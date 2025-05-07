import React, { useEffect, useState } from 'react';
import Owner from './owner';
import Coverage from './coverage';
import Medical from './medical';
import Beneficiary from './beneficiary';
import Payment from './payment';
import Review from './review';
import { Box, Button, Container, Step, StepLabel, Stepper, Typography, Tooltip } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { nextStep, previousStep, setActiveStep, setStepValid } from '../../slices/stepSlice';
import { toast } from 'react-toastify';

function Create() {
  const dispatch = useDispatch();
  const activeStep = useSelector((state) => state.step.activeStep);
  const stepValidation = useSelector((state) => state.step.stepValidation);

  function _renderStepContent(step) {
    switch (step) {
      case 0:
        return <Owner
          applicationNumber={applicationNumber}
          onStepComplete={(isComplete) => handleStepCompletion(0, isComplete)}
        />;
      case 1:
        return <Coverage
          applicationNumber={applicationNumber}
          onStepComplete={(isComplete) => handleStepCompletion(1, isComplete)}
        />;
      case 2:
        return <Medical
          applicationNumber={applicationNumber}
          onStepComplete={(isComplete) => handleStepCompletion(2, isComplete)}
        />;
      case 3:
        return <Beneficiary
          applicationNumber={applicationNumber}
          onStepComplete={(isComplete) => handleStepCompletion(3, isComplete)}
        />;
      case 4:
        return <Payment
          applicationNumber={applicationNumber}
          onStepComplete={(isComplete) => handleStepCompletion(4, isComplete)}
        />;
      case 5:
        return <Review
          applicationNumber={applicationNumber}
          onStepComplete={(isComplete) => handleStepCompletion(5, isComplete)}
        />;
      case 6:
        return <></>;
      default:
        return <div>Not Found</div>;
    }
  }

  const handleStepCompletion = (step, isValid) => {
    if (step === activeStep || (isValid && !stepValidation[step])) {
      dispatch(setStepValid({ step, isValid }));
    }
  };

  const validateCurrentStep = () => {
    return stepValidation[activeStep];
  };

  const handleNext = () => {
    const isCurrentStepValid = validateCurrentStep();

    if (isCurrentStepValid) {
      if (!stepValidation[activeStep]) {
        dispatch(setStepValid({ step: activeStep, isValid: true }));
      }
      dispatch(nextStep());
    } else {
      toast.error('Please complete all required fields in the current step before proceeding.');
    }
  };

  const handleBack = () => {
    dispatch(previousStep());
  };

  const handleStepClick = (step) => {
    if (step > activeStep) {
      if (!stepValidation[activeStep]) {
        toast.error("Please complete all required fields in the current step before proceeding.");
        return;
      }

      if (step > activeStep + 1) {
        toast.error("Please complete steps in order.");
        return;
      }
    }

    dispatch(setActiveStep(step));
  };

  useEffect(() => {
    const generateApplicationNumber = () => {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      return randomNum;
    };

    setApplicationNumber(generateApplicationNumber());
  }, []);
  const [applicationNumber, setApplicationNumber] = useState('');

  const steps = [
    'Owner Details',
    'Coverage Information',
    'Medical & Lifestyle',
    'Beneficiary Details',
    'Payment & Banking',
    'Review & Declaration',
    'Submission & Confirmation'
  ];

  const getTooltipText = (index) => {
    if (index === activeStep) {
      return stepValidation[index]
        ? "Current step (completed)"
        : "Current step";
    } else if (index < activeStep || stepValidation[index]) {
      return "Click to return to this completed step";
    } else if (index === activeStep + 1) {
      return stepValidation[activeStep]
        ? "Click to advance to this step"
        : "Complete current step to unlock";
    } else {
      return "Complete previous steps first";
    }
  };

  return (
    <Box>
      <Container
        maxWidth="false"
        sx={{
          py: 3
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="subtitle1"
            sx={{
              minWidth: 'fit-content',
              color: 'text.secondary',
              mb: 3
            }}
          >
            Application Number: APP{applicationNumber}
          </Typography>

          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              '& .MuiStepLabel-label': {
                fontSize: '1rem',
                fontWeight: 600,
                mt: 1.5,
                color: '#333',
              },
              '& .MuiStepLabel-label.Mui-active': {
                fontWeight: 700,
              },
              '& .MuiStepIcon-root': {
                fontSize: '2.2rem',
              },
              '& .MuiStepIcon-root.Mui-active': {
                color: '#6246EA',
              },
              '& .MuiStepIcon-root.Mui-completed': {
                color: '#6246EA',
              },
              mb: 3
            }}
          >
            {steps.map((label, index) => (
              <Tooltip
                key={label}
                title={getTooltipText(index)}
                placement="top"
                arrow
              >
                <Step
                  completed={activeStep > index || stepValidation[index]}
                  sx={{
                    cursor: 'pointer',
                    padding: '8px'
                  }}
                  onClick={() => handleStepClick(index)}
                >
                  <StepLabel>{label}</StepLabel>
                </Step>
              </Tooltip>
            ))}
          </Stepper>

          {/* <Typography
            variant="caption"
            align="center"
            sx={{
              display: 'block',
              mb: 6,
              color: 'text.secondary',
              fontStyle: 'italic'
            }}
          >
            Tip: Complete each step to unlock the next one. Completed steps stay checked even when you navigate back.
          </Typography> */}
        </Box>
        {_renderStepContent(activeStep)}
      </Container>
    </Box>
  );
}

export default Create;
