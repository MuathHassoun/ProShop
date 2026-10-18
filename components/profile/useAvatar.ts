// components/profile/useAvatar.ts
'use client';
import { useCallback, useState, useSyncExternalStore } from 'react';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const AVATAR_SIZE = 256;
const AVATAR_EVENT = 'proshop-avatar-change';
const storageKey = (userId: number) => `proshop_avatar_${userId}`;

function readStored(userId: number | undefined): string | null {
  if (userId === undefined) {
    return null;
  }

  try {
    return localStorage.getItem(storageKey(userId));
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(AVATAR_EVENT, onChange);
  window.addEventListener('storage', onChange);

  return () => {
    window.removeEventListener(AVATAR_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

async function toAvatarDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);

  try {
    const side = Math.min(bitmap.width, bitmap.height);

    const canvas = document.createElement('canvas');
    canvas.width = AVATAR_SIZE;
    canvas.height = AVATAR_SIZE;

    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas is not available.');
    }

    context.drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      AVATAR_SIZE,
      AVATAR_SIZE
    );

    return canvas.toDataURL('image/jpeg', 0.85);
  } finally {
    bitmap.close();
  }
}

export function useAvatar(
  userId: number | undefined,
  remoteUrl?: string | null
) {
  const [error, setError] = useState('');

  const stored = useSyncExternalStore(
    subscribe,
    () => readStored(userId),
    () => null
  );

  const upload = useCallback(
    async (file: File | undefined) => {
      if (!file || userId === undefined) {
        return;
      }

      setError('');

      if (!file.type.startsWith('image/')) {
        setError('Please choose an image file.');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError('Image must be smaller than 5 MB.');
        return;
      }

      try {
        const dataUrl = await toAvatarDataUrl(file);

        try {
          localStorage.setItem(storageKey(userId), dataUrl);
        } catch {
          setError('Could not save the photo in this browser.');
          return;
        }

        window.dispatchEvent(new Event(AVATAR_EVENT));
      } catch {
        setError('Could not process that image. Try another one.');
      }
    },
    [userId]
  );

  return {
    src: stored ?? remoteUrl ?? null,
    upload,
    error,
  };
}
