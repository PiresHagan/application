import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  product: {
    product: 'Whole Life',
    plan: 'WL LifePay',
    productGUID: '',
    planGUID: ''
  },
  base: {
    coverageType: 'single',
    insured1: '',
    insured2: '',
    sameAsOwner1: false,
    sameAsOwner2: false,
    relationship1: '',
    relationship2: '',
    faceAmount: '100000',
    tableRating: '100%',
    permanentFlatExtra: false,
    permanentFlatExtraAmount: '0',
    temporaryFlatExtra: false,
    temporaryFlatExtraAmount: '0',
    temporaryFlatExtraDuration: '0',
    underwritingClass: 'Standard'
  },
  additional: [],
  riders: []
};

export const coverageSlice = createSlice({
  name: 'coverage',
  initialState,
  reducers: {
    setProductData: (state, action) => {
      state.product = action.payload;
    },
    setBaseCoverageData: (state, action) => {
      state.base = action.payload;
    },
    setAdditionalCoverages: (state, action) => {
      state.additional = action.payload;
    },
    setRiders: (state, action) => {
      state.riders = action.payload;
    }
  }
});

export const {
  setProductData,
  setBaseCoverageData,
  setAdditionalCoverages,
  setRiders
} = coverageSlice.actions;

export default coverageSlice.reducer; 