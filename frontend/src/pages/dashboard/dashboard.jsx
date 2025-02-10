import React, { useRef, useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Divider,
  Grid,
  IconButton,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import dashboardService from '../../api/dashboardService';
import IndividualInfo from '../../components/owner/IndividualInfo';
import OccupationInfo from '../../components/owner/OccupationInfo';
import CorporateInfo from '../../components/owner/CorporateInfo';
import AddressInfo from '../../components/owner/AddressInfo';
import ContactInfo from '../../components/owner/ContactInfo';

function Dashboard() {
  const [activeStep, setActiveStep] = useState(0);
  const [owners, setOwners] = React.useState([
    {
      id: 1,
      isMainOwner: true,
      ownerType: '01',
      sameAsMailingAddress: true,
      addressCountry: '01',
      mailingAddressCountry: '01',
      countryCode: '01',
    }
  ]);
  const newOwnerRef = useRef(null);
  const [formErrors, setFormErrors] = React.useState(false);
  const [dropdownValues, setDropdownValues] = useState({
    countries: [],
    states: [],
    provinces: [],
    gender: [],
    tobacco: [],
    occupation: []
  });
  const [applicationNumber, setApplicationNumber] = useState('');
  const mailingAddressRef = useRef(null);

  const steps = [
    'Owner Details',
    'Coverage Information',
    'Medical & Lifestyle',
    'Beneficiary Details',
    'Payment & Banking',
    'Review & Declaration',
    'Submission & Confirmation'
  ];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleAddOwner = () => {
    if (owners.length < 2) {
      const newOwner = {
        id: owners.length + 1,
        isMainOwner: false,
        ownerType: '01',
        sameAsMailingAddress: true,
        addressCountry: '01',
        mailingAddressCountry: '01',
        countryCode: '01',
      };
      setOwners([...owners, newOwner]);

      setFormErrors(false);

      setTimeout(() => {
        newOwnerRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleRemoveOwner = (ownerId) => {
    setOwners(owners.filter(owner => owner.id !== ownerId));
  };

  const handleSameAsMailingAddressChange = (ownerId, checked) => {
    setOwners(owners.map(owner =>
      owner.id === ownerId
        ? { ...owner, sameAsMailingAddress: checked }
        : owner
    ));

    if (!checked) {
      setTimeout(() => {
        mailingAddressRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  };

  const handleFieldChange = (ownerId, fieldName, value) => {
    setOwners(owners.map(owner =>
      owner.id === ownerId
        ? { ...owner, [fieldName]: value }
        : owner
    ));
  };

  const validateForm = (owner) => {
    const commonFields = {
      addressLine1: owner.addressLine1,
      addressCity: owner.addressCity,
      addressCountry: owner.addressCountry,
      addressState: owner.addressState,
      addressZipCode: owner.addressZipCode,
      countryCode: owner.countryCode,
      state: owner.state,
    };

    const corporateFields = {
      companyName: owner.companyName,
      businessRegistration: owner.businessRegistration,
      businessType: owner.businessType,
      relationshipToInsured: owner.relationshipToInsured
    };

    const individualFields = {
      firstName: owner.firstName,
      lastName: owner.lastName,
      dateOfBirth: owner.dateOfBirth,
      gender: owner.gender,
      tobacco: owner.tobacco,
      ssn: owner.ssn,
      employer: owner.employer,
      occupation: owner.occupation,
      netWorth: owner.netWorth,
      annualIncome: owner.annualIncome,
      primaryPhone: owner.primaryPhone,
      alternatePhone: owner.alternatePhone,
      email: owner.email,
    };


    const requiredFields = {
      ...commonFields,
      ...(owner.ownerType === '02' ? corporateFields : individualFields),
      ...((!owner.sameAsMailingAddress) && {
        mailingAddressLine1: owner.mailingAddressLine1,
        mailingCity: owner.mailingCity,
        mailingAddressCountry: owner.mailingAddressCountry,
        mailingState: owner.mailingState,
        mailingZipCode: owner.mailingZipCode
      })
    };
    console.log(requiredFields);

    // Check if any required field is empty
    const hasEmptyFields = Object.entries(requiredFields).some(
      ([key, value]) => !value || value.toString().trim() === ''
    );

    return !hasEmptyFields;
  };

  const handleSaveAndContinue = async () => {
    const isValid = owners.every(owner => validateForm(owner));

    if (!isValid) {
      setFormErrors(true);
      return;
    }

    try {
      const ownerRequest = {
        applicationFormNumber: applicationNumber,
        owners: owners.map(owner => ({
          typeCode: owner.ownerType,
          ...(owner.ownerType === '01' ? {
            firstName: owner.firstName,
            lastName: owner.lastName,
            dateOfBirth: owner.dateOfBirth,
            gender: owner.gender,
            tobacco: owner.tobacco,
            ssn: owner.ssn,
            employer: owner.employer,
            occupation: owner.occupation,
            netWorth: owner.netWorth,
            annualIncome: owner.annualIncome,
          } : {
            companyName: owner.companyName,
            businessRegistrationNumber: owner.businessRegistration,
            businessType: owner.businessType,
            relationshipToInsured: owner.relationshipToInsured,
          }),
          countryCode: owner.countryCode,
          stateCode: owner.state,
          addresses: [
            {
              typeCode: "01", 
              addressLine1: owner.addressLine1,
              addressLine2: owner.addressLine2,
              city: owner.addressCity,
              stateCode: owner.addressState,
              countryCode: owner.addressCountry,
              zipCode: owner.addressZipCode

            },
            ...(!owner.sameAsMailingAddress ? [{
              typeCode: "02",
              addressLine1: owner.mailingAddressLine1,
              addressLine2: owner.mailingAddressLine2,
              city: owner.mailingCity,
              stateCode: owner.mailingState,
              countryCode: owner.mailingAddressCountry,
              zipCode: owner.mailingZipCode
            }] : [])
          ]
        }))
      };

      console.log(ownerRequest);

      await dashboardService.saveOwners(ownerRequest);
      setFormErrors(false);
      setActiveStep((prevStep) => prevStep + 1);
    } catch (error) {
      console.error('Error saving owners:', error);
    }
  };

  useEffect(() => {
    const fetchDropdownValues = async () => {
      try {
        const response = await dashboardService.getDropdownValues();
        console.log('Dropdown response:', response.data);
        setDropdownValues(response.data);
      } catch (error) {
        console.error('Error fetching dropdown values:', error);
      }
    };

    fetchDropdownValues();
  }, []);

  useEffect(() => {
    const generateApplicationNumber = () => {
      const randomNum = Math.floor(100000 + Math.random() * 900000); 
      return randomNum;
    };

    setApplicationNumber(generateApplicationNumber());
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="subtitle1"
          sx={{
            minWidth: 'fit-content',
            color: 'text.secondary',
            mb: 3 
          }}
        >
          Application Number: APP{applicationNumber}
        </Typography>

        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            '& .MuiStepLabel-label': {
              fontSize: '0.875rem',
              mt: 1 
            },
            '& .MuiStepIcon-root': {
              fontSize: '2rem',  
            },
            '& .MuiStepIcon-root.Mui-active': {
              color: 'primary.main',  
            },
            '& .MuiStepIcon-root.Mui-completed': {
              color: 'success.main',  
            }
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {activeStep === 0 && (
        <>
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
                onChange={(e) => handleFieldChange(owner.id, 'ownerType', e.target.value)}
                sx={{ mb: 3 }}
              >
                <FormControlLabel
                  value="01"
                  control={<Radio />}
                  label="Individual"
                />
                <FormControlLabel
                  value="02"
                  control={<Radio />}
                  label="Corporate"
                />
              </RadioGroup>

              {owner.ownerType === '01' ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    <IndividualInfo
                      owner={owner}
                      formErrors={formErrors}
                      dropdownValues={dropdownValues}
                      handleFieldChange={handleFieldChange}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <OccupationInfo
                      owner={owner}
                      formErrors={formErrors}
                      handleFieldChange={handleFieldChange}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <ContactInfo
                      owner={owner}
                      formErrors={formErrors}
                      handleFieldChange={handleFieldChange}
                    />
                  </Box>
                </>
              ) : (
                <Box sx={{ mb: 2 }}>
                  <CorporateInfo
                    owner={owner}
                    formErrors={formErrors}
                    dropdownValues={dropdownValues}
                    handleFieldChange={handleFieldChange}
                  />
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <AddressInfo
                  owner={owner}
                  formErrors={formErrors}
                  dropdownValues={dropdownValues}
                  handleFieldChange={handleFieldChange}
                  handleSameAsMailingAddressChange={handleSameAsMailingAddressChange}
                  mailingAddressRef={mailingAddressRef}
                />
              </Box>
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
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="inherit"
                onClick={handleBack}
                disabled={activeStep === 0}
                sx={{
                  bgcolor: 'grey.500',
                  '&:hover': {
                    bgcolor: 'grey.600',
                  }
                }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveAndContinue}
              >
                SAVE AND CONTINUE
              </Button>
            </Box>
          </Box>
        </>
      )}

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
