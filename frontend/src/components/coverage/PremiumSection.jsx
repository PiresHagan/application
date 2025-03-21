import React from 'react';
import { Box, Paper, Typography, Divider, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';

/**
 * Premium Section displays the calculated premium details
 * This component shows the premium calculation results from the premium calculation API
 */
const PremiumSection = () => {
  // Get premium data from redux store
  const premiumData = useSelector(state => state.premium?.data);
  const loading = useSelector(state => state.premium?.loading);
  const error = useSelector(state => state.premium?.error);

  if (loading) {
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
          Error calculating premium: {error}
        </Typography>
      </Paper>
    );
  }

  if (!premiumData) {
    return (
      <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom>Premium Calculation</Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
          Complete the form to see premium calculation results.
        </Typography>
      </Paper>
    );
  }

  // Example premium data structure - adjust according to your actual API response
  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>Premium Calculation</Typography>
      <Divider sx={{ mb: 2 }} />
      
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