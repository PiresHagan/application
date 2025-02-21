import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nextStep, previousStep } from '../../slices/stepSlice';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import CollapsibleSection from '../../components/common/CollapsibleSection';
import BaseCoverage from '../../components/coverage/BaseCoverage';
import AdditionalCoverage from '../../components/coverage/AdditionalCoverage';
import Riders from '../../components/coverage/Riders';
import { validateSection, validateAllAdditionalCoverages, validateAllRiders } from '../../utils/coverageValidations';
import { toast } from 'react-toastify';
import { useGetDropdownValuesQuery, useGetFormOwnersQuery } from '../../slices/createApiSlice';
import { setFormOwners } from '../../slices/formDataSlice';
import { setCoverageOwners } from '../../slices/coverageOwnersSlice';

function Coverage({ applicationNumber }) {
  const dispatch = useDispatch();
  const activeStep = useSelector((state) => state.step.activeStep);
  const owners = useSelector(state => state.coverageOwners.owners);
  const { data: dropdownValues = {} } = useGetDropdownValuesQuery();
  const { data: formOwners, isLoading } = useGetFormOwnersQuery(applicationNumber);

  // State for section management
  const [expandedSections, setExpandedSections] = useState({
    'product': 'selector',
    'product-selector': true
  });
  const [sectionValidation, setSectionValidation] = useState({
    product: false,
    base: false,
    additional: false,
    riders: false
  });
  const [attemptedSections, setAttemptedSections] = useState({});
  const [formErrors, setFormErrors] = useState({
    product: {},
    base: {},
    additional: {},
    riders: {}
  });
  const [showErrors, setShowErrors] = useState(false);

  // Product Selector State
  const [productData, setProductData] = useState({
    product: 'Whole Life',
    plan: 'WL LifePay'
  });

  // Base Coverage State
  const [baseCoverageData, setBaseCoverageData] = useState({
    coverageType: 'single',
    insured1: '',
    insured2: '',
    sameAsOwner1: false,
    sameAsOwner2: false,
    relationship1: '',
    relationship2: '',
    faceAmount: '',
    tableRating: '100%',
    permanentFlatExtra: false,
    permanentFlatExtraAmount: '0',
    temporaryFlatExtra: false,
    temporaryFlatExtraAmount: '0',
    temporaryFlatExtraDuration: '1',
    underwritingClass: 'Standard'
  });

  // Additional Coverage State
  const [additionalCoverages, setAdditionalCoverages] = useState([{
    id: 1,
    coverageType: 'single',
    coverage: '',
    insured1: '',
    faceAmount: '',
    tableRating: '100%',
    permanentFlatExtra: false,
    permanentFlatExtraAmount: '0',
    temporaryFlatExtra: false,
    temporaryFlatExtraAmount: '0',
    temporaryFlatExtraDuration: '1',
    underwritingClass: 'Standard'
  }]);

  // Riders State
  const [riders, setRiders] = useState([{
    id: 1,
    type: 'Please Select'
  }]);

  // Add new state for tracking attempted fields
  const [attemptedFields, setAttemptedFields] = useState({
    additional: {}, // Will store attempted fields per coverage ID
    riders: {} // Will store attempted fields per rider ID
  });

  const newCoverageRef = useRef(null);

  const handleAddCoverage = () => {
    const newId = Math.max(...additionalCoverages.map(c => c.id)) + 1;
    const newCoverage = {
      id: newId,
      coverageType: 'single',
      coverage: '',
      insured1: '',
      faceAmount: '',
      tableRating: '100%',
      permanentFlatExtra: false,
      permanentFlatExtraAmount: '0',
      temporaryFlatExtra: false,
      temporaryFlatExtraAmount: '0',
      temporaryFlatExtraDuration: '1',
      underwritingClass: 'Standard'
    };

    const updatedCoverages = [...additionalCoverages, newCoverage];
    setAdditionalCoverages(updatedCoverages);

    // Validate with current attempted fields
    const { isValid: additionalValid, errors: additionalErrors } =
      validateAllAdditionalCoverages(updatedCoverages, attemptedFields.additional);
    setFormErrors(prev => ({
      ...prev,
      additional: additionalErrors
    }));
    setSectionValidation(prev => ({
      ...prev,
      additional: additionalValid
    }));

    setExpandedSections(prev => ({
      ...prev,
      'additional': 'coverage',
      'additional-coverage': true
    }));

    requestAnimationFrame(() => {
      const lastCoverageElement = document.getElementById(`coverage-${newId}`);
      if (lastCoverageElement) {
        lastCoverageElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  };

  const handleRemoveCoverage = (id) => {
    setAdditionalCoverages(additionalCoverages.filter(coverage => coverage.id !== id));
  };

  const handleAddRider = () => {
    const newId = Math.max(...riders.map(r => r.id)) + 1;
    const updatedRiders = [...riders, { id: newId, type: 'Please Select' }];
    setRiders(updatedRiders);

    // Validate the updated riders
    const { isValid: ridersValid, errors: riderErrors } = validateAllRiders(updatedRiders);
    setFormErrors(prev => ({
      ...prev,
      riders: riderErrors
    }));
    setSectionValidation(prev => ({
      ...prev,
      riders: ridersValid
    }));

    setExpandedSections(prev => ({
      ...prev,
      'riders': 'section',
      'riders-section': true
    }));

    requestAnimationFrame(() => {
      const newRiderElement = document.getElementById(`rider-${newId}`);
      if (newRiderElement) {
        newRiderElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  };

  const handleRemoveRider = (id) => {
    setRiders(riders.filter(rider => rider.id !== id));
  };

  const handleDisabledSectionClick = (sectionName) => {
    setShowErrors(true);

    // Get the section that needs to be completed first
    const sections = ['product', 'base', 'additional', 'riders'];
    const currentIndex = sections.indexOf(sectionName);
    let sectionToValidate = sections[currentIndex - 1];
    // Validate the previous section and show errors
    switch (sectionToValidate) {
      case 'product':
        validateAndUpdateSection('product', productData);
        break;
      case 'base':
        validateAndUpdateSection('base', baseCoverageData);
        break;
      case 'additional':
        const { errors: additionalErrors } = validateAllAdditionalCoverages(additionalCoverages, attemptedFields.additional);
        setFormErrors(prev => ({
          ...prev,
          additional: additionalErrors
        }));
        break;
      case 'riders':
        const { errors: riderErrors } = validateAllRiders(riders);
        setFormErrors(prev => ({
          ...prev,
          riders: riderErrors
        }));
        break;
    }

    toast.error('Please complete the previous section first');
  };

  // Validate section and update validation state
  const validateAndUpdateSection = (section, data) => {
    const { isValid, errors } = validateSection(section, data);

    setFormErrors(prev => ({
      ...prev,
      [section]: errors
    }));

    setSectionValidation(prev => ({
      ...prev,
      [section]: isValid
    }));

    return isValid;
  };

  // Handle section expansion
  const handleSectionChange = (sectionId, sectionName) => () => {
    // If section is already expanded, collapse it
    if (expandedSections[sectionId] === sectionName) {
      setExpandedSections(prev => ({
        ...prev,
        [sectionId]: null,
        [`${sectionId}-${sectionName}`]: false
      }));
      return;
    }

    // Get the section that needs to be completed first
    const sections = ['product', 'base', 'additional', 'riders'];
    const currentIndex = sections.indexOf(sectionName);

    // Validate all previous sections
    let isValid = true;
    for (let i = 0; i < currentIndex; i++) {
      const section = sections[i];
      switch (section) {
        case 'product':
          isValid = validateAndUpdateSection('product', productData);
          break;
        case 'base':
          isValid = validateAndUpdateSection('base', baseCoverageData);
          break;
        case 'additional':
          const { isValid: additionalValid, errors: additionalErrors } = validateAllAdditionalCoverages(additionalCoverages, attemptedFields.additional);
          setFormErrors(prev => ({
            ...prev,
            additional: additionalErrors
          }));
          isValid = additionalValid;
          break;
        case 'riders':
          const { isValid: ridersValid, errors: riderErrors } = validateAllRiders(riders);
          setFormErrors(prev => ({
            ...prev,
            riders: riderErrors
          }));
          isValid = ridersValid;
          break;
      }

      if (!isValid) {
        setShowErrors(true);
        toast.error('Please complete the previous section first');
        return;
      }
    }

    // If all previous sections are valid, expand the current section
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: sectionName,
      [`${sectionId}-${sectionName}`]: true
    }));

    setTimeout(() => {
      const sectionElement = document.getElementById(`section-${sectionId}-${sectionName}`);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 200);
  };

  // Handle field changes with validation
  const handleFieldChange = (section, field, value) => {
    console.log('Field change:', { section, field, value });
    let newData;
    switch (section) {
      case 'product':
        newData = { ...productData, [field]: value };
        setProductData(newData);
        validateAndUpdateSection('product', newData);
        break;
      case 'base':
        newData = { ...baseCoverageData, [field]: value };
        setBaseCoverageData(newData);
        validateAndUpdateSection('base', newData);
        break;
      case 'additional':
        // Track the attempted field
        setAttemptedFields(prev => ({
          ...prev,
          additional: {
            ...prev.additional,
            [field.id]: [...new Set([...(prev.additional[field.id] || []), field.name])]
          }
        }));

        // Update coverage
        const updatedCoverages = additionalCoverages.map(coverage =>
          coverage.id === field.id
            ? { ...coverage, [field.name]: value }
            : coverage
        );
        setAdditionalCoverages(updatedCoverages);

        // Validate with attempted fields
        const { isValid: additionalValid, errors: additionalErrors } =
          validateAllAdditionalCoverages(updatedCoverages, attemptedFields.additional);
        setFormErrors(prev => ({
          ...prev,
          additional: additionalErrors
        }));
        setSectionValidation(prev => ({
          ...prev,
          additional: additionalValid
        }));
        break;
      case 'riders':
        // Handle rider changes
        const updatedRiders = riders.map(rider =>
          rider.id === field.id
            ? { ...rider, [field.name]: value }
            : rider
        );
        console.log('Updated riders:', updatedRiders);
        setRiders(updatedRiders);

        // Validate after update
        const { isValid: ridersValid, errors: riderErrors } = validateAllRiders(updatedRiders);
        setFormErrors(prev => ({
          ...prev,
          riders: riderErrors
        }));
        setSectionValidation(prev => ({
          ...prev,
          riders: ridersValid
        }));
        break;
    }
  };

  // Add useEffect to validate product section on initial load
  useEffect(() => {
    validateAndUpdateSection('product', productData);
  }, []); // Run once on component mount

  // Handle save and continue
  const handleSaveAndContinue = () => {
    setShowErrors(true);

    // When saving, validate all fields by passing empty attemptedFields
    const { isValid: additionalValid, errors: additionalErrors } =
      validateAllAdditionalCoverages(additionalCoverages, {});
    const { isValid: ridersValid, errors: riderErrors } = validateAllRiders(riders);

    setFormErrors(prev => ({
      ...prev,
      additional: additionalErrors,
      riders: riderErrors
    }));

    if (!additionalValid || !ridersValid) {
      toast.error('Please complete all required fields correctly');
      return;
    }

    // Proceed with save logic
    dispatch(nextStep());
  };

  useEffect(() => {
    if (formOwners) {
      // Only update coverage owners, not the main owners
      dispatch(setCoverageOwners(formOwners.map(owner => ({
        clientGUID: owner.clientGUID,
        id: owner.id,
        firstName: owner.firstName,
        lastName: owner.lastName,
        dateOfBirth: owner.dateOfBirth,
        gender: owner.gender,
        tobacco: owner.tobacco,
        countryCode: owner.countryCode,
        state: owner.stateCode,
        ssn: owner.ssn,
        ownerType: '01'
      }))));
    }
  }, [formOwners, dispatch]);

  return (
    <Box sx={{ pb: 3 }}>
      <CollapsibleSection
        title="Product Selector"
        isEnabled={true}
        isExpanded={expandedSections['product'] === 'selector' || expandedSections['product-selector']}
        isValid={sectionValidation.product}
        onExpand={handleSectionChange('product', 'selector')}
        onDisabledClick={() => handleDisabledSectionClick('product')}
        sectionName="selector"
        ownerId="product"
        expandedSections={expandedSections}
        errors={formErrors.product}
        showErrors={showErrors}
      >
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Product</InputLabel>
            <Select
              value={productData.product}
              onChange={(e) => setProductData({ ...productData, product: e.target.value })}
              label="Product"
            >
              <MenuItem value="Whole Life">Whole Life</MenuItem>
              <MenuItem value="Term Life">Term Life</MenuItem>
              <MenuItem value="Universal Life">Universal Life</MenuItem>
              <MenuItem value="Critical Illness">Critical Illness</MenuItem>
              <MenuItem value="Final Expense">Final Expense</MenuItem>
              <MenuItem value="Annuities">Annuities</MenuItem>
            </Select>
          </FormControl>

          {productData.product === 'Whole Life' && (
            <FormControl fullWidth>
              <InputLabel>Plan</InputLabel>
              <Select
                value={productData.plan}
                onChange={(e) => setProductData({ ...productData, plan: e.target.value })}
                label="Plan"
              >
                <MenuItem value="WL LifePay">WL LifePay</MenuItem>
                <MenuItem value="WL 10Pay">WL 10Pay</MenuItem>
                <MenuItem value="WL 15Pay">WL 15Pay</MenuItem>
                <MenuItem value="WL 20Pay">WL 20Pay</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
      </CollapsibleSection>

      <CollapsibleSection
        title="Base Coverage"
        isEnabled={sectionValidation.product}
        isExpanded={expandedSections['base'] === 'coverage' || expandedSections['base-coverage']}
        isValid={sectionValidation.base}
        onExpand={handleSectionChange('base', 'coverage')}
        onDisabledClick={() => handleDisabledSectionClick('base')}
        sectionName="coverage"
        ownerId="base"
        expandedSections={expandedSections}
        errors={formErrors.base}
        showErrors={showErrors}
      >
        <BaseCoverage
          data={baseCoverageData}
          onChange={(data) => {
            setBaseCoverageData(data);
            validateAndUpdateSection('base', data);
          }}
          errors={formErrors.base}
          showErrors={showErrors}
          owners={owners}
          dropdownValues={dropdownValues}
          applicationNumber={applicationNumber}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Additional Coverage(s)"
        isEnabled={sectionValidation.base}
        isExpanded={expandedSections['additional'] === 'coverage' || expandedSections['additional-coverage']}
        isValid={sectionValidation.additional}
        onExpand={handleSectionChange('additional', 'coverage')}
        onDisabledClick={() => handleDisabledSectionClick('additional')}
        sectionName="coverage"
        ownerId="additional"
        expandedSections={expandedSections}
        errors={formErrors.additional}
        showErrors={showErrors}
      >
        <AdditionalCoverage
          coverages={additionalCoverages}
          onChange={(fieldName, value, coverageId) => {
            console.log('Additional coverage change:', { fieldName, value, coverageId });
            handleFieldChange('additional', { id: coverageId, name: fieldName }, value);
          }}
          onAdd={handleAddCoverage}
          onRemove={handleRemoveCoverage}
          errors={formErrors.additional}
          showErrors={showErrors}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Riders"
        isEnabled={sectionValidation.additional}
        isExpanded={expandedSections['riders'] === 'section' || expandedSections['riders-section']}
        isValid={sectionValidation.riders}
        onExpand={handleSectionChange('riders', 'section')}
        onDisabledClick={() => handleDisabledSectionClick('riders')}
        sectionName="section"
        ownerId="riders"
        expandedSections={expandedSections}
        errors={formErrors.riders}
        showErrors={showErrors}
      >
        <Riders
          riders={riders}
          onChange={(fieldName, value, riderId) => {
            console.log('Rider change:', { fieldName, value, riderId });
            handleFieldChange('riders', { id: riderId, name: fieldName }, value);
          }}
          onAdd={handleAddRider}
          onRemove={handleRemoveRider}
          errors={formErrors.riders}
          showErrors={showErrors}
        />
      </CollapsibleSection>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="contained"
          color="inherit"
          onClick={() => dispatch(previousStep())}
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
  );
}

export default Coverage;
