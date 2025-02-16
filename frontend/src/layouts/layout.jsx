import React from 'react';
import { Box, Container } from '@mui/material';
import Sidebar from '../components/Sidebar/Sidebar';

function Layout({ children }) {
  return (
    <Box
      sx={{
        paddingLeft: '45px',
        width: '100%',
        minHeight: '100vh',
      }}
    >
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
    </Box>
  );
}

export default Layout;