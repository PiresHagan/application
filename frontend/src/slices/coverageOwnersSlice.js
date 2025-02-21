import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  owners: [],
  nextId: 1  // Add a counter for sequential IDs
};

export const coverageOwnersSlice = createSlice({
  name: 'coverageOwners',
  initialState,
  reducers: {
    setCoverageOwners: (state, action) => {
      // Map incoming owners with sequential IDs
      state.owners = action.payload.map((owner, index) => ({
        ...owner,
        id: index + 1
      }));
      state.nextId = action.payload.length + 1;
    },
    updateCoverageOwner: (state, action) => {
      const { id, data } = action.payload;
      state.owners = state.owners.map(owner =>
        owner.id === id ? { ...owner, ...data } : owner
      );
    },
    addCoverageOwner: (state, action) => {
      // Add new owner with next sequential ID
      state.owners.push({
        ...action.payload,
        id: state.nextId
      });
      state.nextId += 1;
    }
  }
});

export const { setCoverageOwners, updateCoverageOwner, addCoverageOwner } = coverageOwnersSlice.actions;

export default coverageOwnersSlice.reducer; 