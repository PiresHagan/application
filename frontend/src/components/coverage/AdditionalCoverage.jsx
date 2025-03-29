import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addCoverageOwner, updateCoverageOwner } from '../../slices/coverageOwnersSlice';
import { useSaveInsuredMutation, useUpdateInsuredMutation } from '../../slices/createApiSlice';
import { toast } from 'react-toastify';
import AddOwnerModal from './AddOwnerModal';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  FormHelperText,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function AdditionalCoverage({
  coverages,
  onChange,
  onAdd,
  onRemove,
  errors = {},
  showErrors = false,
  owners = [],
  dropdownValues = {},
  applicationNumber,
  baseCoverageData = {}
}) {
  const dispatch = useDispatch();
  const [saveInsured] = useSaveInsuredMutation();
  const [updateInsured] = useUpdateInsuredMutation();

  const [isAddOwnerModalOpen, setIsAddOwnerModalOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);
  const [activeCoverageId, setActiveCoverageId] = useState(null);

  const tableRatingOptions = ['100%', '125%', '150%', '175%', '200%', '225%', '250%', '275%',
    '300%', '325%', '350%', '375%', '400%', '425%', '450%', '475%', '500%'];

  const underwritingOptions = ['Standard', 'Standard Plus', 'Preferred', 'Preferred Plus'];

  const coverageOptions = ['Term 10', 'Term 20', 'Term 30', 'Term 100'];

  const handleCoverageChange = (id, field, value) => {
    onChange(field, value, id);
  };

  const handleAddOwnerClick = (coverageId) => {
    setActiveCoverageId(coverageId);
    setIsAddOwnerModalOpen(true);
  };

  const handleEditOwner = (owner, event, coverageId) => {
    event.stopPropagation();
    setEditingOwner(owner);
    setActiveCoverageId(coverageId);
    setIsAddOwnerModalOpen(true);
  };

  const handleSaveNewInsured = async (newOwner) => {
    try {
      const insuredData = {
        firstName: newOwner.firstName,
        lastName: newOwner.lastName,
        dateOfBirth: newOwner.dateOfBirth,
        gender: newOwner.gender,
        tobacco: newOwner.tobacco,
        countryCode: newOwner.countryCode,
        stateCode: newOwner.state,
        ssn: newOwner.ssn,
        applicationFormNumber: applicationNumber
      };

      if (editingOwner) {
        await updateInsured({
          clientGUID: editingOwner.clientGUID,
          data: insuredData
        }).unwrap();

        dispatch(updateCoverageOwner({
          id: editingOwner.id,
          data: {
            ...newOwner,
            id: editingOwner.id
          }
        }));
      } else {
        const response = await saveInsured(insuredData).unwrap();
        console.log('Response:', response);

        dispatch(addCoverageOwner({
          ...newOwner,
          clientGUID: response.clientGUID
        }));
      }

      onChange('insured1', newOwner.id, activeCoverageId);

      toast.success(editingOwner ? 'Insured updated successfully!' : 'Insured added successfully!');
    } catch (error) {
      console.log('Error:', error);
      toast.error(`Error ${editingOwner ? 'updating' : 'saving'} insured: ${error.message}`);
    }
  };

  const renderOwnerMenuItem = (owner, coverageId) => (
    <MenuItem key={owner.id} value={owner.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>{formatOwnerOption(owner)}</span>
      <IconButton
        size="small"
        onClick={(e) => handleEditOwner(owner, e, coverageId)}
        sx={{ ml: 1 }}
      >
        <EditIcon fontSize="small" />
      </IconButton>
    </MenuItem>
  );

  const formatOwnerOption = (owner) => {
    if (owner.ownerType === '01') {
      return `${owner.firstName} ${owner.lastName} - ${owner.gender === 'male' ? 'Male' : 'Female'} - ${owner.tobacco ? 'Smoker' : 'Non-Smoker'} - Born: ${owner.dateOfBirth}`;
    }
    return null;
  };

  const isOwnerUsedElsewhere = (ownerId, currentCoverageId) => {
    if (baseCoverageData.insured1 === ownerId || baseCoverageData.insured2 === ownerId) {
      return true;
    }

    return coverages.some(coverage =>
      coverage.id !== currentCoverageId && coverage.insured1 === ownerId
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {coverages.map((coverage, index) => {
        const coverageErrors = errors[coverage.id] || {};

        return (
          <Box
            key={coverage.id}
            id={`coverage-${coverage.id}`}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            {/* Line 1 */}
            <RadioGroup
              row
              value="single"
              disabled
            >
              <FormControlLabel value="single" control={<Radio />} label="Single" />
            </RadioGroup>

            {/* Line 2 */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl
                fullWidth
                error={showErrors && coverageErrors.coverage}
              >
                <InputLabel>Coverage</InputLabel>
                <Select
                  value={coverage.coverage}
                  onChange={(e) => handleCoverageChange(coverage.id, 'coverage', e.target.value)}
                  label="Coverage"
                >
                  {coverageOptions.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
                {showErrors && coverageErrors.coverage && (
                  <FormHelperText>{coverageErrors.coverage}</FormHelperText>
                )}
              </FormControl>
              <FormControl
                fullWidth
                error={showErrors && coverageErrors.insured1}
              >
                <InputLabel>Please Select Insured</InputLabel>
                <Select
                  value={coverage.insured1 || ''}
                  onChange={(e) => {
                    if (e.target.value === 'add_new') {
                      handleAddOwnerClick(coverage.id);
                    } else {
                      onChange('insured1', e.target.value, coverage.id);
                    }
                  }}
                  label="Please Select Insured"
                >
                  {owners
                    .filter(owner =>
                      owner.ownerType === '01' && true
                      // !isOwnerUsedElsewhere(owner.id, coverage.id)
                    )
                    .map(owner => renderOwnerMenuItem(owner, coverage.id))
                  }
                  <MenuItem value="add_new">Add New Insured</MenuItem>
                </Select>
                {showErrors && coverageErrors.insured1 && (
                  <FormHelperText>{coverageErrors.insured1}</FormHelperText>
                )}
              </FormControl>
            </Box>

            {/* Line 3 */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Face Amount"
                type="number"
                value={coverage.faceAmount}
                onChange={(e) => {
                  const newValue = e.target.value;
                  const isValid = newValue && Number(newValue) >= 10000 && Number(newValue) <= 5000000;
                  
                  // Update both the face amount and its validation status
                  const updates = {
                    id: coverage.id,
                    updates: {
                      faceAmount: newValue,
                      faceAmountValid: isValid
                    }
                  };
                  onChange('_multipleFields', updates, coverage.id);
                }}
                InputProps={{
                  startAdornment: '$',
                }}
                error={(showErrors && coverageErrors.faceAmount) || (coverage.faceAmount && (Number(coverage.faceAmount) < 10000 || Number(coverage.faceAmount) > 5000000))}
                helperText={(showErrors && coverageErrors.faceAmount) || "Minimum $10,000 Maximum $5,000,000"}
              />
              <FormControl fullWidth>
                <InputLabel>Table Rating</InputLabel>
                <Select
                  value={coverage.tableRating}
                  onChange={(e) => handleCoverageChange(coverage.id, 'tableRating', e.target.value)}
                  label="Table Rating"
                >
                  {tableRatingOptions.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Line 4 */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={coverage.permanentFlatExtra}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      const updates = {
                        id: coverage.id,
                        updates: {
                          permanentFlatExtra: isChecked,
                          permanentFlatExtraAmount: isChecked ? coverage.permanentFlatExtraAmount : '0'
                        }
                      };
                      onChange('_multipleFields', updates, coverage.id);
                    }}
                  />
                }
                label="Add Permanent Flat Extra"
              />
              <TextField
                label="Permanent Flat Extra / 1000$"
                type="number"
                value={coverage.permanentFlatExtraAmount}
                disabled={!coverage.permanentFlatExtra}
                onChange={(e) => handleCoverageChange(coverage.id, 'permanentFlatExtraAmount', e.target.value)}
                InputProps={{
                  startAdornment: '$',
                }}
              />
            </Box>

            {/* Line 5 */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={coverage.temporaryFlatExtra}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      const updates = {
                        id: coverage.id,
                        updates: {
                          temporaryFlatExtra: isChecked,
                          temporaryFlatExtraAmount: isChecked ? coverage.temporaryFlatExtraAmount : '0',
                          temporaryFlatExtraDuration: isChecked ? '1' : '0'
                        }
                      };
                      onChange('_multipleFields', updates, coverage.id);
                    }}
                  />
                }
                label="Add Temporary Flat Extra"
              />
              <TextField
                label="Temporary Flat Extra / 1000$"
                type="number"
                value={coverage.temporaryFlatExtraAmount}
                disabled={!coverage.temporaryFlatExtra}
                onChange={(e) => handleCoverageChange(coverage.id, 'temporaryFlatExtraAmount', e.target.value)}
                InputProps={{
                  startAdornment: '$',
                }}
              />
              <TextField
                label="Duration"
                type="number"
                value={coverage.temporaryFlatExtraDuration}
                disabled={!coverage.temporaryFlatExtra}
                onChange={(e) => handleCoverageChange(coverage.id, 'temporaryFlatExtraDuration', e.target.value)}
              />
            </Box>

            {/* Line 6 */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl fullWidth>
                <InputLabel>Underwriting Class</InputLabel>
                <Select
                  value={coverage.underwritingClass}
                  onChange={(e) => handleCoverageChange(coverage.id, 'underwritingClass', e.target.value)}
                  label="Underwriting Class"
                >
                  {underwritingOptions.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <IconButton
                color="error"
                onClick={() => onRemove(coverage.id)}
                sx={{ ml: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        );
      })}

      <AddOwnerModal
        open={isAddOwnerModalOpen}
        onClose={() => {
          setIsAddOwnerModalOpen(false);
          setEditingOwner(null);
          setActiveCoverageId(null);
        }}
        onSave={handleSaveNewInsured}
        dropdownValues={dropdownValues}
        owners={owners}
        editingOwner={editingOwner}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={onAdd}
        sx={{ alignSelf: 'flex-start', mt: 2 }}
      >
        Add New Coverage
      </Button>
    </Box>
  );
}

export default AdditionalCoverage; 