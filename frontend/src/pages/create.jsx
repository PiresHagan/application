import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Grid,
  Alert,
  Stepper,
  Step,
  StepLabel,
  TextField,
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
import { validateSection, validateOwnerDetails, validateOccupation, validateContact, validateAddress, validateField } from '../utils/validations';

// Constants for better maintainability
const INITIAL_OWNER = {
  id: 1,
  isMainOwner: true,
  ownerType: '01',
  sameAsMailingAddress: true,
  addressCountry: '01',
  mailingAddressCountry: '01',
  countryCode: '01',
};

const SECTION_ORDER = {
  '01': ['ownerDetails', 'occupation', 'contact', 'address'],
  '02': ['ownerDetails', 'contact', 'address']
};

function Create() {
  const [activeStep, setActiveStep] = useState(0);
  const [owners, setOwners] = useState([INITIAL_OWNER]);
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
    1: 'ownerDetails',
    '1-ownerDetails': true
  });
  const [sectionValidation, setSectionValidation] = useState({});
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

  const getSectionOrder = useCallback((ownerType) => {
    return SECTION_ORDER[ownerType] || SECTION_ORDER['01'];
  }, []);

  const validateOwnerSection = useCallback((owner, section) => {
    const { isValid } = validateSection(owner, section, owner.countryCode);
    return isValid;
  }, []);

  const handleSectionChange = (ownerId, section) => (event, isExpanded) => {
    if (!isExpanded) return;
    setFormErrors(false);

    const currentOwner = owners.find(owner => owner.id === ownerId);
    const sectionsOrder = currentOwner.ownerType === '02'
      ? ['ownerDetails', 'contact', 'address']
      : ['ownerDetails', 'occupation', 'contact', 'address'];

    const currentIndex = sectionsOrder.indexOf(section);
    const previousSections = sectionsOrder.slice(0, currentIndex);

    // Check if previous sections are valid
    const canExpand = previousSections.every(
      prevSection => sectionValidation[ownerId]?.[prevSection]
    );

    if (!canExpand) return;

    // Update expanded sections while keeping previous sections expanded
    setExpandedSections(prev => ({
      ...prev,
      [ownerId]: section,
      [`${ownerId}-${section}`]: true
    }));

    // Scroll to the selected section
    setTimeout(() => {
      const sectionElement = document.getElementById(`section-${ownerId}-${section}`);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleDisabledSectionClick = (ownerId, section) => {
    const currentOwner = owners.find(owner => owner.id === ownerId);
    const sectionsOrder = currentOwner.ownerType === '02'
      ? ['ownerDetails', 'contact', 'address']
      : ['ownerDetails', 'occupation', 'contact', 'address'];

    const currentIndex = sectionsOrder.indexOf(section);
    const previousSections = sectionsOrder.slice(0, currentIndex);

    // Mark all previous sections and current section as attempted
    setAttemptedSections(prev => ({
      ...prev,
      [ownerId]: {
        ...prev[ownerId],
        ...previousSections.reduce((acc, sec) => ({ ...acc, [sec]: true }), {}),
        [section]: true
      }
    }));

    // Force error display
    setFormErrors(true);

    // Validate and update section validation state
    const newValidation = {};
    previousSections.forEach(sec => {
      const { isValid } = validateSection(currentOwner, sec, currentOwner.countryCode);
      newValidation[sec] = isValid;
    });

    setSectionValidation(prev => ({
      ...prev,
      [ownerId]: {
        ...prev[ownerId],
        ...newValidation
      }
    }));
  };

  const shouldShowFieldError = (ownerId, sectionName, fieldName) => {
    const owner = owners.find(o => o.id === ownerId);
    let sectionName1 = sectionName;
    if (sectionName === 'ownerDetails') {
      sectionName1 = owner.ownerType === '01'
        ? 'individual'
        : 'corporate';
    };
    return formErrors &&
      attemptedSections[ownerId]?.[sectionName] &&
      owner &&
      !validateField(fieldName, owner[fieldName], sectionName1, owner.countryCode).isValid;
  };

  const getFieldErrorMessage = (ownerId, sectionName, fieldName) => {
    if (!shouldShowFieldError(ownerId, sectionName, fieldName)) return "";
    if (sectionName === 'ownerDetails') {
      sectionName = owners.find(o => o.id === ownerId).ownerType === '01'
        ? 'individual'
        : 'corporate';
    }

    const owner = owners.find(o => o.id === ownerId);
    const { error } = validateField(
      fieldName,
      owner[fieldName],
      sectionName,
      owner.countryCode
    );
    return error || "";
  };

  const handleAddOwner = useCallback(() => {
    if (owners.length < 2) {
      const newOwnerId = owners.length + 1;
      const newOwner = {
        ...INITIAL_OWNER,
        id: newOwnerId,
        isMainOwner: false,
      };

      setOwners(prev => [...prev, newOwner]);
      setExpandedSections(prev => ({
        ...prev,
        [newOwnerId]: 'ownerDetails',
        [`${newOwnerId}-ownerDetails`]: true
      }));
      setFormErrors(false);

      requestAnimationFrame(() => {
        newOwnerRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [owners.length]);

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

  const handleFieldChange = useCallback((ownerId, fieldName, value) => {
    setOwners(prev => prev.map(owner => {
      if (owner.id === ownerId) {
        const updatedOwner = { ...owner, [fieldName]: value };

        // Update validation state
        const newValidation = {
          ownerDetails: validateOwnerSection(updatedOwner, 'ownerDetails'),
          occupation: updatedOwner.ownerType === '02' ? true : validateOwnerSection(updatedOwner, 'occupation'),
          contact: validateOwnerSection(updatedOwner, 'contact'),
          address: validateOwnerSection(updatedOwner, 'address')
        };

        setSectionValidation(prev => ({
          ...prev,
          [ownerId]: newValidation
        }));

        return updatedOwner;
      }
      return owner;
    }));
  }, [validateOwnerSection]);

  const handleSaveAndContinue = async () => {
    // Mark all sections as attempted to show validation errors
    setFormErrors(true);

    owners.forEach(owner => {
      const sectionsToValidate = owner.ownerType === '02'
        ? ['ownerDetails', 'contact', 'address']
        : ['ownerDetails', 'occupation', 'contact', 'address'];

      // Mark all sections as attempted
      setAttemptedSections(prev => ({
        ...prev,
        [owner.id]: {
          ...prev[owner.id],
          ...sectionsToValidate.reduce((acc, section) => ({
            ...acc,
            [section]: true
          }), {})
        }
      }));

      // Update section validation state
      const newValidation = {};
      sectionsToValidate.forEach(section => {
        const { isValid } = validateSection(owner, section, owner.countryCode);
        newValidation[section] = isValid;
      });

      setSectionValidation(prev => ({
        ...prev,
        [owner.id]: {
          ...prev[owner.id],
          ...newValidation
        }
      }));
    });

    // Validate all sections for all owners
    const isValid = owners.every(owner => {
      const sectionsToValidate = owner.ownerType === '02'
        ? ['ownerDetails', 'contact', 'address']
        : ['ownerDetails', 'occupation', 'contact', 'address'];

      return sectionsToValidate.every(section => {
        const { isValid } = validateSection(owner, section, owner.countryCode);
        return isValid;
      });
    });

    if (!isValid) {
      toast.error('Please complete all required fields correctly');
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

      const response = await saveOwners(ownerRequest).unwrap();
      toast.success('Owners saved successfully!');
      setActiveStep((prevStep) => prevStep + 1);
    } catch (error) {
      toast.error('Error saving owners: ' + error.message);
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

                    {owner.ownerType === '01' ? (
                      <>
                        <CollapsibleSection
                          title="Owner Details"
                          isEnabled={true}
                          isExpanded={expandedSections[owner.id] === 'ownerDetails' || expandedSections[`${owner.id}-ownerDetails`]}
                          isValid={sectionValidation[owner.id]?.ownerDetails}
                          onExpand={handleSectionChange(owner.id, 'ownerDetails')}
                          onDisabledClick={() => handleDisabledSectionClick(owner.id, 'ownerDetails')}
                          ownerId={owner.id}
                          sectionName="ownerDetails"
                          expandedSections={expandedSections}
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
                            dropdownValues={dropdownValues}
                            handleFieldChange={handleFieldChange}
                            shouldShowError={shouldShowFieldError}
                            getErrorMessage={getFieldErrorMessage}
                          />
                        </CollapsibleSection>

                        <CollapsibleSection
                          title="Occupation"
                          isEnabled={sectionValidation[owner.id]?.ownerDetails}
                          isExpanded={expandedSections[owner.id] === 'occupation' || expandedSections[`${owner.id}-occupation`]}
                          isValid={sectionValidation[owner.id]?.occupation}
                          onExpand={handleSectionChange(owner.id, 'occupation')}
                          onDisabledClick={() => handleDisabledSectionClick(owner.id, 'occupation')}
                          ownerId={owner.id}
                          sectionName="occupation"
                          expandedSections={expandedSections}
                        >
                          <OccupationInfo
                            owner={owner}
                            dropdownValues={dropdownValues}
                            handleFieldChange={handleFieldChange}
                            shouldShowError={shouldShowFieldError}
                            getErrorMessage={getFieldErrorMessage}
                          />
                        </CollapsibleSection>
                      </>
                    ) : (
                      <CollapsibleSection
                        title="Owner Details"
                        isEnabled={true}
                        isExpanded={expandedSections[owner.id] === 'ownerDetails' || expandedSections[`${owner.id}-ownerDetails`]}
                        isValid={sectionValidation[owner.id]?.ownerDetails}
                        onExpand={handleSectionChange(owner.id, 'ownerDetails')}
                        onDisabledClick={() => handleDisabledSectionClick(owner.id, 'ownerDetails')}
                        ownerId={owner.id}
                        sectionName="ownerDetails"
                        expandedSections={expandedSections}
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
                          dropdownValues={dropdownValues}
                          handleFieldChange={handleFieldChange}
                          shouldShowError={shouldShowFieldError}
                          getErrorMessage={getFieldErrorMessage}
                        />
                      </CollapsibleSection>
                    )}

                    <CollapsibleSection
                      title="Contact Information"
                      isEnabled={owner.ownerType === '01' ? sectionValidation[owner.id]?.occupation : sectionValidation[owner.id]?.ownerDetails}
                      isExpanded={expandedSections[owner.id] === 'contact' || expandedSections[`${owner.id}-contact`]}
                      isValid={sectionValidation[owner.id]?.contact}
                      onExpand={handleSectionChange(owner.id, 'contact')}
                      onDisabledClick={() => handleDisabledSectionClick(owner.id, 'contact')}
                      ownerId={owner.id}
                      sectionName="contact"
                      expandedSections={expandedSections}
                    >
                      <ContactInfo
                        owner={owner}
                        handleFieldChange={handleFieldChange}
                        shouldShowError={shouldShowFieldError}
                        getErrorMessage={getFieldErrorMessage}
                      />
                    </CollapsibleSection>

                    <CollapsibleSection
                      title="Address Details"
                      isEnabled={sectionValidation[owner.id]?.contact}
                      isExpanded={expandedSections[owner.id] === 'address' || expandedSections[`${owner.id}-address`]}
                      isValid={sectionValidation[owner.id]?.address}
                      onExpand={handleSectionChange(owner.id, 'address')}
                      onDisabledClick={() => handleDisabledSectionClick(owner.id, 'address')}
                      ownerId={owner.id}
                      sectionName="address"
                      expandedSections={expandedSections}
                    >
                      <AddressInfo
                        owner={owner}
                        dropdownValues={dropdownValues}
                        handleFieldChange={handleFieldChange}
                        handleSameAsMailingAddressChange={handleSameAsMailingAddressChange}
                        mailingAddressRef={mailingAddressRef}
                        shouldShowError={shouldShowFieldError}
                        getErrorMessage={getFieldErrorMessage}
                      />
                    </CollapsibleSection>
                    {!owner.isMainOwner && (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'row-reverse',
                        }}
                      >
                        <Button
                          variant="contained"
                          onClick={() => handleRemoveOwner(owner.id)}
                          color="error"
                          startIcon={<DeleteIcon />}
                        >
                          Delete
                        </Button>
                      </Box>
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
          </Container>
        </Box>
      )}
    </CreateLayout>
  );
}

export default Create;