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
import { setCoverageOwners } from '../../slices/coverageOwnersSlice';
import {
  setProductData,
  setBaseCoverageData,
  setAdditionalCoverages,
  setRiders
} from '../../slices/coverageSlice';

function Coverage({ applicationNumber }) {
  const dispatch = useDispatch();
  const activeStep = useSelector((state) => state.step.activeStep);
  const owners = useSelector(state => state.coverageOwners.owners);
  const { data: dropdownValues = {} } = useGetDropdownValuesQuery();
  const { data: formOwners, isLoading } = useGetFormOwnersQuery(applicationNumber);
  const mainOwners = useSelector(state => state.owner.owners);
  const coverageOwners = useSelector(state => state.coverageOwners.owners);

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

  // Get data from Redux store
  const storedProductData = useSelector(state => state.coverage.product);
  const storedBaseCoverageData = useSelector(state => state.coverage.base);
  const storedAdditionalCoverages = useSelector(state => state.coverage.additional);
  const storedRiders = useSelector(state => state.coverage.riders);

  // Initialize state with stored values
  const [productData, setProductDataState] = useState(storedProductData);
  const [baseCoverageData, setBaseCoverageDataState] = useState(storedBaseCoverageData);
  const [additionalCoverages, setAdditionalCoveragesState] = useState(
    storedAdditionalCoverages.length > 0 ? storedAdditionalCoverages : [{
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
    }]
  );
  const [riders, setRidersState] = useState(storedRiders);

  // Add new state for tracking attempted fields
  const [attemptedFields, setAttemptedFields] = useState({
    additional: {}, // Will store attempted fields per coverage ID
    riders: {} // Will store attempted fields per rider ID
  });

  const newCoverageRef = useRef(null);

  // Update local state and Redux store
  const handleProductDataChange = (newData) => {
    setProductDataState(newData);
    // dispatch(setProductData(newData));
  };

  const handleBaseCoverageDataChange = (newData) => {
    setBaseCoverageDataState(newData);
    // dispatch(setBaseCoverageData(newData));
  };

  const handleAdditionalCoveragesChange = (newData) => {
    setAdditionalCoveragesState(newData);
    // dispatch(setAdditionalCoverages(newData));
  };

  const handleRidersChange = (newData) => {
    setRidersState(newData);
    // dispatch(setRiders(newData));
  };

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
    handleAdditionalCoveragesChange(updatedCoverages);

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
    const updatedCoverages = additionalCoverages.filter(coverage => coverage.id !== id);
    handleAdditionalCoveragesChange(updatedCoverages);

    // Validate the remaining coverages after removal
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

    // Also clean up the attempted fields for the removed coverage
    setAttemptedFields(prev => {
      const newAttempted = { ...prev.additional };
      delete newAttempted[id];
      return {
        ...prev,
        additional: newAttempted
      };
    });
  };

  const handleAddRider = () => {
    const newId = riders.length > 0 ? Math.max(...riders.map(r => r.id)) + 1 : 1;
    const newRider = {
      id: newId,
      type: 'Please Select',
      waiverType: '',
      selectedPerson: '',
      faceAmount: '',
      rating: '',
      returnOfPremiumType: ''
    };

    const updatedRiders = [...riders, newRider];
    handleRidersChange(updatedRiders);

    // Validate after adding
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
    const updatedRiders = riders.filter(rider => rider.id !== id);
    handleRidersChange(updatedRiders);

    // Validate the remaining riders after removal
    const { isValid: ridersValid, errors: riderErrors } = validateAllRiders(updatedRiders);
    setFormErrors(prev => ({
      ...prev,
      riders: riderErrors
    }));
    setSectionValidation(prev => ({
      ...prev,
      riders: ridersValid
    }));

    // Clean up attempted fields for the removed rider
    setAttemptedFields(prev => {
      const newAttempted = { ...prev.riders };
      delete newAttempted[id];
      return {
        ...prev,
        riders: newAttempted
      };
    });
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
    switch (section) {
      case 'product':
        const newProductData = { ...productData, [field]: value };
        handleProductDataChange(newProductData);
        validateAndUpdateSection('product', newProductData);
        break;
      case 'base':
        const newBaseCoverageData = { ...baseCoverageData, [field]: value };
        handleBaseCoverageDataChange(newBaseCoverageData);
        validateAndUpdateSection('base', newBaseCoverageData);
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
        handleAdditionalCoveragesChange(updatedCoverages);

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
        // Update rider
        const updatedRiders = riders.map(rider =>
          rider.id === field.id
            ? { ...rider, [field.name]: value }
            : rider
        );
        handleRidersChange(updatedRiders);

        // Track attempted fields
        setAttemptedFields(prev => ({
          ...prev,
          riders: {
            ...prev.riders,
            [field.id]: [...new Set([...(prev.riders[field.id] || []), field.name])]
          }
        }));

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

  // Add useEffect to validate sections on mount and when data changes
  useEffect(() => {
    validateAndUpdateSection('product', productData);
    validateAndUpdateSection('base', baseCoverageData);

    const { isValid: additionalValid, errors: additionalErrors } =
      validateAllAdditionalCoverages(additionalCoverages, {});
    setFormErrors(prev => ({
      ...prev,
      additional: additionalErrors
    }));
    setSectionValidation(prev => ({
      ...prev,
      additional: additionalValid
    }));

    const { isValid: ridersValid, errors: riderErrors } = validateAllRiders(riders);
    setFormErrors(prev => ({
      ...prev,
      riders: riderErrors
    }));
    setSectionValidation(prev => ({
      ...prev,
      riders: ridersValid
    }));
  }, [productData, baseCoverageData, additionalCoverages, riders]);

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

    dispatch(nextStep());
  };

  useEffect(() => {
    if (formOwners) {
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

  // Add a function to get unique insureds (owners added in coverage page)
  const getInsuredsList = () => {
    return coverageOwners.filter(coverageOwner =>
      !mainOwners.some(mainOwner => mainOwner.ssn === coverageOwner.ssn)
    );
  };

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
              onChange={(e) => setProductDataState({ ...productData, product: e.target.value })}
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
                onChange={(e) => setProductDataState({ ...productData, plan: e.target.value })}
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
            handleBaseCoverageDataChange(data);
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
          owners={owners}
          dropdownValues={dropdownValues}
          applicationNumber={applicationNumber}
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
          owners={mainOwners}
          insureds={getInsuredsList()}
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
