import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  IconButton,
  FormHelperText,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AddBeneficiaryModal from './AddBeneficiaryModal';

function BeneficiarySection({
  coverageType,
  planName,
  faceAmount,
  insured,
  insured2,
  beneficiaries = [],
  onAddBeneficiary,
  onUpdateBeneficiary,
  onRemoveBeneficiary,
  errors = {},
  showErrors = false,
  dropdownValues = {},
  applicationNumber,
  coverageId,
  coverageBeneficiaries = {},
}) {
  const [primaryBeneficiaries, setPrimaryBeneficiaries] = useState([
    { id: 1, beneficiaryId: '', relationship: '', allocation: 100, relatedInsured: insured, type: 'primary' }
  ]);

  const [contingentBeneficiaries, setContingentBeneficiaries] = useState([]);
  const [storedBeneficiaries, setStoredBeneficiaries] = useState([]);

  const [showAddBeneficiaryModal, setShowAddBeneficiaryModal] = useState(false);
  const [currentBeneficiaryRowId, setCurrentBeneficiaryRowId] = useState(null);
  const [currentBeneficiaryType, setCurrentBeneficiaryType] = useState(null);
  const [editingBeneficiary, setEditingBeneficiary] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setStoredBeneficiaries(beneficiaries);

    if (coverageId && !initialized && Array.isArray(beneficiaries) && coverageBeneficiaries) {
      const beneficiaryData = coverageBeneficiaries[coverageId];

      if (beneficiaryData) {
        if (beneficiaryData.primary && beneficiaryData.primary.length > 0) {
          const primaryRows = beneficiaryData.primary.map((item, index) => ({
            id: index + 1,
            beneficiaryId: item.beneficiaryId,
            relationship: item.relationship || '',
            allocation: item.allocation || 100 / beneficiaryData.primary.length,
            relatedInsured: item.relatedInsured || insured,
            type: 'primary'
          }));
          setPrimaryBeneficiaries(primaryRows);
        }

        if (beneficiaryData.contingent && beneficiaryData.contingent.length > 0) {
          const contingentRows = beneficiaryData.contingent.map((item, index) => ({
            id: index + 1,
            beneficiaryId: item.beneficiaryId,
            relationship: item.relationship || '',
            allocation: item.allocation || 100 / beneficiaryData.contingent.length,
            relatedInsured: item.relatedInsured || insured,
            type: 'contingent'
          }));
          setContingentBeneficiaries(contingentRows);
        }

        setInitialized(true);
      }
    }
  }, [beneficiaries, coverageId, insured, coverageBeneficiaries, initialized]);

  // Create array of insured options
  const insuredOptions = [];
  if (insured) {
    insuredOptions.push({ value: insured, label: insured });
  }
  if (insured2) {
    insuredOptions.push({ value: insured2, label: insured2 });
  }

  const relationshipOptions = [
    { value: '01', label: 'Spouse' },
    { value: '02', label: 'Child' },
    { value: '03', label: 'Parent' },
    { value: '04', label: 'Business Partner' },
    { value: '05', label: 'Employee' },
    { value: '06', label: 'Other' },
  ];

  const formatBeneficiaryInfo = (beneficiary) => {
    if (!beneficiary) return '';
    return `${beneficiary.firstName || ''} ${beneficiary.lastName || ''}`;
  };

  const handleAddBeneficiaryClick = (rowId, beneficiaryType) => {
    setCurrentBeneficiaryRowId(rowId);
    setCurrentBeneficiaryType(beneficiaryType);
    setEditingBeneficiary(null);
    setShowAddBeneficiaryModal(true);
  };

  const handleEditBeneficiary = (beneficiary, rowId, beneficiaryType) => {
    if (!beneficiary) return;
    setCurrentBeneficiaryRowId(rowId);
    setCurrentBeneficiaryType(beneficiaryType);
    setEditingBeneficiary(beneficiary);
    setShowAddBeneficiaryModal(true);
  };

  const handleSaveBeneficiary = (beneficiary) => {
    if (!beneficiary) return;

    try {
      // Add to stored beneficiaries
      const updatedBeneficiaries = [...storedBeneficiaries];
      const existingIndex = updatedBeneficiaries.findIndex(b => b && beneficiary && b.id === beneficiary.id);

      if (existingIndex >= 0) {
        updatedBeneficiaries[existingIndex] = beneficiary;
      } else {
        updatedBeneficiaries.push(beneficiary);
      }

      setStoredBeneficiaries(updatedBeneficiaries);

      // Update the beneficiary in the appropriate row
      if (currentBeneficiaryType === 'primary') {
        setPrimaryBeneficiaries(prev =>
          prev.map(row =>
            row && row.id === currentBeneficiaryRowId
              ? { ...row, beneficiaryId: beneficiary.id }
              : row
          )
        );
      } else {
        setContingentBeneficiaries(prev =>
          prev.map(row =>
            row && row.id === currentBeneficiaryRowId
              ? { ...row, beneficiaryId: beneficiary.id }
              : row
          )
        );
      }

      // Call parent handler
      if (onAddBeneficiary) {
        onAddBeneficiary(beneficiary);
      }

      if (onUpdateBeneficiary) {
        const rowData = currentBeneficiaryType === 'primary'
          ? primaryBeneficiaries.find(b => b.id === currentBeneficiaryRowId)
          : contingentBeneficiaries.find(b => b.id === currentBeneficiaryRowId);

        if (rowData) {
          onUpdateBeneficiary(
            beneficiary.id,
            rowData.relationship,
            rowData.allocation,
            currentBeneficiaryType
          );
        }
      }
    } catch (error) {
      console.error('Error saving beneficiary:', error);
    }
  };

  const handleAddPrimaryBeneficiary = () => {
    try {
      const newId = primaryBeneficiaries.length > 0
        ? Math.max(...primaryBeneficiaries.filter(b => b).map(b => b.id)) + 1
        : 1;

      // When adding a new row, recalculate allocations
      const newAllocation = 100 / (primaryBeneficiaries.length + 1);
      const updatedBeneficiaries = primaryBeneficiaries.map(row => ({
        ...row,
        allocation: parseFloat(newAllocation.toFixed(2))
      }));

      setPrimaryBeneficiaries([
        ...updatedBeneficiaries,
        { id: newId, beneficiaryId: '', relationship: '', allocation: parseFloat(newAllocation.toFixed(2)), relatedInsured: insured, type: 'primary' }
      ]);
    } catch (error) {
      console.error('Error adding primary beneficiary:', error);
    }
  };

  const handleRemovePrimaryBeneficiary = (id) => {
    try {
      if (primaryBeneficiaries.length <= 1) {
        return;
      }

      const updatedBeneficiaries = primaryBeneficiaries.filter(row => row && row.id !== id);

      // Recalculate allocations
      const newAllocation = 100 / updatedBeneficiaries.length;
      const distributedBeneficiaries = updatedBeneficiaries.map(row => ({
        ...row,
        allocation: parseFloat(newAllocation.toFixed(2))
      }));

      setPrimaryBeneficiaries(distributedBeneficiaries);

      if (onRemoveBeneficiary) {
        const removedRow = primaryBeneficiaries.find(row => row && row.id === id);
        if (removedRow && removedRow.beneficiaryId) {
          onRemoveBeneficiary(removedRow.beneficiaryId, 'primary');
        }
      }
    } catch (error) {
      console.error('Error removing primary beneficiary:', error);
    }
  };

  const handleAddContingentBeneficiary = () => {
    try {
      if (contingentBeneficiaries.length === 0) {
        // Adding first contingent beneficiary
        setContingentBeneficiaries([
          { id: 1, beneficiaryId: '', relationship: '', allocation: 100, relatedInsured: insured, type: 'contingent' }
        ]);
      } else {
        const newId = Math.max(...contingentBeneficiaries.filter(b => b).map(b => b.id)) + 1;

        // Recalculate allocations
        const newAllocation = 100 / (contingentBeneficiaries.length + 1);
        const updatedBeneficiaries = contingentBeneficiaries.map(row => ({
          ...row,
          allocation: parseFloat(newAllocation.toFixed(2))
        }));

        setContingentBeneficiaries([
          ...updatedBeneficiaries,
          { id: newId, beneficiaryId: '', relationship: '', allocation: parseFloat(newAllocation.toFixed(2)), relatedInsured: insured, type: 'contingent' }
        ]);
      }
    } catch (error) {
      console.error('Error adding contingent beneficiary:', error);
    }
  };

  const handleRemoveContingentBeneficiary = (id) => {
    try {
      const updatedBeneficiaries = contingentBeneficiaries.filter(row => row && row.id !== id);

      if (updatedBeneficiaries.length === 0) {
        setContingentBeneficiaries([]);
      } else {
        // Recalculate allocations
        const newAllocation = 100 / updatedBeneficiaries.length;
        const distributedBeneficiaries = updatedBeneficiaries.map(row => ({
          ...row,
          allocation: parseFloat(newAllocation.toFixed(2))
        }));

        setContingentBeneficiaries(distributedBeneficiaries);
      }

      if (onRemoveBeneficiary) {
        const removedRow = contingentBeneficiaries.find(row => row && row.id === id);
        if (removedRow && removedRow.beneficiaryId) {
          onRemoveBeneficiary(removedRow.beneficiaryId, 'contingent');
        }
      }
    } catch (error) {
      console.error('Error removing contingent beneficiary:', error);
    }
  };

  const handleAllocationChange = (id, value, type) => {
    try {
      const numValue = parseFloat(value) || 0;

      if (type === 'primary') {
        const updatedBeneficiaries = primaryBeneficiaries.map(row =>
          row && row.id === id ? { ...row, allocation: numValue } : row
        );
        setPrimaryBeneficiaries(updatedBeneficiaries);

        // Get the updated row data to send to parent
        const updatedRow = updatedBeneficiaries.find(row => row && row.id === id);
        if (updatedRow && updatedRow.beneficiaryId && onUpdateBeneficiary) {
          // Update the Redux store
          onUpdateBeneficiary(
            updatedRow.beneficiaryId,
            updatedRow.relationship,
            numValue, // Updated allocation value
            type,
            updatedRow.relatedInsured
          );
        }
      } else {
        const updatedBeneficiaries = contingentBeneficiaries.map(row =>
          row && row.id === id ? { ...row, allocation: numValue } : row
        );
        setContingentBeneficiaries(updatedBeneficiaries);

        // Get the updated row data to send to parent
        const updatedRow = updatedBeneficiaries.find(row => row && row.id === id);
        if (updatedRow && updatedRow.beneficiaryId && onUpdateBeneficiary) {
          // Update the Redux store
          onUpdateBeneficiary(
            updatedRow.beneficiaryId,
            updatedRow.relationship,
            numValue, // Updated allocation value
            type,
            updatedRow.relatedInsured
          );
        }
      }
    } catch (error) {
      console.error('Error changing allocation:', error);
    }
  };

  const handleRelationshipChange = (id, value, type) => {
    try {
      if (type === 'primary') {
        const updatedBeneficiaries = primaryBeneficiaries.map(row =>
          row && row.id === id ? { ...row, relationship: value } : row
        );
        setPrimaryBeneficiaries(updatedBeneficiaries);

        // Get the updated row data to send to parent
        const updatedRow = updatedBeneficiaries.find(row => row && row.id === id);
        if (updatedRow && updatedRow.beneficiaryId && onUpdateBeneficiary) {
          // Update the Redux store with the new relationship
          onUpdateBeneficiary(
            updatedRow.beneficiaryId,
            value, // Updated relationship value
            updatedRow.allocation,
            type
          );
        }
      } else {
        const updatedBeneficiaries = contingentBeneficiaries.map(row =>
          row && row.id === id ? { ...row, relationship: value } : row
        );
        setContingentBeneficiaries(updatedBeneficiaries);

        const updatedRow = updatedBeneficiaries.find(row => row && row.id === id);
        if (updatedRow && updatedRow.beneficiaryId && onUpdateBeneficiary) {
          onUpdateBeneficiary(
            updatedRow.beneficiaryId,
            updatedRow.allocation,
            type
          );
        }
      }
    } catch (error) {
      console.error('Error changing relationship:', error);
    }
  };

  const handleRelatedInsuredChange = (id, value, type) => {
    try {
      if (type === 'primary') {
        const updatedBeneficiaries = primaryBeneficiaries.map(row =>
          row && row.id === id ? { ...row, relatedInsured: value } : row
        );
        setPrimaryBeneficiaries(updatedBeneficiaries);

        const updatedRow = updatedBeneficiaries.find(row => row && row.id === id);
        if (updatedRow && updatedRow.beneficiaryId && onUpdateBeneficiary) {
          onUpdateBeneficiary(
            updatedRow.beneficiaryId,
            updatedRow.relationship,
            updatedRow.allocation,
            type,
            value
          );
        }
      } else {
        const updatedBeneficiaries = contingentBeneficiaries.map(row =>
          row && row.id === id ? { ...row, relatedInsured: value } : row
        );
        setContingentBeneficiaries(updatedBeneficiaries);

        // Get the updated row data to send to parent
        const updatedRow = updatedBeneficiaries.find(row => row && row.id === id);
        if (updatedRow && updatedRow.beneficiaryId && onUpdateBeneficiary) {
          // Update the Redux store
          onUpdateBeneficiary(
            updatedRow.beneficiaryId,
            updatedRow.relationship,
            updatedRow.allocation,
            type,
            value
          );
        }
      }
    } catch (error) {
      console.error('Error changing related insured:', error);
    }
  };

  const renderCoverageInfo = () => (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Plan"
            value={planName || ''}
            disabled
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Face Amount"
            value={`$${parseFloat(faceAmount || 0).toLocaleString()}`}
            disabled
          />
        </Grid>
        {insured2 ? (
          <>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Insured 1"
                value={insured || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Insured 2"
                value={insured2 || ''}
                disabled
              />
            </Grid>
          </>
        ) : (
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Insured"
              value={insured || ''}
              disabled
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );

  const renderBeneficiaryRow = (row, type) => {
    if (!row) return null;

    const selectedBeneficiary = storedBeneficiaries.find(b => b && row && b.id === row.beneficiaryId);

    return (
      <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }} key={`${type}-${row.id}`}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>{type === 'primary' ? 'Add Beneficiary' : 'Add Contingent Beneficiary'}</InputLabel>
            <Select
              value={row.beneficiaryId || ''}
              onChange={() => { }}
              label={type === 'primary' ? 'Add Beneficiary' : 'Add Contingent Beneficiary'}
              renderValue={() => formatBeneficiaryInfo(selectedBeneficiary)}
            >
              <MenuItem value="" disabled>Select</MenuItem>
              <MenuItem
                value="add_new"
                onClick={() => handleAddBeneficiaryClick(row.id, type)}
              >
                Add Beneficiary
              </MenuItem>
              {selectedBeneficiary && (
                <MenuItem
                  value="edit_existing"
                  onClick={() => handleEditBeneficiary(selectedBeneficiary, row.id, type)}
                >
                  Edit {formatBeneficiaryInfo(selectedBeneficiary)}
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Related Insured</InputLabel>
            <Select
              value={row.relatedInsured || insured}
              onChange={(e) => handleRelatedInsuredChange(row.id, e.target.value, type)}
              label="Related Insured"
            >
              {insuredOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Relationship to Insured</InputLabel>
            <Select
              value={row.relationship || ''}
              onChange={(e) => handleRelationshipChange(row.id, e.target.value, type)}
              label="Relationship to Insured"
            >
              {relationshipOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Allocation %"
            type="number"
            value={row.allocation || 0}
            onChange={(e) => handleAllocationChange(row.id, e.target.value, type)}
            InputProps={{
              endAdornment: '%',
            }}
          />
        </Grid>
        <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton
            color="primary"
            onClick={type === 'primary' ? handleAddPrimaryBeneficiary : () => handleAddContingentBeneficiary()}
          >
            <AddIcon />
          </IconButton>
          {(type === 'contingent' || primaryBeneficiaries.length > 1) && (
            <IconButton
              color="error"
              onClick={() => type === 'primary'
                ? handleRemovePrimaryBeneficiary(row.id)
                : handleRemoveContingentBeneficiary(row.id)
              }
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Grid>
      </Grid>
    );
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {coverageType || 'Coverage'} Beneficiaries
      </Typography>

      {renderCoverageInfo()}

      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
        Beneficiaries
      </Typography>

      <Box sx={{ mb: 3 }}>
        {primaryBeneficiaries.filter(row => row).map(row => renderBeneficiaryRow(row, 'primary'))}
      </Box>

      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
        Contingent Beneficiaries
      </Typography>

      {contingentBeneficiaries.length === 0 ? (
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddContingentBeneficiary}
          sx={{ mb: 2 }}
        >
          Add Contingent Beneficiary
        </Button>
      ) : (
        <Box sx={{ mb: 3 }}>
          {contingentBeneficiaries.filter(row => row).map(row => renderBeneficiaryRow(row, 'contingent'))}
        </Box>
      )}

      <AddBeneficiaryModal
        open={showAddBeneficiaryModal}
        onClose={() => {
          setShowAddBeneficiaryModal(false);
          setCurrentBeneficiaryRowId(null);
          setCurrentBeneficiaryType(null);
          setEditingBeneficiary(null);
        }}
        onSave={handleSaveBeneficiary}
        dropdownValues={dropdownValues}
        beneficiaries={storedBeneficiaries}
        editingBeneficiary={editingBeneficiary}
        applicationNumber={applicationNumber}
      />
    </Paper>
  );
}

export default BeneficiarySection; 