import React, { useEffect, useState } from 'react';
import Owner from './owner';
import Coverage from './coverage';
import { Box, Button, Container, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { nextStep, previousStep } from '../../slices/stepSlice';



function Create() {
  const dispatch = useDispatch();
  const activeStep = useSelector((state) => state.step.activeStep);

  function _renderStepContent(step) {
    switch (step) {
      case 0:
        return <Owner applicationNumber={applicationNumber} />;
      case 1:
        return <Coverage applicationNumber={applicationNumber} />;
      case 2:
        return <></>;
      default:
        return <div>Not Found</div>;
    }
  }

  const handleNext = () => {
    dispatch(nextStep());
  };

  const handleBack = () => {
    dispatch(previousStep());
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
                fontSize: '0.875rem',
                mt: 1
              },
              '& .MuiStepIcon-root': {
                fontSize: '2rem',
              },
              '& .MuiStepIcon-root.Mui-active': {
                color: 'primary.main',
              },
              '& .MuiStepIcon-root.Mui-completed': {
                color: 'success.main',
              }
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        {_renderStepContent(activeStep)}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          mt: 3,
          '@media (max-width: 600px)': {
            flexDirection: 'column',
          }
        }}>
          <Button
            variant="contained"
            color="inherit"
            onClick={handleBack}
            disabled={activeStep === 0}
            sx={{
              bgcolor: 'grey.500',
              '&:hover': {
                bgcolor: 'grey.600',
              }
            }}
          >
            Back Step
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleNext}
            >
              Next Step
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Create;
