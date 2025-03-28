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
  Grid,
  Typography
} from '@mui/material';
import CollapsibleSection from '../../components/common/CollapsibleSection';
import BaseCoverage from '../../components/coverage/BaseCoverage';
import AdditionalCoverage from '../../components/coverage/AdditionalCoverage';
import Riders from '../../components/coverage/Riders';
import PremiumSection from '../../components/coverage/PremiumSection';
import { validateSection, validateAllAdditionalCoverages, validateAllRiders } from '../../utils/coverageValidations';
import { toast } from 'react-toastify';
import { useGetDropdownValuesQuery, useGetFormOwnersQuery, useGetCompanyProductsQuery, useGetProductPlansQuery, useUpdateApplicationPlanMutation, useSaveBaseCoverageMutation } from '../../slices/createApiSlice';
import { setCoverageOwners } from '../../slices/coverageOwnersSlice';
import {
  setProductData,
  setBaseCoverageData,
  setAdditionalCoverages,
  setRiders
} from '../../slices/coverageSlice';
import { handleCoverageChange, createPremiumRequest, formatPremiumResult } from '../../utils/premiumCalculation';
import { useCalculatePremiumMutation, setPremiumData } from '../../slices/premiumSlice';

function Coverage({ applicationNumber, onStepComplete }) {
  const dispatch = useDispatch();
  const activeStep = useSelector((state) => state.step.activeStep);
  const owners = useSelector(state => state.coverageOwners.owners);
  const { data: dropdownValues = {} } = useGetDropdownValuesQuery();
  const { data: formOwners, isLoading } = useGetFormOwnersQuery(applicationNumber);
  const mainOwners = useSelector(state => state.owner.owners);
  const coverageOwners = useSelector(state => state.coverageOwners.owners);
  const outdated = useSelector(state => state.premium?.outdated);

  const storedProductData = useSelector(state => state.coverage.product);
  const storedBaseCoverageData = useSelector(state => state.coverage.base || {});
  const storedAdditionalCoverages = useSelector(state => state.coverage.additional || []);
  const storedRiders = useSelector(state => state.coverage.riders || []);

  const [expandedSections, setExpandedSections] = useState(() => {
    const hasBaseCoverageData = Object.keys(storedBaseCoverageData).length > 0;
    const hasAdditionalCoverages = storedAdditionalCoverages.length > 0;
    const hasRiders = storedRiders.length > 0;
    
    return {
      'product': 'selector',
      'product-selector': true,
      'base': hasBaseCoverageData ? 'coverage' : null,
      'base-coverage': hasBaseCoverageData,
      'additional': hasAdditionalCoverages ? 'coverage' : null,
      'additional-coverage': hasAdditionalCoverages,
      'riders': hasRiders ? 'section' : null,
      'riders-section': hasRiders
    };
  });
  
  const [sectionValidation, setSectionValidation] = useState({
    base: false,
    additional: false,
    riders: false
  });
  const [attemptedSections, setAttemptedSections] = useState({});
  const [formErrors, setFormErrors] = useState({
    base: {},
    additional: {},
    riders: {}
  });
  const [showErrors, setShowErrors] = useState(false);

  const [productData, setProductDataState] = useState(storedProductData);
  const [baseCoverageData, setBaseCoverageDataState] = useState(storedBaseCoverageData);
  const [additionalCoverages, setAdditionalCoveragesState] = useState(
    storedAdditionalCoverages.length > 0 ? storedAdditionalCoverages : []
  );
  const [riders, setRidersState] = useState(storedRiders);

  const [attemptedFields, setAttemptedFields] = useState({
    additional: {},
    riders: {}
  });

  const newCoverageRef = useRef(null);

  const { data: companyProducts = [] } = useGetCompanyProductsQuery('DEV Insurance');
  const { data: productPlans = [], refetch: refetchPlans } = useGetProductPlansQuery(
    productData.productGUID || '',
    { skip: !productData.productGUID }
  );
  const [updateApplicationPlan] = useUpdateApplicationPlanMutation();
  const [saveBaseCoverage] = useSaveBaseCoverageMutation();

  const [calculatePremium, { isLoading: premiumLoading }] = useCalculatePremiumMutation();

  const handleProductDataChange = (newData) => {
    setProductDataState(newData);
  };

  const handleBaseCoverageDataChange = (newData) => {
    setBaseCoverageDataState(newData);
  };

  const handleAdditionalCoveragesChange = (newData) => {
    setAdditionalCoveragesState(newData);
  };

  const handleRidersChange = (newData) => {
    setRidersState(newData);
  };

  const handleAddCoverage = () => {
    const newId = additionalCoverages.length > 0
      ? Math.max(...additionalCoverages.map(c => c.id)) + 1
      : 1;
    
    let defaultInsured = '';
    const individualOwners = owners.filter(owner => owner.ownerType === '01');

    // if (individualOwners.length > 0) {
    //   const usedInsuredIds = [
    //     baseCoverageData.insured1,
    //     baseCoverageData.insured2,
    //     ...additionalCoverages.map(c => c.insured1)
    //   ].filter(Boolean);  

      // const availableOwner = individualOwners.find(owner => !usedInsuredIds.includes(owner.id));
      if (individualOwners) {
        console.log('individualOwners', individualOwners);
        defaultInsured = individualOwners[0].id;
      }
    // }

    const newCoverage = {
      id: newId,
      coverageType: 'single',
      coverage: 'Term 10',
      insured1: '1',
      faceAmount: '100000',
      tableRating: '100%',
      permanentFlatExtra: false,
      permanentFlatExtraAmount: '0',
      temporaryFlatExtra: false,
      temporaryFlatExtraAmount: '0',
      temporaryFlatExtraDuration: '0',
      underwritingClass: 'Standard'
    };

    const updatedCoverages = [...additionalCoverages, newCoverage];
    handleAdditionalCoveragesChange(updatedCoverages);

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

    const sections = ['base', 'additional', 'riders'];
    const currentIndex = sections.indexOf(sectionName);
    let sectionToValidate = sections[currentIndex - 1];
    switch (sectionToValidate) {
      case 'product':
        true;
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

  const handleSectionChange = (sectionId, sectionName) => async () => {
    if (expandedSections[sectionId] === sectionName) {
      setExpandedSections(prev => ({
        ...prev,
        [sectionId]: null,
        [`${sectionId}-${sectionName}`]: false
      }));
      return;
    }

    const sections = ['base', 'additional', 'riders'];
    const currentIndex = sections.indexOf(sectionName);

    let isValid = true;
    for (let i = 0; i < currentIndex; i++) {
      const section = sections[i];
      switch (section) {
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

    if (sectionId === 'base' && sectionName === 'coverage') {
      try {
        if (productData.planGUID) {
          await updateApplicationPlan({
            applicationNumber,
            planGUID: productData.planGUID
          }).unwrap();

          dispatch(setProductData(productData));

          toast.success('Product selection saved successfully');
        } else {
          toast.error('Please select a product and plan first');
          return;
        }
      } catch (error) {
        console.error('Error saving product selection:', error);
        toast.error('Error saving product selection. Please try again.');
        return;
      }
    }

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

  const handleFieldChange = (section, field, value) => {
    switch (section) {
      case 'product':
        const newProductData = { ...productData, [field]: value };
        handleProductDataChange(newProductData);
        break;
      case 'base':
        const newBaseCoverageData = { ...baseCoverageData, [field]: value };
        handleBaseCoverageDataChange(newBaseCoverageData);
        validateAndUpdateSection('base', newBaseCoverageData);
        console.log('test');
        break;
      case 'additional':
        if (field.name === '_multipleFields') {
          const { id, updates } = value;

          const fieldNames = Object.keys(updates);
          setAttemptedFields(prev => ({
            ...prev,
            additional: {
              ...prev.additional,
              [id]: [...new Set([...(prev.additional[id] || []), ...fieldNames])]
            }
          }));

          const updatedCoverages = additionalCoverages.map(coverage =>
            coverage.id === id
              ? { ...coverage, ...updates }
              : coverage
          );
          handleAdditionalCoveragesChange(updatedCoverages);

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
        }

        setAttemptedFields(prev => ({
          ...prev,
          additional: {
            ...prev.additional,
            [field.id]: [...new Set([...(prev.additional[field.id] || []), field.name])]
          }
        }));

        const updatedCoverages = additionalCoverages.map(coverage =>
          coverage.id === field.id
            ? { ...coverage, [field.name]: value }
            : coverage
        );
        handleAdditionalCoveragesChange(updatedCoverages);

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
        const updatedRiders = riders.map(rider =>
          rider.id === field.id
            ? { ...rider, [field.name]: value }
            : rider
        );
        handleRidersChange(updatedRiders);

        setAttemptedFields(prev => ({
          ...prev,
          riders: {
            ...prev.riders,
            [field.id]: [...new Set([...(prev.riders[field.id] || []), field.name])]
          }
        }));

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

  useEffect(() => {
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
    triggerPremiumCalculation();
  }, [productData, baseCoverageData, additionalCoverages, riders]);

  useEffect(() => {
    if (owners.length > 0 && (!baseCoverageData.insured1 || (!baseCoverageData.insured2 && baseCoverageData.coverageType === 'joint'))) {
      const individualOwners = owners.filter(owner => owner.ownerType === '01');

      if (individualOwners.length > 0) {
        const updatedData = { ...baseCoverageData };

        if (!updatedData.insured1 && individualOwners[0]) {
          updatedData.insured1 = individualOwners[0].id;
        }

        if (updatedData.coverageType === 'joint' && !updatedData.insured2 && individualOwners.length > 1) {
          updatedData.insured2 = individualOwners[1].id;
        }

        if (updatedData.insured1 !== baseCoverageData.insured1 ||
          updatedData.insured2 !== baseCoverageData.insured2) {
          handleBaseCoverageDataChange(updatedData);
          validateAndUpdateSection('base', updatedData);
        }
      }
    }
  }, [owners, baseCoverageData, handleBaseCoverageDataChange, validateAndUpdateSection]);

  useEffect(() => {
    if (sectionValidation.base) {
      const state = {
        coverage: {
          product: productData,
          base: baseCoverageData,
          additional: additionalCoverages,
          riders: riders
        },
        coverageOwners: {
          owners: owners
        }
      };
      
      handleCoverageChange(
        state, 
        sectionValidation, 
        applicationNumber,
        dispatch
      );
    }
  }, [
    sectionValidation.base, 
    productData.planGUID,
    baseCoverageData.faceAmount,
    baseCoverageData.insured1,
    baseCoverageData.insured2,
    baseCoverageData.underwritingClass,
    baseCoverageData.coverageType,
    baseCoverageData.tableRating,
    baseCoverageData.coverageGUID,
    baseCoverageData.coverageDefinitionGUID,
    JSON.stringify(baseCoverageData.insuredRoles),
    JSON.stringify(additionalCoverages),
    JSON.stringify(riders),
    dispatch,
    applicationNumber
  ]);

  const handleSaveAndContinue = async () => {
    setShowErrors(true);

    if (outdated) {
      toast.error('Please refresh the premium calculation before proceeding');
      return;
    }

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

    try {
      const enhancedBaseCoverageData = { ...baseCoverageData, planGUID: productData.planGUID };

      const isInsuredSameAsOwner = (insuredId) => {
        const insured = owners.find(owner => owner.id === insuredId);
        if (!insured || !insured.ssn) return false;

        return mainOwners.some(owner => owner.ssn === insured.ssn);
      };

      if (enhancedBaseCoverageData.insured1) {
        enhancedBaseCoverageData.insured1IsSameAsOwner = isInsuredSameAsOwner(enhancedBaseCoverageData.insured1);
      }

      if (enhancedBaseCoverageData.coverageType === 'joint' && enhancedBaseCoverageData.insured2) {
        enhancedBaseCoverageData.insured2IsSameAsOwner = isInsuredSameAsOwner(enhancedBaseCoverageData.insured2);
      }

      console.log('Saving base coverage with data:', enhancedBaseCoverageData);

      if (productData.planGUID) {
        await updateApplicationPlan({
          applicationNumber,
          planGUID: productData.planGUID
        }).unwrap();
      }

      const response = await saveBaseCoverage({
        applicationNumber,
        coverageData: enhancedBaseCoverageData
      }).unwrap();

      dispatch(setBaseCoverageData({
        ...baseCoverageData,
        coverageGUID: response.coverageGUID,
        coverageDefinitionGUID: response.coverageDefinitionGUID,
        insuredRoles: response.insuredRoles || []
      }));

      dispatch(setAdditionalCoverages(additionalCoverages));
      dispatch(setRiders(riders));

      if (response.coverageGUID) {
        const state = {
          coverage: {
            product: {
              ...productData,
              planGUID: response.planGUID || productData.planGUID
            },
            base: {
              ...baseCoverageData,
              coverageGUID: response.coverageGUID,
              coverageDefinitionGUID: response.coverageDefinitionGUID,
              insuredRoles: response.insuredRoles || []
            },
            additional: additionalCoverages,
            riders: riders
          },
          coverageOwners: {
            owners: owners
          }
        };
      }

      dispatch(nextStep());
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Error saving coverage information. Please try again.');
    }
  };

  useEffect(() => {
    if (formOwners) {
      dispatch(setCoverageOwners(formOwners.map(owner => ({
        clientGUID: owner.clientGUID,
        roleGUID: owner.roleGUID,
        roleCode: owner.roleCode,
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

  const triggerPremiumCalculation = () => {
    const state = {
      coverage: {
        product: productData,
        base: baseCoverageData,
        additional: additionalCoverages,
        riders: riders
      },
      coverageOwners: {
        owners: owners
      }
    };
    
    const calcRequest = createPremiumRequest(state, applicationNumber);
      if (calcRequest) {
        calculatePremium(calcRequest)
          .unwrap()
          .then(result => {
            dispatch(setPremiumData(formatPremiumResult(result)));
          })
          .catch(err => {
            console.error('Failed to calculate initial premium:', err);
          });
      }
  };

  const getInsuredsList = () => {
    const selectedInsureds = [];

    if (baseCoverageData.insured1) {
      const insured1 = owners.find(owner => owner.id === baseCoverageData.insured1);
      if (insured1) selectedInsureds.push(insured1);
    }

    if (baseCoverageData.insured2) {
      const insured2 = owners.find(owner => owner.id === baseCoverageData.insured2);
      if (insured2) selectedInsureds.push(insured2);
    }

    additionalCoverages.forEach(coverage => {
      if (coverage.insured1) {
        const insured = owners.find(owner => owner.id === coverage.insured1);
        if (insured && !selectedInsureds.some(selected => selected.id === insured.id)) {
          selectedInsureds.push(insured);
        }
      }
    });

    return selectedInsureds;
  };

  useEffect(() => {
    if (companyProducts.length > 0 && productData.product) {
      const selectedProduct = companyProducts.find(p => p.ProductName === productData.product);
      if (selectedProduct) {
        setProductDataState(prev => ({
          ...prev,
          productGUID: selectedProduct.ProductGUID,
          planGUID: '',
        }));
      }
    }
  }, [companyProducts, productData.product]);

  useEffect(() => {
    if (productPlans && productPlans.length > 0 && (!productData.plan || !productData.planGUID)) {
      const firstPlan = productPlans[0];
      setProductDataState(prev => ({
        ...prev,
        plan: firstPlan.PlanName,
        planGUID: firstPlan.PlanGUID
      }));
    }
  }, [productData]);

  useEffect(() => {
    if (productData.productGUID) {
      refetchPlans();
    }
  }, [productData.productGUID, refetchPlans]);

  useEffect(() => {
    const isAllValid =
      sectionValidation.base &&
      sectionValidation.additional &&
      sectionValidation.riders;

    if (onStepComplete) {
      onStepComplete(isAllValid);
    }

  }, [sectionValidation, onStepComplete]);

  const handlePremiumRefresh = async () => {
    const currentState = {
      coverage: {
        product: productData,
        base: baseCoverageData,
        additional: additionalCoverages,
        riders: riders
      },
      coverageOwners: {
        owners: owners
      }
    };
    
    const calcRequest = createPremiumRequest(currentState, applicationNumber);
    if (calcRequest) {
      try {
        const result = await calculatePremium(calcRequest).unwrap();
        dispatch(setPremiumData(formatPremiumResult(result)));
      } catch (err) {
        console.error('Failed to calculate premium:', err);
      }
    }
  };

  return (
    <Box sx={{ pb: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8.4}>
          <CollapsibleSection
            title="Product Selector"
            isEnabled={true}
            isExpanded={expandedSections['product'] === 'selector' || expandedSections['product-selector']}
            isValid={true}
            onExpand={handleSectionChange('product', 'selector')}
            onDisabledClick={() => handleDisabledSectionClick('product')}
            sectionName="selector"
            ownerId="product"
            expandedSections={expandedSections}
            errors={{}}
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
                  {companyProducts.map(product => (
                    <MenuItem key={product.ProductGUID} value={product.ProductName}>
                      {product.ProductName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {productPlans.length > 0 && (
                <FormControl fullWidth>
                  <InputLabel>Plan</InputLabel>
                  <Select
                    value={productData.plan}
                    onChange={(e) => {
                      const selectedPlan = productPlans.find(p => p.PlanName === e.target.value);
                      setProductDataState({
                        ...productData,
                        plan: e.target.value,
                        planGUID: selectedPlan ? selectedPlan.PlanGUID : ''
                      });
                    }}
                    label="Plan"
                  >
                    {productPlans.map(plan => (
                      <MenuItem key={plan.PlanGUID} value={plan.PlanName}>
                        {plan.PlanName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          </CollapsibleSection>

          <CollapsibleSection
            title="Base Coverage"
            isEnabled={true}
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
                if (baseCoverageData.coverageType === 'joint' && data.coverageType === 'single') {
                  data.insured2 = '';
                }

                if (baseCoverageData.coverageType === 'single' && data.coverageType === 'joint') {
                  const individualOwners = owners.filter(owner =>
                    owner.ownerType === '01' && owner.id !== data.insured1
                  );
                  if (individualOwners.length > 0) {
                    data.insured2 = individualOwners[0].id;
                  }
                }

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
              baseCoverageData={baseCoverageData}
            />
          </CollapsibleSection>

          <CollapsibleSection
            title="Riders"
            isEnabled={sectionValidation.additional && sectionValidation.base}
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
              disabled={outdated}
            >
              Next Step
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={3.6} sx={{ position: 'relative' }}>
          <Box sx={{ position: 'sticky', top: 16 }}>
            <PremiumSection
              onRequestRefresh={handlePremiumRefresh}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Coverage;
