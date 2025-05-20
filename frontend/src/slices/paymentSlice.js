import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    paymentMode: 'monthly',
    paymentMethod: 'ach',
    bankAccountType: 'enter',
    bankAccountInfo: null,
    checkSpecimen: null,
    cardInfo: null,
    authorizeAutoWithdrawal: false,
    initialPaymentOption: 'with_application',
    deferredDate: null,
    authorizePayments: false,
    cashWithApplication: false,
    payors: [],
    payorDetails: {}
};

export const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        setPaymentData: (state, action) => {
            const newState = { ...state, ...action.payload };
            
            if (action.payload.payors) {
                newState.payorDetails = { ...state.payorDetails };
                action.payload.payors.forEach(payor => {
                    if (payor.payorDetails) {
                        newState.payorDetails[payor.payorId] = payor.payorDetails;
                    }
                });
            }
            
            return newState;
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
            if (action.payload === 'cash_with_app') {
                state.cashWithApplication = true;
            }
        },

        setCashWithApplication: (state, action) => {
            state.cashWithApplication = action.payload;
            if (action.payload) {
                state.initialPaymentOption = 'cash_with_app';
            } else if (state.initialPaymentOption === 'cash_with_app') {
                state.initialPaymentOption = 'with_application';
            }
        },

        setDeferredDate: (state, action) => {
            state.deferredDate = action.payload;
        },

        setAuthorizePayments: (state, action) => {
            state.authorizePayments = action.payload;
        },

        setPayors: (state, action) => {
            state.payors = action.payload;
            
            action.payload.forEach(payor => {
                if (payor.payorDetails) {
                    state.payorDetails[payor.payorId] = payor.payorDetails;
                }
            });
        },

        addPayor: (state, action) => {
            const existingIndex = state.payors.findIndex(p => p.id === action.payload.id);

            if (existingIndex >= 0) {
                state.payors[existingIndex] = action.payload;
            } else {
                state.payors.push(action.payload);
            }
            
            if (action.payload.payorDetails) {
                state.payorDetails[action.payload.payorId] = action.payload.payorDetails;
            }
        },

        removePayor: (state, action) => {
            const payorToRemove = state.payors.find(p => p.id === action.payload);
            
            if (payorToRemove && payorToRemove.payorId && state.payorDetails[payorToRemove.payorId]) {
                delete state.payorDetails[payorToRemove.payorId];
            }
            
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
    setCashWithApplication,
    setDeferredDate,
    setAuthorizePayments,
    setPayors,
    addPayor,
    removePayor,
    clearPaymentData
} = paymentSlice.actions;

export default paymentSlice.reducer; 