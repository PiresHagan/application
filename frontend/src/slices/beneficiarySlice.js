import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  beneficiaries: [],
  nextId: 1,
  coverageBeneficiaries: {}
};

export const beneficiarySlice = createSlice({
  name: 'beneficiary',
  initialState,
  reducers: {
    addBeneficiary: (state, action) => {
      const newBeneficiary = {
        ...action.payload,
        id: action.payload.id || state.nextId
      };

      if (!action.payload.id) {
        state.nextId += 1;
      }

      const existingIndex = state.beneficiaries.findIndex(b => b.id === newBeneficiary.id);
      if (existingIndex >= 0) {
        state.beneficiaries[existingIndex] = newBeneficiary;
      } else {
        state.beneficiaries.push(newBeneficiary);
      }
    },

    removeBeneficiary: (state, action) => {
      state.beneficiaries = state.beneficiaries.filter(b => b.id !== action.payload);
    },

    associateBeneficiaryWithCoverage: (state, action) => {
      const { coverageId, beneficiaryId, relationship, allocation, type, relatedInsured } = action.payload;

      if (!state.coverageBeneficiaries[coverageId]) {
        state.coverageBeneficiaries[coverageId] = {
          primary: [],
          contingent: []
        };
      }

      const targetArray = type === 'primary'
        ? state.coverageBeneficiaries[coverageId].primary
        : state.coverageBeneficiaries[coverageId].contingent;

      const existingIndex = targetArray.findIndex(b => b.beneficiaryId === beneficiaryId);

      if (existingIndex >= 0) {
        targetArray[existingIndex] = {
          beneficiaryId,
          relationship,
          allocation,
          relatedInsured
        };
      } else {
        targetArray.push({
          beneficiaryId,
          relationship,
          allocation,
          relatedInsured
        });
      }
    },

    removeBeneficiaryFromCoverage: (state, action) => {
      const { coverageId, beneficiaryId, type } = action.payload;

      if (!state.coverageBeneficiaries[coverageId]) return;

      if (type === 'primary') {
        state.coverageBeneficiaries[coverageId].primary =
          state.coverageBeneficiaries[coverageId].primary.filter(
            b => b.beneficiaryId !== beneficiaryId
          );
      } else {
        state.coverageBeneficiaries[coverageId].contingent =
          state.coverageBeneficiaries[coverageId].contingent.filter(
            b => b.beneficiaryId !== beneficiaryId
          );
      }
    },

    updateBeneficiaryAllocation: (state, action) => {
      const { coverageId, beneficiaryId, allocation, type } = action.payload;

      if (!state.coverageBeneficiaries[coverageId]) return;

      const targetArray = type === 'primary'
        ? state.coverageBeneficiaries[coverageId].primary
        : state.coverageBeneficiaries[coverageId].contingent;

      const beneficiary = targetArray.find(b => b.beneficiaryId === beneficiaryId);

      if (beneficiary) {
        beneficiary.allocation = allocation;
      }
    }
  }
});

export const {
  addBeneficiary,
  removeBeneficiary,
  associateBeneficiaryWithCoverage,
  removeBeneficiaryFromCoverage,
  updateBeneficiaryAllocation
} = beneficiarySlice.actions;

export default beneficiarySlice.reducer; 