'use client';
import { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

const subscribeNever = () => () => {};

export default function RedirectAuthenticated() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user.userInfo);
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);

  useEffect(() => {
    if (mounted && user) router.replace('/');
  }, [mounted, user, router]);

  return null;
}
