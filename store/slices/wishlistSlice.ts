// store/slices/wishlistSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '@/types';

export interface WishlistState {
  items: Product[];
  status: 'idle' | 'ready' | 'error';
}

const initialState: WishlistState = { items: [], status: 'idle' };

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
      state.status = 'ready';
    },
    setWishlistError: (state) => {
      state.status = 'error';
    },
    resetWishlist: () => initialState,
    addToWishlistLocal: (state, action: PayloadAction<Product>) => {
      if (!state.items.some((p) => p.product_id === action.payload.product_id)) {
        state.items.unshift(action.payload);
      }
    },
    removeFromWishlistLocal: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((p) => p.product_id !== action.payload);
    },
  },
});

export const {
  setWishlist,
  setWishlistError,
  resetWishlist,
  addToWishlistLocal,
  removeFromWishlistLocal,
} = wishlistSlice.actions;
export default wishlistSlice.reducer;
