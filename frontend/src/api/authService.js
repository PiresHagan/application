import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem('userInfo');
    },
    userBanned: (state) => {
      // Clear user info and show ban message
      state.userInfo = null;
      localStorage.removeItem('userInfo');
      // Remove the jwt cookie by making a request to /api/users/logout
      fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include'
      });
    },
  },
});

export const { setCredentials, logout, userBanned } = authSlice.actions;

export default authSlice.reducer;
