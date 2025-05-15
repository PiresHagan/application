import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Divider,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useSelector } from 'react-redux';

const Submission = ({ applicationNumber }) => {
  const [submissionTime, setSubmissionTime] = useState(new Date());
  const [caseNumber, setCaseNumber] = useState('');

  useEffect(() => {
    const generateCaseNumber = () => {
      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      setCaseNumber(`UW${randomDigits}`);
    };
    
    generateCaseNumber();
  }, []);

  const formattedDate = submissionTime.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  const formattedTime = submissionTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              textAlign: 'center',
              mb: 4
            }}
          >
            <CheckCircleOutlineIcon 
              color="success" 
              sx={{ fontSize: 80, mb: 2 }}
            />
            <Typography variant="h4" component="h1" gutterBottom>
              Application Submitted Successfully
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Your application has been submitted for Underwriting
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Submission Date & Time
                  </Typography>
                  <Typography variant="body1">
                    {formattedDate} at {formattedTime}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Application Number
                  </Typography>
                  <Typography variant="body1">
                    {applicationNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Underwriting Case Number
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    {caseNumber}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1">
              An underwriter will review your application soon. You will receive 
              notifications about the status of your application.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Submission; 