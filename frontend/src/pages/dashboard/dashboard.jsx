import React, { useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  Checkbox,
  Button,
  Divider,
  Grid,
  IconButton,
  Alert,
  FormHelperText,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function Dashboard() {
  const [tabValue, setTabValue] = React.useState(0);
  const [owners, setOwners] = React.useState([
    {
      id: 1,
      isMainOwner: true,
      ownerType: 'individual',
      sameAsMailingAddress: true,
      addressCountry: 'us',
      mailingAddressCountry: 'us',
      citizenship: 'us',
      registeredCountry: 'us',
      // Add other owner-specific fields here
    }
  ]);
  const newOwnerRef = useRef(null);
  const [registeredCountry, setRegisteredCountry] = React.useState('us');
  const [formErrors, setFormErrors] = React.useState(false);

  const regionsByCountry = {
    us: [
      { value: 'ca', label: 'California' },
      { value: 'ny', label: 'New York' },
      { value: 'tx', label: 'Texas' }
    ],
    ca: [
      { value: 'qc', label: 'Quebec' },
      { value: 'on', label: 'Ontario' },
      { value: 'ab', label: 'Alberta' }
    ]
  };

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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOwnerTypeChange = (ownerId, newType) => {
    setOwners(owners.map(owner =>
      owner.id === ownerId
        ? { ...owner, ownerType: newType }
        : owner
    ));
  };

  const handleSameAsMailingAddressChange = (ownerId, checked) => {
    setOwners(owners.map(owner =>
      owner.id === ownerId
        ? { ...owner, sameAsMailingAddress: checked }
        : owner
    ));
  };

  const handleAddressCountryChange = (ownerId, country, isMailingAddress = false) => {
    setOwners(owners.map(owner =>
      owner.id === ownerId
        ? {
          ...owner,
          [isMailingAddress ? 'mailingAddressCountry' : 'addressCountry']: country
        }
        : owner
    ));
  };

  const handleAddOwner = () => {
    if (owners.length < 2) {
      const newOwner = {
        id: owners.length + 1,
        isMainOwner: false,
        ownerType: 'individual',
        sameAsMailingAddress: true,
        addressCountry: 'us',
        mailingAddressCountry: 'us',
        citizenship: 'us',
        registeredCountry: 'us',
        // Initialize other owner-specific fields here
      };
      setOwners([...owners, newOwner]);
      // Reset form errors when adding new owner
      setFormErrors(false);

      setTimeout(() => {
        newOwnerRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleRemoveOwner = (ownerId) => {
    setOwners(owners.filter(owner => owner.id !== ownerId));
  };

  const handleFieldChange = (ownerId, fieldName, value) => {
    setOwners(owners.map(owner =>
      owner.id === ownerId
        ? { ...owner, [fieldName]: value }
        : owner
    ));
  };

  const handleCitizenshipChange = (ownerId, value) => {
    setOwners(owners.map(owner =>
      owner.id === ownerId
        ? { ...owner, citizenship: value }
        : owner
    ));
  };

  const validateForm = (owner) => {
    const commonFields = {
      // Fields common to both individual and corporate
      addressLine1: owner.addressLine1,
      city: owner.city,
      addressCountry: owner.addressCountry,
      addressState: owner.addressState,
      zipCode: owner.zipCode,
      // ... other common fields
    };

    const corporateFields = {
      companyName: owner.companyName,
      registeredCountry: owner.registeredCountry,
      registeredState: owner.registeredState,
      businessRegistration: owner.businessRegistration,
      businessType: owner.businessType,
      relationshipToInsured: owner.relationshipToInsured
    };

    const individualFields = {
      firstName: owner.firstName,
      lastName: owner.lastName,
      dateOfBirth: owner.dateOfBirth,
      gender: owner.gender,
      // ... other individual fields
    };

    const requiredFields = {
      ...commonFields,
      ...(owner.ownerType === 'corporate' ? corporateFields : individualFields),
      // Add mailing address fields if needed
      ...((!owner.sameAsMailingAddress) && {
        mailingAddressLine1: owner.mailingAddressLine1,
        mailingCity: owner.mailingCity,
        mailingAddressCountry: owner.mailingAddressCountry,
        mailingState: owner.mailingState,
        mailingZipCode: owner.mailingZipCode
      })
    };

    // Check if any required field is empty
    const hasEmptyFields = Object.entries(requiredFields).some(
      ([key, value]) => !value || value.toString().trim() === ''
    );

    return !hasEmptyFields;
  };

  const handleSaveAndContinue = () => {
    const isValid = owners.every(owner => validateForm(owner));
    console.log(owners);

    if (!isValid) {
      setFormErrors(true);
      // Show error message
      return;
    }

    setFormErrors(false);
    // Proceed with save logic
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{
        mb: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>
        <Typography
          variant="subtitle1"
          sx={{
            minWidth: 'fit-content',
            color: 'text.secondary'
          }}
        >
          Application Number: APP859261
        </Typography>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            mr: 2, // Add margin to the right
            height: '20px',
            alignSelf: 'center'
          }}
        />

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              fontSize: '0.875rem',
              minHeight: '48px',
            }
          }}
        >
          <Tab label="OWNER DETAILS" />
          <Tab label="COVERAGE DETAILS" />
          <Tab label="SUMMARY" />
        </Tabs>
      </Box>

      {owners.map((owner, index) => (
        <Box
          key={owner.id}
          ref={index === owners.length - 1 ? newOwnerRef : null}
          sx={{
            mb: 4,
            p: 3,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            position: 'relative'
          }}
        >
          {!owner.isMainOwner && (
            <IconButton
              onClick={() => handleRemoveOwner(owner.id)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: 'error.main',
              }}
            >
              <DeleteIcon />
            </IconButton>
          )}

          <RadioGroup
            row
            value={owner.ownerType}
            onChange={(e) => handleOwnerTypeChange(owner.id, e.target.value)}
            sx={{ mb: 3 }}
          >
            <FormControlLabel
              value="individual"
              control={<Radio />}
              label="Individual"
            />
            <FormControlLabel
              value="corporate"
              control={<Radio />}
              label="Corporate"
            />
          </RadioGroup>

          {owner.ownerType === 'corporate' ? (
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
                  helperText={formErrors && !owner.companyName ? "Company Name is required" : ""}
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
                    <MenuItem value="us">United States</MenuItem>
                    <MenuItem value="ca">Canada</MenuItem>
                  </Select>
                  {formErrors && !owner.registeredCountry && (
                    <FormHelperText>Registered Country is required</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Registered State/Province */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required size="small" error={formErrors && !owner.registeredState}>
                  <InputLabel>{owner.registeredCountry === 'us' ? 'Registered State' : 'Registered Province'}</InputLabel>
                  <Select
                    value={owner.registeredState || ''}
                    onChange={(e) => handleFieldChange(owner.id, 'registeredState', e.target.value)}
                    label={owner.registeredCountry === 'us' ? 'Registered State' : 'Registered Province'}
                  >
                    {regionsByCountry[owner.registeredCountry]?.map((region) => (
                      <MenuItem key={region.value} value={region.value}>
                        {region.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors && !owner.registeredState && (
                    <FormHelperText>
                      {owner.registeredCountry === 'us' ? 'Registered State is required' : 'Registered Province is required'}
                    </FormHelperText>
                  )}
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
                  helperText={formErrors && !owner.businessRegistration ? "Business Registration Number is required" : ""}
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
                  {formErrors && !owner.businessType && (
                    <FormHelperText>Business Type is required</FormHelperText>
                  )}
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
                  {formErrors && !owner.relationshipToInsured && (
                    <FormHelperText>Relationship to Insured is required</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Primary Address */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  placeholder="Address Line 1"
                  value={owner.addressLine1 || ''}
                  onChange={(e) => handleFieldChange(owner.id, 'addressLine1', e.target.value)}
                  error={formErrors && !owner.addressLine1}
                  helperText={formErrors && !owner.addressLine1 ? "Address Line 1 is required" : ""}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Address Line 2"
                  value={owner.addressLine2 || ''}
                  onChange={(e) => handleFieldChange(owner.id, 'addressLine2', e.target.value)}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  required
                  placeholder="City"
                  value={owner.city || ''}
                  onChange={(e) => handleFieldChange(owner.id, 'city', e.target.value)}
                  error={formErrors && !owner.city}
                  helperText={formErrors && !owner.city ? "City is required" : ""}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth required size="small" error={formErrors && !owner.addressCountry}>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={owner.addressCountry || 'us'}
                    onChange={(e) => handleAddressCountryChange(owner.id, e.target.value)}
                    label="Country"
                  >
                    <MenuItem value="us">United States</MenuItem>
                    <MenuItem value="ca">Canada</MenuItem>
                  </Select>
                  {formErrors && !owner.addressCountry && (
                    <FormHelperText>Country is required</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth required size="small" error={formErrors && !owner.addressState}>
                  <InputLabel>{owner.addressCountry === 'us' ? 'State' : 'Province'}</InputLabel>
                  <Select
                    value={owner.addressState || ''}
                    onChange={(e) => handleFieldChange(owner.id, 'addressState', e.target.value)}
                    label={owner.addressCountry === 'us' ? 'State' : 'Province'}
                  >
                    {regionsByCountry[owner.addressCountry]?.map((region) => (
                      <MenuItem key={region.value} value={region.value}>
                        {region.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors && !owner.addressState && (
                    <FormHelperText>
                      {owner.addressCountry === 'us' ? 'State is required' : 'Province is required'}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  required
                  placeholder={owner.addressCountry === 'us' ? 'Zip Code' : 'Postal Code'}
                  value={owner.zipCode || ''}
                  onChange={(e) => handleFieldChange(owner.id, 'zipCode', e.target.value)}
                  error={formErrors && !owner.zipCode}
                  helperText={formErrors && !owner.zipCode
                    ? owner.addressCountry === 'us'
                      ? "Zip Code is required"
                      : "Postal Code is required"
                    : ""}
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
                  <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
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
                        helperText={formErrors && !owner.mailingAddressLine1 ? "Address Line 1 is required" : ""}
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
                        helperText={formErrors && !owner.mailingCity ? "City is required" : ""}
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth required size="small" error={formErrors && !owner.mailingAddressCountry}>
                        <InputLabel>Country</InputLabel>
                        <Select
                          value={owner.mailingAddressCountry}
                          onChange={(e) => handleAddressCountryChange(owner.id, e.target.value, true)}
                          label="Country"
                        >
                          <MenuItem value="us">United States</MenuItem>
                          <MenuItem value="ca">Canada</MenuItem>
                        </Select>
                        {formErrors && !owner.mailingAddressCountry && (
                          <FormHelperText>Country is required</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth required size="small" error={formErrors && !owner.mailingState}>
                        <InputLabel>{owner.mailingAddressCountry === 'us' ? 'State' : 'Province'}</InputLabel>
                        <Select
                          value={owner.mailingState || ''}
                          onChange={(e) => handleFieldChange(owner.id, 'mailingState', e.target.value)}
                          label={owner.mailingAddressCountry === 'us' ? 'State' : 'Province'}
                        >
                          {regionsByCountry[owner.mailingAddressCountry]?.map((region) => (
                            <MenuItem key={region.value} value={region.value}>
                              {region.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {formErrors && !owner.mailingState && (
                          <FormHelperText>
                            {owner.mailingAddressCountry === 'us' ? 'State is required' : 'Province is required'}
                          </FormHelperText>
                        )}
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        required
                        placeholder={owner.mailingAddressCountry === 'us' ? 'Zip Code' : 'Postal Code'}
                        value={owner.mailingZipCode || ''}
                        onChange={(e) => handleFieldChange(owner.id, 'mailingZipCode', e.target.value)}
                        error={formErrors && !owner.mailingZipCode}
                        helperText={formErrors && !owner.mailingZipCode
                          ? owner.mailingAddressCountry === 'us'
                            ? "Zip Code is required"
                            : "Postal Code is required"
                          : ""}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </>
              )}
            </Grid>
          ) : (
            <Grid container spacing={2}>
              {/* First Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  placeholder="First Name"
                  value={owner.firstName || ''}
                  onChange={(e) => handleFieldChange(owner.id, 'firstName', e.target.value)}
                  error={formErrors && !owner.firstName}
                  helperText={formErrors && !owner.firstName ? "First Name is required" : ""}
                  size="small"
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
                  error={formErrors && !owner.lastName}
                  helperText={formErrors && !owner.lastName ? "Last Name is required" : ""}
                  size="small"
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
                  error={formErrors && !owner.dateOfBirth}
                  helperText={formErrors && !owner.dateOfBirth ? "Date of Birth is required" : ""}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Gender */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required size="small" error={formErrors && !owner.gender}>
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
                  {formErrors && !owner.gender && (
                    <FormHelperText>Gender is required</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Tobacco Status */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required size="small" error={formErrors && !owner.tobaccoStatus}>
                  <InputLabel>Tobacco Status</InputLabel>
                  <Select
                    value={owner.tobaccoStatus || ''}
                    onChange={(e) => handleFieldChange(owner.id, 'tobaccoStatus', e.target.value)}
                    label="Tobacco Status"
                  >
                    <MenuItem value="yes">Smoker</MenuItem>
                    <MenuItem value="no">Non-Smoker</MenuItem>
                  </Select>
                  {formErrors && !owner.tobaccoStatus && (
                    <FormHelperText>Tobacco Status is required</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required size="small" error={formErrors && !owner.citizenship}>
                  <InputLabel>Citizenship</InputLabel>
                  <Select
                    value={owner.citizenship}
                    onChange={(e) => handleCitizenshipChange(owner.id, e.target.value)}
                    label="Citizenship"
                  >
                    <MenuItem value="us">United States</MenuItem>
                    <MenuItem value="ca">Canada</MenuItem>
                  </Select>
                  {formErrors && !owner.citizenship && (
                    <FormHelperText>Citizenship is required</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required size="small" error={formErrors && !owner.state}>
                  <InputLabel>{owner.citizenship === 'us' ? 'State' : 'Province'}</InputLabel>
                  <Select
                    value={owner.state || ''}
                    onChange={(e) => handleFieldChange(owner.id, 'state', e.target.value)}
                    label={owner.citizenship === 'us' ? 'State' : 'Province'}
                  >
                    {regionsByCountry[owner.citizenship]?.map((region) => (
                      <MenuItem key={region.value} value={region.value}>
                        {region.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors && !owner.state && (
                    <FormHelperText>
                      {owner.citizenship === 'us' ? 'State is required' : 'Province is required'}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  required
                  placeholder="SSN"
                  value={owner.ssn || ''}
                  onChange={(e) => handleFieldChange(owner.id, 'ssn', e.target.value)}
                  error={formErrors && !owner.ssn}
                  helperText={formErrors && !owner.ssn ? "SSN is required" : ""}
                  size="small"
                />
              </Grid>

              {/* Employer */}
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  required
                  placeholder="Employer"
                  value={owner.employer || ''}
                  onChange={(e) => handleFieldChange(owner.id, 'employer', e.target.value)}
                  error={formErrors && !owner.employer}
                  helperText={formErrors && !owner.employer ? "Employer is required" : ""}
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
                  {formErrors && !owner.occupation && (
                    <FormHelperText>Occupation is required</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Net Worth */}
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  required
                  placeholder="Net Worth"
                  value={owner.netWorth || ''}
                  onChange={(e) => handleFieldChange(owner.id, 'netWorth', e.target.value)}
                  error={formErrors && !owner.netWorth}
                  helperText={formErrors && !owner.netWorth ? "Net Worth is required" : ""}
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
                  helperText={formErrors && !owner.annualIncome ? "Annual Income is required" : ""}
                  size="small"
                />
              </Grid>

              {/* Primary Phone */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  placeholder="Primary Phone Number"
                  value={owner.primaryPhone || ''}
                  onChange={(e) => handleFieldChange(owner.id, 'primaryPhone', e.target.value)}
                  error={formErrors && !owner.primaryPhone}
                  helperText={formErrors && !owner.primaryPhone ? "Primary Phone is required" : ""}
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
                  helperText={formErrors && !owner.email ? "Email is required" : ""}
                  size="small"
                />
              </Grid>

              {/* Address Line 1 */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  placeholder="Address Line 1"
                  value={owner.addressLine1 || ''}
                  onChange={(e) => handleFieldChange(owner.id, 'addressLine1', e.target.value)}
                  error={formErrors && !owner.addressLine1}
                  helperText={formErrors && !owner.addressLine1 ? "Address Line 1 is required" : ""}
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
                  helperText={formErrors && !owner.city ? "City is required" : ""}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={owner.addressCountry}
                    onChange={(e) => handleAddressCountryChange(owner.id, e.target.value)}
                    label="Country"
                  >
                    <MenuItem value="us">United States</MenuItem>
                    <MenuItem value="ca">Canada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth required size="small" error={formErrors && !owner.addressState}>
                  <InputLabel>{owner.addressCountry === 'us' ? 'State' : 'Province'}</InputLabel>
                  <Select
                    value={owner.addressState || ''}
                    onChange={(e) => handleFieldChange(owner.id, 'addressState', e.target.value)}
                    label={owner.addressCountry === 'us' ? 'State' : 'Province'}
                  >
                    {regionsByCountry[owner.addressCountry]?.map((region) => (
                      <MenuItem key={region.value} value={region.value}>
                        {region.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors && !owner.addressState && (
                    <FormHelperText>
                      {owner.addressCountry === 'us' ? 'State is required' : 'Province is required'}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  required
                  placeholder={owner.addressCountry === 'us' ? 'Zip Code' : 'Postal Code'}
                  value={owner.zipCode || ''}
                  onChange={(e) => handleFieldChange(owner.id, 'zipCode', e.target.value)}
                  error={formErrors && !owner.zipCode}
                  helperText={formErrors && !owner.zipCode
                    ? owner.addressCountry === 'us'
                      ? "Zip Code is required"
                      : "Postal Code is required"
                    : ""}
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
                  <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
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
                        helperText={formErrors && !owner.mailingAddressLine1 ? "Address Line 1 is required" : ""}
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
                        helperText={formErrors && !owner.mailingCity ? "City is required" : ""}
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth required size="small" error={formErrors && !owner.mailingAddressCountry}>
                        <InputLabel>Country</InputLabel>
                        <Select
                          value={owner.mailingAddressCountry}
                          onChange={(e) => handleAddressCountryChange(owner.id, e.target.value, true)}
                          label="Country"
                        >
                          <MenuItem value="us">United States</MenuItem>
                          <MenuItem value="ca">Canada</MenuItem>
                        </Select>
                        {formErrors && !owner.mailingAddressCountry && (
                          <FormHelperText>Country is required</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth required size="small" error={formErrors && !owner.mailingState}>
                        <InputLabel>{owner.mailingAddressCountry === 'us' ? 'State' : 'Province'}</InputLabel>
                        <Select
                          value={owner.mailingState || ''}
                          onChange={(e) => handleFieldChange(owner.id, 'mailingState', e.target.value)}
                          label={owner.mailingAddressCountry === 'us' ? 'State' : 'Province'}
                        >
                          {regionsByCountry[owner.mailingAddressCountry]?.map((region) => (
                            <MenuItem key={region.value} value={region.value}>
                              {region.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {formErrors && !owner.mailingState && (
                          <FormHelperText>
                            {owner.mailingAddressCountry === 'us' ? 'State is required' : 'Province is required'}
                          </FormHelperText>
                        )}
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        required
                        placeholder={owner.mailingAddressCountry === 'us' ? 'Zip Code' : 'Postal Code'}
                        value={owner.mailingZipCode || ''}
                        onChange={(e) => handleFieldChange(owner.id, 'mailingZipCode', e.target.value)}
                        error={formErrors && !owner.mailingZipCode}
                        helperText={formErrors && !owner.mailingZipCode
                          ? owner.mailingAddressCountry === 'us'
                            ? "Zip Code is required"
                            : "Postal Code is required"
                          : ""}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </Box>
      ))}

      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 2,
        mt: 3,
        '@media (max-width: 600px)': {
          flexDirection: 'column',
        }
      }}>
        <Button
          variant="contained"
          color="inherit"
          onClick={handleAddOwner}
          disabled={owners.length >= 2}
          sx={{
            bgcolor: 'grey.500',
            '&:hover': {
              bgcolor: 'grey.600',
            }
          }}
        >
          ADD OWNER
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveAndContinue}
        >
          SAVE AND CONTINUE
        </Button>
      </Box>

      {formErrors && (
        <Grid container justifyContent="center">
          <Grid item xs={12} md={3}>
            <Alert
              severity="error"
              sx={{ mt: 2 }}
            >
              Please complete all required fields.
            </Alert>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

export default Dashboard;
