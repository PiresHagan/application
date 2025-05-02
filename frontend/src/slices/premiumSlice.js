import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice';

export const premiumApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    calculatePremium: builder.mutation({
      query: (data) => ({
        url: '/api/coverage/premium/calculate',
        method: 'POST',
        body: data,
      }),
    }),
    savePremium: builder.mutation({
      query: ({ applicationNumber, premiumData }) => ({
        url: `/api/coverage/premium/${applicationNumber}`,
        method: 'POST',
        body: premiumData,
      }),
    }),
  }),
});

export const { useCalculatePremiumMutation, useSavePremiumMutation } = premiumApiSlice;

const initialState = {
  premiumData: null,
  timestamp: null,
  outdated: false,
};

const premiumSlice = createSlice({
  name: 'premium',
  initialState,
  reducers: {
    clearPremiumData: (state) => {
      state.premiumData = null;
      state.timestamp = null;
      state.outdated = false;
    },
    markPremiumOutdated: (state) => {
      state.outdated = true;
    },
    setPremiumData: (state, action) => {
      state.premiumData = action.payload;
      state.timestamp = Date.now();
      state.outdated = false;
    },
  },
});

export const { clearPremiumData, markPremiumOutdated, setPremiumData } = premiumSlice.actions;

export default premiumSlice.reducer; 