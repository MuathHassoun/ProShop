// store/slices/checkoutSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CheckoutDraft } from '@/types/index';

const KEY = 'proshop_checkout';
const empty: CheckoutDraft = { address: null, payment: null };

const load = (): CheckoutDraft => {
  if (typeof window === 'undefined') return empty;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch {
    return empty;
  }
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState: load(),
  reducers: {
    setCheckoutDraft: (state, action: PayloadAction<CheckoutDraft>) => {
      state.address = action.payload.address;
      state.payment = action.payload.payment;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(KEY, JSON.stringify(action.payload));
      }
    },
    clearCheckout: (state) => {
      state.address = null;
      state.payment = null;
      if (typeof window !== 'undefined') sessionStorage.removeItem(KEY);
    },
  },
});

export const { setCheckoutDraft, clearCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;