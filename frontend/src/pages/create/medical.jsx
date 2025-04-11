import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  TextField,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CollapsibleSection from '../../components/common/CollapsibleSection';
import TabPanel from '../../components/common/TabPanel';
import { nextStep, previousStep } from '../../slices/stepSlice';
import { saveMedicalData } from '../../slices/medicalSlice';
import { toast } from 'react-toastify';

function a11yProps(index) {
  return {
    id: `insured-tab-${index}`,
    'aria-controls': `insured-tabpanel-${index}`,
  };
}

function Medical({ applicationNumber, onStepComplete }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const insureds = useSelector(state => state.coverageOwners.owners || []);

  const medicalData = useSelector(state => state.medical?.medicalData || {});

  const [activeTab, setActiveTab] = useState(0);
  const [expandedSections, setExpandedSections] = useState({});
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [sectionValidation, setSectionValidation] = useState({});
  const [hasErrors, setHasErrors] = useState(false);

  useEffect(() => {
    if (Object.keys(medicalData).length > 0) {
      setFormData(medicalData);
    } else {
      const initialData = {};
      insureds.forEach(insured => {
        initialData[insured.id] = {
          heightWeight: {
            height: '',
            weight: '',
            suddenWeightChange: ''
          },
          tobaccoSubstance: {
            usesTobacco: '',
            packsPerDay: '',
            yearsSmoked: '',
            hasQuit: '',
            yearsQuit: '',
            usesRecreationalDrugs: '',
            substanceAbuseTreatment: ''
          },
          chronicConditions: {
            heartDisease: false,
            highBloodPressure: false,
            highCholesterol: false,
            stroke: false,
            diabetes: false,
            cancer: false,
            cancerDetails: '',
            kidneyDisease: false,
            liverDisease: false,
            lungDisease: false,
            neurologicalDisorders: false,
            noneOfTheAbove: false
          },
          recentMedical: {
            recentSurgery: '',
            recentHospitalization: '',
            currentTreatment: '',
            currentTreatmentDetails: ''
          },
          medications: {
            takesMedications: '',
            medicationDetails: ''
          },
          mentalHealth: {
            mentalHealthDiagnosis: '',
            mentalHealthHospitalization: '',
            mentalHealthMedications: ''
          },
          familyHistory: {
            familyCancer: false,
            familyHeartDisease: false,
            familyDiabetes: false,
            familyStroke: false,
            familyHighBloodPressure: false,
            noneOfTheAbove: false
          },
          hivStd: {
            hivPositive: '',
            stdDiagnosis: ''
          },
          sleepDisorders: {
            sleepApnea: ''
          },
          otherConditions: {
            hasOtherConditions: '',
            otherConditionsDetails: ''
          },
          highRiskActivities: {
            skydiving: false,
            scubaDiving: false,
            rockClimbing: false,
            baseJumping: false,
            hangGliding: false,
            bungeeJumping: false,
            motorsports: false,
            extremeHiking: false,
            whitewaterRafting: false,
            bigGameHunting: false,
            bullRiding: false,
            professionalSports: false,
            noneOfTheAbove: false
          },
          hazardousTravel: {
            frequentTravel: '',
            travelWarningCountries: '',
            warZones: ''
          },
          pilotLicense: {
            hasPilotLicense: '',
            fliesUltralight: '',
            flyingHours: ''
          },
          alcohol: {
            alcoholConsumption: ''
          },
          dui: {
            hasDUI: '',
            duiDetails: ''
          },
          military: {
            militaryService: '',
            highRiskUnit: ''
          },
          occupationRisks: {
            highRiskJob: '',
            firefighter: false,
            policeOfficer: false,
            militaryCombat: false,
            oilRigWorker: false,
            deepSeaFisherman: false,
            stuntPerformer: false,
            explosivesWorker: false
          }
        };

        setSectionValidation(prev => ({
          ...prev,
          [insured.id]: {
            heightWeight: false,
            tobaccoSubstance: false,
            chronicConditions: false,
            recentMedical: false,
            medications: false,
            mentalHealth: false,
            familyHistory: false,
            hivStd: false,
            sleepDisorders: false,
            otherConditions: false,
            highRiskActivities: false,
            hazardousTravel: false,
            pilotLicense: false,
            alcohol: false,
            dui: false,
            military: false,
            occupationRisks: false
          }
        }));
      });
      setFormData(initialData);

      const initialExpandedState = {};
      insureds.forEach(insured => {
        initialExpandedState[`${insured.id}-heightWeight`] = true;
      });
      setExpandedSections(initialExpandedState);
    }

    if (insureds.length > 0) {
      const currentInsured = insureds[activeTab];
      if (currentInsured) {
        setTimeout(() => {
          const sectionId = `section-${currentInsured.id}-heightWeight`;
          const sectionElement = document.getElementById(sectionId);
          if (sectionElement) {
            sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 200);
      }
    }
  }, [insureds, medicalData, activeTab]);

  useEffect(() => {
    const isValid = (
      Object.keys(sectionValidation).every(insuredId => {
        return Object.values(sectionValidation[insuredId] || {}).every(valid => valid === true);
      }) &&
      !hasErrors
    );

    if (onStepComplete) {
      onStepComplete(isValid);
    }

  }, [sectionValidation, hasErrors, onStepComplete]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);

    setTimeout(() => {
      const currentInsured = insureds[newValue];
      if (currentInsured) {
        const sectionId = `section-${currentInsured.id}-heightWeight`;
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 100);
  };

  const handleSectionChange = (insuredId, sectionName) => () => {
    const newExpandedState = {
      ...expandedSections,
      [`${insuredId}-${sectionName}`]: !expandedSections[`${insuredId}-${sectionName}`]
    };

    setExpandedSections(newExpandedState);

    if (!expandedSections[`${insuredId}-${sectionName}`]) {
      setTimeout(() => {
        const sectionId = `section-${insuredId}-${sectionName}`;
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const handleFieldChange = (insuredId, section, field, value) => {
    let updatedSection = {};

    if (field === 'noneOfTheAbove' && value === true &&
      (section === 'chronicConditions' || section === 'familyHistory' || section === 'highRiskActivities')) {
      const currentSection = formData[insuredId][section] || {};
      updatedSection = Object.keys(currentSection).reduce((acc, key) => {
        if (key === 'noneOfTheAbove') {
          acc[key] = true;
        } else if (typeof currentSection[key] === 'boolean') {
          acc[key] = false;
        } else {
          acc[key] = currentSection[key];
        }
        return acc;
      }, {});
    } else if ((section === 'chronicConditions' || section === 'familyHistory' || section === 'highRiskActivities') &&
      typeof value === 'boolean' && value === true && field !== 'noneOfTheAbove') {
      updatedSection = {
        ...formData[insuredId][section],
        [field]: value,
        noneOfTheAbove: false
      };
    } else {
      updatedSection = {
        ...formData[insuredId][section],
        [field]: value
      };
    }

    setFormData(prevData => ({
      ...prevData,
      [insuredId]: {
        ...prevData[insuredId],
        [section]: updatedSection
      }
    }));

    if (field === 'usesTobacco' && value === 'N') {
      setFormData(prevData => ({
        ...prevData,
        [insuredId]: {
          ...prevData[insuredId],
          tobaccoSubstance: {
            ...prevData[insuredId].tobaccoSubstance,
            usesTobacco: 'N',
            packsPerDay: '',
            yearsSmoked: '',
            hasQuit: '',
            yearsQuit: ''
          }
        }
      }));
    }

    updateSectionValidation(insuredId, section, updatedSection);
  };

  const updateSectionValidation = (insuredId, section, sectionData) => {
    let isValid = false;

    switch (section) {
      case 'heightWeight':
        isValid = sectionData.suddenWeightChange !== '';
        break;
      case 'tobaccoSubstance':
        isValid = sectionData.usesTobacco !== '' &&
          (sectionData.usesTobacco === 'N' ||
            (sectionData.packsPerDay !== '' && sectionData.yearsSmoked !== '' &&
              sectionData.hasQuit !== '')) &&
          sectionData.usesRecreationalDrugs !== '' &&
          sectionData.substanceAbuseTreatment !== '';
        break;
      case 'chronicConditions':
        isValid = sectionData.noneOfTheAbove === true ||
          Object.keys(sectionData).some(key => key !== 'noneOfTheAbove' &&
            key !== 'cancerDetails' &&
            sectionData[key] === true);
        break;
      case 'recentMedical':
        isValid = sectionData.recentSurgery !== '' &&
          sectionData.recentHospitalization !== '' &&
          sectionData.currentTreatment !== '';
        break;
      case 'medications':
        isValid = sectionData.takesMedications !== '' &&
          (sectionData.takesMedications === 'N' || sectionData.medicationDetails !== '');
        break;
      case 'mentalHealth':
        isValid = sectionData.mentalHealthDiagnosis !== '' &&
          sectionData.mentalHealthHospitalization !== '' &&
          sectionData.mentalHealthMedications !== '';
        break;
      case 'familyHistory':
        isValid = sectionData.noneOfTheAbove === true ||
          Object.keys(sectionData).some(key => key !== 'noneOfTheAbove' && sectionData[key] === true);
        break;
      case 'hivStd':
        isValid = sectionData.hivPositive !== '' && sectionData.stdDiagnosis !== '';
        break;
      case 'sleepDisorders':
        isValid = sectionData.sleepApnea !== '';
        break;
      case 'otherConditions':
        isValid = sectionData.hasOtherConditions !== '' &&
          (sectionData.hasOtherConditions === 'N' || sectionData.otherConditionsDetails !== '');
        break;
      case 'highRiskActivities':
        isValid = sectionData.noneOfTheAbove === true ||
          Object.keys(sectionData).some(key => key !== 'noneOfTheAbove' && sectionData[key] === true);
        break;
      case 'hazardousTravel':
        isValid = sectionData.frequentTravel !== '' &&
          sectionData.travelWarningCountries !== '' &&
          sectionData.warZones !== '';
        break;
      case 'pilotLicense':
        isValid = sectionData.hasPilotLicense !== '' &&
          (sectionData.hasPilotLicense === 'N' || sectionData.fliesUltralight !== '');
        break;
      case 'alcohol':
        isValid = sectionData.alcoholConsumption !== '';
        break;
      case 'dui':
        isValid = sectionData.hasDUI !== '' &&
          (sectionData.hasDUI === 'N' || sectionData.duiDetails !== '');
        break;
      case 'military':
        isValid = sectionData.militaryService !== '' &&
          (sectionData.militaryService === 'N' || sectionData.highRiskUnit !== '');
        break;
      case 'occupationRisks':
        isValid = sectionData.highRiskJob !== '';
        break;
      default:
        isValid = false;
    }

    setSectionValidation(prev => ({
      ...prev,
      [insuredId]: {
        ...(prev[insuredId] || {}),
        [section]: isValid
      }
    }));
  };

  const handleNext = () => {
    if (activeTab < insureds.length - 1) {
      const currentInsuredId = insureds[activeTab].id;
      const isCurrentInsuredValid = validateForm(currentInsuredId);

      if (!isCurrentInsuredValid) {
        setHasErrors(true);
        const newExpandedState = { ...expandedSections };
        Object.keys(sectionValidation[currentInsuredId] || {}).forEach(section => {
          if (!sectionValidation[currentInsuredId][section]) {
            newExpandedState[`${currentInsuredId}-${section}`] = true;
          }
        });
        setExpandedSections(newExpandedState);

        toast.error('Please complete all required fields before proceeding');
        return;
      }

      setActiveTab(activeTab + 1);
    } else {
      const isAllValid = insureds.every(insured => validateForm(insured.id));

      if (!isAllValid) {
        setHasErrors(true);
        toast.error('Please complete all required fields before proceeding');

        const currentInsuredId = insureds[activeTab].id;
        const newExpandedState = { ...expandedSections };
        Object.keys(sectionValidation[currentInsuredId] || {}).forEach(section => {
          if (!sectionValidation[currentInsuredId][section]) {
            newExpandedState[`${currentInsuredId}-${section}`] = true;
          }
        });
        setExpandedSections(newExpandedState);
        return;
      }

      dispatch(saveMedicalData(formData));
      dispatch(nextStep());
    }
  };

  const handleBack = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    } else {
      dispatch(previousStep());
    }
  };

  const validateForm = (insuredId) => {
    const insuredSections = sectionValidation[insuredId] || {};

    const requiredSections = [
      'heightWeight',
      'tobaccoSubstance',
      'chronicConditions',
      'recentMedical',
      'medications',
      'mentalHealth',
      'familyHistory',
      'hivStd',
      'sleepDisorders',
      'otherConditions',
      'highRiskActivities',
      'hazardousTravel',
      'pilotLicense',
      'alcohol',
      'dui',
      'military',
      'occupationRisks'
    ];

    return requiredSections.every(section => insuredSections[section] === true);
  };

  const renderHeightWeightSection = (insuredId) => (
    <CollapsibleSection
      title="Height & Weight"
      isEnabled={true}
      isExpanded={expandedSections[`${insuredId}-heightWeight`]}
      isValid={sectionValidation[insuredId]?.heightWeight || false}
      onExpand={handleSectionChange(insuredId, 'heightWeight')}
      ownerId={insuredId}
      sectionName="heightWeight"
      expandedSections={expandedSections}
    >
      <Grid container spacing={2}>
        {/* <Grid item xs={6}>
          <TextField
            label={'Height (ft\'in")'}
            fullWidth
            value={formData[insuredId]?.heightWeight?.height || ''}
            onChange={(e) => handleFieldChange(insuredId, 'heightWeight', 'height', e.target.value)}
            placeholder={'5\'10"'}
            margin="normal"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Weight (lbs)"
            fullWidth
            type="number"
            value={formData[insuredId]?.heightWeight?.weight || ''}
            onChange={(e) => handleFieldChange(insuredId, 'heightWeight', 'weight', e.target.value)}
            margin="normal"
          />
        </Grid> */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Have you experienced sudden weight gain or loss in the past 12 months?
          </Typography>
          <RadioGroup
            row
            value={formData[insuredId]?.heightWeight?.suddenWeightChange || ''}
            onChange={(e) => handleFieldChange(insuredId, 'heightWeight', 'suddenWeightChange', e.target.value)}
          >
            <FormControlLabel value="Y" control={<Radio />} label="Yes" />
            <FormControlLabel value="N" control={<Radio />} label="No" />
          </RadioGroup>
        </Grid>
      </Grid>
    </CollapsibleSection>
  );

  const renderTobaccoSubstanceSection = (insuredId) => (
    <CollapsibleSection
      title="Tobacco & Substance Use"
      isEnabled={true}
      isExpanded={expandedSections[`${insuredId}-tobaccoSubstance`]}
      isValid={sectionValidation[insuredId]?.tobaccoSubstance || false}
      onExpand={handleSectionChange(insuredId, 'tobaccoSubstance')}
      ownerId={insuredId}
      sectionName="tobaccoSubstance"
      expandedSections={expandedSections}
    >
      <Typography variant="subtitle1" gutterBottom>
        Do you smoke cigarettes, cigars, e-cigarettes, or chew tobacco?
      </Typography>
      <RadioGroup
        row
        value={formData[insuredId]?.tobaccoSubstance?.usesTobacco || ''}
        onChange={(e) => handleFieldChange(insuredId, 'tobaccoSubstance', 'usesTobacco', e.target.value)}
        sx={{ mb: 2 }}
      >
        <FormControlLabel value="Y" control={<Radio />} label="Yes" />
        <FormControlLabel value="N" control={<Radio />} label="No" />
      </RadioGroup>

      {formData[insuredId]?.tobaccoSubstance?.usesTobacco === 'Y' && (
        <>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Packs per day"
                fullWidth
                value={formData[insuredId]?.tobaccoSubstance?.packsPerDay || ''}
                onChange={(e) => handleFieldChange(insuredId, 'tobaccoSubstance', 'packsPerDay', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Years smoked"
                fullWidth
                type="number"
                value={formData[insuredId]?.tobaccoSubstance?.yearsSmoked || ''}
                onChange={(e) => handleFieldChange(insuredId, 'tobaccoSubstance', 'yearsSmoked', e.target.value)}
                margin="normal"
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Have you quit smoking?
          </Typography>
          <RadioGroup
            row
            value={formData[insuredId]?.tobaccoSubstance?.hasQuit || ''}
            onChange={(e) => handleFieldChange(insuredId, 'tobaccoSubstance', 'hasQuit', e.target.value)}
            sx={{ mb: 2 }}
          >
            <FormControlLabel value="Y" control={<Radio />} label="Yes" />
            <FormControlLabel value="N" control={<Radio />} label="No" />
          </RadioGroup>

          {formData[insuredId]?.tobaccoSubstance?.hasQuit === 'Y' && (
            <TextField
              label="How long ago? (years)"
              fullWidth
              type="number"
              value={formData[insuredId]?.tobaccoSubstance?.yearsQuit || ''}
              onChange={(e) => handleFieldChange(insuredId, 'tobaccoSubstance', 'yearsQuit', e.target.value)}
              margin="normal"
            />
          )}
        </>
      )}

      <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
        Do you use recreational drugs (marijuana, cocaine, opioids, etc.)?
      </Typography>
      <RadioGroup
        row
        value={formData[insuredId]?.tobaccoSubstance?.usesRecreationalDrugs || ''}
        onChange={(e) => handleFieldChange(insuredId, 'tobaccoSubstance', 'usesRecreationalDrugs', e.target.value)}
        sx={{ mb: 2 }}
      >
        <FormControlLabel value="Y" control={<Radio />} label="Yes" />
        <FormControlLabel value="N" control={<Radio />} label="No" />
      </RadioGroup>

      <Typography variant="subtitle1" gutterBottom>
        Have you ever been treated for substance abuse?
      </Typography>
      <RadioGroup
        row
        value={formData[insuredId]?.tobaccoSubstance?.substanceAbuseTreatment || ''}
        onChange={(e) => handleFieldChange(insuredId, 'tobaccoSubstance', 'substanceAbuseTreatment', e.target.value)}
      >
        <FormControlLabel value="Y" control={<Radio />} label="Yes" />
        <FormControlLabel value="N" control={<Radio />} label="No" />
      </RadioGroup>
    </CollapsibleSection>
  );

  const renderChronicConditionsSection = (insuredId) => (
    <CollapsibleSection
      title="Chronic & Pre-Existing Conditions"
      isEnabled={true}
      isExpanded={expandedSections[`${insuredId}-chronicConditions`]}
      isValid={sectionValidation[insuredId]?.chronicConditions || false}
      onExpand={handleSectionChange(insuredId, 'chronicConditions')}
      ownerId={insuredId}
      sectionName="chronicConditions"
      expandedSections={expandedSections}
    >
      <Typography variant="subtitle1" gutterBottom>
        Have you ever been diagnosed with any of the following conditions?
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.chronicConditions?.heartDisease || false}
                onChange={(e) => handleFieldChange(insuredId, 'chronicConditions', 'heartDisease', e.target.checked)}
                disabled={formData[insuredId]?.chronicConditions?.noneOfTheAbove || false}
              />
            }
            label="Heart disease"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.chronicConditions?.highBloodPressure || false}
                onChange={(e) => handleFieldChange(insuredId, 'chronicConditions', 'highBloodPressure', e.target.checked)}
                disabled={formData[insuredId]?.chronicConditions?.noneOfTheAbove || false}
              />
            }
            label="High blood pressure"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.chronicConditions?.highCholesterol || false}
                onChange={(e) => handleFieldChange(insuredId, 'chronicConditions', 'highCholesterol', e.target.checked)}
                disabled={formData[insuredId]?.chronicConditions?.noneOfTheAbove || false}
              />
            }
            label="High cholesterol"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.chronicConditions?.stroke || false}
                onChange={(e) => handleFieldChange(insuredId, 'chronicConditions', 'stroke', e.target.checked)}
                disabled={formData[insuredId]?.chronicConditions?.noneOfTheAbove || false}
              />
            }
            label="Stroke"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.chronicConditions?.diabetes || false}
                onChange={(e) => handleFieldChange(insuredId, 'chronicConditions', 'diabetes', e.target.checked)}
                disabled={formData[insuredId]?.chronicConditions?.noneOfTheAbove || false}
              />
            }
            label="Diabetes (Type 1 or Type 2)"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.chronicConditions?.cancer || false}
                onChange={(e) => handleFieldChange(insuredId, 'chronicConditions', 'cancer', e.target.checked)}
                disabled={formData[insuredId]?.chronicConditions?.noneOfTheAbove || false}
              />
            }
            label="Cancer"
          />
        </Grid>
        {formData[insuredId]?.chronicConditions?.cancer && (
          <Grid item xs={12}>
            <TextField
              label="Cancer type and stage"
              fullWidth
              value={formData[insuredId]?.chronicConditions?.cancerDetails || ''}
              onChange={(e) => handleFieldChange(insuredId, 'chronicConditions', 'cancerDetails', e.target.value)}
              margin="normal"
              disabled={formData[insuredId]?.chronicConditions?.noneOfTheAbove || false}
            />
          </Grid>
        )}
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.chronicConditions?.kidneyDisease || false}
                onChange={(e) => handleFieldChange(insuredId, 'chronicConditions', 'kidneyDisease', e.target.checked)}
                disabled={formData[insuredId]?.chronicConditions?.noneOfTheAbove || false}
              />
            }
            label="Kidney disease"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.chronicConditions?.liverDisease || false}
                onChange={(e) => handleFieldChange(insuredId, 'chronicConditions', 'liverDisease', e.target.checked)}
                disabled={formData[insuredId]?.chronicConditions?.noneOfTheAbove || false}
              />
            }
            label="Liver disease"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.chronicConditions?.lungDisease || false}
                onChange={(e) => handleFieldChange(insuredId, 'chronicConditions', 'lungDisease', e.target.checked)}
                disabled={formData[insuredId]?.chronicConditions?.noneOfTheAbove || false}
              />
            }
            label="Lung disease (e.g., asthma, COPD)"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.chronicConditions?.neurologicalDisorders || false}
                onChange={(e) => handleFieldChange(insuredId, 'chronicConditions', 'neurologicalDisorders', e.target.checked)}
                disabled={formData[insuredId]?.chronicConditions?.noneOfTheAbove || false}
              />
            }
            label="Neurological disorders"
          />
        </Grid>
        <Grid item xs={12} sx={{ borderTop: '1px solid #e0e0e0', mt: 2, pt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.chronicConditions?.noneOfTheAbove || false}
                onChange={(e) => handleFieldChange(insuredId, 'chronicConditions', 'noneOfTheAbove', e.target.checked)}
              />
            }
            label="None of the above"
          />
        </Grid>
      </Grid>
    </CollapsibleSection>
  );

  const renderMedicalHistorySection = (insuredId) => (
    <CollapsibleSection
      title="Recent Medical History"
      isEnabled={true}
      isExpanded={expandedSections[`${insuredId}-recentMedical`]}
      isValid={sectionValidation[insuredId]?.recentMedical || false}
      onExpand={handleSectionChange(insuredId, 'recentMedical')}
      ownerId={insuredId}
      sectionName="recentMedical"
      expandedSections={expandedSections}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Have you had surgery in the past 5 years?
          </Typography>
          <RadioGroup
            row
            value={formData[insuredId]?.recentMedical?.recentSurgery || ''}
            onChange={(e) => handleFieldChange(insuredId, 'recentMedical', 'recentSurgery', e.target.value)}
            sx={{ mb: 2 }}
          >
            <FormControlLabel value="Y" control={<Radio />} label="Yes" />
            <FormControlLabel value="N" control={<Radio />} label="No" />
          </RadioGroup>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Have you been hospitalized in the past 2 years?
          </Typography>
          <RadioGroup
            row
            value={formData[insuredId]?.recentMedical?.recentHospitalization || ''}
            onChange={(e) => handleFieldChange(insuredId, 'recentMedical', 'recentHospitalization', e.target.value)}
            sx={{ mb: 2 }}
          >
            <FormControlLabel value="Y" control={<Radio />} label="Yes" />
            <FormControlLabel value="N" control={<Radio />} label="No" />
          </RadioGroup>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Are you currently under medical treatment for any condition?
          </Typography>
          <RadioGroup
            row
            value={formData[insuredId]?.recentMedical?.currentTreatment || ''}
            onChange={(e) => handleFieldChange(insuredId, 'recentMedical', 'currentTreatment', e.target.value)}
            sx={{ mb: 2 }}
          >
            <FormControlLabel value="Y" control={<Radio />} label="Yes" />
            <FormControlLabel value="N" control={<Radio />} label="No" />
          </RadioGroup>
        </Grid>

        {/* {formData[insuredId]?.recentMedical?.currentTreatment === 'Y' && (
          <Grid item xs={12}>
            <TextField
              label="Details of current treatment"
              fullWidth
              multiline
              rows={3}
              value={formData[insuredId]?.recentMedical?.currentTreatmentDetails || ''}
              onChange={(e) => handleFieldChange(insuredId, 'recentMedical', 'currentTreatmentDetails', e.target.value)}
              margin="normal"
            />
          </Grid>
        )} */}
      </Grid>
    </CollapsibleSection>
  );

  const renderMedicationsSection = (insuredId) => (
    <CollapsibleSection
      title="Medications"
      isEnabled={true}
      isExpanded={expandedSections[`${insuredId}-medications`]}
      isValid={sectionValidation[insuredId]?.medications || false}
      onExpand={handleSectionChange(insuredId, 'medications')}
      ownerId={insuredId}
      sectionName="medications"
      expandedSections={expandedSections}
    >
      <Typography variant="subtitle1" gutterBottom>
        Are you currently taking any prescription medications?
      </Typography>
      <RadioGroup
        row
        value={formData[insuredId]?.medications?.takesMedications || ''}
        onChange={(e) => handleFieldChange(insuredId, 'medications', 'takesMedications', e.target.value)}
        sx={{ mb: 2 }}
      >
        <FormControlLabel value="Y" control={<Radio />} label="Yes" />
        <FormControlLabel value="N" control={<Radio />} label="No" />
      </RadioGroup>

      {formData[insuredId]?.medications?.takesMedications === 'Y' && (
        <TextField
          label="List medications, dosages, and purpose"
          fullWidth
          multiline
          rows={4}
          value={formData[insuredId]?.medications?.medicationDetails || ''}
          onChange={(e) => handleFieldChange(insuredId, 'medications', 'medicationDetails', e.target.value)}
          margin="normal"
          placeholder="Example: Lisinopril 10mg daily for high blood pressure"
        />
      )}
    </CollapsibleSection>
  );

  const renderMentalHealthSection = (insuredId) => (
    <CollapsibleSection
      title="Mental Health"
      isEnabled={true}
      isExpanded={expandedSections[`${insuredId}-mentalHealth`]}
      isValid={sectionValidation[insuredId]?.mentalHealth || false}
      onExpand={handleSectionChange(insuredId, 'mentalHealth')}
      ownerId={insuredId}
      sectionName="mentalHealth"
      expandedSections={expandedSections}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Have you ever been diagnosed with depression, anxiety, bipolar disorder, or schizophrenia?
          </Typography>
          <RadioGroup
            row
            value={formData[insuredId]?.mentalHealth?.mentalHealthDiagnosis || ''}
            onChange={(e) => handleFieldChange(insuredId, 'mentalHealth', 'mentalHealthDiagnosis', e.target.value)}
            sx={{ mb: 2 }}
          >
            <FormControlLabel value="Y" control={<Radio />} label="Yes" />
            <FormControlLabel value="N" control={<Radio />} label="No" />
          </RadioGroup>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Have you ever been hospitalized for mental health treatment?
          </Typography>
          <RadioGroup
            row
            value={formData[insuredId]?.mentalHealth?.mentalHealthHospitalization || ''}
            onChange={(e) => handleFieldChange(insuredId, 'mentalHealth', 'mentalHealthHospitalization', e.target.value)}
            sx={{ mb: 2 }}
          >
            <FormControlLabel value="Y" control={<Radio />} label="Yes" />
            <FormControlLabel value="N" control={<Radio />} label="No" />
          </RadioGroup>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Are you currently taking medication for mental health conditions?
          </Typography>
          <RadioGroup
            row
            value={formData[insuredId]?.mentalHealth?.mentalHealthMedications || ''}
            onChange={(e) => handleFieldChange(insuredId, 'mentalHealth', 'mentalHealthMedications', e.target.value)}
          >
            <FormControlLabel value="Y" control={<Radio />} label="Yes" />
            <FormControlLabel value="N" control={<Radio />} label="No" />
          </RadioGroup>
        </Grid>
      </Grid>
    </CollapsibleSection>
  );

  const renderFamilyHistorySection = (insuredId) => (
    <CollapsibleSection
      title="Family History"
      isEnabled={true}
      isExpanded={expandedSections[`${insuredId}-familyHistory`]}
      isValid={sectionValidation[insuredId]?.familyHistory || false}
      onExpand={handleSectionChange(insuredId, 'familyHistory')}
      ownerId={insuredId}
      sectionName="familyHistory"
      expandedSections={expandedSections}
    >
      <Typography variant="subtitle1" gutterBottom>
        Has a parent or sibling been diagnosed with any of the following before age 60?
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.familyHistory?.familyCancer || false}
                onChange={(e) => handleFieldChange(insuredId, 'familyHistory', 'familyCancer', e.target.checked)}
                disabled={formData[insuredId]?.familyHistory?.noneOfTheAbove || false}
              />
            }
            label="Cancer"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.familyHistory?.familyHeartDisease || false}
                onChange={(e) => handleFieldChange(insuredId, 'familyHistory', 'familyHeartDisease', e.target.checked)}
                disabled={formData[insuredId]?.familyHistory?.noneOfTheAbove || false}
              />
            }
            label="Heart disease"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.familyHistory?.familyDiabetes || false}
                onChange={(e) => handleFieldChange(insuredId, 'familyHistory', 'familyDiabetes', e.target.checked)}
                disabled={formData[insuredId]?.familyHistory?.noneOfTheAbove || false}
              />
            }
            label="Diabetes"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.familyHistory?.familyStroke || false}
                onChange={(e) => handleFieldChange(insuredId, 'familyHistory', 'familyStroke', e.target.checked)}
                disabled={formData[insuredId]?.familyHistory?.noneOfTheAbove || false}
              />
            }
            label="Stroke"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.familyHistory?.familyHighBloodPressure || false}
                onChange={(e) => handleFieldChange(insuredId, 'familyHistory', 'familyHighBloodPressure', e.target.checked)}
                disabled={formData[insuredId]?.familyHistory?.noneOfTheAbove || false}
              />
            }
            label="High blood pressure"
          />
        </Grid>
        <Grid item xs={12} sx={{ borderTop: '1px solid #e0e0e0', mt: 2, pt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.familyHistory?.noneOfTheAbove || false}
                onChange={(e) => handleFieldChange(insuredId, 'familyHistory', 'noneOfTheAbove', e.target.checked)}
              />
            }
            label="None of the above"
          />
        </Grid>
      </Grid>
    </CollapsibleSection>
  );

  const renderHivStdSection = (insuredId) => (
    <CollapsibleSection
      title="HIV/AIDS & STDs"
      isEnabled={true}
      isExpanded={expandedSections[`${insuredId}-hivStd`]}
      isValid={sectionValidation[insuredId]?.hivStd || false}
      onExpand={handleSectionChange(insuredId, 'hivStd')}
      ownerId={insuredId}
      sectionName="hivStd"
      expandedSections={expandedSections}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Have you ever tested positive for HIV/AIDS?
          </Typography>
          <RadioGroup
            row
            value={formData[insuredId]?.hivStd?.hivPositive || ''}
            onChange={(e) => handleFieldChange(insuredId, 'hivStd', 'hivPositive', e.target.value)}
            sx={{ mb: 2 }}
          >
            <FormControlLabel value="Y" control={<Radio />} label="Yes" />
            <FormControlLabel value="N" control={<Radio />} label="No" />
          </RadioGroup>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Have you been diagnosed with any other sexually transmitted diseases?
          </Typography>
          <RadioGroup
            row
            value={formData[insuredId]?.hivStd?.stdDiagnosis || ''}
            onChange={(e) => handleFieldChange(insuredId, 'hivStd', 'stdDiagnosis', e.target.value)}
          >
            <FormControlLabel value="Y" control={<Radio />} label="Yes" />
            <FormControlLabel value="N" control={<Radio />} label="No" />
          </RadioGroup>
        </Grid>
      </Grid>
    </CollapsibleSection>
  );

  const renderSleepDisordersSection = (insuredId) => (
    <CollapsibleSection
      title="Sleep Disorders"
      isEnabled={true}
      isExpanded={expandedSections[`${insuredId}-sleepDisorders`]}
      isValid={sectionValidation[insuredId]?.sleepDisorders || false}
      onExpand={handleSectionChange(insuredId, 'sleepDisorders')}
      ownerId={insuredId}
      sectionName="sleepDisorders"
      expandedSections={expandedSections}
    >
      <Typography variant="subtitle1" gutterBottom>
        Do you suffer from sleep apnea or require a CPAP machine?
      </Typography>
      <RadioGroup
        row
        value={formData[insuredId]?.sleepDisorders?.sleepApnea || ''}
        onChange={(e) => handleFieldChange(insuredId, 'sleepDisorders', 'sleepApnea', e.target.value)}
      >
        <FormControlLabel value="Y" control={<Radio />} label="Yes" />
        <FormControlLabel value="N" control={<Radio />} label="No" />
      </RadioGroup>
    </CollapsibleSection>
  );

  const renderOtherConditionsSection = (insuredId) => (
    <CollapsibleSection
      title="Other Conditions"
      isEnabled={true}
      isExpanded={expandedSections[`${insuredId}-otherConditions`]}
      isValid={sectionValidation[insuredId]?.otherConditions || false}
      onExpand={handleSectionChange(insuredId, 'otherConditions')}
      ownerId={insuredId}
      sectionName="otherConditions"
      expandedSections={expandedSections}
    >
      <Typography variant="subtitle1" gutterBottom>
        Do you have any medical conditions not listed above that require treatment?
      </Typography>
      <RadioGroup
        row
        value={formData[insuredId]?.otherConditions?.hasOtherConditions || ''}
        onChange={(e) => handleFieldChange(insuredId, 'otherConditions', 'hasOtherConditions', e.target.value)}
        sx={{ mb: 2 }}
      >
        <FormControlLabel value="Y" control={<Radio />} label="Yes" />
        <FormControlLabel value="N" control={<Radio />} label="No" />
      </RadioGroup>

      {formData[insuredId]?.otherConditions?.hasOtherConditions === 'Y' && (
        <TextField
          label="Please describe"
          fullWidth
          multiline
          rows={3}
          value={formData[insuredId]?.otherConditions?.otherConditionsDetails || ''}
          onChange={(e) => handleFieldChange(insuredId, 'otherConditions', 'otherConditionsDetails', e.target.value)}
          margin="normal"
        />
      )}
    </CollapsibleSection>
  );

  const renderHighRiskActivitiesSection = (insuredId) => (
    <CollapsibleSection
      title="High-Risk Activities & Dangerous Hobbies"
      isEnabled={true}
      isExpanded={expandedSections[`${insuredId}-highRiskActivities`]}
      isValid={sectionValidation[insuredId]?.highRiskActivities || false}
      onExpand={handleSectionChange(insuredId, 'highRiskActivities')}
      ownerId={insuredId}
      sectionName="highRiskActivities"
      expandedSections={expandedSections}
    >
      <Typography variant="subtitle1" gutterBottom>
        Do you participate in any of the following high-risk activities?
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.highRiskActivities?.skydiving || false}
                onChange={(e) => handleFieldChange(insuredId, 'highRiskActivities', 'skydiving', e.target.checked)}
                disabled={formData[insuredId]?.highRiskActivities?.noneOfTheAbove || false}
              />
            }
            label="Skydiving"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.highRiskActivities?.scubaDiving || false}
                onChange={(e) => handleFieldChange(insuredId, 'highRiskActivities', 'scubaDiving', e.target.checked)}
                disabled={formData[insuredId]?.highRiskActivities?.noneOfTheAbove || false}
              />
            }
            label="Scuba Diving"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.highRiskActivities?.rockClimbing || false}
                onChange={(e) => handleFieldChange(insuredId, 'highRiskActivities', 'rockClimbing', e.target.checked)}
                disabled={formData[insuredId]?.highRiskActivities?.noneOfTheAbove || false}
              />
            }
            label="Rock Climbing"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.highRiskActivities?.baseJumping || false}
                onChange={(e) => handleFieldChange(insuredId, 'highRiskActivities', 'baseJumping', e.target.checked)}
                disabled={formData[insuredId]?.highRiskActivities?.noneOfTheAbove || false}
              />
            }
            label="Base Jumping"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.highRiskActivities?.hangGliding || false}
                onChange={(e) => handleFieldChange(insuredId, 'highRiskActivities', 'hangGliding', e.target.checked)}
                disabled={formData[insuredId]?.highRiskActivities?.noneOfTheAbove || false}
              />
            }
            label="Hang Gliding"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.highRiskActivities?.bungeeJumping || false}
                onChange={(e) => handleFieldChange(insuredId, 'highRiskActivities', 'bungeeJumping', e.target.checked)}
                disabled={formData[insuredId]?.highRiskActivities?.noneOfTheAbove || false}
              />
            }
            label="Bungee Jumping"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.highRiskActivities?.motorsports || false}
                onChange={(e) => handleFieldChange(insuredId, 'highRiskActivities', 'motorsports', e.target.checked)}
                disabled={formData[insuredId]?.highRiskActivities?.noneOfTheAbove || false}
              />
            }
            label="Motorsports (racing)"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.highRiskActivities?.extremeHiking || false}
                onChange={(e) => handleFieldChange(insuredId, 'highRiskActivities', 'extremeHiking', e.target.checked)}
                disabled={formData[insuredId]?.highRiskActivities?.noneOfTheAbove || false}
              />
            }
            label="Extreme Hiking"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.highRiskActivities?.whitewaterRafting || false}
                onChange={(e) => handleFieldChange(insuredId, 'highRiskActivities', 'whitewaterRafting', e.target.checked)}
                disabled={formData[insuredId]?.highRiskActivities?.noneOfTheAbove || false}
              />
            }
            label="Whitewater Rafting"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.highRiskActivities?.bigGameHunting || false}
                onChange={(e) => handleFieldChange(insuredId, 'highRiskActivities', 'bigGameHunting', e.target.checked)}
                disabled={formData[insuredId]?.highRiskActivities?.noneOfTheAbove || false}
              />
            }
            label="Big Game Hunting"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.highRiskActivities?.bullRiding || false}
                onChange={(e) => handleFieldChange(insuredId, 'highRiskActivities', 'bullRiding', e.target.checked)}
                disabled={formData[insuredId]?.highRiskActivities?.noneOfTheAbove || false}
              />
            }
            label="Bull Riding"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.highRiskActivities?.professionalSports || false}
                onChange={(e) => handleFieldChange(insuredId, 'highRiskActivities', 'professionalSports', e.target.checked)}
                disabled={formData[insuredId]?.highRiskActivities?.noneOfTheAbove || false}
              />
            }
            label="Professional Sports"
          />
        </Grid>
        <Grid item xs={12} sx={{ borderTop: '1px solid #e0e0e0', mt: 2, pt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.highRiskActivities?.noneOfTheAbove || false}
                onChange={(e) => handleFieldChange(insuredId, 'highRiskActivities', 'noneOfTheAbove', e.target.checked)}
              />
            }
            label="None of the above"
          />
        </Grid>
      </Grid>
    </CollapsibleSection>
  );

  const renderHazardousTravelSection = (insuredId) => (
    <CollapsibleSection
      title="Travel to Hazardous Locations"
      isEnabled={true}
      isExpanded={expandedSections[`${insuredId}-hazardousTravel`]}
      isValid={sectionValidation[insuredId]?.hazardousTravel || false}
      onExpand={handleSectionChange(insuredId, 'hazardousTravel')}
      ownerId={insuredId}
      sectionName="hazardousTravel"
      expandedSections={expandedSections}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Do you frequently travel outside the country?
          </Typography>
          <RadioGroup
            row
            value={formData[insuredId]?.hazardousTravel?.frequentTravel || ''}
            onChange={(e) => handleFieldChange(insuredId, 'hazardousTravel', 'frequentTravel', e.target.value)}
            sx={{ mb: 2 }}
          >
            <FormControlLabel value="Y" control={<Radio />} label="Yes" />
            <FormControlLabel value="N" control={<Radio />} label="No" />
          </RadioGroup>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Have you traveled to any countries under a State Department Travel Warning in the past year?
          </Typography>
          <RadioGroup
            row
            value={formData[insuredId]?.hazardousTravel?.travelWarningCountries || ''}
            onChange={(e) => handleFieldChange(insuredId, 'hazardousTravel', 'travelWarningCountries', e.target.value)}
            sx={{ mb: 2 }}
          >
            <FormControlLabel value="Y" control={<Radio />} label="Yes" />
            <FormControlLabel value="N" control={<Radio />} label="No" />
          </RadioGroup>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Do you work/live in war zones or high-risk areas?
          </Typography>
          <RadioGroup
            row
            value={formData[insuredId]?.hazardousTravel?.warZones || ''}
            onChange={(e) => handleFieldChange(insuredId, 'hazardousTravel', 'warZones', e.target.value)}
          >
            <FormControlLabel value="Y" control={<Radio />} label="Yes" />
            <FormControlLabel value="N" control={<Radio />} label="No" />
          </RadioGroup>
        </Grid>
      </Grid>
    </CollapsibleSection>
  );

  const renderPilotLicenseSection = (insuredId) => (
    <CollapsibleSection
      title="Pilot's License"
      isEnabled={true}
      isExpanded={expandedSections[`${insuredId}-pilotLicense`]}
      isValid={sectionValidation[insuredId]?.pilotLicense || false}
      onExpand={handleSectionChange(insuredId, 'pilotLicense')}
      ownerId={insuredId}
      sectionName="pilotLicense"
      expandedSections={expandedSections}
    >
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="subtitle1" gutterBottom>
            Do you hold a private or commercial pilot's license?
          </Typography>
          <RadioGroup
            row
            value={formData[insuredId]?.pilotLicense?.hasPilotLicense || ''}
            onChange={(e) => handleFieldChange(insuredId, 'pilotLicense', 'hasPilotLicense', e.target.value)}
            sx={{ mb: 2 }}
          >
            <FormControlLabel value="Y" control={<Radio />} label="Yes" />
            <FormControlLabel value="N" control={<Radio />} label="No" />
          </RadioGroup>
        </Grid>

        {formData[insuredId]?.pilotLicense?.hasPilotLicense === 'Y' && (
          <>
            <Grid item xs={6}>
              <TextField
                label="How many hours do you fly per year?"
                fullWidth
                type="number"
                value={formData[insuredId]?.pilotLicense?.flyingHours || '0'}
                onChange={(e) => handleFieldChange(insuredId, 'pilotLicense', 'flyingHours', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Do you fly ultralight or experimental aircraft?
              </Typography>
              <RadioGroup
                row
                value={formData[insuredId]?.pilotLicense?.fliesUltralight || ''}
                onChange={(e) => handleFieldChange(insuredId, 'pilotLicense', 'fliesUltralight', e.target.value)}
                sx={{ mb: 2 }}
              >
                <FormControlLabel value="Y" control={<Radio />} label="Yes" />
                <FormControlLabel value="N" control={<Radio />} label="No" />
              </RadioGroup>
            </Grid>
          </>
        )}
      </Grid>
    </CollapsibleSection>
  );

  const renderAlcoholSection = (insuredId) => (
    <CollapsibleSection
      title="Do you consume alcohol?"
      isEnabled={true}
      isExpanded={expandedSections[`${insuredId}-alcohol`]}
      isValid={sectionValidation[insuredId]?.alcohol || false}
      onExpand={handleSectionChange(insuredId, 'alcohol')}
      ownerId={insuredId}
      sectionName="alcohol"
      expandedSections={expandedSections}
    >
      <Typography variant="subtitle1" gutterBottom>
        How many drinks per week do you consume on average?
      </Typography>
      <RadioGroup
        value={formData[insuredId]?.alcohol?.alcoholConsumption || ''}
        onChange={(e) => handleFieldChange(insuredId, 'alcohol', 'alcoholConsumption', e.target.value)}
      >
        <FormControlLabel value="None" control={<Radio />} label="None" />
        <FormControlLabel value="1-2 per week" control={<Radio />} label="1-2 per week" />
        <FormControlLabel value="3-5 per week" control={<Radio />} label="3-5 per week" />
        <FormControlLabel value="6+ per week" control={<Radio />} label="6+ per week" />
      </RadioGroup>
    </CollapsibleSection>
  );

  const renderDuiSection = (insuredId) => (
    <CollapsibleSection
      title="DUI Convictions"
      isEnabled={true}
      isExpanded={expandedSections[`${insuredId}-dui`]}
      isValid={sectionValidation[insuredId]?.dui || false}
      onExpand={handleSectionChange(insuredId, 'dui')}
      ownerId={insuredId}
      sectionName="dui"
      expandedSections={expandedSections}
    >
      <Typography variant="subtitle1" gutterBottom>
        Have you ever been convicted of a DUI or reckless driving?
      </Typography>
      <RadioGroup
        row
        value={formData[insuredId]?.dui?.hasDUI || ''}
        onChange={(e) => handleFieldChange(insuredId, 'dui', 'hasDUI', e.target.value)}
        sx={{ mb: 2 }}
      >
        <FormControlLabel value="Y" control={<Radio />} label="Yes" />
        <FormControlLabel value="N" control={<Radio />} label="No" />
      </RadioGroup>

      {formData[insuredId]?.dui?.hasDUI === 'Y' && (
        <TextField
          label="How many times and when?"
          fullWidth
          value={formData[insuredId]?.dui?.duiDetails || ''}
          onChange={(e) => handleFieldChange(insuredId, 'dui', 'duiDetails', e.target.value)}
          margin="normal"
          placeholder="Example: 1 time in 2018"
        />
      )}
    </CollapsibleSection>
  );

  const renderMilitarySection = (insuredId) => (
    <CollapsibleSection
      title="Military Status"
      isEnabled={true}
      isExpanded={expandedSections[`${insuredId}-military`]}
      isValid={sectionValidation[insuredId]?.military || false}
      onExpand={handleSectionChange(insuredId, 'military')}
      ownerId={insuredId}
      sectionName="military"
      expandedSections={expandedSections}
    >
      <Typography variant="subtitle1" gutterBottom>
        Are you currently serving in the military or law enforcement?
      </Typography>
      <RadioGroup
        row
        value={formData[insuredId]?.military?.militaryService || ''}
        onChange={(e) => handleFieldChange(insuredId, 'military', 'militaryService', e.target.value)}
        sx={{ mb: 2 }}
      >
        <FormControlLabel value="Y" control={<Radio />} label="Yes" />
        <FormControlLabel value="N" control={<Radio />} label="No" />
      </RadioGroup>

      {formData[insuredId]?.military?.militaryService === 'Y' && (
        <>
          <Typography variant="subtitle1" gutterBottom>
            Are you in a high-risk unit (SWAT, bomb squad, special forces)?
          </Typography>
          <RadioGroup
            row
            value={formData[insuredId]?.military?.highRiskUnit || ''}
            onChange={(e) => handleFieldChange(insuredId, 'military', 'highRiskUnit', e.target.value)}
          >
            <FormControlLabel value="Y" control={<Radio />} label="Yes" />
            <FormControlLabel value="N" control={<Radio />} label="No" />
          </RadioGroup>
        </>
      )}
    </CollapsibleSection>
  );

  const renderOccupationRisksSection = (insuredId) => (
    <CollapsibleSection
      title="Occupation Risks"
      isEnabled={true}
      isExpanded={expandedSections[`${insuredId}-occupationRisks`]}
      isValid={sectionValidation[insuredId]?.occupationRisks || false}
      onExpand={handleSectionChange(insuredId, 'occupationRisks')}
      ownerId={insuredId}
      sectionName="occupationRisks"
      expandedSections={expandedSections}
    >
      <Typography variant="subtitle1" gutterBottom>
        Does your job involve high-risk duties?
      </Typography>
      <RadioGroup
        row
        value={formData[insuredId]?.occupationRisks?.highRiskJob || ''}
        onChange={(e) => handleFieldChange(insuredId, 'occupationRisks', 'highRiskJob', e.target.value)}
        sx={{ mb: 2 }}
      >
        <FormControlLabel value="Y" control={<Radio />} label="Yes" />
        <FormControlLabel value="N" control={<Radio />} label="No" />
      </RadioGroup>

      {formData[insuredId]?.occupationRisks?.highRiskJob === 'Y' && (
        <>
          <Typography variant="subtitle1" gutterBottom>
            Examples:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData[insuredId]?.occupationRisks?.firefighter || false}
                    onChange={(e) => handleFieldChange(insuredId, 'occupationRisks', 'firefighter', e.target.checked)}
                  />
                }
                label="Firefighter"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData[insuredId]?.occupationRisks?.policeOfficer || false}
                    onChange={(e) => handleFieldChange(insuredId, 'occupationRisks', 'policeOfficer', e.target.checked)}
                  />
                }
                label="Police Officer"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData[insuredId]?.occupationRisks?.militaryCombat || false}
                    onChange={(e) => handleFieldChange(insuredId, 'occupationRisks', 'militaryCombat', e.target.checked)}
                  />
                }
                label="Military Combat Role"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData[insuredId]?.occupationRisks?.oilRigWorker || false}
                    onChange={(e) => handleFieldChange(insuredId, 'occupationRisks', 'oilRigWorker', e.target.checked)}
                  />
                }
                label="Offshore Oil Rig Worker"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData[insuredId]?.occupationRisks?.deepSeaFisherman || false}
                    onChange={(e) => handleFieldChange(insuredId, 'occupationRisks', 'deepSeaFisherman', e.target.checked)}
                  />
                }
                label="Deep-Sea Fisherman"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData[insuredId]?.occupationRisks?.stuntPerformer || false}
                    onChange={(e) => handleFieldChange(insuredId, 'occupationRisks', 'stuntPerformer', e.target.checked)}
                  />
                }
                label="Stunt Performer"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData[insuredId]?.occupationRisks?.explosivesWorker || false}
                    onChange={(e) => handleFieldChange(insuredId, 'occupationRisks', 'explosivesWorker', e.target.checked)}
                  />
                }
                label="Explosives/Demolition Worker"
              />
            </Grid>
          </Grid>
        </>
      )}
    </CollapsibleSection>
  );

  // Render the component with tabs for each insured
  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Medical and Lifestyle Information
      </Typography>

      {insureds.length === 0 ? (
        <Typography>No insureds found. Please add insureds in the previous steps.</Typography>
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="insured tabs"
              variant={insureds.length > 3 ? "scrollable" : "standard"}
              scrollButtons={insureds.length > 3 ? "auto" : false}
            >
              {insureds.map((insured, index) => (
                <Tab
                  key={insured.id}
                  label={insured.firstName || `Insured ${index + 1}`}
                  {...a11yProps(index)}
                />
              ))}
            </Tabs>
          </Box>

          {insureds.map((insured, index) => (
            <TabPanel key={insured.id} value={activeTab} index={index}>
              <Box sx={{ p: 2 }}>
                {renderHeightWeightSection(insured.id)}
                {renderTobaccoSubstanceSection(insured.id)}
                {renderChronicConditionsSection(insured.id)}
                {renderMedicalHistorySection(insured.id)}
                {renderMedicationsSection(insured.id)}
                {renderMentalHealthSection(insured.id)}
                {renderFamilyHistorySection(insured.id)}
                {renderHivStdSection(insured.id)}
                {renderSleepDisordersSection(insured.id)}
                {renderOtherConditionsSection(insured.id)}
                {renderHighRiskActivitiesSection(insured.id)}
                {renderHazardousTravelSection(insured.id)}
                {renderPilotLicenseSection(insured.id)}
                {renderAlcoholSection(insured.id)}
                {renderDuiSection(insured.id)}
                {renderMilitarySection(insured.id)}
                {renderOccupationRisksSection(insured.id)}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button onClick={handleBack} variant="outlined">
                    {activeTab > 0 ? 'Previous Insured' : 'Back'}
                  </Button>
                  <Button
                    onClick={handleNext}
                    variant="contained"
                    color="primary"
                  >
                    {activeTab < insureds.length - 1 ? 'Next Insured' : 'Next Step'}
                  </Button>
                </Box>
              </Box>
            </TabPanel>
          ))}
        </>
      )}
    </Box>
  );
}

export default Medical; 