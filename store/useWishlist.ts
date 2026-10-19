// store/useWishlist.ts
'use client';
import { useCallback, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from 'react-redux';
import { useAppDispatch, useAppSelector } from './hooks';
import type { RootState } from './index';
import {
  addToWishlistLocal,
  removeFromWishlistLocal,
  setWishlist,
} from './slices/wishlistSlice';
import type { Product } from '@/types';

const subscribeNever = () => () => {};

export function useMounted() {
  return useSyncExternalStore(subscribeNever, () => true, () => false);
}

export function useWishlisted(productId: number) {
  return useAppSelector((s) => s.wishlist.items.some((p) => p.product_id === productId));
}

async function request(method: 'POST' | 'DELETE', userId: number, productId?: number) {
  const res =
    method === 'POST'
      ? await fetch('/api/wishlist', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, productId }),
        })
      : await fetch(
          `/api/wishlist?userId=${userId}${productId !== undefined ? `&productId=${productId}` : ''}`,
          { method }
        );
  if (!res.ok) throw new Error(`Wishlist request failed (${res.status})`);
}

export function useToggleWishlist() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();

  return useCallback(
    async (product: Product) => {
      const { user, wishlist } = store.getState();
      const userId = user.userInfo?.user_id;
      if (userId === undefined) {
        router.push('/login');
        return;
      }

      const wasSaved = wishlist.items.some((p) => p.product_id === product.product_id);
      if (wasSaved) dispatch(removeFromWishlistLocal(product.product_id));
      else dispatch(addToWishlistLocal(product));

      try {
        await request(wasSaved ? 'DELETE' : 'POST', userId, product.product_id);
      } catch {
        if (wasSaved) dispatch(addToWishlistLocal(product));
        else dispatch(removeFromWishlistLocal(product.product_id));
      }
    },
    [dispatch, router, store]
  );
}

export function useClearWishlist() {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();

  return useCallback(async () => {
    const { user, wishlist } = store.getState();
    const userId = user.userInfo?.user_id;
    if (userId === undefined) return;

    const previous = wishlist.items;
    dispatch(setWishlist([]));
    try {
      await request('DELETE', userId);
    } catch {
      dispatch(setWishlist(previous));
    }
  }, [dispatch, store]);
}
