import React from 'react';
import { Box, Container } from '@mui/material';
import Header from './header/header';
import Footer from './footer/footer';
import './layout.css';

function Layout({ children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Container>
          {children}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}

export default Layout;