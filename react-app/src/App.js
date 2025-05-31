import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminContent from './components/Admin';
import LoginPage from './components/Login';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<AdminContent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
