import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import IndividualInfo from '../owner/IndividualInfo';
import ContactInfo from '../owner/ContactInfo';
import AddressInfo from '../owner/AddressInfo';
import { validateSection, validateField } from '../../utils/validations';
import { toast } from 'react-toastify';

function AddBeneficiaryModal({ open, onClose, onSave, dropdownValues, beneficiaries, editingBeneficiary }) {
  const getNewId = () => {
    if (beneficiaries.length === 0) return 1;
    return Math.max(...beneficiaries.map(beneficiary => beneficiary.id)) + 1;
  };

  const INITIAL_BENEFICIARY = {
    id: getNewId(),
    type: 'beneficiary',
    sameAsMailingAddress: true,
    addressCountry: '01',
    mailingAddressCountry: '01',
    countryCode: '01',
  };

  const [beneficiary, setBeneficiary] = useState(editingBeneficiary || INITIAL_BENEFICIARY);
  const [formErrors, setFormErrors] = useState(false);
  const [attemptedFields, setAttemptedFields] = useState({});

  useEffect(() => {
    if (open) {
      setBeneficiary(editingBeneficiary || {
        ...INITIAL_BENEFICIARY,
        id: getNewId()
      });
      setFormErrors(false);
      setAttemptedFields({});
    }
  }, [open, editingBeneficiary]);

  const handleFieldChange = (_, fieldName, value) => {
    setBeneficiary(prev => ({
      ...prev,
      [fieldName]: value
    }));

    setAttemptedFields(prev => ({
      ...prev,
      [fieldName]: true
    }));

    const { isValid } = validateField(fieldName, value, 'individual', beneficiary.countryCode);
    if (!isValid && !formErrors) {
      setFormErrors(true);
    }
  };

  const handleSameAsMailingAddressChange = (_, isChecked) => {
    setBeneficiary(prev => ({
      ...prev,
      sameAsMailingAddress: isChecked
    }));
  };

  const validateBeneficiary = (checkAll = false) => {
    const requiredFields = [
      'firstName',
      'lastName',
      'dateOfBirth',
      'gender',
      'email',
      'phone',
      'addressLine1',
      'addressCity',
      'addressState',
      'addressZipCode'
    ];

    let isValid = true;
    const errors = {};

    requiredFields.forEach(field => {
      if (checkAll || attemptedFields[field]) {
        const result = validateField(field, beneficiary[field], 'individual', beneficiary.countryCode);
        if (!result.isValid) {
          errors[field] = result.error;
          isValid = false;
        }
      }
    });

    if (!beneficiary.sameAsMailingAddress && checkAll) {
      const mailingFields = [
        'mailingAddressLine1',
        'mailingCity',
        'mailingState',
        'mailingZipCode'
      ];

      mailingFields.forEach(field => {
        const result = validateField(field, beneficiary[field], 'individual', beneficiary.mailingAddressCountry);
        if (!result.isValid) {
          errors[field] = result.error;
          isValid = false;
        }
      });
    }

    return { isValid, errors };
  };

  const handleSave = () => {
    const { isValid, errors } = validateBeneficiary(true);

    if (!isValid) {
      setFormErrors(true);
      const requiredFields = [
        'firstName', 'lastName', 'dateOfBirth', 'gender',
        'email', 'phone', 'addressLine1', 'addressCity', 'addressState', 'addressZipCode'
      ];
      setAttemptedFields(prev => ({
        ...prev,
        ...requiredFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
      }));
      toast.error('Please complete all required fields');
      return;
    }

    onSave(beneficiary);
    onClose();
  };

  const handleClose = () => {
    setBeneficiary(INITIAL_BENEFICIARY);
    setFormErrors(false);
    setAttemptedFields({});
    onClose();
  };

  const shouldShowError = (_, section, fieldName) => {
    if (!formErrors || !attemptedFields[fieldName]) return false;

    const { isValid } = validateField(fieldName, beneficiary[fieldName], 'individual', beneficiary.countryCode);
    return !isValid;
  };

  const getErrorMessage = (_, section, fieldName) => {
    if (!shouldShowError(_, section, fieldName)) return "";

    const { error } = validateField(fieldName, beneficiary[fieldName], 'individual', beneficiary.countryCode);
    return error;
  };

  const mailingAddressRef = React.useRef(null);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>{editingBeneficiary ? 'Edit Beneficiary' : 'Add Beneficiary'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          <IndividualInfo
            owner={beneficiary}
            dropdownValues={dropdownValues}
            handleFieldChange={handleFieldChange}
            shouldShowError={shouldShowError}
            getErrorMessage={getErrorMessage}
          />
          <ContactInfo
            owner={beneficiary}
            handleFieldChange={handleFieldChange}
            shouldShowError={shouldShowError}
            getErrorMessage={getErrorMessage}
          />
          <AddressInfo
            owner={beneficiary}
            formErrors={formErrors}
            dropdownValues={dropdownValues}
            handleFieldChange={handleFieldChange}
            handleSameAsMailingAddressChange={handleSameAsMailingAddressChange}
            mailingAddressRef={mailingAddressRef}
            shouldShowError={shouldShowError}
            getErrorMessage={getErrorMessage}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {editingBeneficiary ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddBeneficiaryModal; 