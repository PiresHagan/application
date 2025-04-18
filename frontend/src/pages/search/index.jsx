import React, { useState, useRef, useEffect } from 'react';
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
  CircularProgress,
  Pagination,
  Stack,
  Popover,
  Checkbox,
  ListItemText,
  IconButton,
  Tooltip,
  FormGroup,
  Switch
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { useSearchApplicationsQuery, useGetMyApplicationsQuery } from '../../slices/createApiSlice';

const SearchPage = () => {
  const [searchBy, setSearchBy] = useState('applicationNumber');
  const [ownerType, setOwnerType] = useState('individual');
  const [applicationNumber, setApplicationNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [searchParams, setSearchParams] = useState({}); // Initialize with empty object to show results by default
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [currentUserOnly, setCurrentUserOnly] = useState(true); // Default to show only current user's applications
  
  // Status filter state
  const [statusFilter, setStatusFilter] = useState([]);
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const statusFilterRef = useRef(null);
  
  const statusOptions = [
    'In Progress',
    'Submitted',
    'In Review',
    'Approved',
    'Declined'
  ];
  
  const { 
    data: myApplicationsResponse = { content: [], totalPages: 0, totalItems: 0, currentPage: 0 },
    isLoading: isLoadingMyApplications,
    isError: isMyApplicationsError,
    error: myApplicationsError 
  } = useGetMyApplicationsQuery(
    { page, size: pageSize },
    {
      skip: searchParams && Object.keys(searchParams).length > 0
    }
  );
  
  // Use search applications when search params are provided
  const { 
    data: searchResponse = { content: [], totalPages: 0, totalItems: 0, currentPage: 0 }, 
    isLoading: isLoadingSearch, 
    isError: isSearchError, 
    error: searchError 
  } = useSearchApplicationsQuery(
    searchParams ? { ...searchParams, currentUserOnly, page, size: pageSize } : null,
    {
      skip: !searchParams || Object.keys(searchParams).length === 0
    }
  );

  const isLoading = isLoadingMyApplications || isLoadingSearch;
  const isError = (Object.keys(searchParams).length > 0 && isSearchError) || 
                  (Object.keys(searchParams).length === 0 && isMyApplicationsError);
  const error = Object.keys(searchParams).length > 0 ? searchError : myApplicationsError;
  
  const resultsData = Object.keys(searchParams).length > 0 ? searchResponse : myApplicationsResponse;
  let searchResults = resultsData.content || [];
  
  if (statusFilter.length > 0) {
    searchResults = searchResults.filter(result => statusFilter.includes(result.status));
  }

  const handleSearchByChange = (event) => {
    setSearchBy(event.target.value);
    setSearchParams({});
    setPage(0);
  };

  const handleOwnerTypeChange = (event) => {
    setOwnerType(event.target.value);
    setSearchParams({});
    setPage(0);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(parseInt(event.target.value));
    setPage(0);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage - 1); 
  };

  const handleStatusFilterClick = (event) => {
    setStatusAnchorEl(event.currentTarget);
  };

  const handleStatusFilterClose = () => {
    setStatusAnchorEl(null);
  };

  const handleStatusFilterChange = (event, status) => {
    const selectedStatus = event.target.value;
    
    setStatusFilter(prevSelected => {
      if (prevSelected.includes(selectedStatus)) {
        return prevSelected.filter(item => item !== selectedStatus);
      } else {
        return [...prevSelected, selectedStatus];
      }
    });
  };

  const handleClearStatusFilter = () => {
    setStatusFilter([]);
    setStatusAnchorEl(null);
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
    setPage(0);
  };

  const clearSearch = () => {
    setApplicationNumber('');
    setFirstName('');
    setLastName('');
    setCompanyName('');
    setSearchParams({});
    setPage(0);
    setStatusFilter([]);
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
          
          <Grid item xs={12} md={6}>
            <FormGroup>
              <FormControlLabel 
                control={
                  <Switch 
                    checked={currentUserOnly}
                    onChange={(e) => setCurrentUserOnly(e.target.checked)}
                    color="primary"
                  />
                } 
                label="Show only my applications" 
              />
            </FormGroup>
          </Grid>
          
          <Grid item xs={12} md={6}>
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
                Search
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {Object.keys(searchParams).length === 0 
              ? 'My Applications' 
              : 'Search Results'}
          </Typography>
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Results per page</InputLabel>
            <Select
              value={pageSize}
              onChange={handlePageSizeChange}
              label="Results per page"
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Typography color="error" sx={{ textAlign: 'center', py: 3 }}>
            Error: {error?.data?.message || 'Failed to fetch results. Please try again.'}
          </Typography>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Application #</TableCell>
                    {!searchResults.length || searchResults[0]?.ownerType === '01' ? (
                      <>
                        <TableCell>Owner Name</TableCell>
                        <TableCell>Date of Birth</TableCell>
                      </>
                    ) : (
                      <TableCell>Company Name</TableCell>
                    )}
                    <TableCell>Primary Address</TableCell>
                    <TableCell>Last Modified</TableCell>
                    <TableCell>Created By</TableCell>
                    <TableCell>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          cursor: 'pointer'
                        }}
                        onClick={handleStatusFilterClick}
                        ref={statusFilterRef}
                      >
                        Status
                        <Tooltip title="Filter by status">
                          <IconButton size="small" sx={{ ml: 0.5 }}>
                            <FilterIcon 
                              fontSize="small" 
                              color={statusFilter.length > 0 ? "primary" : "action"} 
                            />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      
                      <Popover
                        open={Boolean(statusAnchorEl)}
                        anchorEl={statusAnchorEl}
                        onClose={handleStatusFilterClose}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                      >
                        <Box sx={{ p: 2, width: 200 }}>
                          <Typography variant="subtitle1" sx={{ mb: 1 }}>Filter by Status</Typography>
                          {statusOptions.map((status) => (
                            <MenuItem key={status} dense>
                              <Checkbox 
                                checked={statusFilter.includes(status)}
                                onChange={(e) => handleStatusFilterChange(e, status)}
                                value={status}
                              />
                              <ListItemText primary={status} />
                            </MenuItem>
                          ))}
                          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button 
                              size="small" 
                              onClick={handleClearStatusFilter}
                              disabled={statusFilter.length === 0}
                            >
                              Clear Filters
                            </Button>
                          </Box>
                        </Box>
                      </Popover>
                    </TableCell>
                  </TableRow>
                </TableHead>
                {searchResults.length > 0 ? (
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
                        <TableCell>{result.createdBy || 'N/A'}</TableCell>
                        <TableCell>{result.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                ) : (
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                        No applications found matching your search criteria
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
            
            {resultsData.totalPages > 0 && (
              <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'center' }}>
                <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                  Showing {searchResults.length} of {resultsData.totalItems} results
                  {statusFilter.length > 0 && ` (filtered)`}
                </Typography>
                <Pagination
                  count={resultsData.totalPages}
                  page={resultsData.currentPage + 1}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Stack>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default SearchPage;
