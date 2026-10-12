// store/slices/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types';

export interface UserState {
  userInfo: User | null;
}

const getInitialUser = (): User | null => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('proshop_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
  return null;
};

const initialState: UserState = {
  userInfo: getInitialUser(),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<User>) => {
      state.userInfo = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('proshop_user', JSON.stringify(action.payload));
      }
    },
    logout: (state) => {
      state.userInfo = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('proshop_user');
      }
    },
  },
});

export const { setCredentials, logout } = userSlice.actions;
export default userSlice.reducer;
