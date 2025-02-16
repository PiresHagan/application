import { createSlice } from '@reduxjs/toolkit';

const stepSlice = createSlice({
  name: 'step',
  initialState: {
    activeStep: 0
  },
  reducers: {
    setActiveStep: (state, action) => {
      state.activeStep = action.payload;
    },
    nextStep: (state) => {
      state.activeStep += 1;
    },
    previousStep: (state) => {
      state.activeStep -= 1;
    }
  }
});

export const { setActiveStep, nextStep, previousStep } = stepSlice.actions;
export default stepSlice.reducer; 