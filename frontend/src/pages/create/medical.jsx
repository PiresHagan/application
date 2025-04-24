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
  FormHelperText,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CollapsibleSection from '../../components/common/CollapsibleSection';
import TabPanel from '../../components/common/TabPanel';
import { nextStep, previousStep } from '../../slices/stepSlice';
import { saveMedicalData } from '../../slices/medicalSlice';
import { useSaveMedicalDataMutation } from '../../slices/createApiSlice';
import { toast } from 'react-toastify';

const questionMapping = {
  'heightWeight_suddenWeightChange': 'Have you experienced sudden weight gain or loss in the past 12 months?',

  'tobaccoSubstance_usesTobacco': 'Do you smoke cigarettes, cigars, e-cigarettes, or chew tobacco?',
  'tobaccoSubstance_packsPerDay': 'Packs per day',
  'tobaccoSubstance_yearsSmoked': 'Years smoked',
  'tobaccoSubstance_hasQuit': 'Have you quit smoking?',
  'tobaccoSubstance_yearsQuit': 'How long ago? (years)',
  'tobaccoSubstance_usesRecreationalDrugs': 'Do you use recreational drugs (marijuana, cocaine, opioids, etc.)?',
  'tobaccoSubstance_substanceAbuseTreatment': 'Have you ever been treated for substance abuse?',

  'chronicConditions_heartDisease': 'Heart disease',
  'chronicConditions_highBloodPressure': 'High blood pressure',
  'chronicConditions_highCholesterol': 'High cholesterol',
  'chronicConditions_stroke': 'Stroke',
  'chronicConditions_diabetes': 'Diabetes (Type 1 or Type 2)',
  'chronicConditions_cancer': 'Cancer',
  'chronicConditions_cancerDetails': 'Cancer type and stage',
  'chronicConditions_kidneyDisease': 'Kidney disease',
  'chronicConditions_liverDisease': 'Liver disease',
  'chronicConditions_lungDisease': 'Lung disease (e.g., asthma, COPD)',
  'chronicConditions_neurologicalDisorders': 'Neurological disorders',
  'chronicConditions_noneOfTheAbove': 'None of the above chronic conditions',

  'recentMedical_recentSurgery': 'Have you had surgery in the past 5 years?',
  'recentMedical_recentHospitalization': 'Have you been hospitalized in the past 2 years?',
  'recentMedical_currentTreatment': 'Are you currently under medical treatment for any condition?',
  'recentMedical_currentTreatmentDetails': 'Details of current treatment',

  'medications_takesMedications': 'Are you currently taking any prescription medications?',
  'medications_medicationDetails': 'List medications, dosages, and purpose',

  'mentalHealth_mentalHealthDiagnosis': 'Have you ever been diagnosed with depression, anxiety, bipolar disorder, or schizophrenia?',
  'mentalHealth_mentalHealthHospitalization': 'Have you ever been hospitalized for mental health treatment?',
  'mentalHealth_mentalHealthMedications': 'Are you currently taking medication for mental health conditions?',

  'familyHistory_familyCancer': 'Family history of cancer',
  'familyHistory_familyHeartDisease': 'Family history of heart disease',
  'familyHistory_familyDiabetes': 'Family history of diabetes',
  'familyHistory_familyStroke': 'Family history of stroke',
  'familyHistory_familyHighBloodPressure': 'Family history of high blood pressure',
  'familyHistory_noneOfTheAbove': 'No family history of these conditions',

  'hivStd_hivPositive': 'Have you ever tested positive for HIV/AIDS?',
  'hivStd_stdDiagnosis': 'Have you been diagnosed with any other sexually transmitted diseases?',

  'sleepDisorders_sleepApnea': 'Do you suffer from sleep apnea or require a CPAP machine?',

  'otherConditions_hasOtherConditions': 'Do you have any medical conditions not listed above that require treatment?',
  'otherConditions_otherConditionsDetails': 'Please describe other medical conditions',

  'highRiskActivities_skydiving': 'Skydiving',
  'highRiskActivities_scubaDiving': 'Scuba Diving',
  'highRiskActivities_rockClimbing': 'Rock Climbing',
  'highRiskActivities_baseJumping': 'Base Jumping',
  'highRiskActivities_hangGliding': 'Hang Gliding',
  'highRiskActivities_bungeeJumping': 'Bungee Jumping',
  'highRiskActivities_motorsports': 'Motorsports (racing)',
  'highRiskActivities_extremeHiking': 'Extreme Hiking',
  'highRiskActivities_whitewaterRafting': 'Whitewater Rafting',
  'highRiskActivities_bigGameHunting': 'Big Game Hunting',
  'highRiskActivities_bullRiding': 'Bull Riding',
  'highRiskActivities_professionalSports': 'Professional Sports',
  'highRiskActivities_noneOfTheAbove': 'No participation in high-risk activities',

  'hazardousTravel_frequentTravel': 'Do you frequently travel outside the country?',
  'hazardousTravel_travelWarningCountries': 'Have you traveled to any countries under a State Department Travel Warning in the past year?',
  'hazardousTravel_warZones': 'Do you work/live in war zones or high-risk areas?',

  'pilotLicense_hasPilotLicense': 'Do you hold a private or commercial pilot\'s license?',
  'pilotLicense_flyingHours': 'How many hours do you fly per year?',
  'pilotLicense_fliesUltralight': 'Do you fly ultralight or experimental aircraft?',

  'alcohol_alcoholConsumption': 'How many drinks per week do you consume on average?',

  'dui_hasDUI': 'Have you ever been convicted of a DUI or reckless driving?',
  'dui_duiDetails': 'How many times and when?',

  // Military
  'military_militaryService': 'Are you currently serving in the military or law enforcement?',
  'military_highRiskUnit': 'Are you in a high-risk unit (SWAT, bomb squad, special forces)?',

  // Occupation Risks
  'occupationRisks_highRiskJob': 'Does your job involve high-risk duties?',
  'occupationRisks_firefighter': 'Firefighter',
  'occupationRisks_policeOfficer': 'Police Officer',
  'occupationRisks_militaryCombat': 'Military Combat Role',
  'occupationRisks_oilRigWorker': 'Offshore Oil Rig Worker',
  'occupationRisks_deepSeaFisherman': 'Deep-Sea Fisherman',
  'occupationRisks_stuntPerformer': 'Stunt Performer',
  'occupationRisks_explosivesWorker': 'Explosives/Demolition Worker'
};

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

  const [saveMedicalDataToAPI, { isLoading: isSaving }] = useSaveMedicalDataMutation();

  useEffect(() => {
    if (Object.keys(medicalData).length > 0) {
      setFormData(medicalData);

      Object.keys(medicalData).forEach(insuredId => {
        Object.keys(medicalData[insuredId]).forEach(section => {
          updateSectionValidation(insuredId, section, medicalData[insuredId][section]);
        });
      });
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
    const currentInsuredId = insureds[activeTab]?.id;
    if (currentInsuredId) {
      dispatch(saveMedicalData(formData));
    }

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

  const transformSectionData = (sectionData, sectionName) => {
    // Transform the section data to use actual questions as field names
    const transformedData = {};

    Object.entries(sectionData).forEach(([field, value]) => {
      const fieldKey = `${sectionName}_${field}`;
      const questionText = questionMapping[fieldKey] || fieldKey; // Fallback to the field key if no mapping exists

      transformedData[questionText] = value;
    });

    return transformedData;
  };

  const saveInsuredMedicalData = async (insuredId) => {
    try {
      const insuredData = formData[insuredId];
      if (!insuredData) return true;

      // Get the roleGUID from the insured
      const insured = insureds.find(ins => ins.id == insuredId);
      if (!insured || !insured.roleGUID) {
        console.error(`No roleGUID found for insured ${insuredId}`);
        return false;
      }

      // Transform and flatten the data for API
      const apiData = {};

      for (const [section, sectionData] of Object.entries(insuredData)) {
        const transformedSection = transformSectionData(sectionData, section);
        Object.assign(apiData, transformedSection);
      }

      // Send to API
      await saveMedicalDataToAPI({
        roleGUID: insured.roleGUID,
        medicalData: apiData
      }).unwrap();

      return true;
    } catch (error) {
      console.error('Error saving medical data:', error);
      toast.error(`Failed to save medical data: ${error.message || 'Unknown error'}`);
      return false;
    }
  };

  const handleNext = async () => {
    dispatch(saveMedicalData(formData));

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

      // Save current insured data to database
      const saveSuccess = await saveInsuredMedicalData(currentInsuredId);
      if (!saveSuccess) return;

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

      const currentInsuredId = insureds[activeTab].id;
      const saveSuccess = await saveInsuredMedicalData(currentInsuredId);
      if (!saveSuccess) return;

      for (const insured of insureds) {
        if (insured.id !== currentInsuredId) {
          const otherSaveSuccess = await saveInsuredMedicalData(insured.id);
          if (!otherSaveSuccess) return;
        }
      }

      dispatch(nextStep());
    }
  };

  const handleBack = () => {
    dispatch(saveMedicalData(formData));

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
            {questionMapping['heightWeight_suddenWeightChange']}
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
        {questionMapping['tobaccoSubstance_usesTobacco']}
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
                label={questionMapping['tobaccoSubstance_packsPerDay']}
                fullWidth
                value={formData[insuredId]?.tobaccoSubstance?.packsPerDay || ''}
                onChange={(e) => handleFieldChange(insuredId, 'tobaccoSubstance', 'packsPerDay', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={questionMapping['tobaccoSubstance_yearsSmoked']}
                fullWidth
                type="number"
                value={formData[insuredId]?.tobaccoSubstance?.yearsSmoked || ''}
                onChange={(e) => handleFieldChange(insuredId, 'tobaccoSubstance', 'yearsSmoked', e.target.value)}
                margin="normal"
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            {questionMapping['tobaccoSubstance_hasQuit']}
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
              label={questionMapping['tobaccoSubstance_yearsQuit']}
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
        {questionMapping['tobaccoSubstance_usesRecreationalDrugs']}
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
        {questionMapping['tobaccoSubstance_substanceAbuseTreatment']}
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
            label={questionMapping['chronicConditions_heartDisease']}
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
            label={questionMapping['chronicConditions_highBloodPressure']}
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
            label={questionMapping['chronicConditions_highCholesterol']}
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
            label={questionMapping['chronicConditions_stroke']}
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
            label={questionMapping['chronicConditions_diabetes']}
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
            label={questionMapping['chronicConditions_cancer']}
          />
        </Grid>
        {formData[insuredId]?.chronicConditions?.cancer && (
          <Grid item xs={12}>
            <TextField
              label={questionMapping['chronicConditions_cancerDetails']}
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
            label={questionMapping['chronicConditions_kidneyDisease']}
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
            label={questionMapping['chronicConditions_liverDisease']}
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
            label={questionMapping['chronicConditions_lungDisease']}
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
            label={questionMapping['chronicConditions_neurologicalDisorders']}
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
            label={questionMapping['chronicConditions_noneOfTheAbove']}
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
            {questionMapping['recentMedical_recentSurgery']}
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
            {questionMapping['recentMedical_recentHospitalization']}
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
            {questionMapping['recentMedical_currentTreatment']}
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
        {questionMapping['medications_takesMedications']}
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
          label={questionMapping['medications_medicationDetails']}
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
            {questionMapping['mentalHealth_mentalHealthDiagnosis']}
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
            {questionMapping['mentalHealth_mentalHealthHospitalization']}
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
            {questionMapping['mentalHealth_mentalHealthMedications']}
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
        {questionMapping['familyHistory_noneOfTheAbove']}
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
            label={questionMapping['familyHistory_familyCancer']}
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
            label={questionMapping['familyHistory_familyHeartDisease']}
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
            label={questionMapping['familyHistory_familyDiabetes']}
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
            label={questionMapping['familyHistory_familyStroke']}
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
            label={questionMapping['familyHistory_familyHighBloodPressure']}
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
            label={questionMapping['familyHistory_noneOfTheAbove']}
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
            {questionMapping['hivStd_hivPositive']}
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
            {questionMapping['hivStd_stdDiagnosis']}
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
        {questionMapping['sleepDisorders_sleepApnea']}
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
        {questionMapping['otherConditions_hasOtherConditions']}
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
          label={questionMapping['otherConditions_otherConditionsDetails']}
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
        {questionMapping['highRiskActivities_noneOfTheAbove']}
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
            label={questionMapping['highRiskActivities_skydiving']}
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
            label={questionMapping['highRiskActivities_scubaDiving']}
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
            label={questionMapping['highRiskActivities_rockClimbing']}
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
            label={questionMapping['highRiskActivities_baseJumping']}
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
            label={questionMapping['highRiskActivities_hangGliding']}
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
            label={questionMapping['highRiskActivities_bungeeJumping']}
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
            label={questionMapping['highRiskActivities_motorsports']}
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
            label={questionMapping['highRiskActivities_extremeHiking']}
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
            label={questionMapping['highRiskActivities_whitewaterRafting']}
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
            label={questionMapping['highRiskActivities_bigGameHunting']}
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
            label={questionMapping['highRiskActivities_bullRiding']}
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
            label={questionMapping['highRiskActivities_professionalSports']}
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
            label={questionMapping['highRiskActivities_noneOfTheAbove']}
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
            {questionMapping['hazardousTravel_frequentTravel']}
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
            {questionMapping['hazardousTravel_travelWarningCountries']}
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
            {questionMapping['hazardousTravel_warZones']}
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
            {questionMapping['pilotLicense_hasPilotLicense']}
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
                label={questionMapping['pilotLicense_flyingHours']}
                fullWidth
                type="number"
                value={formData[insuredId]?.pilotLicense?.flyingHours || '0'}
                onChange={(e) => handleFieldChange(insuredId, 'pilotLicense', 'flyingHours', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                {questionMapping['pilotLicense_fliesUltralight']}
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
        {questionMapping['alcohol_alcoholConsumption']}
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
        {questionMapping['dui_hasDUI']}
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
          label={questionMapping['dui_duiDetails']}
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
        {questionMapping['military_militaryService']}
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
            {questionMapping['military_highRiskUnit']}
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
        {questionMapping['occupationRisks_highRiskJob']}
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
                label={questionMapping['occupationRisks_firefighter']}
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
                label={questionMapping['occupationRisks_policeOfficer']}
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
                label={questionMapping['occupationRisks_militaryCombat']}
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
                label={questionMapping['occupationRisks_oilRigWorker']}
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
                label={questionMapping['occupationRisks_deepSeaFisherman']}
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
                label={questionMapping['occupationRisks_stuntPerformer']}
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
                label={questionMapping['occupationRisks_explosivesWorker']}
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
                  <Button onClick={handleBack} variant="outlined" disabled={isSaving}>
                    {activeTab > 0 ? 'Previous Insured' : 'Back'}
                  </Button>
                  <Button
                    onClick={handleNext}
                    variant="contained"
                    color="primary"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                        Saving...
                      </>
                    ) : (
                      activeTab < insureds.length - 1 ? 'Next Insured' : 'Next Step'
                    )}
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