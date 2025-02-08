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
      {/* Company Name */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          placeholder="Company Name"
          value={owner.companyName || ''}
          onChange={(e) => handleFieldChange(owner.id, 'companyName', e.target.value)}
          error={formErrors && !owner.companyName}
          size="small"
        />
      </Grid>

      {/* Registered Country */}
      <Grid item xs={12} md={6}>
        <FormControl fullWidth required size="small" error={formErrors && !owner.registeredCountry}>
          <InputLabel>Registered Country</InputLabel>
          <Select
            value={owner.registeredCountry || ''}
            onChange={(e) => handleFieldChange(owner.id, 'registeredCountry', e.target.value)}
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

      {/* Registered State/Province */}
      <Grid item xs={12} md={6}>
        <FormControl fullWidth required size="small" error={formErrors && !owner.registeredState}>
          <InputLabel>{owner.registeredCountry === '01' ? 'Registered State' : 'Registered Province'}</InputLabel>
          <Select
            value={owner.registeredState || ''}
            onChange={(e) => handleFieldChange(owner.id, 'registeredState', e.target.value)}
            label={owner.registeredCountry === '01' ? 'Registered State' : 'Registered Province'}
          >
            {owner.registeredCountry === '01'
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

      {/* Business Registration */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required
          placeholder="Business Registration Number"
          value={owner.businessRegistration || ''}
          onChange={(e) => handleFieldChange(owner.id, 'businessRegistration', e.target.value)}
          error={formErrors && !owner.businessRegistration}
          size="small"
        />
      </Grid>

      {/* Business Type */}
      <Grid item xs={12} md={6}>
        <FormControl fullWidth required size="small" error={formErrors && !owner.businessType}>
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

      {/* Relationship to Insured */}
      <Grid item xs={12}>
        <FormControl fullWidth required size="small" error={formErrors && !owner.relationshipToInsured}>
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