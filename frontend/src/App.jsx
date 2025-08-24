import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import VoiceCommand from './components/VoiceCommand';

// Landing Page
import SimpleLanding from './pages/SimpleLanding';

// Authentication Pages
import Register from './pages/Register';
import Signin from './pages/Signin';
import LabReports from './pages/LabReports';
import TestPage from './TestPage';

// Patient Pages
import Home from './pages/Home';
import PatientHome from './pages/PatientHome';
import HealthHistory from './pages/HealthHistory';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import Chat from './pages/Chat';
import Emergency from './pages/Emergency';
import QuickCheckup from './pages/QuickCheckup';
import HealthMetrics from './pages/HealthMetrics';
import HealthPredict from './pages/HealthPredict';
import AppointmentBooking from './pages/AppointmentBooking';
import AppointmentBookingDetails from './pages/AppointmentBookingDetails';
import MedicineReminder from './pages/MedicineReminder';

import Landing from './pages/Landing';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import About from './pages/About';

// Doctor Pages
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorProtectedRoute from './components/DoctorProtectedRoute';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPg from './pages/AdminLoginPg';
import AdminProtectedRoute from './components/AdminProtectedRoute';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('isAuthenticated');
      const role = localStorage.getItem('userRole');
      const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token');
      
      if (auth === 'true' && role && token) {
        setIsAuthenticated(true);
        setUserRole(role);
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    };

    checkAuth();

    // Listen for storage changes
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleAuthSuccess = (token, username, role = 'patient') => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('accessToken', token);
    localStorage.setItem('access_token', token); // Keep both for compatibility
    localStorage.setItem('userName', username);
    localStorage.setItem('username', username); // Keep both for compatibility
    localStorage.setItem('userRole', role);
    setIsAuthenticated(true);
    setUserRole(role);
    
    // Redirect based on user role
    if (role === 'doctor') {
      window.location.href = '/doctor-dashboard';
    } else if (role === 'admin') {
      window.location.href = '/admin-dashboard';
    } else {
      window.location.href = '/dashboard';
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('access_token');
    localStorage.removeItem('userName');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    localStorage.removeItem('verificationStatus');
    setIsAuthenticated(false);
    setUserRole(null);
    setIsMobileMenuOpen(false);
    window.location.href = '/';
  };

  // ProtectedRoute checks for authentication
  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const auth = localStorage.getItem('isAuthenticated');
    const role = localStorage.getItem('userRole');
    const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token');
    
    if (!auth || !token || auth !== 'true') {
      return <Navigate to="/signin" />;
    }
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      return <Navigate to="/signin" />;
    }
    
    return children;
  };

  // Don't show sidebar and navbar for admin, doctor dashboards, and unauthenticated users
  const shouldShowNavigation = isAuthenticated && 
    !['/admin-login', '/admin-dashboard', '/doctor-dashboard', '/signin', '/register'].some(path => 
      window.location.pathname === path
    );

  // If not authenticated, show only landing page
  if (!isAuthenticated && !['/signin', '/register', '/admin-login'].includes(window.location.pathname)) {
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
            <Route path="/" element={<SimpleLanding />} />
            <Route path="/landing" element={<SimpleLanding />} />
            <Route path="/signin" element={<Signin setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} onAuthSuccess={handleAuthSuccess} />} />
            <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} onAuthSuccess={handleAuthSuccess} />} />
            <Route path="/admin-login" element={<AdminLoginPg setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} onAuthSuccess={handleAuthSuccess} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
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
        
        {/* Show sidebar and navbar only for patient panel */}
        {shouldShowNavigation && userRole === 'patient' && (
          <>
            <div className="flex h-screen bg-white">
              <Sidebar
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                userRole={userRole}
              />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar 
                  setIsMobileMenuOpen={setIsMobileMenuOpen}
                  isAuthenticated={isAuthenticated}
                  userRole={userRole}
                  onSignOut={handleSignOut}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white">
                  <Routes>
                    {/* Landing and Auth Routes */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/signin" element={<Signin setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} onAuthSuccess={handleAuthSuccess} />} />
                    <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} onAuthSuccess={handleAuthSuccess} />} />
                    <Route path="/admin-login" element={<AdminLoginPg setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} onAuthSuccess={handleAuthSuccess} />} />

                    {/* Patient Routes */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <PatientHome />
                      </ProtectedRoute>
                    } />
                    <Route path="/home" element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <Home />
                      </ProtectedRoute>
                    } />
                    <Route path="/chatbot" element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <Chatbot />
                      </ProtectedRoute>
                    } />
                    <Route path="/chat" element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <Chat />
                      </ProtectedRoute>
                    } />
                    <Route path="/emergency" element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <Emergency />
                      </ProtectedRoute>
                    } />
                    <Route path="/quick-checkup" element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <QuickCheckup />
                      </ProtectedRoute>
                    } />
                    <Route path="/health-metrics" element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <HealthMetrics />
                      </ProtectedRoute>
                    } />
                    <Route path="/health-predict" element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <HealthPredict />
                      </ProtectedRoute>
                    } />
                    <Route path="/landing" element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <Landing />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/history" element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <HealthHistory />
                      </ProtectedRoute>
                    } />
                    <Route path="/contact" element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <Contact />
                      </ProtectedRoute>
                    } />
                    <Route path="/about" element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <About />
                      </ProtectedRoute>
                    } />
                    <Route path="/lab-reports" element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <LabReports />
                      </ProtectedRoute>
                    } />
                    <Route path="/appointments/book" element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <AppointmentBooking />
                      </ProtectedRoute>
                    } />
                    <Route path="/appointments/book-details" element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <AppointmentBookingDetails />
                      </ProtectedRoute>
                    } />
                    <Route path="/medicine-reminder" element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <MedicineReminder />
                      </ProtectedRoute>
                    } />
                    
                    {/* Redirect other routes */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>
              </div>
              
              {/* Global Voice Command Component */}
              <VoiceCommand />
            </div>
          </>
        )}

        {/* Doctor Dashboard - No sidebar/navbar */}
        {userRole === 'doctor' && (
          <Routes>
            <Route path="/doctor-dashboard" element={
              <DoctorProtectedRoute>
                <DoctorDashboard />
              </DoctorProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/doctor-dashboard" replace />} />
          </Routes>
        )}

        {/* Admin Dashboard - No sidebar/navbar */}
        {userRole === 'admin' && (
          <Routes>
            <Route path="/admin-dashboard" element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
          </Routes>
        )}

        {/* Default routes when navigation is not shown */}
        {!shouldShowNavigation && isAuthenticated && (
          <Routes>
            <Route path="/signin" element={<Signin setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} onAuthSuccess={handleAuthSuccess} />} />
            <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} onAuthSuccess={handleAuthSuccess} />} />
            <Route path="/admin-login" element={<AdminLoginPg setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} onAuthSuccess={handleAuthSuccess} />} />
            <Route path="*" element={<div className="p-6 text-center text-xl text-red-600">404 - Page Not Found</div>} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
