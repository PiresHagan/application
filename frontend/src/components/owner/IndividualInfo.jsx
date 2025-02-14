import React from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const IndividualInfo = ({
  owner,
  dropdownValues,
  handleFieldChange,
  shouldShowError,
  getErrorMessage
}) => {
  return (
    <Grid container spacing={2}>
      {/* First Name */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required
          placeholder="First Name"
          value={owner.firstName || ''}
          onChange={(e) => handleFieldChange(owner.id, 'firstName', e.target.value)}
          error={shouldShowError(owner.id, 'ownerDetails', 'firstName')}
          helperText={getErrorMessage(owner.id, 'ownerDetails', 'firstName')}
          size="medium"
        />
      </Grid>

      {/* Last Name */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required
          placeholder="Last Name"
          value={owner.lastName || ''}
          onChange={(e) => handleFieldChange(owner.id, 'lastName', e.target.value)}
          error={shouldShowError(owner.id, 'ownerDetails', 'lastName')}
          helperText={getErrorMessage(owner.id, 'ownerDetails', 'lastName')}
          size="medium"
        />
      </Grid>

      {/* Date of Birth */}
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          required
          type="date"
          label="Date of Birth"
          value={owner.dateOfBirth || ''}
          onChange={(e) => handleFieldChange(owner.id, 'dateOfBirth', e.target.value)}
          error={shouldShowError(owner.id, 'ownerDetails', 'dateOfBirth')}
          helperText={getErrorMessage(owner.id, 'ownerDetails', 'dateOfBirth')}
          size="medium"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      {/* Gender */}
      <Grid item xs={12} md={4}>
        <FormControl
          fullWidth
          required
          error={shouldShowError(owner.id, 'ownerDetails', 'gender')}
          size="medium"
        >
          <InputLabel>Gender</InputLabel>
          <Select
            value={owner.gender || ''}
            onChange={(e) => handleFieldChange(owner.id, 'gender', e.target.value)}
            label="Gender"
          >
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Tobacco Status */}
      <Grid item xs={12} md={4}>
        <FormControl fullWidth required size="medium" error={Boolean(shouldShowError(owner.id, 'ownerDetails', 'tobacco'))}>
          <InputLabel>Tobacco Status</InputLabel>
          <Select
            value={owner.tobacco || ''}
            onChange={(e) => handleFieldChange(owner.id, 'tobacco', e.target.value)}
            label="Tobacco Status"
          >
            <MenuItem value="yes">Smoker</MenuItem>
            <MenuItem value="no">Non-Smoker</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={4}>
        <FormControl fullWidth required size="medium" error={Boolean(shouldShowError(owner.id, 'ownerDetails', 'countryCode'))}>
          <InputLabel>Citizenship</InputLabel>
          <Select
            value={owner.countryCode || '01'}
            onChange={(e) => handleFieldChange(owner.id, 'countryCode', e.target.value)}
            label="Citizenship"
          >
            {dropdownValues.countries?.map((country) => (
              <MenuItem key={country.code} value={country.code}>
                {country.description}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControl
          fullWidth
          error={Boolean(shouldShowError(owner.id, 'ownerDetails', 'state'))}
          size="medium"
        >
          <InputLabel>{owner.countryCode === '01' ? 'State' : 'Province'}</InputLabel>
          <Select
            value={owner.state || ''}
            onChange={(e) => handleFieldChange(owner.id, 'state', e.target.value)}
            label={owner.countryCode === '01' ? 'State' : 'Province'}
          >
            {owner.countryCode === '01'
              ? dropdownValues.states?.map((state) => (
                <MenuItem key={state.code} value={state.code}>
                  {state.description}
                </MenuItem>
              ))
              : dropdownValues.provinces?.map((province) => (
                <MenuItem key={province.code} value={province.code}>
                  {province.description}
                </MenuItem>
              ))
            }
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          required
          placeholder="SSN"
          value={owner.ssn || ''}
          onChange={(e) => handleFieldChange(owner.id, 'ssn', e.target.value)}
          error={Boolean(shouldShowError(owner.id, 'ownerDetails', 'ssn'))}
          helperText={getErrorMessage(owner.id, 'ownerDetails', 'ssn')}
          size="medium"
        />
      </Grid>
    </Grid>
  );
};

export default IndividualInfo; 