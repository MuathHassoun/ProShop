// components/auth/useAuthSubmit.ts
'use client';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/userSlice';

export function useAuthSubmit(endpoint: string, fallbackError: string) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const submit = useCallback(
    async (payload: Record<string, string>) => {
      setFormError('');
      setLoading(true);
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setFormError(json.message ?? fallbackError);
          return;
        }
        dispatch(setCredentials(json.user));
        router.push('/profile');
      } catch {
        setFormError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [endpoint, fallbackError, dispatch, router]
  );

  return { submit, loading, formError, setFormError };
}
