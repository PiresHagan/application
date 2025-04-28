import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nextStep, previousStep } from '../../slices/stepSlice';
import {
    Box,
    Button,
    Typography,
    Grid,
    FormControlLabel,
    Radio,
    RadioGroup,
    Checkbox,
    Paper,
    Divider
} from '@mui/material';
import { toast } from 'react-toastify';
import PayorSection from '../../components/payment/PayorSection';
import PaymentMethodSection from '../../components/payment/PaymentMethodSection';
import BankAccountSection from '../../components/payment/BankAccountSection';
import CreditCardSection from '../../components/payment/CreditCardSection';
import PremiumBreakdownSection from '../../components/payment/PremiumBreakdownSection';

function Payment({ applicationNumber, onStepComplete }) {
    const dispatch = useDispatch();
    const premium = useSelector(state => state.premium);
    const coverageOwners = useSelector(state => state.coverageOwners.owners || []);

    const [paymentData, setPaymentData] = useState({
        paymentMode: 'monthly',
        paymentMethod: 'ach',
        bankAccountType: 'enter',
        authorizeAutoWithdrawal: false,
        initialPaymentOption: 'upon_approval',
        authorizePayments: false,
        payors: [
            { id: 1, payorId: '', allocation: 100 }
        ]
    });

    const [validationStatus, setValidationStatus] = useState({
        payors: false,
        paymentMethod: false,
        authorization: false
    });

    useEffect(() => {
        const payorsValid = paymentData.payors.length > 0 &&
            paymentData.payors.every(p => p.payorId);

        const paymentMethodValid =
            (paymentData.paymentMethod === 'ach' &&
                ((paymentData.bankAccountType === 'enter' && paymentData.bankAccountInfo?.routingNumber &&
                    paymentData.bankAccountInfo?.accountNumber && paymentData.bankAccountInfo?.accountHolderName) ||
                    (paymentData.bankAccountType === 'upload' && paymentData.checkSpecimen))) ||
            (paymentData.paymentMethod === 'card' && paymentData.cardInfo?.cardNumber &&
                paymentData.cardInfo?.expirationDate && paymentData.cardInfo?.cvv) ||
            ['direct_billing', 'payroll', 'online_banking'].includes(paymentData.paymentMethod);

        const authorizationValid = paymentData.authorizePayments;

        setValidationStatus({
            payors: payorsValid,
            paymentMethod: paymentMethodValid,
            authorization: authorizationValid
        });

        if (onStepComplete) {
            onStepComplete(payorsValid && paymentMethodValid && authorizationValid);
        }
    }, [paymentData, onStepComplete]);

    const handlePaymentDataChange = (field, value) => {
        setPaymentData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePayorChange = (payors) => {
        setPaymentData(prev => ({
            ...prev,
            payors
        }));
    };

    const handleBankAccountInfoChange = (info) => {
        setPaymentData(prev => ({
            ...prev,
            bankAccountInfo: {
                ...prev.bankAccountInfo,
                ...info
            }
        }));
    };

    const handleCardInfoChange = (info) => {
        setPaymentData(prev => ({
            ...prev,
            cardInfo: {
                ...prev.cardInfo,
                ...info
            }
        }));
    };

    const handleSaveAndContinue = () => {
        if (!validationStatus.payors) {
            toast.error('Please select at least one payor');
            return;
        }

        if (!validationStatus.paymentMethod) {
            toast.error('Please complete payment method information');
            return;
        }

        if (!validationStatus.authorization) {
            toast.error('Please authorize premium payments');
            return;
        }

        // TODO: Save payment data to Redux store and API

        dispatch(nextStep());
    };

    return (
        <Box sx={{ pb: 3 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
                Payment & Banking Information
            </Typography>

            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Payor Information
                </Typography>

                <PayorSection
                    payors={paymentData.payors}
                    onChange={handlePayorChange}
                    coverageOwners={coverageOwners}
                    applicationNumber={applicationNumber}
                />
            </Paper>

            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Payment Options
                </Typography>

                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Payment Mode
                </Typography>

                <RadioGroup
                    value={paymentData.paymentMode}
                    onChange={(e) => handlePaymentDataChange('paymentMode', e.target.value)}
                    sx={{ mb: 3 }}
                >
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                            <FormControlLabel value="monthly" control={<Radio />} label="Monthly" />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <FormControlLabel value="quarterly" control={<Radio />} label="Quarterly" />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <FormControlLabel value="semi_annually" control={<Radio />} label="Semi-Annually" />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <FormControlLabel value="annually" control={<Radio />} label="Annually" />
                        </Grid>
                    </Grid>
                </RadioGroup>

                <PaymentMethodSection
                    value={paymentData.paymentMethod}
                    onChange={(value) => handlePaymentDataChange('paymentMethod', value)}
                />

                {paymentData.paymentMethod === 'ach' && (
                    <BankAccountSection
                        type={paymentData.bankAccountType}
                        onTypeChange={(value) => handlePaymentDataChange('bankAccountType', value)}
                        info={paymentData.bankAccountInfo || {}}
                        onInfoChange={handleBankAccountInfoChange}
                        checkSpecimen={paymentData.checkSpecimen}
                        onCheckSpecimenChange={(file) => handlePaymentDataChange('checkSpecimen', file)}
                        authorizeAutoWithdrawal={paymentData.authorizeAutoWithdrawal}
                        onAuthorizeChange={(value) => handlePaymentDataChange('authorizeAutoWithdrawal', value)}
                    />
                )}

                {paymentData.paymentMethod === 'card' && (
                    <CreditCardSection
                        info={paymentData.cardInfo || {}}
                        onInfoChange={handleCardInfoChange}
                    />
                )}

                <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                    Initial Payment
                </Typography>

                <RadioGroup
                    value={paymentData.initialPaymentOption}
                    onChange={(e) => handlePaymentDataChange('initialPaymentOption', e.target.value)}
                    sx={{ mb: 3 }}
                >
                    <FormControlLabel
                        value="upon_approval"
                        control={<Radio />}
                        label="Charge first premium upon approval"
                    />
                    <FormControlLabel
                        value="defer"
                        control={<Radio />}
                        label="Defer first payment to a specific date"
                    />
                </RadioGroup>
            </Paper>

            <PremiumBreakdownSection premiumData={premium} />

            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Authorization & Consent
                </Typography>

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={paymentData.authorizePayments}
                            onChange={(e) => handlePaymentDataChange('authorizePayments', e.target.checked)}
                        />
                    }
                    label="I authorize the insurance company to withdraw premium payments as per my selected payment method."
                />
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                    variant="contained"
                    color="inherit"
                    onClick={() => dispatch(previousStep())}
                >
                    Back
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSaveAndContinue}
                >
                    Next
                </Button>
            </Box>
        </Box>
    );
}

export default Payment; 