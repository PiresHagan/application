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
import OccupationInfo from '../owner/OccupationInfo';
import ContactInfo from '../owner/ContactInfo';
import AddressInfo from '../owner/AddressInfo';
import { validateSection, validateField } from '../../utils/validations';
import { toast } from 'react-toastify';

function AddOwnerModal({ open, onClose, onSave, dropdownValues, owners, editingOwner }) {
  const getNewId = () => {
    if (owners.length === 0) return 1;
    return Math.max(...owners.map(owner => owner.id)) + 1;
  };

  const INITIAL_OWNER = {
    id: getNewId(),
    ownerType: '01',
    isMainOwner: false,
    sameAsMailingAddress: true,
    addressCountry: '01',
    mailingAddressCountry: '01',
    countryCode: '01',
  };

  const [owner, setOwner] = useState(editingOwner || INITIAL_OWNER);
  const [formErrors, setFormErrors] = useState(false);
  const [attemptedFields, setAttemptedFields] = useState({});

  useEffect(() => {
    if (open) {
      setOwner(editingOwner || {
        ...INITIAL_OWNER,
        id: getNewId()
      });
      setFormErrors(false);
      setAttemptedFields({});
    }
  }, [open, editingOwner]);

  const handleFieldChange = (_, fieldName, value) => {
    setOwner(prev => ({
      ...prev,
      [fieldName]: value
    }));

    setAttemptedFields(prev => ({
      ...prev,
      [fieldName]: true
    }));

    const { isValid } = validateField(fieldName, value, 'individual', owner.countryCode);
    if (!isValid && !formErrors) {
      setFormErrors(true);
    }
  };

  const validateOwner = (checkAll = false) => {
    const requiredFields = [
      'firstName',
      'lastName',
      'dateOfBirth',
      'gender',
      'tobacco',
      'state',
      'ssn'
    ];

    let isValid = true;
    const errors = {};

    requiredFields.forEach(field => {
      if (checkAll || attemptedFields[field]) {
        const result = validateField(field, owner[field], 'individual', owner.countryCode);
        if (!result.isValid) {
          errors[field] = result.error;
          isValid = false;
        }
      }
    });

    return { isValid, errors };
  };

  const handleSave = () => {
    const { isValid, errors } = validateOwner(true);

    if (!isValid) {
      setFormErrors(true);
      const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'tobacco', 'state', 'ssn'];
      setAttemptedFields(prev => ({
        ...prev,
        ...requiredFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
      }));
      toast.error('Please complete all required fields');
      return;
    }

    onSave(owner);
    onClose();
  };

  const handleClose = () => {
    setOwner(INITIAL_OWNER);
    setFormErrors(false);
    setAttemptedFields({});
    onClose();
  };

  const shouldShowError = (_, section, fieldName) => {
    if (!formErrors || !attemptedFields[fieldName]) return false;

    const { isValid } = validateField(fieldName, owner[fieldName], 'individual', owner.countryCode);
    return !isValid;
  };

  const getErrorMessage = (_, section, fieldName) => {
    if (!shouldShowError(_, section, fieldName)) return "";

    const { error } = validateField(fieldName, owner[fieldName], 'individual', owner.countryCode);
    return error;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>{editingOwner ? 'Edit Insured' : 'Add New Insured'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          <IndividualInfo
            owner={owner}
            dropdownValues={dropdownValues}
            handleFieldChange={handleFieldChange}
            shouldShowError={shouldShowError}
            getErrorMessage={getErrorMessage}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {editingOwner ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddOwnerModal; 