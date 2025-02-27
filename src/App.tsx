import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Sales } from './pages/Sales';
import { Publications } from './pages/Publications';
import { Unauthorized } from './pages/Unauthorized';
import { ConnectMercadoLibre } from './pages/ConnectMercadoLibre';
import { MercadoLibreCallback } from './pages/MercadoLibreCallback';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
            </>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/mercadolibre/callback" element={<MercadoLibreCallback />} />

        {/* Protected routes */}
        <Route
          path="/connect-mercadolibre"
          element={
            <PrivateRoute allowedRoles={['client']}>
              <ConnectMercadoLibre />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute requiresMercadoLibre>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <PrivateRoute requiresMercadoLibre>
              <Sales />
            </PrivateRoute>
          }
        />
        <Route
          path="/publications"
          element={
            <PrivateRoute requiresMercadoLibre>
              <Publications />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/analytics"
          element={
            <PrivateRoute allowedRoles={['client']} requiresMercadoLibre>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/clients"
          element={
            <PrivateRoute allowedRoles={['consultant']}>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <PrivateRoute requiresMercadoLibre>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
