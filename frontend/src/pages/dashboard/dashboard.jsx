import React from 'react';
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
  Checkbox,
  Button,
  Divider,
  Grid,
} from '@mui/material';

function Dashboard() {
  const [tabValue, setTabValue] = React.useState(0);
  const [ownerType, setOwnerType] = React.useState('individual');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container sx={{ py: 3 }}>
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

      <Box component="form">
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
              <Select defaultValue="">
                <MenuItem value="">Gender</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <Select defaultValue="">
                <MenuItem value="">Tobacco Status</MenuItem>
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <Select defaultValue="us">
                <MenuItem value="us">United States</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <Select defaultValue="">
                <MenuItem value="">State</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              placeholder="SSN"
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
              <Select defaultValue="us">
                <MenuItem value="us">United States</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <Select defaultValue="">
                <MenuItem value="">State</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Zip Code"
              size="small"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, mb: 3 }}>
          <FormControlLabel
            control={<Checkbox />}
            label="Same as Mailing Address"
          />
        </Box>

        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          '@media (max-width: 600px)': {
            flexDirection: 'column',
          }
        }}>
          <Button
            variant="contained"
            color="inherit"
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
      </Box>
    </Container>
  );
}

export default Dashboard;
