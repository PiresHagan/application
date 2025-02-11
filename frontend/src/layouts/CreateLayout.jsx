import React from 'react';
import { Box, Container } from '@mui/material';
import Sidebar from '../components/Sidebar/Sidebar';

function CreateLayout({ children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
    </Box>
  );
}

export default CreateLayout;