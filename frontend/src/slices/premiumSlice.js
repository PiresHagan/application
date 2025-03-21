import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

/**
 * Async thunk to calculate premiums based on coverage data
 * This is a placeholder for the actual API call implementation
 */
export const calculatePremium = createAsyncThunk(
  'premium/calculate',
  async (requestData, { rejectWithValue }) => {
    console.log('requestData', requestData);
    try {
      // In a real implementation, this would be an API call to your backend
      // For now, we'll just simulate a response after a short delay
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response based on the request data
      const basePremium = parseFloat(requestData.application.coverages[0].coveragedetails.FaceAmount) * 0.0005;
      
      // Calculate additional premiums if they exist
      const additionalPremiums = requestData.application.coverages.slice(1).map(cov => 
        parseFloat(cov.coveragedetails.FaceAmount) * 0.0006
      );
      
      // Calculate total premium
      const totalPremium = basePremium + 
        additionalPremiums.reduce((sum, premium) => sum + premium, 0);
      
      // Return mock premium calculation result
      return {
        totalPremium: totalPremium.toFixed(2),
        basePremium: basePremium.toFixed(2),
        additionalPremiums: additionalPremiums.map(p => p.toFixed(2)),
        riderPremiums: [],
        calculationDate: new Date().toISOString(),
        frequency: 'Annual',
        annualPremium: totalPremium.toFixed(2),
        semiAnnualPremium: (totalPremium / 1.92).toFixed(2),
        quarterlyPremium: (totalPremium / 3.68).toFixed(2),
        monthlyPremium: (totalPremium / 11.23).toFixed(2)
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to calculate premium');
    }
  }
);

/**
 * Redux slice for premium calculation state
 */
const premiumSlice = createSlice({
  name: 'premium',
  initialState: {
    data: null,
    loading: false,
    error: null,
    lastCalculated: null
  },
  reducers: {
    clearPremium: (state) => {
      state.data = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(calculatePremium.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculatePremium.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.lastCalculated = new Date().toISOString();
      })
      .addCase(calculatePremium.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to calculate premium';
      });
  }
});

export const { clearPremium } = premiumSlice.actions;

export default premiumSlice.reducer; 