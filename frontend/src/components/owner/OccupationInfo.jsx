import React from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const OccupationInfo = ({ 
  owner, 
  dropdownValues, 
  handleFieldChange,
  shouldShowError,
  getErrorMessage
}) => {
  return (
    <Grid container spacing={2}>
      {/* Employer */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required
          placeholder="Employer"
          value={owner.employer || ''}
          onChange={(e) => handleFieldChange(owner.id, 'employer', e.target.value)}
          error={shouldShowError(owner.id, 'occupation', 'employer')}
          helperText={getErrorMessage(owner.id, 'occupation', 'employer')}
          size="medium"
        />
      </Grid>

      {/* Occupation */}
      <Grid item xs={12} md={6}>
        <FormControl 
          fullWidth 
          required
          error={shouldShowError(owner.id, 'occupation', 'occupation')}
          size="medium"
        >
          <InputLabel>Occupation</InputLabel>
          <Select
            value={owner.occupation || ''}
            onChange={(e) => handleFieldChange(owner.id, 'occupation', e.target.value)}
            label="Occupation"
          >
            <MenuItem value="it">IT Consultant</MenuItem>
            <MenuItem value="lawyer">Lawyer</MenuItem>
            <MenuItem value="accountant">Accountant</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Net Worth */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required
          placeholder="Net Worth"
          value={owner.netWorth || ''}
          onChange={(e) => handleFieldChange(owner.id, 'netWorth', e.target.value)}
          error={shouldShowError(owner.id, 'occupation', 'netWorth')}
          helperText={getErrorMessage(owner.id, 'occupation', 'netWorth')}
          size="medium"
        />
      </Grid>

      {/* Annual Income */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required
          placeholder="Annual Income"
          value={owner.annualIncome || ''}
          onChange={(e) => handleFieldChange(owner.id, 'annualIncome', e.target.value)}
          error={shouldShowError(owner.id, 'occupation', 'annualIncome')}
          helperText={getErrorMessage(owner.id, 'occupation', 'annualIncome')}
          size="medium"
        />
      </Grid>
    </Grid>
  );
};

export default OccupationInfo; 