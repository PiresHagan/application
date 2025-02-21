import React from 'react';
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

function AdditionalCoverage({ coverages, onChange, onAdd, onRemove, errors = {}, showErrors = false }) {
  const tableRatingOptions = ['100%', '125%', '150%', '175%', '200%', '225%', '250%', '275%',
    '300%', '325%', '350%', '375%', '400%', '425%', '450%', '475%', '500%'];

  const underwritingOptions = ['Standard', 'Standard Plus', 'Preferred', 'Preferred Plus'];

  const coverageOptions = ['Term 10', 'Term 20', 'Term 30', 'Term 100'];

  const handleCoverageChange = (id, field, value) => {
    onChange(field, value, id);
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
              <FormControlLabel value="single" control={<Radio />} label="Single Only" />
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
                <InputLabel>Insured 1</InputLabel>
                <Select
                  value={coverage.insured1}
                  onChange={(e) => handleCoverageChange(coverage.id, 'insured1', e.target.value)}
                  label="Insured 1"
                >
                  <MenuItem value="add_new">Add New</MenuItem>
                  {/* Add mapped owner options here */}
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
                onChange={(e) => handleCoverageChange(coverage.id, 'faceAmount', e.target.value)}
                InputProps={{
                  startAdornment: '$',
                }}
                error={showErrors && coverageErrors.faceAmount}
                helperText={showErrors && coverageErrors.faceAmount}
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
                    onChange={(e) => handleCoverageChange(coverage.id, 'permanentFlatExtra', e.target.checked)}
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
                    onChange={(e) => handleCoverageChange(coverage.id, 'temporaryFlatExtra', e.target.checked)}
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
              {coverages.length > 1 && (
                <IconButton
                  color="error"
                  onClick={() => onRemove(coverage.id)}
                  sx={{ ml: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          </Box>
        );
      })}

      {/* Add New Coverage Button */}
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