// store/WishlistSync.tsx
'use client';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { resetWishlist, setWishlist, setWishlistError } from './slices/wishlistSlice';

export default function WishlistSync() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((s) => s.user.userInfo?.user_id);

  useEffect(() => {
    if (userId === undefined) {
      dispatch(resetWishlist());
      return;
    }

    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`/api/wishlist?userId=${userId}`, { signal: controller.signal });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        dispatch(setWishlist(Array.isArray(data.items) ? data.items : []));
      } catch (err) {
        if ((err as Error).name !== 'AbortError') dispatch(setWishlistError());
      }
    })();

    return () => controller.abort();
  }, [userId, dispatch]);

  return null;
}
