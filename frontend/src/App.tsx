import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MandiPrices from './pages/MandiPrices';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import HubPortal from './pages/HubPortal';
import Pharmacy from './pages/Pharmacy';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/mandi-prices" replace />} />
        <Route path="/mandi-prices" element={<MandiPrices />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/hub" element={<HubPortal />} />
        <Route path="/pharmacy" element={<Pharmacy />} />
      </Routes>
    </Router>
  );
}

export default App;
