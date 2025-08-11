import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Simple Landing Page (no authentication required)
import SimpleLanding from './pages/SimpleLanding';

// Authentication Pages
import Signin from './pages/Signin';
import Register from './pages/Register';

// Patient Routes and Components
import PatientLayout from './components/PatientLayout';
import PatientDashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Chat from './pages/Chat';
import Emergency from './pages/Emergency';
import HealthPredict from './pages/HealthPredict';

// Doctor Routes and Components
import DoctorLayout from './components/DoctorLayout';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorProtectedRoute from './components/DoctorProtectedRoute';

// Admin Routes and Components
import AdminLayout from './components/AdminLayout';
import AdminLoginPg from './pages/AdminLoginPg';
import AdminDashboard from './pages/AdminDashboard';
import AdminProtectedRoute from './components/AdminProtectedRoute';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on app load
    const checkAuth = () => {
      const auth = localStorage.getItem('isAuthenticated');
      const role = localStorage.getItem('userRole');
      const token = localStorage.getItem('accessToken');

      if (auth === 'true' && role && token) {
        setIsAuthenticated(true);
        setUserRole(role);
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
        // Clear any stale data
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userName');
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        
        <Routes>
          {/* Public Routes - No Authentication Required */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                userRole === 'patient' ? <Navigate to="/dashboard" replace /> :
                userRole === 'doctor' ? <Navigate to="/doctor-dashboard" replace /> :
                userRole === 'admin' ? <Navigate to="/admin-dashboard" replace /> :
                <SimpleLanding />
              ) : (
                <SimpleLanding />
              )
            } 
          />
          <Route path="/signin" element={<Signin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-login" element={<AdminLoginPg />} />

          {/* Patient Routes */}
          {isAuthenticated && userRole === 'patient' && (
            <>
              <Route path="/dashboard" element={
                <PatientLayout>
                  <PatientDashboard />
                </PatientLayout>
              } />
              <Route path="/appointments" element={
                <PatientLayout>
                  <Appointments />
                </PatientLayout>
              } />
              <Route path="/chat" element={
                <PatientLayout>
                  <Chat />
                </PatientLayout>
              } />
              <Route path="/emergency" element={
                <PatientLayout>
                  <Emergency />
                </PatientLayout>
              } />
              <Route path="/health-predict" element={
                <PatientLayout>
                  <HealthPredict />
                </PatientLayout>
              } />
            </>
          )}

          {/* Doctor Routes */}
          {isAuthenticated && userRole === 'doctor' && (
            <>
              <Route path="/doctor-dashboard" element={
                <DoctorProtectedRoute>
                  <DoctorLayout>
                    <DoctorDashboard />
                  </DoctorLayout>
                </DoctorProtectedRoute>
              } />
            </>
          )}

          {/* Admin Routes */}
          {isAuthenticated && userRole === 'admin' && (
            <>
              <Route path="/admin-dashboard" element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </AdminProtectedRoute>
              } />
            </>
          )}

          {/* Redirect unauthorized access */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
