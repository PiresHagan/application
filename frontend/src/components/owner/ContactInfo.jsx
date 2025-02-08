import React from 'react';
import { Grid, TextField, } from '@mui/material';

const ContactInfo = ({ owner, formErrors, handleFieldChange }) => {
  return (
    <Grid container spacing={2}>
      {/* Primary Phone */}
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          required
          placeholder="Primary Phone Number"
          value={owner.primaryPhone || ''}
          onChange={(e) => handleFieldChange(owner.id, 'primaryPhone', e.target.value)}
          error={formErrors && !owner.primaryPhone}
          size="small"
        />
      </Grid>

      {/* Alternate Phone - Not Required */}
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          placeholder="Alternate Phone Number"
          value={owner.alternatePhone || ''}
          onChange={(e) => handleFieldChange(owner.id, 'alternatePhone', e.target.value)}
          size="small"
        />
      </Grid>

      {/* Email */}
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          required
          type="email"
          placeholder="Email Address"
          value={owner.email || ''}
          onChange={(e) => handleFieldChange(owner.id, 'email', e.target.value)}
          error={formErrors && !owner.email}
          size="small"
        />
      </Grid>
    </Grid>
  );
};

export default ContactInfo; 