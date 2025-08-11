import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Landing Page
import SimpleLanding from './pages/SimpleLanding';

// Authentication Pages
import Register from './pages/Register';
import Signin from './pages/Signin';
import AdminLoginPg from './pages/AdminLoginPg';

// Patient Pages
import PatientHome from './pages/PatientHome';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import Emergency from './pages/Emergency';
import QuickCheckup from './pages/QuickCheckup';
import HealthMetrics from './pages/HealthMetrics';
import HealthPredict from './pages/HealthPredict';
import Appointments from './pages/Appointments';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import About from './pages/About';

// Doctor Pages
import DoctorDashboard from './pages/DoctorDashboard';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

// Main App Content
const AppContent = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // If not authenticated, show only public routes
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<SimpleLanding />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<AdminLoginPg />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Patient Dashboard with Sidebar and Navbar
  if (user?.role === 'patient') {
    return (
      <div className="flex h-screen bg-white">
        <Sidebar userRole={user.role} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<PatientHome />} />
              <Route path="/chatbot" element={<Chatbot />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/quick-checkup" element={<QuickCheckup />} />
              <Route path="/health-metrics" element={<HealthMetrics />} />
              <Route path="/health-predict" element={<HealthPredict />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    );
  }

  // Doctor Dashboard - Full screen
  if (user?.role === 'doctor') {
    return (
      <Routes>
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="*" element={<Navigate to="/doctor-dashboard" replace />} />
      </Routes>
    );
  }

  // Admin Dashboard - Full screen
  if (user?.role === 'admin') {
    return (
      <Routes>
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
      </Routes>
    );
  }

  // Fallback
  return <Navigate to="/signin" replace />;
};

function App() {
  return (
    <AuthProvider>
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
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;