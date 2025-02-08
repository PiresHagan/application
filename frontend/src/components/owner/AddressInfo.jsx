import React, { useRef } from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, Typography } from '@mui/material';

const AddressInfo = ({
  owner,
  formErrors,
  dropdownValues,
  handleFieldChange,
  handleSameAsMailingAddressChange,
  mailingAddressRef
}) => {
  return (
    <Grid container spacing={2}>


      {/* Address Line 1 */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required
          placeholder="Address Line 1"
          value={owner.addressLine1 || ''}
          onChange={(e) => handleFieldChange(owner.id, 'addressLine1', e.target.value)}
          error={formErrors && !owner.addressLine1}
          size="small"
        />
      </Grid>

      {/* Address Line 2 - Not Required */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          placeholder="Address Line 2"
          value={owner.addressLine2 || ''}
          onChange={(e) => handleFieldChange(owner.id, 'addressLine2', e.target.value)}
          size="small"
        />
      </Grid>

      {/* City */}
      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          required
          placeholder="City"
          value={owner.city || ''}
          onChange={(e) => handleFieldChange(owner.id, 'city', e.target.value)}
          error={formErrors && !owner.city}
          size="small"
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <FormControl fullWidth size="small">
          <InputLabel>Country</InputLabel>
          <Select
            value={owner.addressCountry}
            onChange={(e) => handleFieldChange(owner.id, 'addressCountry', e.target.value)}
            label="Country"
          >

            {dropdownValues.countries?.map((country) => (
              <MenuItem key={country.code} value={country.code}>
                {country.description}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={3}>
        <FormControl
          fullWidth
          error={formErrors && !owner.addressState}
          size="small"
        >
          <InputLabel>{owner.addressCountry === '01' ? 'State' : 'Province'}</InputLabel>
          <Select
            value={owner.addressState || ''}
            onChange={(e) => handleFieldChange(owner.id, 'addressState', e.target.value)}
            label={owner.addressCountry === '01' ? 'State' : 'Province'}
          >
            {owner.addressCountry === '01'
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
      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          required
          placeholder={owner.addressCountry === '01' ? 'Zip Code' : 'Postal Code'}
          value={owner.zipCode || ''}
          onChange={(e) => handleFieldChange(owner.id, 'zipCode', e.target.value)}
          error={formErrors && !owner.zipCode}
          size="small"
        />
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={owner.sameAsMailingAddress}
              onChange={(e) => handleSameAsMailingAddressChange(owner.id, e.target.checked)}              
            />
          }
          label="Same as Mailing Address"
        />
      </Grid>

      {!owner.sameAsMailingAddress && (
        <>
          <Typography
            ref={mailingAddressRef}
            variant="subtitle1"
            sx={{ mt: 3, mb: 2 }}
          >
            Mailing Address
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                placeholder="Address Line 1"
                value={owner.mailingAddressLine1 || ''}
                onChange={(e) => handleFieldChange(owner.id, 'mailingAddressLine1', e.target.value)}
                error={formErrors && !owner.mailingAddressLine1}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Address Line 2"
                value={owner.mailingAddressLine2 || ''}
                onChange={(e) => handleFieldChange(owner.id, 'mailingAddressLine2', e.target.value)}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                required
                placeholder="City"
                value={owner.mailingCity || ''}
                onChange={(e) => handleFieldChange(owner.id, 'mailingCity', e.target.value)}
                error={formErrors && !owner.mailingCity}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth required size="small" error={formErrors && !owner.mailingAddressCountry}>
                <InputLabel>Country</InputLabel>
                <Select
                  value={owner.mailingAddressCountry}
                  onChange={(e) => handleFieldChange(owner.id, 'mailingAddressCountry', e.target.value)}
                  label="Country"
                >

                  {dropdownValues.countries?.map((country) => (
                    <MenuItem key={country.code} value={country.code}>
                      {country.description}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth required size="small" error={formErrors && !owner.mailingState}>
                <InputLabel>{owner.mailingAddressCountry === '01' ? 'State' : 'Province'}</InputLabel>
                <Select
                  value={owner.mailingState || ''}
                  onChange={(e) => handleFieldChange(owner.id, 'mailingState', e.target.value)}
                  label={owner.mailingAddressCountry === '01' ? 'State' : 'Province'}
                >
                  {owner.mailingAddressCountry === '01'
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

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                required
                placeholder={owner.mailingAddressCountry === '01' ? 'Zip Code' : 'Postal Code'}
                value={owner.mailingZipCode || ''}
                onChange={(e) => handleFieldChange(owner.id, 'mailingZipCode', e.target.value)}
                error={formErrors && !owner.mailingZipCode}
                size="small"
              />
            </Grid>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default AddressInfo; 