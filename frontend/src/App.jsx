import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './layouts/layout';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

import Counter from './pages/counter/counter';
import Create from './pages/create';
import Register from './pages/Auth/Register';
import Login from './pages/Auth/login';
import Search from './pages/search';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <Routes>
          <Route path="/counter" element={<Counter />} />
          <Route path="/application/create" element={<Create />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/application/search" element={<Search />} />
          {/* <Route path="*" element={<Navigate to="/" />} /> */}
        </Routes>
      </Layout>
      <ToastContainer />
    </ThemeProvider>
  );
}

export default App;