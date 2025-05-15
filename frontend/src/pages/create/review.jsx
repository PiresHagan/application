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
    
    if (onStepComplete) {
      onStepComplete(true);
    }
    
    toast.success('Application submitted successfully!');
    dispatch(nextStep());
  };

  const getInsuredForCoverage = (coverageData) => {
    if (!coverageData) return null;
    
    if (coverageData.insured1) {
      return coverageOwners.find(owner => owner.id === coverageData.insured1);
    }
    
    if (coverageData.selectedPerson) {
      return coverageOwners.find(owner => owner.id === coverageData.selectedPerson);
    }
    
    return null;
  };

  const getBeneficiariesForCoverage = (coverageId) => {
    const beneficiaryData = coverageBeneficiaries[coverageId];
    if (!beneficiaryData) return [];
    
    const allBeneficiaryRefs = [
      ...(beneficiaryData.primary || []),
      ...(beneficiaryData.contingent || [])
    ];
    
    return allBeneficiaryRefs.map(ref => {
      const beneficiary = beneficiaries.find(b => b.id === ref.beneficiaryId);
      if (!beneficiary) return null;
      
      return {
        ...beneficiary,
        relationship: ref.relationship,
        allocation: ref.allocation,
        type: beneficiaryData.primary?.some(b => b.beneficiaryId === ref.beneficiaryId) 
          ? 'Primary' : 'Contingent'
      };
    }).filter(item => item !== null);
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
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Base Coverage Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Base Coverage
        </Typography>
        
        <Grid container spacing={3}>
          {/* Coverage Details */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Coverage Details</Typography>
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Product / Plan</TableCell>
                    <TableCell>Face Amount</TableCell>
                    <TableCell>Coverage Type</TableCell>
                    <TableCell>Premium ({getPaymentFrequency()})</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover>
                    <TableCell>{coverage.product?.product || 'N/A'} / {coverage.product?.plan || 'N/A'}</TableCell>
                    <TableCell>{formatCurrency(coverage.base?.faceAmount)}</TableCell>
                    <TableCell>{coverage.base?.coverageType === 'joint' ? 'Joint' : 'Single'}</TableCell>
                    <TableCell>{getPremiumAmount()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          
          {/* Insured Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Insured Information</Typography>
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Date of Birth</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>Citizenship</TableCell>
                    <TableCell>Tobacco</TableCell>
                    <TableCell>SSN</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Primary Insured */}
                  {coverage.base?.insured1 && (
                    <TableRow hover>
                      {(() => {
                        const insured = coverageOwners.find(owner => owner.id == coverage.base.insured1);
                        if (!insured) return <TableCell colSpan={6}></TableCell>;
                        
                        return (
                          <>
                            <TableCell>{`${insured.firstName || ''} ${insured.lastName || ''}`}</TableCell>
                            <TableCell>{insured.dateOfBirth || 'N/A'}</TableCell>
                            <TableCell>{insured.gender || 'N/A'}</TableCell>
                            <TableCell>{insured.countryCode === '01' ? 'US' : insured.countryCode === '02' ? 'Canada' : 'N/A'}</TableCell>
                            <TableCell>{insured.tobacco ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{formatMaskedSSN(insured.ssn)}</TableCell>
                          </>
                        );
                      })()}
                    </TableRow>
                  )}
                  
                  {coverage.base?.coverageType === 'joint' && coverage.base?.insured2 && (
                    <TableRow hover>
                      {(() => {
                        const insured = coverageOwners.find(owner => owner.id === coverage.base.insured2);
                        if (!insured) return <TableCell colSpan={6}></TableCell>;
                        
                        return (
                          <>
                            <TableCell>{`${insured.firstName || ''} ${insured.lastName || ''}`}</TableCell>
                            <TableCell>{insured.dateOfBirth || 'N/A'}</TableCell>
                            <TableCell>{insured.gender || 'N/A'}</TableCell>
                            <TableCell>{insured.countryCode === '01' ? 'US' : insured.countryCode === '02' ? 'Canada' : 'N/A'}</TableCell>
                            <TableCell>{insured.tobacco ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{formatMaskedSSN(insured.ssn)}</TableCell>
                          </>
                        );
                      })()}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          
          {/* Beneficiary Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Beneficiary Information</Typography>
            {(() => {
              const baseBeneficiaries = getBeneficiariesForCoverage('base');
              
              if (baseBeneficiaries.length === 0) {
                return <Typography variant="body2">No beneficiaries designated for this coverage.</Typography>;
              }
              
              return (
                <TableContainer>
                  <Table size="medium">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Relationship</TableCell>
                        <TableCell>Allocation</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {baseBeneficiaries.map((beneficiary, index) => (
                        <TableRow key={`base-beneficiary-${beneficiary.id}-${index}`} hover>
                          <TableCell>{`${beneficiary.firstName || ''} ${beneficiary.lastName || ''}`}</TableCell>
                          <TableCell>{beneficiary.type}</TableCell>
                          <TableCell>{formatRelationship(beneficiary.relationship)}</TableCell>
                          <TableCell>{`${beneficiary.allocation || 0}%`}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              );
            })()}
          </Grid>
        </Grid>
      </Paper>

      {/* Additional Coverages Section */}
      {coverage.additional && coverage.additional.length > 0 && (
        <>
          {coverage.additional.map((additionalCoverage, index) => (
            <Paper key={`additional-${index}`} elevation={2} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Additional Coverage: {additionalCoverage.coverage || 'Unknown'}
              </Typography>
              
              <Grid container spacing={3}>
                {/* Coverage Details */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Coverage Details</Typography>
                  <TableContainer>
                    <Table size="medium">
                      <TableHead>
                        <TableRow>
                          <TableCell>Coverage Type</TableCell>
                          <TableCell>Face Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow hover>
                          <TableCell>{additionalCoverage.coverage || 'N/A'}</TableCell>
                          <TableCell>{formatCurrency(additionalCoverage.faceAmount)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                
                {/* Insured Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Insured Information</Typography>
                  <TableContainer>
                    <Table size="medium">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Date of Birth</TableCell>
                          <TableCell>Gender</TableCell>
                          <TableCell>Citizenship</TableCell>
                          <TableCell>Tobacco</TableCell>
                          <TableCell>SSN</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(() => {
                          const insured = coverageOwners.find(owner => owner.id === additionalCoverage.insured1);
                          if (!insured) return (
                            <TableRow hover>
                              <TableCell colSpan={6}>Insured information not found</TableCell>
                            </TableRow>
                          );
                          
                          return (
                            <TableRow hover>
                              <TableCell>{`${insured.firstName || ''} ${insured.lastName || ''}`}</TableCell>
                              <TableCell>{insured.dateOfBirth || 'N/A'}</TableCell>
                              <TableCell>{insured.gender || 'N/A'}</TableCell>
                              <TableCell>{insured.countryCode === '01' ? 'US' : insured.countryCode === '02' ? 'Canada' : 'N/A'}</TableCell>
                              <TableCell>{insured.tobacco ? 'Yes' : 'No'}</TableCell>
                              <TableCell>{formatMaskedSSN(insured.ssn)}</TableCell>
                            </TableRow>
                          );
                        })()}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                
                {/* Beneficiary Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Beneficiary Information</Typography>
                  {(() => {
                    const beneficiariesForCoverage = getBeneficiariesForCoverage(additionalCoverage.id);
                    
                    if (beneficiariesForCoverage.length === 0) {
                      return <Typography variant="body2">No beneficiaries designated for this coverage.</Typography>;
                    }
                    
                    return (
                      <TableContainer>
                        <Table size="medium">
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>Relationship</TableCell>
                              <TableCell>Allocation</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {beneficiariesForCoverage.map((beneficiary, idx) => (
                              <TableRow key={`additional-${index}-beneficiary-${beneficiary.id}-${idx}`} hover>
                                <TableCell>{`${beneficiary.firstName || ''} ${beneficiary.lastName || ''}`}</TableCell>
                                <TableCell>{beneficiary.type}</TableCell>
                                <TableCell>{formatRelationship(beneficiary.relationship)}</TableCell>
                                <TableCell>{`${beneficiary.allocation || 0}%`}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    );
                  })()}
                </Grid>
              </Grid>
            </Paper>
          ))}
        </>
      )}

      {coverage.riders && coverage.riders.length > 0 && (
        <>
          {coverage.riders.filter(rider => rider.type && rider.type.toLowerCase().includes('accidental')).map((rider, index) => (
            <Paper key={`rider-${index}`} elevation={2} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Rider: {rider.type || 'Unknown'}
              </Typography>
              
              <Grid container spacing={3}>
                {/* Rider Details */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Rider Details</Typography>
                  <TableContainer>
                    <Table size="medium">
                      <TableHead>
                        <TableRow>
                          <TableCell>Rider Type</TableCell>
                          <TableCell>Face Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow hover>
                          <TableCell>{rider.type || 'Unknown'}</TableCell>
                          <TableCell>{formatCurrency(rider.faceAmount)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                
                {/* Beneficiary Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Beneficiary Information</Typography>
                  {(() => {
                    const beneficiariesForRider = getBeneficiariesForCoverage(`rider-${rider.id}`);
                    
                    if (beneficiariesForRider.length === 0) {
                      return <Typography variant="body2">No beneficiaries designated for this rider.</Typography>;
                    }
                    
                    return (
                      <TableContainer>
                        <Table size="medium">
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>Relationship</TableCell>
                              <TableCell>Allocation</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {beneficiariesForRider.map((beneficiary, idx) => (
                              <TableRow key={`rider-${index}-beneficiary-${beneficiary.id}-${idx}`} hover>
                                <TableCell>{`${beneficiary.firstName || ''} ${beneficiary.lastName || ''}`}</TableCell>
                                <TableCell>{beneficiary.type}</TableCell>
                                <TableCell>{formatRelationship(beneficiary.relationship)}</TableCell>
                                <TableCell>{`${beneficiary.allocation || 0}%`}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    );
                  })()}
                </Grid>
              </Grid>
            </Paper>
          ))}
        </>
      )}

      {/* Payor & Payment Information */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Payor & Payment Information
        </Typography>
        
        <Grid container spacing={3}>
          {/* Payor Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Payor Information</Typography>
            {paymentData.payors && paymentData.payors.length > 0 ? (
              <TableContainer>
                <Table size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Allocation</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paymentData.payors.map((payor, index) => {
                      const payorInfo = [...owners, ...coverageOwners]
                        .find(person => person.id.toString() === payor.payorId?.toString());
                        
                      return (
                        <TableRow key={`payor-${index}`} hover>
                          <TableCell>
                            {payorInfo ? 
                              `${payorInfo.firstName || ''} ${payorInfo.lastName || ''}` : 
                              'Unknown Payor'}
                          </TableCell>
                          <TableCell>{`${payor.allocation || 0}%`}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2">No payors designated.</Typography>
            )}
          </Grid>
          
          {/* Payment Details */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Payment Details</Typography>
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Payment Method</TableCell>
                    <TableCell>Payment Frequency</TableCell>
                    <TableCell>Premium Amount</TableCell>
                    {paymentData.paymentMethod === 'ach' && (
                      <>
                        <TableCell>Bank Name</TableCell>
                        <TableCell>Account Number</TableCell>
                      </>
                    )}
                    {paymentData.paymentMethod === 'card' && (
                      <TableCell>Card Number</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover>
                    <TableCell>{getPaymentMethod()}</TableCell>
                    <TableCell>{getPaymentFrequency()}</TableCell>
                    <TableCell>{getPremiumAmount()}</TableCell>
                    {paymentData.paymentMethod === 'ach' && (
                      <>
                        <TableCell>{getBankName()}</TableCell>
                        <TableCell>{getMaskedAccountNumber()}</TableCell>
                      </>
                    )}
                    {paymentData.paymentMethod === 'card' && (
                      <TableCell>{getMaskedAccountNumber()}</TableCell>
                    )}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Cash With Application</Typography>
              <Typography variant="body1">
                {paymentData.initialPaymentOption === 'cash_with_app' ? '✅ Selected' : '❌ Not Selected'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Policy Provisions */}
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