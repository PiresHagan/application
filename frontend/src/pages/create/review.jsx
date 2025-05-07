import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nextStep, previousStep } from '../../slices/stepSlice';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Divider,
  FormControlLabel,
  Checkbox,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Alert,
  Stack,
  TableContainer
} from '@mui/material';
import { toast } from 'react-toastify';

function Review({ applicationNumber, onStepComplete }) {
  const dispatch = useDispatch();

  const owners = useSelector(state => state.owner.owners || []);
  const coverageOwners = useSelector(state => state.coverageOwners.owners || []);
  const coverage = useSelector(state => state.coverage);
  const beneficiaries = useSelector(state => state.beneficiary.beneficiaries || []);
  const coverageBeneficiaries = useSelector(state => state.beneficiary.coverageBeneficiaries || {});
  const paymentData = useSelector(state => state.payment || {});
  const premium = useSelector(state => state.premium || {});

  const [policyAcknowledgements, setPolicyAcknowledgements] = useState({
    formBasis: false,
    coverageBegin: false,
    truthfulAnswers: false,
    exclusions: false,
    informationAuthorization: false,
    misrepresentation: false,
    electronicConsent: false
  });

  const [allChecked, setAllChecked] = useState(false);

  useEffect(() => {
    const areAllChecked = Object.values(policyAcknowledgements).every(value => value === true);
    setAllChecked(areAllChecked);
    
    if (onStepComplete) {
      onStepComplete(areAllChecked);
    }
  }, [policyAcknowledgements, onStepComplete]);

  const handleAcknowledgementChange = (e) => {
    setPolicyAcknowledgements({
      ...policyAcknowledgements,
      [e.target.name]: e.target.checked
    });
  };

  const formatMaskedSSN = (ssn) => {
    if (!ssn) return 'Not provided';
    return `XXX-XX-${ssn.slice(-4)}`;
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '$0.00';
    return `$${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getPremiumAmount = () => {
    if (!premium || !paymentData.paymentMode) return 'Not available';
    
    switch (paymentData.paymentMode) {
      case 'monthly':
        return formatCurrency(premium.monthlyPremium || premium.premiumData?.monthlyPremium);
      case 'quarterly':
        return formatCurrency(premium.quarterlyPremium || premium.premiumData?.quarterlyPremium);
      case 'semi_annually':
        return formatCurrency(premium.semiAnnualPremium || premium.premiumData?.semiAnnualPremium);
      case 'annually':
        return formatCurrency(premium.annualPremium || premium.premiumData?.annualPremium);
      default:
        return formatCurrency(premium.monthlyPremium || premium.premiumData?.monthlyPremium);
    }
  };

  const getPaymentFrequency = () => {
    switch (paymentData.paymentMode) {
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'semi_annually': return 'Semi-Annually';
      case 'annually': return 'Annually';
      default: return 'Monthly';
    }
  };

  const getPaymentMethod = () => {
    switch (paymentData.paymentMethod) {
      case 'ach': return 'Bank Draft (ACH)';
      case 'card': return 'Credit Card';
      case 'direct_billing': return 'Direct Billing';
      case 'payroll': return 'Payroll Deduction';
      case 'online_banking': return 'Online Banking';
      default: return 'Unknown';
    }
  };

  const getMaskedAccountNumber = () => {
    if (paymentData.paymentMethod === 'ach' && paymentData.bankAccountInfo?.accountNumber) {
      return `XXXX${paymentData.bankAccountInfo.accountNumber.slice(-4)}`;
    } else if (paymentData.paymentMethod === 'card' && paymentData.cardInfo?.cardNumber) {
      return `XXXX-XXXX-XXXX-${paymentData.cardInfo.cardNumber.slice(-4)}`;
    }
    return 'Not available';
  };

  const getBankName = () => {
    if (paymentData.paymentMethod === 'ach' && paymentData.bankAccountInfo?.accountHolderName) {
      return paymentData.bankAccountInfo.accountHolderName;
    }
    return 'Not available';
  };

  const formatRelationship = (relationshipCode) => {
    const relationships = {
      '01': 'Spouse',
      '02': 'Child',
      '03': 'Parent',
      '04': 'Business Partner',
      '05': 'Employee',
      '06': 'Other'
    };
    return relationships[relationshipCode] || 'Unknown';
  };

  const handleSubmit = () => {
    if (!allChecked) {
      toast.error('Please acknowledge all policy provisions before submitting');
      return;
    }
    
    dispatch(nextStep());
  };

  return (
    <Box sx={{ pb: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Review & Declaration
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Owner & Insured Information
        </Typography>
        
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Date of Birth</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Citizenship</TableCell>
                <TableCell>Tobacco</TableCell>
                <TableCell>SSN</TableCell>
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {owners.map((owner, index) => (
                <TableRow key={`owner-${owner.id}`} hover>
                  <TableCell>
                    {owner.ownerType === '01' 
                      ? `${owner.firstName || ''} ${owner.lastName || ''}` 
                      : owner.companyName || 'Unknown'}
                  </TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>{owner.dateOfBirth || 'N/A'}</TableCell>
                  <TableCell>{owner.gender || 'N/A'}</TableCell>
                  <TableCell>{owner.countryCode === '01' ? 'US' : owner.countryCode === '02' ? 'Canada' : 'N/A'}</TableCell>
                  <TableCell>{owner.tobacco ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{formatMaskedSSN(owner.ssn)}</TableCell>
                  <TableCell>{owner.ownerType === '01' ? 'Individual' : 'Corporate'}</TableCell>
                </TableRow>
              ))}
              
              {coverageOwners
                .filter(owner => !owners.some(o => o.id === owner.id))
                .map((insured, index) => (
                  <TableRow key={`insured-${insured.id}`} hover>
                    <TableCell>{`${insured.firstName || ''} ${insured.lastName || ''}`}</TableCell>
                    <TableCell>Insured</TableCell>
                    <TableCell>{insured.dateOfBirth || 'N/A'}</TableCell>
                    <TableCell>{insured.gender || 'N/A'}</TableCell>
                    <TableCell>{insured.countryCode === '01' ? 'US' : insured.countryCode === '02' ? 'Canada' : 'N/A'}</TableCell>
                    <TableCell>{insured.tobacco ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{formatMaskedSSN(insured.ssn)}</TableCell>
                    <TableCell>Individual</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Coverage Details
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Product / Plan</Typography>
            <Typography variant="body1">{coverage.product?.product || 'N/A'} / {coverage.product?.plan || 'N/A'}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Face Amount</Typography>
            <Typography variant="body1">{formatCurrency(coverage.base?.faceAmount)}</Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2">Riders</Typography>
            {coverage.riders && coverage.riders.length > 0 ? (
              <TableContainer>
                <Table size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell>Rider Type</TableCell>
                      <TableCell>Face Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {coverage.riders.map((rider, index) => (
                      <TableRow key={`rider-${index}`} hover>
                        <TableCell>{rider.type || 'Unknown'}</TableCell>
                        <TableCell>{formatCurrency(rider.faceAmount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1">No riders selected</Typography>
            )}
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Premium Frequency</Typography>
            <Typography variant="body1">{getPaymentFrequency()}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Premium Amount</Typography>
            <Typography variant="body1">{getPremiumAmount()}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Beneficiary Information
        </Typography>
        
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Coverage</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Relationship</TableCell>
                <TableCell>Allocation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(coverageBeneficiaries).map(([coverageId, beneficiaryData]) => {
                // Get coverage name
                let coverageName = 'Base Coverage';
                if (coverageId !== 'base') {
                  if (coverageId.startsWith('rider-')) {
                    const riderId = coverageId.replace('rider-', '');
                    const rider = coverage.riders.find(r => r.id == riderId);
                    coverageName = rider ? `Rider: ${rider.type}` : 'Unknown Rider';
                  } else {
                    const additionalCoverage = coverage.additional.find(c => c.id == coverageId);
                    coverageName = additionalCoverage ? `Additional: ${additionalCoverage.coverage}` : 'Unknown Coverage';
                  }
                }
                
                return [...(beneficiaryData.primary || []), ...(beneficiaryData.contingent || [])].map((beneficiaryRef, i) => {
                  const beneficiary = beneficiaries.find(b => b.id === beneficiaryRef.beneficiaryId);
                  if (!beneficiary) return null;
                  
                  return (
                    <TableRow key={`${coverageId}-${beneficiaryRef.beneficiaryId}-${i}`} hover>
                      <TableCell>{`${beneficiary.firstName || ''} ${beneficiary.lastName || ''}`}</TableCell>
                      <TableCell>{coverageName}</TableCell>
                      <TableCell>{beneficiaryData.primary?.some(b => b.beneficiaryId === beneficiary.id) ? 'Primary' : 'Contingent'}</TableCell>
                      <TableCell>{formatRelationship(beneficiaryRef.relationship)}</TableCell>
                      <TableCell>{`${beneficiaryRef.allocation || 0}%`}</TableCell>
                    </TableRow>
                  );
                });
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Payment Information
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Payment Method</Typography>
            <Typography variant="body1">{getPaymentMethod()}</Typography>
          </Grid>
          
          {paymentData.paymentMethod === 'ach' && (
            <>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Bank Name</Typography>
                <Typography variant="body1">{getBankName()}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Account Number</Typography>
                <Typography variant="body1">{getMaskedAccountNumber()}</Typography>
              </Grid>
            </>
          )}
          
          {paymentData.paymentMethod === 'card' && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Card Number</Typography>
              <Typography variant="body1">{getMaskedAccountNumber()}</Typography>
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Typography variant="subtitle2">Cash With Application</Typography>
            <Typography variant="body1">
              {paymentData.initialPaymentOption === 'cash_with_app' ? '✅ Selected' : '❌ Not Selected'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Understanding of Policy Provisions
        </Typography>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          Please review and acknowledge each of the following statements before submitting your application.
        </Alert>
        
        <Stack spacing={1}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={policyAcknowledgements.formBasis}
                onChange={handleAcknowledgementChange}
                name="formBasis"
              />
            }
            label="I acknowledge that this application will form the basis of any insurance policy issued."
          />
          
          <FormControlLabel
            control={
              <Checkbox 
                checked={policyAcknowledgements.coverageBegin}
                onChange={handleAcknowledgementChange}
                name="coverageBegin"
              />
            }
            label="I understand that coverage does not begin until the application is approved and a policy is issued."
          />
          
          <FormControlLabel
            control={
              <Checkbox 
                checked={policyAcknowledgements.truthfulAnswers}
                onChange={handleAcknowledgementChange}
                name="truthfulAnswers"
              />
            }
            label="I confirm that I have truthfully and completely answered all questions to the best of my knowledge."
          />
          
          <FormControlLabel
            control={
              <Checkbox 
                checked={policyAcknowledgements.exclusions}
                onChange={handleAcknowledgementChange}
                name="exclusions"
              />
            }
            label="I understand the policy may contain exclusions, limitations, and a contestability period of 2 years."
          />
          
          <FormControlLabel
            control={
              <Checkbox 
                checked={policyAcknowledgements.informationAuthorization}
                onChange={handleAcknowledgementChange}
                name="informationAuthorization"
              />
            }
            label="I authorize the insurer to obtain medical and personal information from me and third parties for underwriting purposes."
          />
          
          <FormControlLabel
            control={
              <Checkbox 
                checked={policyAcknowledgements.misrepresentation}
                onChange={handleAcknowledgementChange}
                name="misrepresentation"
              />
            }
            label="I understand that any misrepresentation or omission may result in denial of benefits or cancellation of the policy."
          />
          
          <FormControlLabel
            control={
              <Checkbox 
                checked={policyAcknowledgements.electronicConsent}
                onChange={handleAcknowledgementChange}
                name="electronicConsent"
              />
            }
            label="I consent to receive documents and sign electronically in accordance with applicable e-signature laws."
          />
        </Stack>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 4, border: '1px dashed grey' }}>
        <Typography variant="h6" align="center" sx={{ mb: 2 }}>
          Electronic Signature
        </Typography>
        
        <Typography variant="body1" align="center">
          The electronic signature step will be completed through a secure signing service before final submission.
        </Typography>
        
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 1 }}>
          (Integration with certified e-signature provider coming soon)
        </Typography>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="contained"
          color="inherit"
          onClick={() => dispatch(previousStep())}
        >
          Back
        </Button>
        
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!allChecked}
        >
          Submit Application
        </Button>
      </Box>
    </Box>
  );
}

export default Review; 