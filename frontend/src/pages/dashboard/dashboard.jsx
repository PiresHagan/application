import React, { useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  Checkbox,
  Button,
  Divider,
  Grid,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function Dashboard() {
  const [tabValue, setTabValue] = React.useState(0);
  const [ownerType, setOwnerType] = React.useState('individual');
  const [citizenship, setCitizenship] = React.useState('us');
  const [addressCountry, setAddressCountry] = React.useState('us');
  const [sameAsMailingAddress, setSameAsMailingAddress] = React.useState(true);
  const [mailingAddressCountry, setMailingAddressCountry] = React.useState('us');
  const [owners, setOwners] = React.useState([
    { id: 1, isMainOwner: true }
  ]);
  const newOwnerRef = useRef(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const regionsByCountry = {
    us: [
      { value: 'ca', label: 'California' },
      { value: 'ny', label: 'New York' },
      { value: 'tx', label: 'Texas' }
    ],
    ca: [
      { value: 'qc', label: 'Quebec' },
      { value: 'on', label: 'Ontario' },
      { value: 'ab', label: 'Alberta' }
    ]
  };

  const handleAddOwner = () => {
    if (owners.length < 2) {
      const newOwner = { id: owners.length + 1, isMainOwner: false };
      setOwners([...owners, newOwner]);

      // Scroll to new owner section after render
      setTimeout(() => {
        newOwnerRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleRemoveOwner = (ownerId) => {
    setOwners(owners.filter(owner => owner.id !== ownerId));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{
        mb: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>
        <Typography
          variant="subtitle1"
          sx={{
            minWidth: 'fit-content',
            color: 'text.secondary'
          }}
        >
          Application Number: APP859262
        </Typography>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            mr: 2, // Add margin to the right
            height: '20px',
            alignSelf: 'center'
          }}
        />

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              fontSize: '0.875rem',
              minHeight: '48px',
            }
          }}
        >
          <Tab label="OWNER DETAILS" />
          <Tab label="COVERAGE DETAILS" />
          <Tab label="SUMMARY" />
        </Tabs>
      </Box>

      {owners.map((owner, index) => (
        <Box
          key={owner.id}
          ref={index === owners.length - 1 ? newOwnerRef : null}
          sx={{
            mb: 4,
            p: 3,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            position: 'relative'
          }}
        >
          {!owner.isMainOwner && (
            <IconButton
              onClick={() => handleRemoveOwner(owner.id)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: 'error.main',
              }}
            >
              <DeleteIcon />
            </IconButton>
          )}

          <RadioGroup
            row
            value={ownerType}
            onChange={(e) => setOwnerType(e.target.value)}
            sx={{ mb: 3 }}
          >
            <FormControlLabel
              value="individual"
              control={<Radio />}
              label="Individual"
            />
            <FormControlLabel
              value="corporate"
              control={<Radio />}
              label="Corporate"
            />
          </RadioGroup>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="First Name"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Last Name"
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                size="small"
                label="Date of Birth"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Gender</InputLabel>
                <Select input={<OutlinedInput label="Gender" />}>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Tobacco Status</InputLabel>
                <Select input={<OutlinedInput label="Tobacco Status" />}>
                  <MenuItem value="yes">Smoker</MenuItem>
                  <MenuItem value="no">Non-Smoker</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Citizenship</InputLabel>
                <Select
                  value={citizenship}
                  onChange={(e) => setCitizenship(e.target.value)}
                  label="Citizenship"
                >
                  <MenuItem value="us">United States</MenuItem>
                  <MenuItem value="ca">Canada</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>{citizenship === 'us' ? 'State' : 'Province'}</InputLabel>
                <Select
                  label={citizenship === 'us' ? 'State' : 'Province'}
                >
                  {regionsByCountry[citizenship].map((region) => (
                    <MenuItem key={region.value} value={region.value}>
                      {region.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                placeholder="SSN"
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                placeholder="Employer"
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Occupation</InputLabel>
                <Select input={<OutlinedInput label="Occupation" />}>
                  <MenuItem value="it">IT Consultant</MenuItem>
                  <MenuItem value="lawyer">Lawyer</MenuItem>
                  <MenuItem value="accountant">Accountant</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                placeholder="Net Worth"
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Annual Income"
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Primary Phone Number"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Alternate Phone Number"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Email Address"
                type="email"
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Address Line 1"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Address Line 2"
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="City"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Country</InputLabel>
                <Select
                  value={addressCountry}
                  onChange={(e) => setAddressCountry(e.target.value)}
                  label="Country"
                >
                  <MenuItem value="us">United States</MenuItem>
                  <MenuItem value="ca">Canada</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>{addressCountry === 'us' ? 'State' : 'Province'}</InputLabel>
                <Select
                  label={addressCountry === 'us' ? 'State' : 'Province'}
                >
                  {regionsByCountry[addressCountry].map((region) => (
                    <MenuItem key={region.value} value={region.value}>
                      {region.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder={addressCountry === 'us' ? 'Zip Code' : 'Postal Code'}
                size="small"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={sameAsMailingAddress}
                  onChange={(e) => setSameAsMailingAddress(e.target.checked)}
                />
              }
              label="Same as Mailing Address"
            />
          </Box>

          {!sameAsMailingAddress && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
                Mailing Address
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Address Line 1"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Address Line 2"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    placeholder="City"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Country</InputLabel>
                    <Select
                      value={mailingAddressCountry}
                      onChange={(e) => setMailingAddressCountry(e.target.value)}
                      label="Country"
                    >
                      <MenuItem value="us">United States</MenuItem>
                      <MenuItem value="ca">Canada</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{mailingAddressCountry === 'us' ? 'State' : 'Province'}</InputLabel>
                    <Select
                      label={mailingAddressCountry === 'us' ? 'State' : 'Province'}
                    >
                      {regionsByCountry[mailingAddressCountry].map((region) => (
                        <MenuItem key={region.value} value={region.value}>
                          {region.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    placeholder={mailingAddressCountry === 'us' ? 'Zip Code' : 'Postal Code'}
                    size="small"
                  />
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      ))}

      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 2,
        mt: 3,
        '@media (max-width: 600px)': {
          flexDirection: 'column',
        }
      }}>
        <Button
          variant="contained"
          color="inherit"
          onClick={handleAddOwner}
          disabled={owners.length >= 2}
          sx={{
            bgcolor: 'grey.500',
            '&:hover': {
              bgcolor: 'grey.600',
            }
          }}
        >
          ADD OWNER
        </Button>
        <Button variant="contained">
          SAVE AND CONTINUE
        </Button>
      </Box>
    </Container>
  );
}

export default Dashboard;
