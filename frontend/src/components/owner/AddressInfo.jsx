import React, { useRef } from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, Typography } from '@mui/material';

const AddressInfo = ({
  owner,
  formErrors,
  dropdownValues,
  handleFieldChange,
  handleSameAsMailingAddressChange,
  mailingAddressRef,
  shouldShowError,
  getErrorMessage
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
          error={shouldShowError(owner.id, 'address', 'addressLine1')}
          helperText={getErrorMessage(owner.id, 'address', 'addressLine1')}
          size="medium"
        />
      </Grid>

      {/* Address Line 2 */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          placeholder="Address Line 2"
          value={owner.addressLine2 || ''}
          onChange={(e) => handleFieldChange(owner.id, 'addressLine2', e.target.value)}
          size="medium"
        />
      </Grid>

      {/* City */}
      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          required
          placeholder="City"
          value={owner.addressCity || ''}
          onChange={(e) => handleFieldChange(owner.id, 'addressCity', e.target.value)}
          error={shouldShowError(owner.id, 'address', 'addressCity')}
          helperText={getErrorMessage(owner.id, 'address', 'addressCity')}
          size="medium"
        />
      </Grid>

      {/* Country */}
      <Grid item xs={12} md={3}>
        <FormControl
          fullWidth
          size="medium"
          error={shouldShowError(owner.id, 'address', 'addressCountry')}
        >
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

      {/* State/Province */}
      <Grid item xs={12} md={3}>
        <FormControl
          fullWidth
          error={shouldShowError(owner.id, 'address', 'addressState')}
          size="medium"
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

      {/* ZIP/Postal Code */}
      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          required
          placeholder={owner.addressCountry === '01' ? 'Zip Code' : 'Postal Code'}
          value={owner.addressZipCode || ''}
          onChange={(e) => handleFieldChange(owner.id, 'addressZipCode', e.target.value)}
          error={shouldShowError(owner.id, 'address', 'addressZipCode')}
          helperText={getErrorMessage(owner.id, 'address', 'addressZipCode')}
          size="medium"
        />
      </Grid>

      {/* Same as Mailing Address Checkbox */}
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

      {/* Mailing Address Section */}
      {!owner.sameAsMailingAddress && (
        <>
          <Typography
            ref={mailingAddressRef}
            variant="subtitle1"
            sx={{ m: 2 }}
          >
            Mailing Address
          </Typography>
          <Grid container spacing={2} sx={{
            maxWidth: '100%',
            margin: '0 auto'
          }}>
            {/* Mailing Address Line 1 */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                placeholder="Address Line 1"
                value={owner.mailingAddressLine1 || ''}
                onChange={(e) => handleFieldChange(owner.id, 'mailingAddressLine1', e.target.value)}
                error={shouldShowError(owner.id, 'address', 'mailingAddressLine1')}
                helperText={getErrorMessage(owner.id, 'address', 'mailingAddressLine1')}
                size="medium"
              />
            </Grid>

            {/* Mailing Address Line 2 */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Address Line 2"
                value={owner.mailingAddressLine2 || ''}
                onChange={(e) => handleFieldChange(owner.id, 'mailingAddressLine2', e.target.value)}
                size="medium"
              />
            </Grid>

            {/* Mailing City */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                required
                placeholder="City"
                value={owner.mailingCity || ''}
                onChange={(e) => handleFieldChange(owner.id, 'mailingCity', e.target.value)}
                error={shouldShowError(owner.id, 'address', 'mailingCity')}
                helperText={getErrorMessage(owner.id, 'address', 'mailingCity')}
                size="medium"
              />
            </Grid>

            {/* Mailing Country */}
            <Grid item xs={12} md={3}>
              <FormControl
                fullWidth
                required
                size="medium"
                error={shouldShowError(owner.id, 'address', 'mailingAddressCountry')}
              >
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

            {/* Mailing State/Province */}
            <Grid item xs={12} md={3}>
              <FormControl
                fullWidth
                required
                size="medium"
                error={shouldShowError(owner.id, 'address', 'mailingState')}
              >
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

            {/* Mailing ZIP/Postal Code */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                required
                placeholder={owner.mailingAddressCountry === '01' ? 'Zip Code' : 'Postal Code'}
                value={owner.mailingZipCode || ''}
                onChange={(e) => handleFieldChange(owner.id, 'mailingZipCode', e.target.value)}
                error={shouldShowError(owner.id, 'address', 'mailingZipCode')}
                helperText={getErrorMessage(owner.id, 'address', 'mailingZipCode')}
                size="medium"
              />
            </Grid>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default AddressInfo; 