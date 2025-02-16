import { createSlice } from '@reduxjs/toolkit';

const INITIAL_OWNER = {
  id: 1,
  isMainOwner: true,
  ownerType: '01',
  sameAsMailingAddress: true,
  addressCountry: '01',
  mailingAddressCountry: '01',
  countryCode: '01',
};

const ownerSlice = createSlice({
  name: 'owner',
  initialState: {
    owners: [INITIAL_OWNER],
    expandedSections: {
      1: 'ownerDetails',
      '1-ownerDetails': true
    },
    sectionValidation: {},
    attemptedSections: {},
  },
  reducers: {
    setOwners: (state, action) => {
      state.owners = action.payload;
    },
    setExpandedSections: (state, action) => {
      state.expandedSections = action.payload;
    },
    setSectionValidation: (state, action) => {
      state.sectionValidation = action.payload;
    },
    setAttemptedSections: (state, action) => {
      state.attemptedSections = action.payload;
    },
  }
});

export const {
  setOwners,
  setExpandedSections,
  setSectionValidation,
  setAttemptedSections
} = ownerSlice.actions;
export default ownerSlice.reducer; 