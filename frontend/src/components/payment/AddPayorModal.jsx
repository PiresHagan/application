import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    RadioGroup,
    FormControlLabel,
    Radio
} from '@mui/material';
import IndividualInfo from '../owner/IndividualInfo';
import ContactInfo from '../owner/ContactInfo';
import AddressInfo from '../owner/AddressInfo';
import CorporateInfo from '../owner/CorporateInfo';
import { validateSection, validateField } from '../../utils/validations';
import { toast } from 'react-toastify';
import { useSaveOwnersMutation } from '../../slices/createApiSlice';

function AddPayorModal({ open, onClose, onSave, payors, editingPayor, applicationNumber }) {
    const [saveOwners, { isLoading }] = useSaveOwnersMutation();

    const getNewId = () => {
        if (payors.length === 0) return 1;
        return Math.max(...payors.map(payor => payor.id)) + 1;
    };

    const INITIAL_PAYOR = {
        id: getNewId(),
        type: 'payor',
        sameAsMailingAddress: true,
        addressCountry: '01',
        mailingAddressCountry: '01',
        countryCode: '01',
        ownerType: '01',
    };

    const [payor, setPayor] = useState(editingPayor || INITIAL_PAYOR);
    const [formErrors, setFormErrors] = useState(false);
    const [attemptedFields, setAttemptedFields] = useState({});

    useEffect(() => {
        if (open) {
            setPayor(editingPayor || {
                ...INITIAL_PAYOR,
                id: getNewId()
            });
            setFormErrors(false);
            setAttemptedFields({});
        }
    }, [open, editingPayor]);

    const handleFieldChange = (_, fieldName, value) => {
        setPayor(prev => ({
            ...prev,
            [fieldName]: value
        }));

        setAttemptedFields(prev => ({
            ...prev,
            [fieldName]: true
        }));

        const section = fieldName === 'ownerType' ? 'individual' :
            (payor.ownerType === '01' ? 'individual' : 'corporate');
        const { isValid } = validateField(fieldName, value, section, payor.countryCode);
        if (!isValid && !formErrors) {
            setFormErrors(true);
        }
    };

    const handleSameAsMailingAddressChange = (_, isChecked) => {
        setPayor(prev => ({
            ...prev,
            sameAsMailingAddress: isChecked
        }));
    };

    const validatePayor = (checkAll = false) => {
        const requiredIndividualFields = [
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

        const requiredCorporateFields = [
            'companyName',
            'businessRegistration',
            'businessType',
            'email',
            'phone',
            'addressLine1',
            'addressCity',
            'addressState',
            'addressZipCode'
        ];

        const requiredFields = payor.ownerType === '01' ? requiredIndividualFields : requiredCorporateFields;

        let isValid = true;
        const errors = {};

        requiredFields.forEach(field => {
            if (checkAll || attemptedFields[field]) {
                const section = payor.ownerType === '01' ? 'individual' : 'corporate';
                const result = validateField(field, payor[field], section, payor.countryCode);
                if (!result.isValid) {
                    errors[field] = result.error;
                    isValid = false;
                }
            }
        });

        if (!payor.sameAsMailingAddress && checkAll) {
            const mailingFields = [
                'mailingAddressLine1',
                'mailingCity',
                'mailingState',
                'mailingZipCode'
            ];

            mailingFields.forEach(field => {
                const result = validateField(field, payor[field], 'individual', payor.mailingAddressCountry);
                if (!result.isValid) {
                    errors[field] = result.error;
                    isValid = false;
                }
            });
        }

        return { isValid, errors };
    };

    const formatPayorAsOwner = (payor) => {
        if (payor.ownerType === '01') {
            return {
                typeCode: '01',
                firstName: payor.firstName,
                lastName: payor.lastName,
                dateOfBirth: payor.dateOfBirth,
                gender: payor.gender,
                tobacco: payor.tobacco || 'no',
                countryCode: payor.countryCode,
                stateCode: payor.addressState,
                ssn: payor.ssn || '',
                addresses: [
                    {
                        typeCode: '01',
                        statusCode: '01',
                        addressLine1: payor.addressLine1,
                        addressLine2: payor.addressLine2 || '',
                        city: payor.addressCity,
                        stateCode: payor.addressState,
                        countryCode: payor.addressCountry,
                        zipCode: payor.addressZipCode
                    },
                    ...(!payor.sameAsMailingAddress ? [{
                        typeCode: '02',
                        statusCode: '01',
                        addressLine1: payor.mailingAddressLine1,
                        addressLine2: payor.mailingAddressLine2 || '',
                        city: payor.mailingCity,
                        stateCode: payor.mailingState,
                        countryCode: payor.mailingAddressCountry,
                        zipCode: payor.mailingZipCode
                    }] : [])
                ],
                roleCode: '03'
            };
        } else {
            return {
                typeCode: '02',
                companyName: payor.companyName,
                businessRegistrationNumber: payor.businessRegistration,
                businessType: payor.businessType,
                countryCode: payor.countryCode,
                stateCode: payor.addressState,
                addresses: [
                    {
                        typeCode: '01',
                        statusCode: '01',
                        addressLine1: payor.addressLine1,
                        addressLine2: payor.addressLine2 || '',
                        city: payor.addressCity,
                        stateCode: payor.addressState,
                        countryCode: payor.addressCountry,
                        zipCode: payor.addressZipCode
                    },
                    ...(!payor.sameAsMailingAddress ? [{
                        typeCode: '02',
                        statusCode: '01',
                        addressLine1: payor.mailingAddressLine1,
                        addressLine2: payor.mailingAddressLine2 || '',
                        city: payor.mailingCity,
                        stateCode: payor.mailingState,
                        countryCode: payor.mailingAddressCountry,
                        zipCode: payor.mailingZipCode
                    }] : [])
                ],
                roleCode: '03'
            };
        }
    };

    const handleSave = async () => {
        const { isValid, errors } = validatePayor(true);

        if (!isValid) {
            setFormErrors(true);

            const requiredFields = payor.ownerType === '01' ?
                ['firstName', 'lastName', 'dateOfBirth', 'gender', 'email', 'phone', 'addressLine1', 'addressCity', 'addressState', 'addressZipCode'] :
                ['companyName', 'businessRegistration', 'businessType', 'email', 'phone', 'addressLine1', 'addressCity', 'addressState', 'addressZipCode'];

            setAttemptedFields(prev => ({
                ...prev,
                ...requiredFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
            }));

            toast.error('Please complete all required fields');
            return;
        }

        try {
            if (applicationNumber) {
                const ownerRequest = {
                    applicationFormNumber: applicationNumber,
                    owners: [formatPayorAsOwner(payor)]
                };

                await saveOwners(ownerRequest).unwrap();
            }

            onSave(payor);
            onClose();
        } catch (error) {
            console.error('Error saving payor:', error);
            toast.error(`Error saving payor: ${error.message || 'Unknown error'}`);
        }
    };

    const handleClose = () => {
        setPayor(INITIAL_PAYOR);
        setFormErrors(false);
        setAttemptedFields({});
        onClose();
    };

    const shouldShowError = (_, section, fieldName) => {
        if (!formErrors || !attemptedFields[fieldName]) return false;

        const sectionType = payor.ownerType === '01' ? 'individual' : 'corporate';
        const { isValid } = validateField(fieldName, payor[fieldName], sectionType, payor.countryCode);
        return !isValid;
    };

    const getErrorMessage = (_, section, fieldName) => {
        if (!shouldShowError(_, section, fieldName)) return "";

        const sectionType = payor.ownerType === '01' ? 'individual' : 'corporate';
        const { error } = validateField(fieldName, payor[fieldName], sectionType, payor.countryCode);
        return error;
    };

    const mailingAddressRef = React.useRef(null);

    const dropdownValues = {
        countries: [
            { code: '01', description: 'United States' },
            { code: '02', description: 'Canada' }
        ],
        states: [
            { code: 'NY', description: 'New York' },
            { code: 'CA', description: 'California' },
            { code: 'TX', description: 'Texas' }
        ],
        provinces: [
            { code: 'ON', description: 'Ontario' },
            { code: 'BC', description: 'British Columbia' },
            { code: 'QC', description: 'Quebec' }
        ],
        gender: [
            { code: 'male', description: 'Male' },
            { code: 'female', description: 'Female' }
        ]
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>{editingPayor ? 'Edit Payor' : 'Add Payor'}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                    <RadioGroup
                        row
                        value={payor.ownerType}
                        onChange={(e) => handleFieldChange(null, 'ownerType', e.target.value)}
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

                    {payor.ownerType === '01' ? (
                        <IndividualInfo
                            owner={payor}
                            dropdownValues={dropdownValues}
                            handleFieldChange={handleFieldChange}
                            shouldShowError={shouldShowError}
                            getErrorMessage={getErrorMessage}
                        />
                    ) : (
                        <CorporateInfo
                            owner={payor}
                            dropdownValues={dropdownValues}
                            handleFieldChange={handleFieldChange}
                            shouldShowError={shouldShowError}
                            getErrorMessage={getErrorMessage}
                        />
                    )}

                    <ContactInfo
                        owner={payor}
                        handleFieldChange={handleFieldChange}
                        shouldShowError={shouldShowError}
                        getErrorMessage={getErrorMessage}
                    />

                    <AddressInfo
                        owner={payor}
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
                <Button onClick={handleSave} variant="contained" disabled={isLoading}>
                    {isLoading ? 'Saving...' : (editingPayor ? 'Update' : 'Save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AddPayorModal; 