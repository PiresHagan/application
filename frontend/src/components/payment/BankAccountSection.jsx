import React from 'react';
import {
    Box,
    TextField,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Checkbox,
    Typography,
    Button,
    Grid,
    Paper
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function BankAccountSection({
    type = 'enter',
    onTypeChange,
    info = {},
    onInfoChange,
    checkSpecimen,
    onCheckSpecimenChange,
    authorizeAutoWithdrawal,
    onAuthorizeChange
}) {
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            onCheckSpecimenChange(file);
        }
    };

    const handleInfoChange = (field, value) => {
        onInfoChange({ ...info, [field]: value });
    };

    return (
        <Box sx={{ mt: 3, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Bank Account Information
            </Typography>

            <RadioGroup
                value={type}
                onChange={(e) => onTypeChange(e.target.value)}
                sx={{ mb: 3 }}
            >
                <FormControlLabel
                    value="enter"
                    control={<Radio />}
                    label="Enter bank account information"
                />
                <FormControlLabel
                    value="upload"
                    control={<Radio />}
                    label="Upload check specimen"
                />
            </RadioGroup>

            {type === 'enter' && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Account Holder Name"
                            value={info.accountHolderName || ''}
                            onChange={(e) => handleInfoChange('accountHolderName', e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Bank Name"
                            value={info.bankName || ''}
                            onChange={(e) => handleInfoChange('bankName', e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Routing Number (US) / Institution Number (Canada)"
                            value={info.routingNumber || ''}
                            onChange={(e) => handleInfoChange('routingNumber', e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Account Number"
                            value={info.accountNumber || ''}
                            onChange={(e) => handleInfoChange('accountNumber', e.target.value)}
                            required
                        />
                    </Grid>
                </Grid>
            )}

            {type === 'upload' && (
                <Box
                    sx={{
                        border: '2px dashed #ccc',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        mb: 3,
                        backgroundColor: '#f9f9f9'
                    }}
                >
                    <input
                        accept="image/*,.pdf"
                        id="check-specimen-upload"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                    <label htmlFor="check-specimen-upload">
                        <Button
                            variant="contained"
                            component="span"
                            startIcon={<CloudUploadIcon />}
                            sx={{ mb: 2 }}
                        >
                            Upload Check Specimen
                        </Button>
                    </label>
                    <Typography variant="body2" color="textSecondary">
                        {checkSpecimen ? `File selected: ${checkSpecimen.name}` : 'Drag and drop a file here or click to select a file'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                        Accepted formats: JPEG, PNG, PDF
                    </Typography>
                </Box>
            )}

            <FormControlLabel
                control={
                    <Checkbox
                        checked={authorizeAutoWithdrawal}
                        onChange={(e) => onAuthorizeChange(e.target.checked)}
                    />
                }
                label="I authorize automatic withdrawals for premium payments."
            />
        </Box>
    );
}

export default BankAccountSection; 