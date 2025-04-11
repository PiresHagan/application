// Validation rules for each field
const validationRules = {
  product: {
    product: (value) => value && value.length > 0,
    plan: (value) => value && value.length > 0,
  },
  base: {
    insured1: (value) => value && (value > 0 || value === 'add_new'),
    insured2: (value, data) => data.coverageType !== 'joint' || (value && value > 0),
    faceAmount: (value) => value && Number(value) > 10000 && Number(value) < 10000000,
  },
  additional: {
    coverage: (value) => value && value.length > 0,
    insured1: (value) => value && (value > 0 || value === 'add_new'),
    faceAmount: (value) => value && Number(value) > 10000 && Number(value) < 10000000,
  },
  riders: {
    type: (value) => value && value !== 'Please Select',
    waiverType: (value, data) => data.type !== 'Waiver of Premium' || (value && value.length > 0),
    selectedPerson: (value, data) => {
      if (['Waiver of Premium', 'Accidental Death Benefit', 'Disability Income Rider', 'Child Term'].includes(data.type)) {
        return value !== undefined && value !== null && value.toString().length > 0;
      }
      return true;
    },
    faceAmount: (value, data) => {
      if (['Accidental Death Benefit', 'Disability Income Rider'].includes(data.type)) {
        return value && Number(value) > 10000;
      }
      if (data.type === 'Child Term') {
        return value && Number(value) > 1000;
      }
      return true;
    },
    rating: (value, data) => {
      if (['Accidental Death Benefit', 'Disability Income Rider'].includes(data.type)) {
        return value && value.length > 0;
      }
      return true;
    },
    returnOfPremiumType: (value, data) => data.type !== 'Return of Premium' || (value && value.length > 0),
  },
};

// Error messages for each field
const errorMessages = {
  product: {
    product: 'Please select a product',
    plan: 'Please select a plan',
  },
  base: {
    insured1: 'Please select Insured 1',
    insured2: 'Please select Insured 2',
    faceAmount: 'Face amount must be greater than 10,000 and less than 10,000,000',
  },
  additional: {
    coverage: 'Please select coverage type',
    insured1: 'Please select Insured 1',
    faceAmount: 'Face amount must be greater than 0',
  },
  riders: {
    type: 'Please select a valid rider type',
    waiverType: 'Please select waiver type',
    selectedPerson: 'Please select a person',
    faceAmount: (data) => {
      if (['Accidental Death Benefit', 'Disability Income Rider'].includes(data.type)) {
        return 'Face amount must be greater than 10,000';
      }
      return 'Face amount must be greater than 1,000';
    },
    rating: 'Please select a rating',
    returnOfPremiumType: 'Please select return of premium type',
  },
};

// Validate a single field
export const validateField = (section, fieldName, value, data = {}) => {
  const rule = validationRules[section]?.[fieldName];
  if (!rule) return { isValid: true, error: null };
  const isValid = rule(value, data);
  return {
    isValid,
    error: isValid ? null : errorMessages[section][fieldName],
  };
};

// Validate an entire section
export const validateSection = (section, data) => {
  const sectionRules = validationRules[section];
  if (!sectionRules) return { isValid: true, errors: {} };

  const errors = {};
  let isValid = true;

  Object.keys(sectionRules).forEach(fieldName => {
    const { isValid: fieldValid, error } = validateField(section, fieldName, data[fieldName], data);
    if (!fieldValid) {
      errors[fieldName] = error;
      isValid = false;
    }
  });

  return { isValid, errors };
};

// Add a new function to validate a single coverage field
export const validateAdditionalCoverageField = (coverage, fieldName) => {
  const rule = validationRules.additional[fieldName];
  if (!rule) return { isValid: true, error: null };

  const isValid = rule(coverage[fieldName]);
  return {
    isValid,
    error: isValid ? null : errorMessages.additional[fieldName],
  };
};

// Update validateAdditionalCoverage to always validate required fields
export const validateAdditionalCoverage = (coverage, attemptedFields = []) => {
  const errors = {};
  let isValid = true;

  // Always validate required fields
  const requiredFields = ['coverage', 'insured1', 'faceAmount'];

  // Combine required fields with any other attempted fields
  const fieldsToValidate = [...new Set([
    ...requiredFields,
    ...(attemptedFields.length > 0 ? attemptedFields : [])
  ])];

  console.log('Fields to validate:', fieldsToValidate, 'Attempted fields:', attemptedFields, 'Coverage:', coverage);

  fieldsToValidate.forEach(fieldName => {
    const { isValid: fieldValid, error } = validateAdditionalCoverageField(coverage, fieldName);
    if (!fieldValid) {
      errors[fieldName] = error;
      isValid = false;
    }
  });

  return { isValid, errors };
};

// Validate rider item
export const validateRider = (rider) => {
  const errors = {};
  let isValid = true;

  // Validate type first
  const typeValidation = validateField('riders', 'type', rider.type, rider);
  if (!typeValidation.isValid) {
    errors.type = typeValidation.error;
    isValid = false;
  }

  // Only validate other fields if type is valid and not 'Please Select'
  if (rider.type && rider.type !== 'Please Select') {
    Object.keys(validationRules.riders).forEach(fieldName => {
      if (fieldName === 'type') return; // Skip type as it's already validated

      const { isValid: fieldValid, error } = validateField('riders', fieldName, rider[fieldName], rider);
      if (!fieldValid) {
        errors[fieldName] = error;
        isValid = false;
      }
    });
  }

  return { isValid, errors };
};

// Validate all riders
export const validateAllRiders = (riders) => {
  const errors = {};
  let isValid = true;

  riders.forEach(rider => {
    const { isValid: riderValid, errors: riderErrors } = validateRider(rider);
    if (!riderValid) {
      errors[rider.id] = riderErrors;
      isValid = false;
    }
  });

  return { isValid, errors };
};

// Update validateAllAdditionalCoverages to handle empty coverages
export const validateAllAdditionalCoverages = (coverages, attemptedFields = {}) => {
  const errors = {};
  let isValid = true;

  if (coverages.length === 0) {
    return { isValid: true, errors: {} };
  }

  coverages.forEach(coverage => {
    const coverageAttemptedFields = attemptedFields[coverage.id] || [];
    const { isValid: coverageValid, errors: coverageErrors } = validateAdditionalCoverage(coverage, coverageAttemptedFields);
    if (!coverageValid) {
      errors[coverage.id] = coverageErrors;
      isValid = false;
    }
  });

  return { isValid, errors };
}; 