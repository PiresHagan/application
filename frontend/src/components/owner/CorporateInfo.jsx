import React from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const CorporateInfo = ({ owner, formErrors, handleFieldChange, dropdownValues }) => {

  const businessTypes = [
    { value: 'corporation', label: 'Corporation' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'llc', label: 'LLC' },
    { value: 'soleProprietor', label: 'Sole Proprietor' }
  ];

  const relationships = [
    { value: 'employee', label: 'Employee/Executive' },
    { value: 'coOwner', label: 'Co-Owner/Partner' },
    { value: 'shareholder', label: 'Shareholder/Investor' },
    { value: 'subsidiary', label: 'Subsidiary Executive' },
    { value: 'portfolio', label: 'Key Executives in Portfolio Companies' },
    { value: 'owner', label: 'Insured Individual or Business Owner' }
  ];
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          placeholder="Company Name"
          value={owner.companyName || ''}
          onChange={(e) => handleFieldChange(owner.id, 'companyName', e.target.value)}
          error={formErrors && !owner.companyName}
          size="medium"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth required size="medium" error={formErrors && !owner.countryCode}>
          <InputLabel>Registered Country</InputLabel>
          <Select
            value={owner.countryCode || ''}
            onChange={(e) => handleFieldChange(owner.id, 'countryCode', e.target.value)}
            label="Registered Country"
          >

            {dropdownValues.countries?.map((country) => (
              <MenuItem key={country.code} value={country.code}>
                {country.description}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth required size="medium" error={formErrors && !owner.state}>
          <InputLabel>{owner.countryCode === '01' ? 'Registered State' : 'Registered Province'}</InputLabel>
          <Select
            value={owner.state || ''}
            onChange={(e) => handleFieldChange(owner.id, 'state', e.target.value)}
            label={owner.countryCode === '01' ? 'Registered State' : 'Registered Province'}
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

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required
          placeholder="Business Registration Number"
          value={owner.businessRegistration || ''}
          onChange={(e) => handleFieldChange(owner.id, 'businessRegistration', e.target.value)}
          error={formErrors && !owner.businessRegistration}
          size="medium"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth required size="medium" error={formErrors && !owner.businessType}>
          <InputLabel>Business Type</InputLabel>
          <Select
            value={owner.businessType || ''}
            onChange={(e) => handleFieldChange(owner.id, 'businessType', e.target.value)}
            label="Business Type"
          >
            {businessTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <FormControl fullWidth required size="medium" error={formErrors && !owner.relationshipToInsured}>
          <InputLabel>Relationship to Insured</InputLabel>
          <Select
            value={owner.relationshipToInsured || ''}
            onChange={(e) => handleFieldChange(owner.id, 'relationshipToInsured', e.target.value)}
            label="Relationship to Insured"
          >
            {relationships.map((rel) => (
              <MenuItem key={rel.value} value={rel.value}>
                {rel.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default CorporateInfo; 