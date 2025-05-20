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
import { useGetDropdownValuesQuery, useSaveBeneficiaryAllocationsMutation } from '../../slices/createApiSlice';
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
  const [saveBeneficiaryAllocations, { isLoading: isSavingAllocations }] = useSaveBeneficiaryAllocationsMutation();

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

  const handleUpdateBeneficiary = (coverageId, beneficiaryId, relationship, allocation, type, relatedInsured) => {
    dispatch(associateBeneficiaryWithCoverage({
      coverageId,
      beneficiaryId,
      relationship,
      allocation,
      type,
      relatedInsured
    }));
  };

  const handleRemoveBeneficiary = (beneficiaryId, coverageId, type) => {
    dispatch(removeBeneficiaryFromCoverage({
      coverageId,
      beneficiaryId,
      type
    }));
  };

  // Get the relationship label based on the code
  const getRelationshipLabel = (relationshipCode) => {
    const relationships = {
      '01': 'Spouse',
      '02': 'Child',
      '03': 'Parent',
      '04': 'Business Partner',
      '05': 'Employee',
      '06': 'Other'
    };
    return relationships[relationshipCode] || relationshipCode;
  };

  const handleSaveAndContinue = async () => {
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

    try {
      const beneficiaryAllocations = [];

      if (coverageBeneficiaries['base']) {
        // Primary beneficiaries
        coverageBeneficiaries['base'].primary?.forEach(beneficiaryAllocation => {
          const beneficiary = beneficiaries.find(b => b.id === beneficiaryAllocation.beneficiaryId);
          if (beneficiary && beneficiary.roleGUID) {
            beneficiaryAllocations.push({
              roleGUID: beneficiary.roleGUID,
              coverageId: 'base',
              type: 'primary',
              relationshipToInsured: getRelationshipLabel(beneficiaryAllocation.relationship),
              relatedInsured: beneficiaryAllocation.relatedInsured || formatInsuredName(baseCoverage.insured1),
              allocation: beneficiaryAllocation.allocation?.toString() || '100'
            });
          }
        });

        // Contingent beneficiaries
        coverageBeneficiaries['base'].contingent?.forEach(beneficiaryAllocation => {
          const beneficiary = beneficiaries.find(b => b.id === beneficiaryAllocation.beneficiaryId);
          if (beneficiary && beneficiary.roleGUID) {
            beneficiaryAllocations.push({
              roleGUID: beneficiary.roleGUID,
              coverageId: 'base',
              type: 'contingent',
              relationshipToInsured: getRelationshipLabel(beneficiaryAllocation.relationship),
              relatedInsured: beneficiaryAllocation.relatedInsured || formatInsuredName(baseCoverage.insured1),
              allocation: beneficiaryAllocation.allocation?.toString() || '100'
            });
          }
        });
      }

      if (Array.isArray(additionalCoverages)) {
        additionalCoverages.forEach(coverage => {
          if (coverage && coverage.id && coverageBeneficiaries[coverage.id]) {
            coverageBeneficiaries[coverage.id].primary?.forEach(beneficiaryAllocation => {
              const beneficiary = beneficiaries.find(b => b.id === beneficiaryAllocation.beneficiaryId);
              if (beneficiary && beneficiary.roleGUID) {
                beneficiaryAllocations.push({
                  roleGUID: beneficiary.roleGUID,
                  coverageId: coverage.id,
                  type: 'primary',
                  relationshipToInsured: getRelationshipLabel(beneficiaryAllocation.relationship),
                  relatedInsured: beneficiaryAllocation.relatedInsured || formatInsuredName(coverage.insured1),
                  allocation: beneficiaryAllocation.allocation?.toString() || '100'
                });
              }
            });

            coverageBeneficiaries[coverage.id].contingent?.forEach(beneficiaryAllocation => {
              const beneficiary = beneficiaries.find(b => b.id === beneficiaryAllocation.beneficiaryId);
              if (beneficiary && beneficiary.roleGUID) {
                beneficiaryAllocations.push({
                  roleGUID: beneficiary.roleGUID,
                  coverageId: coverage.id,
                  type: 'contingent',
                  relationshipToInsured: getRelationshipLabel(beneficiaryAllocation.relationship),
                  relatedInsured: beneficiaryAllocation.relatedInsured || formatInsuredName(coverage.insured1),
                  allocation: beneficiaryAllocation.allocation?.toString() || '100'
                });
              }
            });
          }
        });
      }

      // Process riders
      if (Array.isArray(riders)) {
        riders.filter(rider => rider && rider.type && rider.type.toLowerCase().includes('accidental'))
          .forEach(rider => {
            const riderId = `rider-${rider.id}`;
            if (coverageBeneficiaries[riderId]) {
              coverageBeneficiaries[riderId].primary?.forEach(beneficiaryAllocation => {
                const beneficiary = beneficiaries.find(b => b.id === beneficiaryAllocation.beneficiaryId);
                if (beneficiary && beneficiary.roleGUID) {
                  beneficiaryAllocations.push({
                    roleGUID: beneficiary.roleGUID,
                    coverageId: riderId,
                    type: 'primary',
                    relationshipToInsured: getRelationshipLabel(beneficiaryAllocation.relationship),
                    relatedInsured: beneficiaryAllocation.relatedInsured || formatInsuredName(rider.selectedPerson),
                    allocation: beneficiaryAllocation.allocation?.toString() || '100'
                  });
                }
              });

              coverageBeneficiaries[riderId].contingent?.forEach(beneficiaryAllocation => {
                const beneficiary = beneficiaries.find(b => b.id === beneficiaryAllocation.beneficiaryId);
                if (beneficiary && beneficiary.roleGUID) {
                  beneficiaryAllocations.push({
                    roleGUID: beneficiary.roleGUID,
                    coverageId: riderId,
                    type: 'contingent',
                    relationshipToInsured: getRelationshipLabel(beneficiaryAllocation.relationship),
                    relatedInsured: beneficiaryAllocation.relatedInsured || formatInsuredName(rider.selectedPerson),
                    allocation: beneficiaryAllocation.allocation?.toString() || '100'
                  });
                }
              });
            }
          });
      }

      if (beneficiaryAllocations.length > 0) {
        await saveBeneficiaryAllocations({
          applicationFormNumber: applicationNumber,
          beneficiaryAllocations
        }).unwrap();
        
        toast.success('Beneficiary allocations saved successfully');
      }

      dispatch(nextStep());
    } catch (error) {
      console.error('Error saving beneficiary allocations:', error);
      toast.error(`Error saving beneficiary allocations: ${error.message || 'Unknown error'}`);
    }
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
        coverageId="base"
        coverageBeneficiaries={coverageBeneficiaries}
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
            coverageId={coverage.id}
            coverageBeneficiaries={coverageBeneficiaries}
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
            coverageId={`rider-${rider.id}`}
            coverageBeneficiaries={coverageBeneficiaries}
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
          disabled={isSavingAllocations}
        >
          {isSavingAllocations ? 'Saving...' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
}

export default Beneficiary; 