import React from 'react';
import {
    Box,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Typography
} from '@mui/material';

function PaymentMethodSection({ value, onChange }) {
    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Payment Method
            </Typography>

            <RadioGroup
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <FormControlLabel
                    value="ach"
                    control={<Radio />}
                    label="Bank Account (ACH / Pre-Authorized Debit)"
                />
                <FormControlLabel
                    value="card"
                    control={<Radio />}
                    label="Credit Card / Debit Card"
                />
                <FormControlLabel
                    value="direct_billing"
                    control={<Radio />}
                    label="Direct Billing (Invoice/Mail-in Check)"
                />
                <FormControlLabel
                    value="payroll"
                    control={<Radio />}
                    label="Payroll Deduction"
                />
                <FormControlLabel
                    value="online_banking"
                    control={<Radio />}
                    label="Online Banking"
                />
            </RadioGroup>
        </Box>
    );
}

export default PaymentMethodSection; 