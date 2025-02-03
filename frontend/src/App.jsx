import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from "./layouts/layout"
import Counter from './pages/counter/counter';
import Dashboard from './pages/dashboard/dashboard';

function App() {

  return (
    <Layout>
      <Routes>
        <Route path='/' exact element={<Dashboard />} />
        <Route path='/counter' exact element={<Counter />} />
      </Routes>
    </Layout>
  );
}


export default App; 