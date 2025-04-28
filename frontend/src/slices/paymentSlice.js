import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    paymentMode: 'monthly',
    paymentMethod: 'ach',
    bankAccountType: 'enter',
    bankAccountInfo: null,
    checkSpecimen: null,
    cardInfo: null,
    authorizeAutoWithdrawal: false,
    initialPaymentOption: 'upon_approval',
    deferredDate: null,
    authorizePayments: false,
    payors: []
};

export const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        setPaymentData: (state, action) => {
            return { ...state, ...action.payload };
        },

        setPaymentMode: (state, action) => {
            state.paymentMode = action.payload;
        },

        setPaymentMethod: (state, action) => {
            state.paymentMethod = action.payload;

            // Reset method-specific data when changing payment method
            if (action.payload !== 'ach') {
                state.bankAccountInfo = null;
                state.checkSpecimen = null;
                state.bankAccountType = 'enter';
            }

            if (action.payload !== 'card') {
                state.cardInfo = null;
            }
        },

        setBankAccountInfo: (state, action) => {
            state.bankAccountInfo = action.payload;
        },

        setCheckSpecimen: (state, action) => {
            state.checkSpecimen = action.payload;
        },

        setCardInfo: (state, action) => {
            state.cardInfo = action.payload;
        },

        setInitialPaymentOption: (state, action) => {
            state.initialPaymentOption = action.payload;
        },

        setDeferredDate: (state, action) => {
            state.deferredDate = action.payload;
        },

        setAuthorizePayments: (state, action) => {
            state.authorizePayments = action.payload;
        },

        setPayors: (state, action) => {
            state.payors = action.payload;
        },

        addPayor: (state, action) => {
            const existingIndex = state.payors.findIndex(p => p.id === action.payload.id);

            if (existingIndex >= 0) {
                state.payors[existingIndex] = action.payload;
            } else {
                state.payors.push(action.payload);
            }
        },

        removePayor: (state, action) => {
            state.payors = state.payors.filter(p => p.id !== action.payload);
        },

        clearPaymentData: () => initialState
    }
});

export const {
    setPaymentData,
    setPaymentMode,
    setPaymentMethod,
    setBankAccountInfo,
    setCheckSpecimen,
    setCardInfo,
    setInitialPaymentOption,
    setDeferredDate,
    setAuthorizePayments,
    setPayors,
    addPayor,
    removePayor,
    clearPaymentData
} = paymentSlice.actions;

export default paymentSlice.reducer; 