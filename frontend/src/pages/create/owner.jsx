import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import { useGetDropdownValuesQuery, useSaveOwnersMutation } from '../../slices/createApiSlice';
import IndividualInfo from '../../components/owner/IndividualInfo';
import OccupationInfo from '../../components/owner/OccupationInfo';
import CorporateInfo from '../../components/owner/CorporateInfo';
import AddressInfo from '../../components/owner/AddressInfo';
import ContactInfo from '../../components/owner/ContactInfo';
import CollapsibleSection from '../../components/common/CollapsibleSection';
import Loader from '../../components/common/Loader';
import { validateSection, validateField } from '../../utils/validations';

import { useDispatch, useSelector } from 'react-redux';
import { nextStep, previousStep } from '../../slices/stepSlice';
import {
  setOwners,
  setExpandedSections,
  setSectionValidation,
  setAttemptedSections
} from '../../slices/ownerSlice';

const INITIAL_OWNER = {
  id: 1,
  isMainOwner: true,
  ownerType: '01',
  sameAsMailingAddress: true,
  addressCountry: '01',
  mailingAddressCountry: '01',
  countryCode: '01',
};

const getPreviousSection = (currentSection, ownerType) => {
  const sectionsOrder = ownerType === '02'
    ? ['ownerDetails', 'contact', 'address']
    : ['ownerDetails', 'occupation', 'contact', 'address'];

  const currentIndex = sectionsOrder.indexOf(currentSection);
  return currentIndex > 0 ? sectionsOrder[currentIndex - 1] : null;
};

function Owner({ applicationNumber, onStepComplete }) {
  const dispatch = useDispatch();

  const owners = useSelector(state => state.owner.owners);
  const expandedSections = useSelector(state => state.owner.expandedSections);
  const sectionValidation = useSelector(state => state.owner.sectionValidation);
  const attemptedSections = useSelector(state => state.owner.attemptedSections);

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
  const mailingAddressRef = useRef(null);

  const validateOwnerSection = useCallback((owner, section) => {
    const { isValid } = validateSection(owner, section, owner.countryCode);
    return isValid;
  }, []);

  const handleBack = () => {
    dispatch(previousStep());
  };

  const handleSectionChange = (ownerId, sectionName) => () => {
    if (expandedSections[ownerId] === sectionName || expandedSections[`${ownerId}-${sectionName}`]) {
      dispatch(setExpandedSections({
        ...expandedSections,
        [ownerId]: null,
        [`${ownerId}-${sectionName}`]: null
      }));
      return;
    }

    const owner = owners.find(o => o.id === ownerId);
    const previousSection = getPreviousSection(sectionName, owner.ownerType);

    if (previousSection) {
      const { isValid } = validateSection(owner, previousSection, owner.countryCode);
      if (!isValid) {
        setFormErrors(true);
        return;
      }
    }

    setFormErrors(false);
    dispatch(setExpandedSections({
      ...expandedSections,
      [ownerId]: sectionName,
      [`${ownerId}-${sectionName}`]: true
    }));

    setTimeout(() => {
      const sectionElement = document.getElementById(`section-${ownerId}-${sectionName}`);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 200);
  };

  const handleDisabledSectionClick = (ownerId, section) => {
    const currentOwner = owners.find(owner => owner.id === ownerId);
    const sectionsOrder = currentOwner.ownerType === '02'
      ? ['ownerDetails', 'contact', 'address']
      : ['ownerDetails', 'occupation', 'contact', 'address'];

    const currentIndex = sectionsOrder.indexOf(section);
    const previousSections = sectionsOrder.slice(0, currentIndex);

    dispatch(setAttemptedSections({
      ...attemptedSections,
      [ownerId]: {
        ...attemptedSections[ownerId],
        ...previousSections.reduce((acc, sec) => ({ ...acc, [sec]: true }), {}),
        [section]: true
      }
    }));

    setFormErrors(true);

    const newValidation = {};
    previousSections.forEach(sec => {
      const { isValid } = validateSection(currentOwner, sec, currentOwner.countryCode);
      newValidation[sec] = isValid;
    });

    dispatch(setSectionValidation({
      ...sectionValidation,
      [ownerId]: {
        ...sectionValidation[ownerId],
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

      dispatch(setOwners([...owners, newOwner]));
      dispatch(setExpandedSections({
        ...expandedSections,
        [newOwnerId]: 'ownerDetails',
        [`${newOwnerId}-ownerDetails`]: true
      }));
      setFormErrors(false);

      requestAnimationFrame(() => {
        newOwnerRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [dispatch, owners, expandedSections]);

  const handleRemoveOwner = (ownerId) => {
    dispatch(setOwners(owners.filter(owner => owner.id !== ownerId)));
  };

  const handleSameAsMailingAddressChange = (ownerId, checked) => {
    const updatedOwners = owners.map(owner =>
      owner.id === ownerId
        ? { ...owner, sameAsMailingAddress: checked }
        : owner
    );

    dispatch(setOwners(updatedOwners));

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
    const updatedOwners = owners.map(owner => {
      if (owner.id === ownerId) {
        const updatedOwner = { ...owner, [fieldName]: value };

        const newValidation = {
          ownerDetails: validateOwnerSection(updatedOwner, 'ownerDetails'),
          occupation: updatedOwner.ownerType === '02' ? true : validateOwnerSection(updatedOwner, 'occupation'),
          contact: validateOwnerSection(updatedOwner, 'contact'),
          address: validateOwnerSection(updatedOwner, 'address')
        };

        dispatch(setSectionValidation({
          ...sectionValidation,
          [ownerId]: newValidation
        }));

        return updatedOwner;
      }
      return owner;
    });

    dispatch(setOwners(updatedOwners));
  }, [dispatch, owners, sectionValidation, validateOwnerSection]);

  const handleSaveAndContinue = async () => {
    setFormErrors(true);

    owners.forEach(owner => {
      const sectionsToValidate = owner.ownerType === '02'
        ? ['ownerDetails', 'contact', 'address']
        : ['ownerDetails', 'occupation', 'contact', 'address'];

      dispatch(setAttemptedSections({
        ...attemptedSections,
        [owner.id]: {
          ...attemptedSections[owner.id],
          ...sectionsToValidate.reduce((acc, section) => ({
            ...acc,
            [section]: true
          }), {})
        }
      }));

      const newValidation = {};
      sectionsToValidate.forEach(section => {
        const { isValid } = validateSection(owner, section, owner.countryCode);
        newValidation[section] = isValid;
      });

      dispatch(setSectionValidation({
        ...sectionValidation,
        [owner.id]: {
          ...sectionValidation[owner.id],
          ...newValidation
        }
      }));
    });

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

      const response = await saveOwners(ownerRequest).unwrap();
      toast.success('Owners saved successfully!');
      dispatch(nextStep());
    } catch (error) {
      toast.error('Error saving owners: ' + error.message);
    }
  };

  const activeStep = useSelector((state) => state.step.activeStep);

  const { data: dropdownValuesData, isLoading: isLoadingDropdowns } = useGetDropdownValuesQuery();
  const [saveOwners, { isLoading: isSaving }] = useSaveOwnersMutation();

  useEffect(() => {
    if (dropdownValuesData) {
      setDropdownValues(dropdownValuesData);
    }
  }, [dropdownValuesData]);

  useEffect(() => {
    const isValid = owners.every(owner => {
      const sectionsToValidate = owner.ownerType === '02'
        ? ['ownerDetails', 'contact', 'address']
        : ['ownerDetails', 'occupation', 'contact', 'address'];

      return sectionsToValidate.every(section =>
        sectionValidation[owner.id]?.[section] === true
      );
    });

    if (onStepComplete) {
      onStepComplete(isValid);
    }

  }, [owners, sectionValidation, onStepComplete]);

  return (
    <>
      {isLoadingDropdowns ? (
        <Loader />
      ) : (
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
                Back Step
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
    </>
  );
}

export default Owner;