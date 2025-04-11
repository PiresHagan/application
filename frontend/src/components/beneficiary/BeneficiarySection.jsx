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
  beneficiaries = [],
  onAddBeneficiary,
  onUpdateBeneficiary,
  onRemoveBeneficiary,
  errors = {},
  showErrors = false,
  dropdownValues = {}
}) {
  const [primaryBeneficiaries, setPrimaryBeneficiaries] = useState([
    { id: 1, beneficiaryId: '', relationship: '', allocation: 100, type: 'primary' }
  ]);
  
  const [contingentBeneficiaries, setContingentBeneficiaries] = useState([]);
  const [storedBeneficiaries, setStoredBeneficiaries] = useState([]);
  
  const [showAddBeneficiaryModal, setShowAddBeneficiaryModal] = useState(false);
  const [currentBeneficiaryRowId, setCurrentBeneficiaryRowId] = useState(null);
  const [currentBeneficiaryType, setCurrentBeneficiaryType] = useState(null);
  const [editingBeneficiary, setEditingBeneficiary] = useState(null);

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
        { id: newId, beneficiaryId: '', relationship: '', allocation: parseFloat(newAllocation.toFixed(2)), type: 'primary' }
      ]);
    } catch (error) {
      console.error('Error adding primary beneficiary:', error);
    }
  };

  const handleRemovePrimaryBeneficiary = (id) => {
    try {
      // Don't allow removing if only one primary beneficiary
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
          { id: 1, beneficiaryId: '', relationship: '', allocation: 100, type: 'contingent' }
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
          { id: newId, beneficiaryId: '', relationship: '', allocation: parseFloat(newAllocation.toFixed(2)), type: 'contingent' }
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
      } else {
        const updatedBeneficiaries = contingentBeneficiaries.map(row => 
          row && row.id === id ? { ...row, allocation: numValue } : row
        );
        setContingentBeneficiaries(updatedBeneficiaries);
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
      } else {
        const updatedBeneficiaries = contingentBeneficiaries.map(row => 
          row && row.id === id ? { ...row, relationship: value } : row
        );
        setContingentBeneficiaries(updatedBeneficiaries);
      }
    } catch (error) {
      console.error('Error changing relationship:', error);
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
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Insured"
            value={insured || ''}
            disabled
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderBeneficiaryRow = (row, type) => {
    if (!row) return null;
    
    const selectedBeneficiary = storedBeneficiaries.find(b => b && row && b.id === row.beneficiaryId);
    
    return (
      <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }} key={`${type}-${row.id}`}>
        <Grid item xs={12} md={5}>
          <FormControl fullWidth>
            <InputLabel>{type === 'primary' ? 'Add Beneficiary' : 'Add Contingent Beneficiary'}</InputLabel>
            <Select
              value={row.beneficiaryId || ''}
              onChange={() => {}}
              label={type === 'primary' ? 'Add Beneficiary' : 'Add Contingent Beneficiary'}
              renderValue={() => formatBeneficiaryInfo(selectedBeneficiary)}
              displayEmpty
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
        <Grid item xs={12} md={3}>
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
      />
    </Paper>
  );
}

export default BeneficiarySection; 