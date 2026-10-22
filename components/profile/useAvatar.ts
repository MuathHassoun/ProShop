// components/profile/useAvatar.ts
'use client';
import { useCallback, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { updateUserProfile } from '@/store/slices/userSlice';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const AVATAR_SIZE = 256;

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
  const dispatch = useAppDispatch();
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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

      setIsUploading(true);

      try {
        let dataUrl: string;

        try {
          dataUrl = await toAvatarDataUrl(file);
        } catch {
          setError('Could not process that image. Try another one.');
          return;
        }

        const response = await fetch('/api/profile/avatar', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, avatar: dataUrl }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setError(data.error || 'Could not save your photo. Please try again.');
          return;
        }

        dispatch(updateUserProfile({ avatar_url: data.avatar_url ?? dataUrl }));
      } catch {
        setError('Could not save your photo. Check your connection and try again.');
      } finally {
        setIsUploading(false);
      }
    },
    [userId, dispatch]
  );

  return {
    src: remoteUrl ?? null,
    upload,
    error,
    isUploading,
  };
}