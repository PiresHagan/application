import React from 'react';
import { Box, Paper, Typography, Divider, CircularProgress, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useSelector, useDispatch } from 'react-redux';
import { useCalculatePremiumMutation, setPremiumData } from '../../slices/premiumSlice';
import { createPremiumRequest, formatPremiumResult } from '../../utils/premiumCalculation';

const PremiumSection = ({ onRequestRefresh }) => {
  const dispatch = useDispatch();
  const premiumData = useSelector(state => state.premium?.premiumData);
  const outdated = useSelector(state => state.premium?.outdated);
  const applicationNumber = useSelector(state => state.application?.applicationNumber);
  
  const [calculatePremium, { isLoading, error }] = useCalculatePremiumMutation();

  const coverageState = useSelector(state => ({
    coverage: state.coverage,
    coverageOwners: state.coverageOwners
  }));

  const handleRefreshPremium = async () => {
    if (onRequestRefresh) {
      onRequestRefresh();
    } else {
      const calcRequest = createPremiumRequest(coverageState, applicationNumber);
      if (calcRequest) {
        try {
          const result = await calculatePremium(calcRequest).unwrap();
          dispatch(setPremiumData(formatPremiumResult(result)));
        } catch (err) {
          console.error('Failed to calculate premium:', err);
        }
      }
    }
  };

  if (isLoading) {
    return (
      <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom>Premium Calculation</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom>Premium Calculation</Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography color="error" sx={{ mt: 2 }}>
          Error calculating premium: {error.data?.message || error.error}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<RefreshIcon />} 
          onClick={handleRefreshPremium}
          sx={{ mt: 2 }}
        >
          Refresh
        </Button>
      </Paper>
    );
  }

  if (!premiumData) {
    return (
      <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom>Premium Calculation</Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
          Loading premium calculation...
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<RefreshIcon />} 
          onClick={handleRefreshPremium}
          sx={{ mt: 2 }}
        >
          Calculate Premium
        </Button>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Premium Calculation</Typography>
        {/* <Button 
          variant={outdated ? "contained" : "outlined"}
          color={outdated ? "error" : "primary"}
          size="small" 
          startIcon={<RefreshIcon />} 
          onClick={handleRefreshPremium}
        >
          Refresh
        </Button> */}
      </Box>
      <Divider sx={{ mb: 2 }} />
      
      {/* {outdated && (
        <Typography 
          sx={{ 
            mb: 2, 
            p: 1, 
            bgcolor: 'error.light', 
            color: 'error.contrastText',
            borderRadius: 1, 
            fontSize: '0.875rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <RefreshIcon sx={{ mr: 1 }} /> Calculation not up to date. Please refresh.
        </Typography>
      )} */}
      
      <Box sx={{ mt: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Total Premium
        </Typography>
        <Typography variant="h4" sx={{ color: 'primary.main' }}>
          ${premiumData.totalPremium || '0.00'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {premiumData.frequency || 'Annual'} premium amount
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Typography variant="subtitle2" gutterBottom>Premium Breakdown</Typography>
      
      {/* Base Coverage */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2">Base Coverage:</Typography>
        <Typography variant="body2" fontWeight="bold">
          ${premiumData.basePremium || '0.00'}
        </Typography>
      </Box>
      
      {/* Additional Coverages */}
      {premiumData.additionalPremiums && premiumData.additionalPremiums.map((premium, index) => (
        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Additional {index + 1}:</Typography>
          <Typography variant="body2" fontWeight="bold">
            ${premium || '0.00'}
          </Typography>
        </Box>
      ))}
      
      {/* Riders */}
      {premiumData.riderPremiums && premiumData.riderPremiums.map((premium, index) => (
        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Rider {index + 1}:</Typography>
          <Typography variant="body2" fontWeight="bold">
            ${premium || '0.00'}
          </Typography>
        </Box>
      ))}
      
      <Divider sx={{ my: 2 }} />
      
      {/* Payment Options */}
      <Typography variant="subtitle2" gutterBottom>Payment Options</Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2">Annual:</Typography>
        <Typography variant="body2" fontWeight="bold">
          ${premiumData.annualPremium || premiumData.totalPremium || '0.00'}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2">Semi-Annual:</Typography>
        <Typography variant="body2" fontWeight="bold">
          ${premiumData.semiAnnualPremium || '0.00'}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2">Quarterly:</Typography>
        <Typography variant="body2" fontWeight="bold">
          ${premiumData.quarterlyPremium || '0.00'}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2">Monthly:</Typography>
        <Typography variant="body2" fontWeight="bold">
          ${premiumData.monthlyPremium || '0.00'}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="caption" color="text.secondary">
        Last calculated: {premiumData.calculationDate || new Date().toLocaleString()}
      </Typography>
    </Paper>
  );
};

export default PremiumSection;