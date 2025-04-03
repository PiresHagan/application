import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  CircularProgress
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useSearchApplicationsQuery } from '../../slices/createApiSlice';

const SearchPage = () => {
  const [searchBy, setSearchBy] = useState('applicationNumber');
  const [ownerType, setOwnerType] = useState('individual');
  const [applicationNumber, setApplicationNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [searchParams, setSearchParams] = useState(null);
  
  const { 
    data: searchResults = [], 
    isLoading, 
    isError, 
    error 
  } = useSearchApplicationsQuery(searchParams || {}, {
    skip: !searchParams, 
  });

  const handleSearchByChange = (event) => {
    setSearchBy(event.target.value);
    setSearchParams(null);
  };

  const handleOwnerTypeChange = (event) => {
    setOwnerType(event.target.value);
    setSearchParams(null);
  };

  const handleSearch = () => {
    const params = {};
    
    if (searchBy === 'applicationNumber') {
      params.applicationNumber = applicationNumber;
    } else if (searchBy === 'applicationOwner') {
      params.ownerType = ownerType;
      
      if (ownerType === 'individual') {
        params.firstName = firstName;
        params.lastName = lastName;
      } else {
        params.companyName = companyName;
      }
    }
    
    setSearchParams(params);
  };

  const clearSearch = () => {
    setApplicationNumber('');
    setFirstName('');
    setLastName('');
    setCompanyName('');
    setSearchParams(null);
  };

  return (
    <Box sx={{ p: 3, margin: '0 auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Search Applications
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Search By</InputLabel>
              <Select
                value={searchBy}
                onChange={handleSearchByChange}
                label="Search By"
              >
                <MenuItem value="applicationNumber">Application Number</MenuItem>
                <MenuItem value="applicationOwner">Application Owner</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {searchBy === 'applicationNumber' && (
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Enter Application Number"
                value={applicationNumber}
                onChange={(e) => setApplicationNumber(e.target.value)}
              />
            </Grid>
          )}
          
          {searchBy === 'applicationOwner' && (
            <>
              <Grid item xs={12} md={8}>
                <RadioGroup
                  row
                  value={ownerType}
                  onChange={handleOwnerTypeChange}
                >
                  <FormControlLabel value="individual" control={<Radio />} label="Individual" />
                  <FormControlLabel value="corporate" control={<Radio />} label="Corporate" />
                </RadioGroup>
              </Grid>
              
              {ownerType === 'individual' ? (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </Grid>
                </>
              ) : (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </Grid>
              )}
            </>
          )}
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={clearSearch}>
                Clear
              </Button>
              <Button 
                variant="contained" 
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={isLoading}
              >
                Show Results
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {searchParams && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Search Results
          </Typography>
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Typography color="error" sx={{ textAlign: 'center', py: 3 }}>
              Error: {error?.data?.message || 'Failed to fetch results. Please try again.'}
            </Typography>
          ) : searchResults.length === 0 ? (
            <Typography sx={{ textAlign: 'center', py: 3 }}>
              No applications found matching your search criteria
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Application #</TableCell>
                    {searchResults[0]?.ownerType === '01' ? (
                      <>
                        <TableCell>Owner Name</TableCell>
                        <TableCell>Date of Birth</TableCell>
                      </>
                    ) : (
                      <TableCell>Company Name</TableCell>
                    )}
                    <TableCell>Primary Address</TableCell>
                    <TableCell>Last Modified</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {searchResults.map((result, index) => (
                    <TableRow key={index} hover sx={{ cursor: 'pointer' }}>
                      <TableCell>{result.applicationNumber}</TableCell>
                      {result.ownerType === '01' ? (
                        <>
                          <TableCell>{result.ownerName}</TableCell>
                          <TableCell>{result.dateOfBirth}</TableCell>
                        </>
                      ) : (
                        <TableCell>{result.companyName}</TableCell>
                      )}
                      <TableCell>{result.primaryAddress}</TableCell>
                      <TableCell>{result.lastModifiedDate}</TableCell>
                      <TableCell>{result.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default SearchPage;
