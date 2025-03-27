import React from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  FormHelperText,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function Riders({
  riders,
  onChange,
  onAdd,
  onRemove,
  errors = {},
  showErrors = false,
  owners = [],
  insureds = []
}) {
  const riderOptions = [
    'Please Select',
    'Waiver of Premium',
    'Accidental Death Benefit',
    'Disability Income Rider',
    'Child Term',
    'Return of Premium'
  ];

  const waiverTypes = [
    'Owner Death',
    'Owner Disability',
    'Insured Death',
    'Insured Disability'
  ];

  const returnOfPremiumTypes = [
    'Return Of Premium on Death',
    'Return Of Premium on Cancellation'
  ];

  const ratingOptions = ['1', '1.5', '2', '2.5', '3'];

  const handleRiderChange = (id, field, value) => {
    if (field === 'selectedPerson') {
      onChange(field, value.toString(), id);
    } else if (field === 'type') {
      onChange('type', value, id);
      onChange('waiverType', '', id);
      onChange('selectedPerson', '', id);
      onChange('faceAmount', '', id);
      onChange('rating', '', id);
      onChange('returnOfPremiumType', '', id);
    } else {
      onChange(field, value, id);
    }
  };

  const renderAdditionalFields = (rider) => {
    const riderErrors = errors[rider.id] || {};

    switch (rider.type) {
      case 'Waiver of Premium':
        return (
          <>
            <FormControl
              fullWidth
              error={showErrors && riderErrors.waiverType}
            >
              <InputLabel>Waiver Type</InputLabel>
              <Select
                value={rider.waiverType || ''}
                onChange={(e) => handleRiderChange(rider.id, 'waiverType', e.target.value)}
                label="Waiver Type"
              >
                {waiverTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
              {showErrors && riderErrors.waiverType && (
                <FormHelperText>{riderErrors.waiverType}</FormHelperText>
              )}
            </FormControl>
            {rider.waiverType && (
              <FormControl
                fullWidth
                error={showErrors && riderErrors.selectedPerson}
              >
                <InputLabel>
                  Select {rider.waiverType.includes('Owner') ? 'Owner' : 'Insured'}
                </InputLabel>
                <Select
                  value={rider.selectedPerson || ''}
                  onChange={(e) => handleRiderChange(rider.id, 'selectedPerson', e.target.value)}
                  label={`Select ${rider.waiverType.includes('Owner') ? 'Owner' : 'Insured'}`}
                >
                  {(rider.waiverType.includes('Owner') ? owners : insureds).map(person => (
                    <MenuItem key={person.id} value={person.id}>
                      {`${person.firstName} ${person.lastName} - ${person.gender === 'male' ? 'Male' : 'Female'} - ${person.tobacco ? 'Smoker' : 'Non-Smoker'} - Born: ${person.dateOfBirth}`}
                    </MenuItem>
                  ))}
                </Select>
                {showErrors && riderErrors.selectedPerson && (
                  <FormHelperText>{riderErrors.selectedPerson}</FormHelperText>
                )}
              </FormControl>
            )}
          </>
        );

      case 'Accidental Death Benefit':
      case 'Disability Income Rider':
        return (
          <>
            <FormControl
              fullWidth
              error={showErrors && riderErrors.selectedPerson}
            >
              <InputLabel>Select Insured</InputLabel>
              <Select
                value={rider.selectedPerson || ''}
                onChange={(e) => handleRiderChange(rider.id, 'selectedPerson', e.target.value)}
                label="Select Insured"
              >
                {insureds.map(insured => (
                  <MenuItem key={insured.id} value={insured.id}>
                    {`${insured.firstName} ${insured.lastName} - ${insured.gender === 'male' ? 'Male' : 'Female'} - ${insured.tobacco ? 'Smoker' : 'Non-Smoker'} - Born: ${insured.dateOfBirth}`}
                  </MenuItem>
                ))}
              </Select>
              {showErrors && riderErrors.selectedPerson && (
                <FormHelperText>{riderErrors.selectedPerson}</FormHelperText>
              )}
            </FormControl>
            <TextField
              fullWidth
              label="Face Amount"
              type="number"
              value={rider.faceAmount || ''}
              onChange={(e) => handleRiderChange(rider.id, 'faceAmount', e.target.value)}
              InputProps={{ startAdornment: '$' }}
              error={showErrors && riderErrors.faceAmount}
              helperText={showErrors && riderErrors.faceAmount}
            />
            <FormControl
              fullWidth
              error={showErrors && riderErrors.rating}
            >
              <InputLabel>Rating</InputLabel>
              <Select
                value={rider.rating || ''}
                onChange={(e) => handleRiderChange(rider.id, 'rating', e.target.value)}
                label="Rating"
              >
                {ratingOptions.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
              {showErrors && riderErrors.rating && (
                <FormHelperText>{riderErrors.rating}</FormHelperText>
              )}
            </FormControl>
          </>
        );

      case 'Child Term':
        return (
          <>
            <FormControl
              fullWidth
              error={showErrors && riderErrors.selectedPerson}
            >
              <InputLabel>Select Insured</InputLabel>
              <Select
                value={rider.selectedPerson || ''}
                onChange={(e) => handleRiderChange(rider.id, 'selectedPerson', e.target.value)}
                label="Select Insured"
              >
                {insureds.map(insured => (
                  <MenuItem key={insured.id} value={insured.id}>
                    {`${insured.firstName} ${insured.lastName} - ${insured.gender === 'male' ? 'Male' : 'Female'} - ${insured.tobacco ? 'Smoker' : 'Non-Smoker'} - Born: ${insured.dateOfBirth}`}
                  </MenuItem>
                ))}
              </Select>
              {showErrors && riderErrors.selectedPerson && (
                <FormHelperText>{riderErrors.selectedPerson}</FormHelperText>
              )}
            </FormControl>
            <TextField
              fullWidth
              label="Face Amount"
              type="number"
              value={rider.faceAmount || ''}
              onChange={(e) => handleRiderChange(rider.id, 'faceAmount', e.target.value)}
              InputProps={{ startAdornment: '$' }}
              error={showErrors && riderErrors.faceAmount}
              helperText={showErrors && riderErrors.faceAmount}
            />
          </>
        );

      case 'Return of Premium':
        return (
          <FormControl
            fullWidth
            error={showErrors && riderErrors.returnOfPremiumType}
          >
            <InputLabel>Return of Premium Type</InputLabel>
            <Select
              value={rider.returnOfPremiumType || ''}
              onChange={(e) => handleRiderChange(rider.id, 'returnOfPremiumType', e.target.value)}
              label="Return of Premium Type"
            >
              {returnOfPremiumTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
            {showErrors && riderErrors.returnOfPremiumType && (
              <FormHelperText>{riderErrors.returnOfPremiumType}</FormHelperText>
            )}
          </FormControl>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {showErrors && errors.general && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {errors.general}
        </Alert>
      )}

      {riders.map((rider) => {
        const riderErrors = errors[rider.id] || {};

        return (
          <Box
            key={rider.id}
            id={`rider-${rider.id}`}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <FormControl
                fullWidth
                error={showErrors && riderErrors.type}
              >
                <InputLabel>Rider</InputLabel>
                <Select
                  value={rider.type || 'Please Select'}
                  onChange={(e) => onChange('type', e.target.value, rider.id)}
                  label="Rider"
                >
                  {riderOptions.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
                {showErrors && riderErrors.type && (
                  <FormHelperText>{riderErrors.type}</FormHelperText>
                )}
              </FormControl>
              <IconButton
                color="error"
                onClick={() => onRemove(rider.id)}
                sx={{ mt: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            {renderAdditionalFields(rider)}
          </Box>
        );
      })}

      <Button
        variant="contained"
        color="primary"
        onClick={onAdd}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add Rider
      </Button>
    </Box>
  );
}

export default Riders; 