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
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function Riders({ riders, onChange, onAdd, onRemove, errors = {}, showErrors = false }) {
  const riderOptions = [
    'Please Select',
    'Waiver of Premium',
    'Accidental Death Benefit',
    'Disability Income Rider',
    'Child Term',
    'Critical Illness',
    'Long-Term Care (LTC)',
    'Return of Premium',
    'Guaranteed Insurability',
    'Accelerated Death Benefit',
    'Cost of Living Adjustment'
  ];

  const handleRiderChange = (id, value) => {
    onChange('type', value, id);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Show general errors if any */}
      {showErrors && errors.general && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {errors.general}
        </Alert>
      )}

      {riders.map((rider, index) => {
        const riderErrors = errors[rider.id] || {};

        return (
          <Box
            key={rider.id}
            id={`rider-${rider.id}`}
            sx={{ display: 'flex', gap: 2, alignItems: 'center' }}
          >
            <FormControl
              fullWidth
              error={showErrors && (riderErrors.type || errors.general)}
            >
              <InputLabel>Rider</InputLabel>
              <Select
                value={rider.type}
                onChange={(e) => handleRiderChange(rider.id, e.target.value)}
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
            {riders.length > 1 && (
              <IconButton
                color="error"
                onClick={() => onRemove(rider.id)}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        );
      })}

      <Button
        variant="contained"
        color="primary"
        onClick={onAdd}
        sx={{ alignSelf: 'flex-start', mt: 2 }}
      >
        Add New Rider
      </Button>
    </Box>
  );
}

export default Riders; 