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
import { toast } from 'react-toastify';
import { useGetDropdownValuesQuery, useSaveOwnersMutation } from '../slices/createApiSlice';
import IndividualInfo from '../components/owner/IndividualInfo';
import OccupationInfo from '../components/owner/OccupationInfo';
import CorporateInfo from '../components/owner/CorporateInfo';
import AddressInfo from '../components/owner/AddressInfo';
import ContactInfo from '../components/owner/ContactInfo';
import CollapsibleSection from '../components/common/CollapsibleSection';
import CreateLayout from '../layouts/CreateLayout';
import Loader from '../components/common/Loader';

function Create() {
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
  const [expandedSections, setExpandedSections] = useState({
    1: 'ownerDetails'
  });
  const [sectionValidation, setSectionValidation] = useState({
    ownerDetails: false,
    occupation: false,
    contact: false,
    address: false
  });
  const [attemptedSections, setAttemptedSections] = useState({});
  const [currentOwnerId, setCurrentOwnerId] = useState(1);

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
      const newOwnerId = owners.length + 1;
      const newOwner = {
        id: newOwnerId,
        isMainOwner: false,
        ownerType: '01',
        sameAsMailingAddress: true,
        addressCountry: '01',
        mailingAddressCountry: '01',
        countryCode: '01',
      };
      setOwners([...owners, newOwner]);

      setExpandedSections(prev => ({
        ...prev,
        [newOwnerId]: 'ownerDetails'
      }));

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

  const validateOwnerDetails = (owner) => {
    const fields = owner.ownerType === '01' ? [
      'firstName',
      'lastName',
      'dateOfBirth',
      'gender',
      'tobacco',
      'countryCode',
      'state',
      'ssn'
    ] : ['companyName', 'businessRegistration', 'businessType', 'relationshipToInsured', 'countryCode', 'state'];
    return fields.every(field => owner[field] && owner[field].toString().trim() !== '');
  };

  const validateOccupation = (owner) => {
    const fields = ['employer', 'occupation', 'netWorth', 'annualIncome'];
    return fields.every(field => owner[field] && owner[field].toString().trim() !== '');
  };

  const validateContact = (owner) => {
    const fields = ['primaryPhone', 'email'];
    return fields.every(field => owner[field] && owner[field].toString().trim() !== '');
  };

  const validateAddress = (owner) => {
    const fields = [
      'addressLine1',
      'addressCity',
      'addressState',
      'addressZipCode',
      ...(owner.sameAsMailingAddress ? [] : [
        'mailingAddressLine1',
        'mailingCity',
        'mailingState',
        'mailingZipCode'
      ])
    ];
    return fields.every(field => owner[field] && owner[field].toString().trim() !== '');
  };

  const handleFieldChange = (ownerId, fieldName, value) => {
    setOwners(owners.map(owner => {
      if (owner.id === ownerId) {
        const updatedOwner = { ...owner, [fieldName]: value };

        const newValidation = {
          ownerDetails: validateOwnerDetails(updatedOwner),
          occupation: validateOccupation(updatedOwner),
          contact: validateContact(updatedOwner),
          address: validateAddress(updatedOwner)
        };

        setSectionValidation(prev => ({
          ...prev,
          [ownerId]: newValidation
        }));

        const sectionsOrder = updatedOwner.ownerType === '02'
          ? ['ownerDetails', 'contact', 'address']  
          : ['ownerDetails', 'occupation', 'contact', 'address'];  

        const currentSection = expandedSections[ownerId];
        const currentIndex = sectionsOrder.indexOf(currentSection);

        if (newValidation[currentSection]) {
          const nextSection = sectionsOrder[currentIndex + 1];
          if (nextSection) {
            setExpandedSections(prev => ({
              ...prev,
              [ownerId]: nextSection
            }));

            setFormErrors(false);
            setAttemptedSections(prev => ({
              ...prev,
              [ownerId]: {
                ...prev[ownerId],
                [currentSection]: true,
                [nextSection]: false
              }
            }));
          }
        }

        return updatedOwner;
      }
      return owner;
    }));
  };

  const handleSectionChange = (ownerId, section) => (event, isExpanded) => {
    setCurrentOwnerId(ownerId);

    const currentOwner = owners.find(owner => owner.id === ownerId);
    const isEnabled = section === 'ownerDetails' ? true :
      section === 'occupation' ? sectionValidation[ownerId]?.ownerDetails :
        section === 'contact' ? (currentOwner.ownerType === '01' ? sectionValidation[ownerId]?.occupation : sectionValidation[ownerId]?.ownerDetails) :
          section === 'address' ? sectionValidation[ownerId]?.contact : false;

    if (!isEnabled) {
      const sectionsOrder = ['ownerDetails', 'occupation', 'contact', 'address'];
      const currentIndex = sectionsOrder.indexOf(section);
      const previousSections = sectionsOrder.slice(0, currentIndex);

      setAttemptedSections(prev => ({
        ...prev,
        [ownerId]: {
          ...prev[ownerId],
          ...previousSections.reduce((acc, sec) => ({ ...acc, [sec]: true }), {})
        }
      }));

      setFormErrors(true);
      return;
    }

    if (isExpanded) {
      setAttemptedSections(prev => ({
        ...prev,
        [ownerId]: {
          ...prev[ownerId],
          [section]: true
        }
      }));

      let canExpand = true;
      const sectionsOrder = ['ownerDetails', 'occupation', 'contact', 'address'];
      const currentIndex = sectionsOrder.indexOf(section);
      const previousSections = sectionsOrder.slice(0, currentIndex);

      for (const prevSection of previousSections) {
        if (!sectionValidation[ownerId]?.[prevSection]) {
          canExpand = false;
          setAttemptedSections(prev => ({
            ...prev,
            [ownerId]: {
              ...prev[ownerId],
              ...previousSections.reduce((acc, sec) => ({ ...acc, [sec]: true }), {})
            }
          }));
          break;
        }
      }

      if (!canExpand) {
        setFormErrors(true);
        return;
      }
    }

    setExpandedSections(prev => ({
      ...prev,
      [ownerId]: isExpanded ? section : false
    }));
  };

  const handleDisabledSectionClick = (ownerId, section) => {
    const sectionsOrder = ['ownerDetails', 'occupation', 'contact', 'address'];
    const currentIndex = sectionsOrder.indexOf(section);
    const previousSections = sectionsOrder.slice(0, currentIndex);

    setAttemptedSections(prev => ({
      ...prev,
      [ownerId]: {
        ...prev[ownerId],
        ...previousSections.reduce((acc, sec) => ({ ...acc, [sec]: true }), {}),
        [section]: false
      }
    }));

    setFormErrors(true);
  };

  const handleSaveAndContinue = async () => {
    const isValid = owners.every(owner => validateOwnerDetails(owner) && validateContact(owner) && validateAddress(owner) && (owner.ownerType === '01' ? validateOccupation(owner) : true));
    console.log(isValid);

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

      await saveOwners(ownerRequest).unwrap();
      setFormErrors(false);
      toast.success('Owners saved successfully!');
      setActiveStep((prevStep) => prevStep + 1);
    } catch (error) {
      console.error('Error saving owners:', error);
    }
  };

  const { data: dropdownValuesData, isLoading: isLoadingDropdowns } = useGetDropdownValuesQuery();
  const [saveOwners, { isLoading: isSaving }] = useSaveOwnersMutation();

  useEffect(() => {
    if (dropdownValuesData) {
      setDropdownValues(dropdownValuesData);
    }
  }, [dropdownValuesData]);

  useEffect(() => {
    const generateApplicationNumber = () => {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      return randomNum;
    };

    setApplicationNumber(generateApplicationNumber());
  }, []);

  return (
    <CreateLayout>
      {isLoadingDropdowns ? (
        <Loader />
      ) : (
        <Box>
          <Container
            maxWidth="xl"
            sx={{
              py: 3,
              pl: { xs: 3, sm: 8 }
            }}
          >
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

                    {owner.ownerType === '01' ? (
                      <>
                        <CollapsibleSection
                          title="Owner Details"
                          isEnabled={true}
                          isExpanded={expandedSections[owner.id] === 'ownerDetails'}
                          isValid={sectionValidation[owner.id]?.ownerDetails}
                          onExpand={handleSectionChange(owner.id, 'ownerDetails')}
                          onDisabledClick={() => handleDisabledSectionClick(owner.id, 'ownerDetails')}
                        >
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
                          <IndividualInfo
                            owner={owner}
                            formErrors={formErrors || attemptedSections[owner.id]?.ownerDetails}
                            dropdownValues={dropdownValues}
                            handleFieldChange={handleFieldChange}
                          />
                        </CollapsibleSection>

                        <CollapsibleSection
                          title="Occupation"
                          isEnabled={sectionValidation[owner.id]?.ownerDetails}
                          isExpanded={expandedSections[owner.id] === 'occupation'}
                          isValid={sectionValidation[owner.id]?.occupation}
                          onExpand={handleSectionChange(owner.id, 'occupation')}
                          onDisabledClick={() => handleDisabledSectionClick(owner.id, 'occupation')}
                        >
                          <OccupationInfo
                            owner={owner}
                            formErrors={formErrors || attemptedSections[owner.id]?.occupation}
                            handleFieldChange={handleFieldChange}
                          />
                        </CollapsibleSection>
                      </>
                    ) : (
                      <CollapsibleSection
                        title="Owner Details"
                        isEnabled={true}
                        isExpanded={expandedSections[owner.id] === 'ownerDetails'}
                        isValid={sectionValidation[owner.id]?.ownerDetails}
                        onExpand={handleSectionChange(owner.id, 'ownerDetails')}
                        onDisabledClick={() => handleDisabledSectionClick(owner.id, 'ownerDetails')}
                      >
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
                        <CorporateInfo
                          owner={owner}
                          formErrors={formErrors || attemptedSections[owner.id]?.ownerDetails}
                          dropdownValues={dropdownValues}
                          handleFieldChange={handleFieldChange}
                        />
                      </CollapsibleSection>
                    )}

                    <CollapsibleSection
                      title="Contact Information"
                      isEnabled={owner.ownerType === '01' ? sectionValidation[owner.id]?.occupation : sectionValidation[owner.id]?.ownerDetails}
                      isExpanded={expandedSections[owner.id] === 'contact'}
                      isValid={sectionValidation[owner.id]?.contact}
                      onExpand={handleSectionChange(owner.id, 'contact')}
                      onDisabledClick={() => handleDisabledSectionClick(owner.id, 'contact')}
                    >
                      <ContactInfo
                        owner={owner}
                        formErrors={formErrors && attemptedSections[owner.id]?.contact}
                        handleFieldChange={handleFieldChange}
                      />
                    </CollapsibleSection>

                    <CollapsibleSection
                      title="Address Details"
                      isEnabled={sectionValidation[owner.id]?.contact}
                      isExpanded={expandedSections[owner.id] === 'address'}
                      isValid={sectionValidation[owner.id]?.address}
                      onExpand={handleSectionChange(owner.id, 'address')}
                      onDisabledClick={() => handleDisabledSectionClick(owner.id, 'address')}
                    >
                      <AddressInfo
                        owner={owner}
                        formErrors={formErrors || attemptedSections[owner.id]?.address}
                        dropdownValues={dropdownValues}
                        handleFieldChange={handleFieldChange}
                        handleSameAsMailingAddressChange={handleSameAsMailingAddressChange}
                        mailingAddressRef={mailingAddressRef}
                      />
                    </CollapsibleSection>
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
                      Next Step
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
        </Box>
      )}
    </CreateLayout>
  );
}

export default Create;
