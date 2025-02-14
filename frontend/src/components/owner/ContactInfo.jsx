import React from 'react';
import { Grid, TextField } from '@mui/material';

const ContactInfo = ({
  owner,
  handleFieldChange,
  shouldShowError,
  getErrorMessage
}) => {
  return (
    <Grid container spacing={2}>
      {/* Primary Phone */}
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          required
          placeholder="Primary Phone"
          value={owner.primaryPhone || ''}
          onChange={(e) => handleFieldChange(owner.id, 'primaryPhone', e.target.value)}
          error={shouldShowError(owner.id, 'contact', 'primaryPhone')}
          helperText={getErrorMessage(owner.id, 'contact', 'primaryPhone')}
          size="medium"
        />
      </Grid>

      {/* Alternate Phone */}
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          placeholder="Alternate Phone"
          value={owner.alternatePhone || ''}
          onChange={(e) => handleFieldChange(owner.id, 'alternatePhone', e.target.value)}
          error={shouldShowError(owner.id, 'contact', 'alternatePhone')}
          helperText={getErrorMessage(owner.id, 'contact', 'alternatePhone')}
          size="medium"
        />
      </Grid>

      {/* Email */}
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          required
          placeholder="Email"
          value={owner.email || ''}
          onChange={(e) => handleFieldChange(owner.id, 'email', e.target.value)}
          error={shouldShowError(owner.id, 'contact', 'email')}
          helperText={getErrorMessage(owner.id, 'contact', 'email')}
          size="medium"
        />
      </Grid>
    </Grid>
  );
};

export default ContactInfo; 