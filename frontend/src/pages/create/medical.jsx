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
import { saveMedicalData } from '../../slices/medicalSlice'; // You'll need to create this slice

function a11yProps(index) {
  return {
    id: `insured-tab-${index}`,
    'aria-controls': `insured-tabpanel-${index}`,
  };
}

function Medical({ applicationNumber }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get insureds from the coverageOwnersSlice
  const insureds = useSelector(state => state.coverageOwners.owners || []);

  // Get medical data from the medicalSlice (to be created)
  const medicalData = useSelector(state => state.medical?.medicalData || {});

  const [activeTab, setActiveTab] = useState(0);
  const [expandedSections, setExpandedSections] = useState({});
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  // Initialize form data with existing medical data or create fresh data
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
            suddenWeightChange: 'N'
          },
          tobaccoSubstance: {
            usesTobacco: 'N',
            packsPerDay: '',
            yearsSmoked: '',
            hasQuit: 'N',
            yearsQuit: '',
            usesRecreationalDrugs: 'N',
            substanceAbuseTreatment: 'N'
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
            neurologicalDisorders: false
          },
          recentMedical: {
            recentSurgery: 'N',
            recentHospitalization: 'N',
            currentTreatment: 'N',
            currentTreatmentDetails: ''
          },
          medications: {
            takesMedications: 'N',
            medicationDetails: ''
          },
          mentalHealth: {
            mentalHealthDiagnosis: 'N',
            mentalHealthHospitalization: 'N',
            mentalHealthMedications: 'N'
          },
          familyHistory: {
            familyCancer: false,
            familyHeartDisease: false,
            familyDiabetes: false,
            familyStroke: false,
            familyHighBloodPressure: false
          },
          hivStd: {
            hivPositive: 'N',
            stdDiagnosis: 'N'
          },
          sleepDisorders: {
            sleepApnea: 'N'
          },
          otherConditions: {
            hasOtherConditions: 'N',
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
            professionalSports: false
          },
          hazardousTravel: {
            frequentTravel: 'N',
            travelWarningCountries: 'N',
            warZones: 'N'
          },
          pilotLicense: {
            hasPilotLicense: 'N',
            fliesUltralight: 'N',
            flyingHours: ''
          },
          alcohol: {
            alcoholConsumption: 'None'
          },
          dui: {
            hasDUI: 'N',
            duiDetails: ''
          },
          military: {
            militaryService: 'N',
            highRiskUnit: 'N'
          },
          occupationRisks: {
            highRiskJob: 'N',
            firefighter: false,
            policeOfficer: false,
            militaryCombat: false,
            oilRigWorker: false,
            deepSeaFisherman: false,
            stuntPerformer: false,
            explosivesWorker: false
          }
        };
      });
      setFormData(initialData);

      // Set first section expanded by default for each insured
      const initialExpandedState = {};
      insureds.forEach(insured => {
        initialExpandedState[`${insured.id}-heightWeight`] = true;
      });
      setExpandedSections(initialExpandedState);
    }

    // Scroll to the first section after initialization
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

    // If the section is being expanded, scroll to it
    if (!expandedSections[`${insuredId}-${sectionName}`]) {
      setTimeout(() => {
        const sectionId = `section-${insuredId}-${sectionName}`;
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100); // Small delay to ensure DOM is updated
    }
  };

  const handleFieldChange = (insuredId, section, field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [insuredId]: {
        ...prevData[insuredId],
        [section]: {
          ...prevData[insuredId][section],
          [field]: value
        }
      }
    }));

    // Clear related fields when parent field changes
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
            hasQuit: 'N',
            yearsQuit: ''
          }
        }
      }));
    }

    // Handle other conditional field clearing logic
    // ...
  };

  const handleNext = () => {
    if (activeTab < insureds.length - 1) {
      // Move to next insured's tab
      setActiveTab(activeTab + 1);
    } else {
      // Move to next step in the application
      // Save data to Redux
      dispatch(saveMedicalData(formData));
      dispatch(nextStep());
    }
  };

  const handleBack = () => {
    if (activeTab > 0) {
      // Move to previous insured's tab
      setActiveTab(activeTab - 1);
    } else {
      // Move to previous step in the application
      dispatch(previousStep());
    }
  };

  const validateForm = (insuredId) => {
    // Implement validation logic here
    // Return true if valid, false if invalid
    return true;
  };

  const renderHeightWeightSection = (insuredId) => (
    <CollapsibleSection
      title="Height & Weight"
      isEnabled={true}
      isExpanded={expandedSections[`${insuredId}-heightWeight`]}
      isValid={true}
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
            value={formData[insuredId]?.heightWeight?.suddenWeightChange || 'N'}
            onChange={(e) => handleFieldChange(insuredId, 'heightWeight', 'suddenWeightChange', e.target.value)}
          >
            <FormControlLabel value="Y" control={<Radio />} label="Yes" />
            <FormControlLabel value="N" control={<Radio />} label="No" />
          </RadioGroup>
          <Typography variant="subtitle1" gutterBottom>
            BMI (Some insurers may charge more for high BMI)
          </Typography>
        </Grid>
      </Grid>
    </CollapsibleSection>
  );

  const renderTobaccoSubstanceSection = (insuredId) => (
    <CollapsibleSection
      title="Tobacco & Substance Use"
      isEnabled={true}
      isExpanded={expandedSections[`${insuredId}-tobaccoSubstance`]}
      isValid={true}
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
        value={formData[insuredId]?.tobaccoSubstance?.usesTobacco || 'N'}
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
            value={formData[insuredId]?.tobaccoSubstance?.hasQuit || 'N'}
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
        value={formData[insuredId]?.tobaccoSubstance?.usesRecreationalDrugs || 'N'}
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
        value={formData[insuredId]?.tobaccoSubstance?.substanceAbuseTreatment || 'N'}
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
      isValid={true}
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
            />
          </Grid>
        )}
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.chronicConditions?.kidneyDisease || false}
                onChange={(e) => handleFieldChange(insuredId, 'chronicConditions', 'kidneyDisease', e.target.checked)}
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
              />
            }
            label="Neurological disorders"
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
      isValid={true}
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
            value={formData[insuredId]?.recentMedical?.recentSurgery || 'N'}
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
            value={formData[insuredId]?.recentMedical?.recentHospitalization || 'N'}
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
            value={formData[insuredId]?.recentMedical?.currentTreatment || 'N'}
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
      isValid={true}
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
        value={formData[insuredId]?.medications?.takesMedications || 'N'}
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
      isValid={true}
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
            value={formData[insuredId]?.mentalHealth?.mentalHealthDiagnosis || 'N'}
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
            value={formData[insuredId]?.mentalHealth?.mentalHealthHospitalization || 'N'}
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
            value={formData[insuredId]?.mentalHealth?.mentalHealthMedications || 'N'}
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
      isValid={true}
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
              />
            }
            label="High blood pressure"
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
      isValid={true}
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
            value={formData[insuredId]?.hivStd?.hivPositive || 'N'}
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
            value={formData[insuredId]?.hivStd?.stdDiagnosis || 'N'}
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
      isValid={true}
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
        value={formData[insuredId]?.sleepDisorders?.sleepApnea || 'N'}
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
      isValid={true}
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
        value={formData[insuredId]?.otherConditions?.hasOtherConditions || 'N'}
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
      isValid={true}
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
              />
            }
            label="Motorsports (Racing, MotoGP, Off-road)"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.highRiskActivities?.extremeHiking || false}
                onChange={(e) => handleFieldChange(insuredId, 'highRiskActivities', 'extremeHiking', e.target.checked)}
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
              />
            }
            label="Big-Game Hunting"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.highRiskActivities?.bullRiding || false}
                onChange={(e) => handleFieldChange(insuredId, 'highRiskActivities', 'bullRiding', e.target.checked)}
              />
            }
            label="Bull Riding/Rodeo"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[insuredId]?.highRiskActivities?.professionalSports || false}
                onChange={(e) => handleFieldChange(insuredId, 'highRiskActivities', 'professionalSports', e.target.checked)}
              />
            }
            label="Professional Sports"
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
      isValid={true}
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
            value={formData[insuredId]?.hazardousTravel?.frequentTravel || 'N'}
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
            value={formData[insuredId]?.hazardousTravel?.travelWarningCountries || 'N'}
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
            value={formData[insuredId]?.hazardousTravel?.warZones || 'N'}
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
      isValid={true}
      onExpand={handleSectionChange(insuredId, 'pilotLicense')}
      ownerId={insuredId}
      sectionName="pilotLicense"
      expandedSections={expandedSections}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Do you hold a private or commercial pilot's license?
          </Typography>
          <RadioGroup
            row
            value={formData[insuredId]?.pilotLicense?.hasPilotLicense || 'N'}
            onChange={(e) => handleFieldChange(insuredId, 'pilotLicense', 'hasPilotLicense', e.target.value)}
            sx={{ mb: 2 }}
          >
            <FormControlLabel value="Y" control={<Radio />} label="Yes" />
            <FormControlLabel value="N" control={<Radio />} label="No" />
          </RadioGroup>
        </Grid>

        {formData[insuredId]?.pilotLicense?.hasPilotLicense === 'Y' && (
          <>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Do you fly ultralight or experimental aircraft?
              </Typography>
              <RadioGroup
                row
                value={formData[insuredId]?.pilotLicense?.fliesUltralight || 'N'}
                onChange={(e) => handleFieldChange(insuredId, 'pilotLicense', 'fliesUltralight', e.target.value)}
                sx={{ mb: 2 }}
              >
                <FormControlLabel value="Y" control={<Radio />} label="Yes" />
                <FormControlLabel value="N" control={<Radio />} label="No" />
              </RadioGroup>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="How many hours do you fly per year?"
                fullWidth
                type="number"
                value={formData[insuredId]?.pilotLicense?.flyingHours || ''}
                onChange={(e) => handleFieldChange(insuredId, 'pilotLicense', 'flyingHours', e.target.value)}
                margin="normal"
              />
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
      isValid={true}
      onExpand={handleSectionChange(insuredId, 'alcohol')}
      ownerId={insuredId}
      sectionName="alcohol"
      expandedSections={expandedSections}
    >
      <Typography variant="subtitle1" gutterBottom>
        How many drinks per week do you consume on average?
      </Typography>
      <RadioGroup
        value={formData[insuredId]?.alcohol?.alcoholConsumption || 'None'}
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
      title="DUI or Reckless Driving"
      isEnabled={true}
      isExpanded={expandedSections[`${insuredId}-dui`]}
      isValid={true}
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
        value={formData[insuredId]?.dui?.hasDUI || 'N'}
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
      title="Military or Law Enforcement Service"
      isEnabled={true}
      isExpanded={expandedSections[`${insuredId}-military`]}
      isValid={true}
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
        value={formData[insuredId]?.military?.militaryService || 'N'}
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
            value={formData[insuredId]?.military?.highRiskUnit || 'N'}
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
      isValid={true}
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
        value={formData[insuredId]?.occupationRisks?.highRiskJob || 'N'}
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
              scrollButtons={insureds.length > 3 ? "auto" : "disabled"}
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