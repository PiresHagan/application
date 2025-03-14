import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

function PremiumSection() {
  const monthlyPremium = "$1,788";
  const annualPremium = "$7,564";
  const semiAnnualPremium = "$4,150";
  const quarterlyPremium = "$2,908";

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 3
      }}
    >
      <Box>
        <Typography variant="subtitle1" color="text.secondary">
          Total Monthly Premium
        </Typography>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
          {monthlyPremium} <Typography variant="subtitle1" component="span">monthly</Typography>
        </Typography>
      </Box>

      <Box>
        <Typography variant="subtitle1" color="text.secondary">
          Total Annual Premium
        </Typography>
        <Typography variant="h6" component="div">
          {annualPremium}
        </Typography>
      </Box>

      <Box>
        <Typography variant="subtitle1" color="text.secondary">
          Total Semi Annual
        </Typography>
        <Typography variant="h6" component="div">
          {semiAnnualPremium}
        </Typography>
      </Box>

      <Box>
        <Typography variant="subtitle1" color="text.secondary">
          Total Quarterly Premium
        </Typography>
        <Typography variant="h6" component="div">
          {quarterlyPremium}
        </Typography>
      </Box>
    </Paper>
  );
}

export default PremiumSection; 