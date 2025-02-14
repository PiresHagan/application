const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const formatCurrency = (amount) => {
  return amount.replace(/\D/g, '')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const isValidPostalCode = (code, country) => {
  const patterns = {
    '01': /^\d{5}(-\d{4})?$/,
    '02': /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
  };
  return patterns[country] ? patterns[country].test(code) : true;
};

const isValidPhoneNumber = (phone, country) => {
  const patterns = {
    '01': /^\+?1?\d{10}$/, // US/Canada
    '02': /^\+?1?\d{10}$/, // Canada
    default: /^\+?\d{8,15}$/
  };
  const pattern = patterns[country] || patterns.default;
  return pattern.test(phone.replace(/\D/g, ''));
};

export const determineSection = (fieldName) => {
  // Individual/Corporate Info fields
  if (['firstName', 'lastName', 'dateOfBirth', 'gender', 'tobacco', 'ssn',
    'companyName', 'businessRegistration', 'businessType', 'relationshipToInsured',
    'countryCode', 'state'].includes(fieldName)) {
    return 'ownerDetails';
  }

  // Occupation Info fields
  if (['employer', 'occupation', 'netWorth', 'annualIncome'].includes(fieldName)) {
    return 'occupation';
  }

  // Contact Info fields
  if (['primaryPhone', 'alternatePhone', 'email'].includes(fieldName)) {
    return 'contact';
  }

  // Address Info fields
  if (['addressLine1', 'addressLine2', 'addressCity', 'addressState', 'addressZipCode',
    'mailingAddressLine1', 'mailingAddressLine2', 'mailingCity', 'mailingState',
    'mailingZipCode', 'addressCountry', 'mailingAddressCountry'].includes(fieldName)) {
    return 'address';
  }

  // Corporate Info fields
  if (['companyName', 'businessRegistration', 'businessType', 'relationshipToInsured'].includes(fieldName)) {
    return 'corporate';
  }

  return 'other';
};

export const validationRules = {
  individual: {
    firstName: {
      required: "First name is required",
      pattern: {
        value: /^[A-Za-z\s-']+$/,
        message: "First name can only contain letters, spaces, hyphens and apostrophes"
      },
      minLength: {
        value: 2,
        message: "First name must be at least 2 characters"
      }
    },
    lastName: {
      required: "Last name is required",
      pattern: {
        value: /^[A-Za-z\s-']+$/,
        message: "Last name can only contain letters, spaces, hyphens and apostrophes"
      },
      minLength: {
        value: 2,
        message: "Last name must be at least 2 characters"
      }
    },
    dateOfBirth: {
      required: "Date of birth is required",
      validate: {
        ageCheck: (value) => {
          const age = calculateAge(value);
          return (age >= 0 && age <= 100) || "Owner must be between 0 and 100 years old";
        }
      }
    },
    ssn: {
      required: "SSN is required"
    },
    gender: {
      required: "Gender is required"
    },
    tobacco: {
      required: "Tobacco Status is required"
    },
    state: {
      required: "State is required"
    }
  },
  corporate: {
    companyName: {
      required: "Company name is required",
      minLength: {
        value: 2,
        message: "Company name must be at least 2 characters"
      }
    },
    businessRegistration: {
      required: "Business registration number is required",
      pattern: {
        value: /^[A-Z0-9-]+$/i,
        message: "Please enter a valid business registration number"
      }
    },
    businessType: {
      required: "Business type is required"
    },
    relationshipToInsured: {
      required: "Relationship to insured is required"
    },
    state: {
      required: "State is required"
    }
  },


  contact: {
    primaryPhone: {
      required: "Primary phone is required",
      validate: {
        phoneFormat: (value, country) => isValidPhoneNumber(value, country) ||
          "Please enter a valid phone number"
      }
    },
    alternatePhone: {
      validate: {
        phoneFormat: (value, country) => !value || isValidPhoneNumber(value, country) ||
          "Please enter a valid phone number"
      }
    },
    email: {
      required: "Email is required",
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: "Please enter a valid email address"
      }
    }
  },

  address: {
    addressLine1: {
      required: "Address line 1 is required",
      minLength: {
        value: 5,
        message: "Please enter a complete street address"
      }
    },
    addressCity: {
      required: "City is required",
      pattern: {
        value: /^[A-Za-z\s-']+$/,
        message: "Please enter a valid city name"
      }
    },
    addressState: {
      required: "State/Province is required"
    },
    addressZipCode: {
      required: "ZIP/Postal code is required",
      validate: {
        format: (value, country) => isValidPostalCode(value, country) ||
          "Please enter a valid postal code"
      }
    },

    mailingAddressLine1: {
      required: "Mailing address line 1 is required",
      minLength: {
        value: 5,
        message: "Please enter a complete street address"
      }
    },
    mailingCity: {
      required: "Mailing city is required",
      pattern: {
        value: /^[A-Za-z\s-']+$/,
        message: "Please enter a valid city name"
      }
    },
    mailingState: {
      required: "Mailing state/province is required"
    },
    mailingZipCode: {
      required: "Mailing ZIP/Postal code is required",
      validate: {
        format: (value, country) => isValidPostalCode(value, country) ||
          "Please enter a valid postal code"
      }
    },
    mailingAddressCountry: {
      required: "Mailing country is required"
    }
  },

  occupation: {
    employer: {
      required: "Employer name is required",
      minLength: {
        value: 2,
        message: "Employer name must be at least 2 characters"
      }
    },
    occupation: {
      required: "Occupation is required"
    },
    netWorth: {
      required: "Net worth is required",
      pattern: {
        value: /^\d+$/,
        message: "Please enter a valid amount"
      },
      validate: {
        positive: (value) => parseInt(value) >= 0 || "Amount must be positive",
      }
    },
    annualIncome: {
      required: "Annual income is required",
      pattern: {
        value: /^\d+$/,
        message: "Please enter a valid amount"
      },
      validate: {
        positive: (value) => parseInt(value) >= 0 || "Amount must be positive",
      }
    }
  }
};

export const validateField = (fieldName, value, section, country) => {
  // Skip validation for ownerType field
  if (fieldName === 'ownerType') {
    return { isValid: true };
  }

  const rules = validationRules[section]?.[fieldName];
  if (!rules) return { isValid: true };

  if (rules.required && (!value || value.trim() === '')) {
    return { isValid: false, error: rules.required };
  }

  if (rules.pattern && !rules.pattern.value.test(value)) {
    return { isValid: false, error: rules.pattern.message };
  }

  if (rules.minLength && value.length < rules.minLength.value) {
    return { isValid: false, error: rules.minLength.message };
  }

  if (rules.validate) {
    for (const [validatorName, validator] of Object.entries(rules.validate)) {
      const result = validator(value, country);
      if (result !== true) {
        return { isValid: false, error: result };
      }
    }
  }

  if (rules.transform) {
    value = rules.transform(value);
  }

  return { isValid: true, transformedValue: value };
};

export const validateSection = (sectionData, sectionName, country) => {
  const errors = {};
  let isValid = true;

  // Handle owner type specific validations for ownerDetails section
  if (sectionName === 'ownerDetails') {
    sectionName = sectionData.ownerType === '01'
      ? 'individual'
      : 'corporate';
  }

  // For address section, handle both primary and mailing addresses
  if (sectionName === 'address') {
    // Validate primary address fields
    Object.keys(validationRules[sectionName] || {})
      .filter(key => !key.startsWith('mailing'))
      .forEach(fieldName => {
        const result = validateField(fieldName, sectionData[fieldName], sectionName, country);
        if (!result.isValid) {
          errors[fieldName] = result.error;
          isValid = false;
        }
      });

    // Validate mailing address fields only if not same as primary address
    if (!sectionData.sameAsMailingAddress) {
      Object.keys(validationRules[sectionName] || {})
        .filter(key => key.startsWith('mailing'))
        .forEach(fieldName => {
          const result = validateField(fieldName, sectionData[fieldName], sectionName, country);
          if (!result.isValid) {
            errors[fieldName] = result.error;
            isValid = false;
          }
        });
    }
  } else {
    // For other sections, validate normally
    Object.keys(validationRules[sectionName] || {}).forEach(fieldName => {
      const result = validateField(fieldName, sectionData[fieldName], sectionName, country);
      if (!result.isValid) {
        errors[fieldName] = result.error;
        isValid = false;
      }
    });
  }

  return { isValid, errors };
};

export const validateCrossFields = (formData) => {
  const errors = {};

  if (!formData.sameAsMailingAddress) {
    const mailingAddressValidation = validateSection(
      {
        addressLine1: formData.mailingAddressLine1,
        addressCity: formData.mailingCity,
        addressState: formData.mailingState,
        addressZipCode: formData.mailingZipCode
      },
      'address',
      formData.mailingAddressCountry
    );
    if (!mailingAddressValidation.isValid) {
      errors.mailingAddress = mailingAddressValidation.errors;
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

export default {
  validateField,
  validateSection,
  validateCrossFields,
  validationRules,
  determineSection
}; 