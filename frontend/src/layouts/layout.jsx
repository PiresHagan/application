import React from 'react';
import { Box, Container, Paper } from '@mui/material';
import Sidebar from '../components/Sidebar/Sidebar';

function Layout({ children }) {
  return (
    <Box
      sx={{
        paddingLeft: '55px',
        width: '100%',
        minHeight: '100vh',
      }}
    >
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Container
          maxWidth={false}
          sx={{
            py: 4,
            backgroundColor: 'transparent',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '12px',
              backgroundColor: 'white',
            }}
          >
            {children}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}

export default Layout;