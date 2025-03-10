import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  medicalData: {},
  loading: false,
  error: null
};

export const medicalSlice = createSlice({
  name: 'medical',
  initialState,
  reducers: {
    saveMedicalData: (state, action) => {
      state.medicalData = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearMedicalData: (state) => {
      state.medicalData = {};
    }
  }
});

export const { saveMedicalData, setLoading, setError, clearMedicalData } = medicalSlice.actions;

export default medicalSlice.reducer; 