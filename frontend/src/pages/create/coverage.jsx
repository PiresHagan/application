import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nextStep, previousStep } from '../../slices/stepSlice';
import { Box, Button } from '@mui/material';

function Coverage() {
  const activeStep = useSelector((state) => state.step.activeStep);
  const dispatch = useDispatch();

  const handleBack = () => {
    dispatch(previousStep());
  };

  return (
    <>

    </>
  );
}

export default Coverage;
