import React, { useState } from 'react';
import {
    Box,
    TextField,
    FormControl,
    FormControlLabel,
    Checkbox,
    Typography,
    Grid,
    Divider
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';

function CreditCardSection({ info = {}, onInfoChange }) {
    const [useDifferentBillingAddress, setUseDifferentBillingAddress] = useState(false);

    const handleInfoChange = (field, value) => {
        onInfoChange({ ...info, [field]: value });
    };

    return (
        <Box sx={{ mt: 3, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <CreditCardIcon sx={{ mr: 1 }} />
                Credit/Debit Card Information
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Cardholder Name"
                        value={info.cardholderName || ''}
                        onChange={(e) => handleInfoChange('cardholderName', e.target.value)}
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Card Number"
                        value={info.cardNumber || ''}
                        onChange={(e) => handleInfoChange('cardNumber', e.target.value)}
                        required
                        inputProps={{ maxLength: 19 }}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Expiration Date (MM/YY)"
                        value={info.expirationDate || ''}
                        onChange={(e) => handleInfoChange('expirationDate', e.target.value)}
                        required
                        placeholder="MM/YY"
                        inputProps={{ maxLength: 5 }}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="CVV"
                        value={info.cvv || ''}
                        onChange={(e) => handleInfoChange('cvv', e.target.value)}
                        required
                        type="password"
                        inputProps={{ maxLength: 4 }}
                    />
                </Grid>
            </Grid>

            <FormControlLabel
                control={
                    <Checkbox
                        checked={useDifferentBillingAddress}
                        onChange={(e) => setUseDifferentBillingAddress(e.target.checked)}
                    />
                }
                label="Use a different billing address"
            />

            {useDifferentBillingAddress && (
                <Box sx={{ mt: 2 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Billing Address
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Address Line 1"
                                value={info.billingAddressLine1 || ''}
                                onChange={(e) => handleInfoChange('billingAddressLine1', e.target.value)}
                                required={useDifferentBillingAddress}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Address Line 2 (Optional)"
                                value={info.billingAddressLine2 || ''}
                                onChange={(e) => handleInfoChange('billingAddressLine2', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="City"
                                value={info.billingCity || ''}
                                onChange={(e) => handleInfoChange('billingCity', e.target.value)}
                                required={useDifferentBillingAddress}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="State"
                                value={info.billingState || ''}
                                onChange={(e) => handleInfoChange('billingState', e.target.value)}
                                required={useDifferentBillingAddress}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="ZIP Code"
                                value={info.billingZipCode || ''}
                                onChange={(e) => handleInfoChange('billingZipCode', e.target.value)}
                                required={useDifferentBillingAddress}
                            />
                        </Grid>
                    </Grid>
                </Box>
            )}
        </Box>
    );
}

export default CreditCardSection; 