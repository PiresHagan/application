import React, { useState } from 'react';
import {
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
} from '@mui/material';
import AddOwnerModal from './AddOwnerModal';
import { useDispatch, useSelector } from 'react-redux';
import { setOwners } from '../../slices/ownerSlice';
import EditIcon from '@mui/icons-material/Edit';
import { useSaveInsuredMutation, useUpdateInsuredMutation } from '../../slices/createApiSlice';
import { toast } from 'react-toastify';
import { updateCoverageOwner, addCoverageOwner } from '../../slices/coverageOwnersSlice';

function BaseCoverage({ data, onChange, errors = {}, showErrors = false, owners = [], dropdownValues = {}, applicationNumber }) {
  const dispatch = useDispatch();
  const mainOwners = useSelector(state => state.owner.owners);

  const [isAddOwnerModalOpen, setIsAddOwnerModalOpen] = useState(false);
  const [addingForField, setAddingForField] = useState(null);
  const [editingOwner, setEditingOwner] = useState(null);

  // Add API mutations
  const [saveInsured] = useSaveInsuredMutation();
  const [updateInsured] = useUpdateInsuredMutation();

  const tableRatingOptions = ['100%', '125%', '150%', '175%', '200%', '225%', '250%', '275%',
    '300%', '325%', '350%', '375%', '400%', '425%', '450%', '475%', '500%'];

  const underwritingOptions = ['Standard', 'Standard Plus', 'Preferred', 'Preferred Plus'];

  const relationshipOptions = [
    { value: '01', label: 'Spouse' },
    { value: '02', label: 'Child' },
    { value: '03', label: 'Parent' },
    { value: '04', label: 'Business Partner' },
    { value: '05', label: 'Employee' },
  ];

  const formatOwnerOption = (owner) => {
    if (owner.ownerType === '01') { // Individual owner
      return `${owner.firstName} ${owner.lastName} - ${owner.gender === 'male' ? 'Male' : 'Female'} - ${owner.tobacco ? 'Smoker' : 'Non-Smoker'} - Born: ${owner.dateOfBirth}`;
    }
    return null;
  };

  const handleAddOwnerClick = (field) => {
    setAddingForField(field);
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
        // Save to backend and get clientGUID
        console.log('Saving insured:', insuredData);
        const response = await saveInsured(insuredData).unwrap();
        console.log('Response:', response);

        // Add to coverage owners store with clientGUID from response
        dispatch(addCoverageOwner({
          ...newOwner,
          clientGUID: response.clientGUID
        }));
      }

      // Update the coverage data
      if (addingForField) {
        onChange({
          ...data,
          [addingForField]: newOwner.id,
          [`sameAsOwner${addingForField === 'insured1' ? '1' : '2'}`]: false,
          [`relationship${addingForField === 'insured1' ? '1' : '2'}`]: ''
        });
      }

      toast.success(editingOwner ? 'Insured updated successfully!' : 'Insured added successfully!');
    } catch (error) {
      console.log('Error:', error);
      toast.error(`Error ${editingOwner ? 'updating' : 'saving'} insured: ${error.message}`);
    }
  };

  const isOwnerSelected = (insuredId) => {
    // First find the coverage owner by ID
    const coverageOwner = owners.find(owner => owner.id === insuredId);
    if (!coverageOwner) return false;

    // Check if this SSN exists in the main owners store
    return mainOwners.some(mainOwner =>
      mainOwner.ssn === coverageOwner.ssn
    );
  };

  const shouldShowRelationshipField = (insuredId) => {
    if (!insuredId) return false;

    // Show field if either:
    // 1. Owner is not in main owners list (new insured)
    // 2. Owner exists but is not marked as "same as owner"
    const coverageOwner = owners.find(owner => owner.id === insuredId);
    if (!coverageOwner) return false;

    const existsInMainOwners = mainOwners.some(mainOwner =>
      mainOwner.ssn === coverageOwner.ssn
    );

    return !existsInMainOwners ||
      (insuredId === data.insured1 ? !data.sameAsOwner1 : !data.sameAsOwner2);
  };

  const handleEditOwner = (owner, event) => {
    event.stopPropagation();
    setEditingOwner(owner);
    setIsAddOwnerModalOpen(true);
  };

  const renderOwnerMenuItem = (owner) => (
    <MenuItem key={owner.id} value={owner.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>{formatOwnerOption(owner)}</span>
      <IconButton
        size="small"
        onClick={(e) => handleEditOwner(owner, e)}
        sx={{ ml: 1 }}
      >
        <EditIcon fontSize="small" />
      </IconButton>
    </MenuItem>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Line 1 */}
      <RadioGroup
        row
        value={data.coverageType}
        onChange={(e) => onChange({ ...data, coverageType: e.target.value })}
      >
        <FormControlLabel value="single" control={<Radio />} label="Single" />
        <FormControlLabel value="joint" control={<Radio />} label="Joint" />
      </RadioGroup>

      {/* Insured 1 Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl
            fullWidth
            error={showErrors && errors.insured1}
          >
            <InputLabel>Please Select Insured</InputLabel>
            <Select
              value={data.insured1}
              onChange={(e) => {
                if (e.target.value === 'add_new') {
                  handleAddOwnerClick('insured1');
                } else {
                  onChange({
                    ...data,
                    insured1: e.target.value,
                    relationship1: ''
                  });
                }
              }}
              label="Please Select Insured"
            >
              {owners
                .filter(owner => owner.ownerType === '01')
                .map(renderOwnerMenuItem)
              }
              <MenuItem value="add_new">Add New Insured</MenuItem>
            </Select>
            {showErrors && errors.insured1 && (
              <FormHelperText>{errors.insured1}</FormHelperText>
            )}
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={isOwnerSelected(data.insured1)}
                disabled={true}
              />
            }
            label="Same as Owner"
          />
        </Box>
        {!isOwnerSelected(data.insured1) && data.insured1 && (
          <FormControl fullWidth>
            <InputLabel>Relationship to Owner</InputLabel>
            <Select
              value={data.relationship1 || ''}
              onChange={(e) => onChange({ ...data, relationship1: e.target.value })}
              label="Relationship to Owner"
            >
              {relationshipOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {/* Insured 2 Section */}
      {data.coverageType === 'joint' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl
              fullWidth
              error={showErrors && errors.insured2}
              disabled={!data.insured1}
            >
              <InputLabel>Please Select Insured</InputLabel>
              <Select
                value={data.insured2}
                onChange={(e) => {
                  if (e.target.value === 'add_new') {
                    handleAddOwnerClick('insured2');
                  } else {
                    onChange({
                      ...data,
                      insured2: e.target.value,
                      relationship2: ''
                    });
                  }
                }}
                label="Please Select Insured"
              >
                {owners
                  .filter(owner => owner.ownerType === '01' && owner.id !== data.insured1)
                  .map(renderOwnerMenuItem)
                }
                <MenuItem value="add_new">Add New Insured</MenuItem>
              </Select>
              {showErrors && errors.insured2 && (
                <FormHelperText>{errors.insured2}</FormHelperText>
              )}
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isOwnerSelected(data.insured2)}
                  disabled={true}
                />
              }
              label="Same as Owner"
            />
          </Box>

          {!isOwnerSelected(data.insured2) && data.insured2 && (
            <FormControl fullWidth>
              <InputLabel>Relationship to Owner</InputLabel>
              <Select
                value={data.relationship2 || ''}
                onChange={(e) => onChange({ ...data, relationship2: e.target.value })}
                label="Relationship to Owner"
              >
                {relationshipOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      )}

      {/* Line 3 */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          label="Face Amount"
          type="number"
          value={data.faceAmount}
          onChange={(e) => onChange({ ...data, faceAmount: e.target.value })}
          InputProps={{
            startAdornment: '$',
          }}
          error={showErrors && errors.faceAmount}
          helperText={showErrors && errors.faceAmount}
        />
        <FormControl fullWidth>
          <InputLabel>Table Rating</InputLabel>
          <Select
            value={data.tableRating}
            onChange={(e) => onChange({ ...data, tableRating: e.target.value })}
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
              checked={data.permanentFlatExtra}
              onChange={(e) => onChange({ ...data, permanentFlatExtra: e.target.checked })}
            />
          }
          label="Add Permanent Flat Extra"
        />
        <TextField
          label="Permanent Flat Extra / 1000$"
          type="number"
          value={data.permanentFlatExtraAmount}
          disabled={!data.permanentFlatExtra}
          onChange={(e) => onChange({ ...data, permanentFlatExtraAmount: e.target.value })}
          InputProps={{
            startAdornment: '$',
          }}
          error={showErrors && errors.permanentFlatExtraAmount}
          helperText={showErrors && errors.permanentFlatExtraAmount}
        />
      </Box>

      {/* Line 5 */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={data.temporaryFlatExtra}
              onChange={(e) => onChange({
                ...data,
                temporaryFlatExtra: e.target.checked,
                temporaryFlatExtraDuration: e.target.checked ? '1' : '0'
              })}
            />
          }
          label="Add Temporary Flat Extra"
        />
        <TextField
          label="Temporary Flat Extra / 1000$"
          type="number"
          value={data.temporaryFlatExtraAmount}
          disabled={!data.temporaryFlatExtra}
          onChange={(e) => onChange({ ...data, temporaryFlatExtraAmount: e.target.value })}
          InputProps={{
            startAdornment: '$',
          }}
          error={showErrors && errors.temporaryFlatExtraAmount}
          helperText={showErrors && errors.temporaryFlatExtraAmount}
        />
        <TextField
          label="Duration"
          type="number"
          value={data.temporaryFlatExtraDuration}
          disabled={!data.temporaryFlatExtra}
          onChange={(e) => onChange({ ...data, temporaryFlatExtraDuration: e.target.value })}
          error={showErrors && errors.temporaryFlatExtraDuration}
          helperText={showErrors && errors.temporaryFlatExtraDuration}
        />
      </Box>

      {/* Line 6 */}
      <FormControl fullWidth>
        <InputLabel>Underwriting Class</InputLabel>
        <Select
          value={data.underwritingClass}
          onChange={(e) => onChange({ ...data, underwritingClass: e.target.value })}
          label="Underwriting Class"
        >
          {underwritingOptions.map(option => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Add the modal */}
      <AddOwnerModal
        open={isAddOwnerModalOpen}
        onClose={() => {
          setIsAddOwnerModalOpen(false);
          setAddingForField(null);
          setEditingOwner(null);
        }}
        onSave={handleSaveNewInsured}
        dropdownValues={dropdownValues}
        owners={owners}
        editingOwner={editingOwner}
      />
    </Box>
  );
}

export default BaseCoverage; 