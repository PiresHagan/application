import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nextStep, previousStep } from '../../slices/stepSlice';
import { setPaymentData } from '../../slices/paymentSlice';
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
import { useSavePaymentDataMutation } from '../../slices/createApiSlice';

function Payment({ applicationNumber, onStepComplete }) {
    const dispatch = useDispatch();
    const premium = useSelector(state => state.premium);
    const coverageOwners = useSelector(state => state.coverageOwners.owners || []);
    const savedPaymentData = useSelector(state => state.payment);

    const [savePaymentDataToAPI, { isLoading }] = useSavePaymentDataMutation();

    const [paymentData, setPaymentDataState] = useState({
        paymentMode: savedPaymentData.paymentMode || 'monthly',
        paymentMethod: savedPaymentData.paymentMethod || 'ach',
        bankAccountType: savedPaymentData.bankAccountType || 'enter',
        bankAccountInfo: savedPaymentData.bankAccountInfo || null,
        checkSpecimen: savedPaymentData.checkSpecimen || null,
        cardInfo: savedPaymentData.cardInfo || null,
        authorizeAutoWithdrawal: savedPaymentData.authorizeAutoWithdrawal || false,
        initialPaymentOption: savedPaymentData.initialPaymentOption || 'with_application',
        deferredDate: savedPaymentData.deferredDate || null,
        authorizePayments: savedPaymentData.authorizePayments || false,
        cashWithApplication: savedPaymentData.cashWithApplication || false,
        payors: savedPaymentData.payors?.length > 0
            ? savedPaymentData.payors
            : [{ id: 1, payorId: '', allocation: 100 }]
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

        // Save to Redux store whenever payment data changes
        dispatch(setPaymentData(paymentData));
    }, [paymentData, onStepComplete, dispatch]);

    const handlePaymentDataChange = (field, value) => {
        setPaymentDataState(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePayorChange = (payors) => {
        setPaymentDataState(prev => ({
            ...prev,
            payors
        }));
    };

    const handleBankAccountInfoChange = (info) => {
        setPaymentDataState(prev => ({
            ...prev,
            bankAccountInfo: {
                ...prev.bankAccountInfo,
                ...info
            }
        }));
    };

    const handleCardInfoChange = (info) => {
        setPaymentDataState(prev => ({
            ...prev,
            cardInfo: {
                ...prev.cardInfo,
                ...info
            }
        }));
    };

    const handleSaveAndContinue = async () => {
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

        try {
            // Save to API
            await savePaymentDataToAPI({
                applicationNumber,
                paymentData: {
                    paymentMode: paymentData.paymentMode,
                    paymentMethod: paymentData.paymentMethod,
                    initialPaymentOption: paymentData.initialPaymentOption,
                    payors: paymentData.payors.map(payor => ({
                        id: payor.id,
                        payorId: payor.payorId,
                        allocation: payor.allocation,
                        clientGUID: payor.payorDetails?.clientGUID,
                        roleGUID: payor.payorDetails?.roleGUID
                    })),
                    // Only include payment method specific data
                    ...(paymentData.paymentMethod === 'ach' && {
                        bankAccountType: paymentData.bankAccountType,
                        bankAccountInfo: paymentData.bankAccountInfo,
                        // We don't send the actual file to the API
                        hasCheckSpecimen: !!paymentData.checkSpecimen,
                        authorizeAutoWithdrawal: paymentData.authorizeAutoWithdrawal
                    }),
                    ...(paymentData.paymentMethod === 'card' && {
                        cardInfo: paymentData.cardInfo
                    }),
                    authorizePayments: paymentData.authorizePayments
                }
            }).unwrap();

            toast.success('Payment information saved successfully');
            dispatch(nextStep());
        } catch (error) {
            console.error('Error saving payment data:', error);
            toast.error('Error saving payment data: ' + (error.data?.message || error.message || 'Unknown error'));
        }
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
                    sx={{ mb: 3, maxWidth: '50%' }}
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

                {/* Premium Breakdown Section */}
                <PremiumBreakdownSection
                    premiumData={premium}
                    applicationNumber={applicationNumber}
                    paymentMode={paymentData.paymentMode}
                />

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

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={paymentData.cashWithApplication}
                            onChange={(e) => {
                                const isChecked = e.target.checked;
                                handlePaymentDataChange('cashWithApplication', isChecked);
                                if (isChecked) {
                                    handlePaymentDataChange('initialPaymentOption', 'cash_with_app');
                                } else {
                                    handlePaymentDataChange('initialPaymentOption', 'with_application');
                                }
                            }}
                        />
                    }
                    label="Cash With Application"
                    sx={{ mb: 1 }}
                />

                <RadioGroup
                    value={paymentData.initialPaymentOption}
                    onChange={(e) => handlePaymentDataChange('initialPaymentOption', e.target.value)}
                    sx={{ mb: 3 }}
                >
                    <FormControlLabel
                        value="with_application"
                        control={<Radio />}
                        label="Pay first premium with application"
                        disabled={paymentData.cashWithApplication}
                    />
                    <FormControlLabel
                        value="upon_approval"
                        control={<Radio />}
                        label="Charge first premium upon approval"
                        disabled={paymentData.cashWithApplication}
                    />
                </RadioGroup>
            </Paper>

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
                    disabled={isLoading}
                >
                    {isLoading ? 'Saving...' : 'Next'}
                </Button>
            </Box>
        </Box>
    );
}

export default Payment; 