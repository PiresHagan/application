import React from 'react';
import { Grid, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';

const OccupationInfo = ({ owner, formErrors, handleFieldChange }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}>

        <TextField
          fullWidth
          required
          placeholder="Employer"
          value={owner.employer || ''}
          onChange={(e) => handleFieldChange(owner.id, 'employer', e.target.value)}
          error={formErrors && !owner.employer}
          size="small"
        />
      </Grid>

      {/* Occupation */}
      <Grid item xs={12} md={3}>
        <FormControl fullWidth required size="small" error={formErrors && !owner.occupation}>
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
      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          required
          placeholder="Net Worth"
          value={owner.netWorth || ''}
          onChange={(e) => handleFieldChange(owner.id, 'netWorth', e.target.value)}
          error={formErrors && !owner.netWorth}
          size="small"
        />
      </Grid>

      {/* Annual Income */}
      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          required
          placeholder="Annual Income"
          value={owner.annualIncome || ''}
          onChange={(e) => handleFieldChange(owner.id, 'annualIncome', e.target.value)}
          error={formErrors && !owner.annualIncome}
          size="small"
        />
      </Grid>
    </Grid>
  );
};

export default OccupationInfo; 