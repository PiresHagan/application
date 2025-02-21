import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  formOwners: [],
};

export const formDataSlice = createSlice({
  name: 'formData',
  initialState,
  reducers: {
    setFormOwners: (state, action) => {
      state.formOwners = action.payload;
    },
  },
});

export const { setFormOwners } = formDataSlice.actions;

export default formDataSlice.reducer; 