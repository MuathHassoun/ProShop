// store/slices/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '@/types';

export interface CartState {
  cartItems: CartItem[];
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
}

const calculateTotals = (cartItems: CartItem[]) => {
  const itemsPrice = Number(
    cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)
  );
  const shippingPrice = Number((itemsPrice > 100 || itemsPrice === 0 ? 0 : 10).toFixed(2));

  // 15% tax
  const taxPrice = Number((itemsPrice * 0.15).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
};

const getInitialState = (): CartState => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('proshop_cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Drop lines saved before carts were keyed by variant_id
        const items: CartItem[] = (parsed.cartItems || []).filter(
          (i: Partial<CartItem>) => typeof i.variant_id === 'number'
        );
        return {
          cartItems: items,
          ...calculateTotals(items),
        };
      }
    } catch {
    }
  }

  return {
    cartItems: [],
    itemsPrice: 0,
    shippingPrice: 0,
    taxPrice: 0,
    totalPrice: 0,
  };
};

const initialState: CartState = getInitialState();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const newItem = action.payload;
      const existItemIndex = state.cartItems.findIndex(
        (item) => item.variant_id === newItem.variant_id
      );

      if (existItemIndex !== -1) {
        state.cartItems[existItemIndex] = {
          ...state.cartItems[existItemIndex],
          quantity: newItem.quantity,
        };
      } else {
        state.cartItems.push(newItem);
      }

      const totals = calculateTotals(state.cartItems);
      state.itemsPrice = totals.itemsPrice;
      state.shippingPrice = totals.shippingPrice;
      state.taxPrice = totals.taxPrice;
      state.totalPrice = totals.totalPrice;

      if (typeof window !== 'undefined') {
        localStorage.setItem('proshop_cart', JSON.stringify({ cartItems: state.cartItems }));
      }
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.variant_id !== action.payload
      );

      const totals = calculateTotals(state.cartItems);
      state.itemsPrice = totals.itemsPrice;
      state.shippingPrice = totals.shippingPrice;
      state.taxPrice = totals.taxPrice;
      state.totalPrice = totals.totalPrice;

      if (typeof window !== 'undefined') {
        localStorage.setItem('proshop_cart', JSON.stringify({ cartItems: state.cartItems }));
      }
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ variant_id: number; quantity: number }>
    ) => {
      const { variant_id, quantity } = action.payload;
      const item = state.cartItems.find((item) => item.variant_id === variant_id);
      if (item) {
        item.quantity = Math.max(1, Math.min(quantity, item.stock_quantity || 99));
      }

      const totals = calculateTotals(state.cartItems);
      state.itemsPrice = totals.itemsPrice;
      state.shippingPrice = totals.shippingPrice;
      state.taxPrice = totals.taxPrice;
      state.totalPrice = totals.totalPrice;

      if (typeof window !== 'undefined') {
        localStorage.setItem('proshop_cart', JSON.stringify({ cartItems: state.cartItems }));
      }
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.itemsPrice = 0;
      state.shippingPrice = 0;
      state.taxPrice = 0;
      state.totalPrice = 0;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('proshop_cart');
      }
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
