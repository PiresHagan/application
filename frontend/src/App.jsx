import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Counter from './pages/counter/counter';
import Create from './pages/create';
import Register from './pages/Auth/Register';
import Login from './pages/Auth/login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {

  return (
    <>
      <Routes>
        <Route path='/counter' exact element={<Counter />} />
        <Route path='/create' exact element={<Create />} />
        <Route path='/register' exact element={<Register />} />
        <Route path='/login' exact element={<Login />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;