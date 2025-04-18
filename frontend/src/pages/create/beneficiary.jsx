import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nextStep, previousStep } from '../../slices/stepSlice';
import {
  Box,
  Button,
  Typography,
  Container,
  Grid,
} from '@mui/material';
import BeneficiarySection from '../../components/beneficiary/BeneficiarySection';
import { useGetDropdownValuesQuery } from '../../slices/createApiSlice';
import {
  addBeneficiary,
  removeBeneficiary,
  associateBeneficiaryWithCoverage,
  removeBeneficiaryFromCoverage,
  updateBeneficiaryAllocation
} from '../../slices/beneficiarySlice';
import { toast } from 'react-toastify';

function Beneficiary({ applicationNumber, onStepComplete }) {
  const dispatch = useDispatch();
  const { data: dropdownValues = {} } = useGetDropdownValuesQuery();

  // Get coverage data from redux store
  const baseCoverage = useSelector(state => state.coverage.base || {});
  const additionalCoverages = useSelector(state => state.coverage.additional || []);
  const riders = useSelector(state => state.coverage.riders || []);
  const productData = useSelector(state => state.coverage.product || {});
  const coverageOwners = useSelector(state => state.coverageOwners.owners || []);
  const beneficiaries = useSelector(state => state.beneficiary.beneficiaries || []);
  const coverageBeneficiaries = useSelector(state => state.beneficiary.coverageBeneficiaries || {});

  const [validationStatus, setValidationStatus] = useState({
    base: false,
    additional: {},
    riders: {}
  });

  // Format insured name for display
  const formatInsuredName = (insuredId) => {
    if (!insuredId) return 'Unknown';
    
    const insured = coverageOwners.find(owner => owner && owner.id == insuredId);
    if (!insured) return 'Unknown';
    
    return `${insured.firstName || ''} ${insured.lastName || ''}`;
  };

  // Check if a coverage has the Accidental Death Benefit rider
  const hasADBRider = (coverageId) => {
    return riders.some(rider => 
      rider && rider.type && 
      rider.type.toLowerCase().includes('accidental') && 
      rider.selectedPerson === coverageId
    );
  };

  useEffect(() => {
    try {
      // Validate base coverage beneficiaries
      const baseBeneficiaries = coverageBeneficiaries['base']?.primary || [];
      const baseValid = baseBeneficiaries.length > 0;
      
      // Validate additional coverages
      const additionalValid = {};
      if (Array.isArray(additionalCoverages)) {
        additionalCoverages.forEach(coverage => {
          if (coverage && coverage.id) {
            const additionalBeneficiaries = coverageBeneficiaries[coverage.id]?.primary || [];
            additionalValid[coverage.id] = additionalBeneficiaries.length > 0;
          }
        });
      }
      
      // Validate riders
      const ridersValid = {};
      if (Array.isArray(riders)) {
        riders.forEach(rider => {
          if (rider && rider.id && rider.type) {
            if (rider.type.toLowerCase().includes('accidental')) {
              const riderBeneficiaries = coverageBeneficiaries[`rider-${rider.id}`]?.primary || [];
              ridersValid[rider.id] = riderBeneficiaries.length > 0;
            } else {
              ridersValid[rider.id] = true;
            }
          }
        });
      }
      
      setValidationStatus({
        base: baseValid,
        additional: additionalValid,
        riders: ridersValid
      });
      
      // Check if all sections are valid for complete status
      const isAllValid = 
        baseValid &&
        Object.values(additionalValid).every(valid => valid) &&
        Object.values(ridersValid).every(valid => valid);
      
      if (onStepComplete) {
        onStepComplete(isAllValid);
      }
    } catch (error) {
      console.error('Error in validation:', error);
    }
  }, [coverageBeneficiaries, additionalCoverages, riders, onStepComplete]);

  const handleAddBeneficiary = (beneficiary) => {
    dispatch(addBeneficiary(beneficiary));
  };

  const handleUpdateBeneficiary = (coverageId, beneficiaryId, relationship, allocation, type) => {
    dispatch(associateBeneficiaryWithCoverage({
      coverageId,
      beneficiaryId,
      relationship,
      allocation,
      type
    }));
  };

  const handleRemoveBeneficiary = (beneficiaryId, coverageId, type) => {
    dispatch(removeBeneficiaryFromCoverage({
      coverageId,
      beneficiaryId,
      type
    }));
  };

  const handleSaveAndContinue = () => {
    // Validate that at least one beneficiary exists for each coverage
    const baseHasBeneficiary = coverageBeneficiaries['base']?.primary?.length > 0;
    
    const additionalHaveBeneficiaries = Array.isArray(additionalCoverages) && 
      additionalCoverages.every(coverage => 
        coverage && coverage.id && 
        coverageBeneficiaries[coverage.id]?.primary?.length > 0
      );
    
    const ridersHaveBeneficiaries = Array.isArray(riders) && 
      riders.every(rider => 
        !rider || !rider.type || 
        !rider.type.toLowerCase().includes('accidental') || 
        coverageBeneficiaries[`rider-${rider.id}`]?.primary?.length > 0
      );
    
    if (!baseHasBeneficiary) {
      toast.error('Please add at least one beneficiary for the base coverage');
      return;
    }
    
    if (!additionalHaveBeneficiaries) {
      toast.error('Please add at least one beneficiary for each additional coverage');
      return;
    }
    
    if (!ridersHaveBeneficiaries) {
      toast.error('Please add at least one beneficiary for each Accidental Death Benefit rider');
      return;
    }
    
    dispatch(nextStep());
  };

  return (
    <Box sx={{ pb: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Beneficiary Designations
      </Typography>
      
      {/* Base Coverage Section */}
      <BeneficiarySection
        coverageType="Base"
        planName={productData.plan || ''}
        faceAmount={baseCoverage.faceAmount || '0'}
        insured={formatInsuredName(baseCoverage.insured1)}
        insured2={baseCoverage.coverageType === 'joint' ? formatInsuredName(baseCoverage.insured2) : null}
        beneficiaries={beneficiaries}
        onAddBeneficiary={handleAddBeneficiary}
        onUpdateBeneficiary={(beneficiaryId, relationship, allocation, type) => 
          handleUpdateBeneficiary('base', beneficiaryId, relationship, allocation, type)
        }
        onRemoveBeneficiary={(beneficiaryId, type) => 
          handleRemoveBeneficiary(beneficiaryId, 'base', type)
        }
        dropdownValues={dropdownValues}
        applicationNumber={applicationNumber}
      />
      
      {/* Additional Coverage Sections */}
      {Array.isArray(additionalCoverages) && additionalCoverages.map(coverage => {
        if (!coverage || !coverage.id) return null;
        
        return (
          <BeneficiarySection
            key={`additional-${coverage.id}`}
            coverageType="Additional Coverage"
            planName={coverage.coverage || ''}
            faceAmount={coverage.faceAmount || '0'}
            insured={formatInsuredName(coverage.insured1)}
            beneficiaries={beneficiaries}
            onAddBeneficiary={handleAddBeneficiary}
            onUpdateBeneficiary={(beneficiaryId, relationship, allocation, type) => 
              handleUpdateBeneficiary(coverage.id, beneficiaryId, relationship, allocation, type)
            }
            onRemoveBeneficiary={(beneficiaryId, type) => 
              handleRemoveBeneficiary(beneficiaryId, coverage.id, type)
            }
            dropdownValues={dropdownValues}
            applicationNumber={applicationNumber}
          />
        );
      })}
      
      {/* Rider Sections only for Accidental Death Benefit */}
      {Array.isArray(riders) && riders
        .filter(rider => rider && rider.id && rider.type && rider.type.toLowerCase().includes('accidental'))
        .map(rider => (
          <BeneficiarySection
            key={`rider-${rider.id}`}
            coverageType="Rider (Accidental Death Benefit)"
            planName={rider.type || ''}
            faceAmount={rider.faceAmount || '0'}
            insured={formatInsuredName(rider.selectedPerson)}
            beneficiaries={beneficiaries}
            onAddBeneficiary={handleAddBeneficiary}
            onUpdateBeneficiary={(beneficiaryId, relationship, allocation, type) => 
              handleUpdateBeneficiary(`rider-${rider.id}`, beneficiaryId, relationship, allocation, type)
            }
            onRemoveBeneficiary={(beneficiaryId, type) => 
              handleRemoveBeneficiary(beneficiaryId, `rider-${rider.id}`, type)
            }
            dropdownValues={dropdownValues}
            applicationNumber={applicationNumber}
          />
        ))}
      
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
          onClick={handleSaveAndContinue}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}

export default Beneficiary; 