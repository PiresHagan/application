import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Box, Paper, Typography, Divider, CircularProgress, Button, Stack } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CodeIcon from '@mui/icons-material/Code';
import { useSelector, useDispatch } from 'react-redux';
import { useCalculatePremiumMutation, useSavePremiumMutation, setPremiumData } from '../../slices/premiumSlice';
import { createPremiumRequest, formatPremiumResult } from '../../utils/premiumCalculation';

const PremiumSection = forwardRef(({ onRequestRefresh, onShowRequestJson, applicationNumber }, ref) => {
  const dispatch = useDispatch();
  const premiumData = useSelector(state => state.premium?.premiumData);
  const outdated = useSelector(state => state.premium?.outdated);
  console.log('applicationNumber', applicationNumber);

  const [calculatePremium, { isLoading, error }] = useCalculatePremiumMutation();
  const [savePremium, { isLoading: isSaving }] = useSavePremiumMutation();
  const [lastRequest, setLastRequest] = useState(null);
  const [lastResponse, setLastResponse] = useState(null);

  const coverageState = useSelector(state => ({
    coverage: state.coverage,
    coverageOwners: state.coverageOwners
  }));

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    updateJson: (request, response) => {
      setLastRequest(request);
      setLastResponse(response);
    },
    showRequestJson: (request) => {
      // Method to be called from parent with the latest request data
      showJsonInNewTab(request, 'Premium Calculation Request');
    },
    savePremiumData: async () => {
      console.log('savePremiumData', premiumData, applicationNumber);
      if (!premiumData || !applicationNumber) {
        console.error('Cannot save premium data: Missing premium data or application number');
        return false;
      }

      try {
        const premiumDataToSave = {
          annualPremium: premiumData.annualPremium,
          semiAnnualPremium: premiumData.semiAnnualPremium,
          quarterlyPremium: premiumData.quarterlyPremium,
          monthlyPremium: premiumData.monthlyPremium
        };

        await savePremium({
          applicationNumber,
          premiumData: premiumDataToSave
        }).unwrap();

        console.log('Premium data saved successfully');
        return true;
      } catch (error) {
        console.error('Error saving premium data:', error);
        return false;
      }
    }
  }));

  const handleRefreshPremium = async () => {
    if (onRequestRefresh) {
      onRequestRefresh();
    } else {
      const calcRequest = createPremiumRequest(coverageState, applicationNumber);
      if (calcRequest) {
        setLastRequest(calcRequest);
        try {
          const result = await calculatePremium(calcRequest).unwrap();
          setLastResponse(result);
          dispatch(setPremiumData(formatPremiumResult(result)));
        } catch (err) {
          console.error('Failed to calculate premium:', err);
        }
      }
    }
  };

  // Helper function to show JSON in a new tab
  const showJsonInNewTab = (data, title) => {
    if (data) {
      const jsonString = JSON.stringify(data, null, 2);
      const newWindow = window.open();
      newWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { background-color: #1e1e1e; color: #d4d4d4; font-family: monospace; padding: 20px; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <pre>${jsonString}</pre>
          </body>
        </html>
      `);
    }
  };

  const showRequestJson = () => {
    // Use the callback from parent to get the latest request
    if (onShowRequestJson) {
      onShowRequestJson();
    } else {
      // Fallback to using Redux state if callback not provided
      const request = createPremiumRequest(coverageState, applicationNumber);
      showJsonInNewTab(request, 'Premium Calculation Request');
    }
  };

  const showResponseJson = () => {
    // For response, use the current premiumData from Redux store
    if (premiumData) {
      // Show the raw data structure before formatting
      const rawApiResponse = {};

      // Extract application ID from the premium data
      const appGuid = Object.keys(premiumData)
        .find(key => key.includes('_totalAnnualPremium'))
        ?.split('_totalAnnualPremium')[0] || applicationNumber || 'APP-000000';

      if (appGuid) {
        // Recreate raw API response structure
        rawApiResponse[`${appGuid}_totalAnnualPremium`] = parseFloat(premiumData.annualPremium);
        rawApiResponse[`${appGuid}_totalMonthlyPremium`] = parseFloat(premiumData.monthlyPremium);
        rawApiResponse[`${appGuid}_totalQuarterlyPremium`] = parseFloat(premiumData.quarterlyPremium);
        rawApiResponse[`${appGuid}_totalSemiAnnualPremium`] = parseFloat(premiumData.semiAnnualPremium);

        // Add base premium
        const baseCoverageGUID = coverageState.coverage.base.coverageGUID || 'COV-base-1';
        rawApiResponse[`${baseCoverageGUID}_premium`] = parseFloat(premiumData.basePremium);

        // Add additional premiums if present
        if (premiumData.additionalPremiums && premiumData.additionalPremiums.length > 0) {
          premiumData.additionalPremiums.forEach((premium, index) => {
            const additionalCoverageId = coverageState.coverage.additional[index]?.id || index + 1;
            rawApiResponse[`COV-additional-${additionalCoverageId}_premium`] = parseFloat(premium);
          });
        }
      }

      showJsonInNewTab(lastResponse || rawApiResponse, 'Premium Calculation Response');
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

      <Box sx={{ mt: 2 }}>
        <Stack direction="row" spacing={1} justifyContent="center">
          <Button
            variant="outlined"
            size="small"
            startIcon={<CodeIcon />}
            onClick={showRequestJson}
          >
            View Request
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CodeIcon />}
            onClick={showResponseJson}
          >
            View Response
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
});

export default PremiumSection;