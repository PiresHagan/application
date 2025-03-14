import { createSlice } from '@reduxjs/toolkit';

const stepSlice = createSlice({
  name: 'step',
  initialState: {
    activeStep: 0,
    stepValidation: {
      0: false,
      1: false, 
      2: false, 
    }
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
    },
    setStepValid: (state, action) => {
      const { step, isValid } = action.payload;
      state.stepValidation[step] = isValid;
    }
  }
});

export const { setActiveStep, nextStep, previousStep, setStepValid } = stepSlice.actions;
export default stepSlice.reducer; 