import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  UserGroupIcon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BellIcon,
  CheckCircleIcon,
  XMarkIcon,
  HeartIcon,
  ArrowTrendingUpIcon,
  ArrowDownIcon,
  SparklesIcon,
  Bars3Icon,
  HomeIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid';
import toast, { Toaster } from 'react-hot-toast';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingConsultations: 0,
    completedToday: 0,
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  const handleSignOut = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('accessToken');
    navigate('/');
  };

  const navigationItems = [
    { id: 'overview', name: 'Dashboard', icon: HomeIcon },
    { id: 'appointments', name: 'Appointments', icon: CalendarDaysIcon },
    { id: 'patients', name: 'Patients', icon: UserGroupIcon },
    { id: 'reports', name: 'Reports', icon: DocumentTextIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'chat', name: 'AI Assistant', icon: ChatBubbleLeftRightIcon },
  ];

  useEffect(() => {
    fetchDoctorData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      const [statsResponse, appointmentsResponse, patientsResponse] = await Promise.all([
        fetch('http://localhost:8000/api/doctor/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/api/doctor/appointments', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/api/doctor/patients', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        setAppointments(appointmentsData);
      }
      if (patientsResponse.ok) {
        const patientsData = await patientsResponse.json();
        setPatients(patientsData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      setLoading(false);
      toast.error('Failed to fetch data');
      
      // Set mock data for demo
      setStats({
        todayAppointments: 12,
        totalPatients: 156,
        pendingConsultations: 8,
        completedToday: 15,
      });
      setAppointments([
        {
          id: 1,
          patientName: 'John Doe',
          time: '10:00 AM',
          type: 'Consultation',
          status: 'confirmed'
        },
        {
          id: 2,
          patientName: 'Jane Smith',
          time: '11:30 AM',
          type: 'Follow-up',
          status: 'pending'
        }
      ]);
      setPatients([
        {
          id: 1,
          name: 'Alice Johnson',
          condition: 'Hypertension',
          lastVisit: '2024-08-20'
        }
      ]);
    }
  };

  const StatCard = ({ title, value, icon: Icon, gradient, trend, description }) => (
    <motion.div 
      className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500 group"
      whileHover={{ scale: 1.02, y: -8 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-15 transition-opacity duration-500`}></div>
      <div className="relative p-8">
        <div className="flex items-center justify-between mb-6">
          <motion.div 
            className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-2xl`}
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <Icon className="w-8 h-8 text-white" />
          </motion.div>
          {trend && (
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl ${
              trend.positive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}>
              {trend.positive ? (
                <ArrowTrendingUpIcon className="w-5 h-5" />
              ) : (
                <ArrowDownIcon className="w-5 h-5" />
              )}
              <span className="font-bold text-sm">+{trend.value}%</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <motion.h3 
            className="text-4xl font-bold text-gray-800"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            {value}
          </motion.h3>
          <h4 className="text-lg font-semibold text-gray-700">{title}</h4>
          <p className="text-sm text-gray-500 font-medium">{description}</p>
        </div>
      </div>

      <div className="absolute top-4 right-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <SparklesIcon className="w-6 h-6 text-gray-400 opacity-30" />
        </motion.div>
      </div>
    </motion.div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <motion.div 
            className="space-y-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <StatCard
                title="Today's Appointments"
                value={stats.todayAppointments}
                icon={CalendarDaysIcon}
                gradient="from-blue-500 to-blue-700"
                trend={{ value: 12, positive: true }}
                description="Scheduled consultations"
              />
              <StatCard
                title="Total Patients"
                value={stats.totalPatients}
                icon={UserGroupIcon}
                gradient="from-emerald-500 to-green-700"
                trend={{ value: 8, positive: true }}
                description="Active patients"
              />
              <StatCard
                title="Pending Reviews"
                value={stats.pendingConsultations}
                icon={ClockIcon}
                gradient="from-amber-500 to-orange-600"
                description="Awaiting consultation"
              />
              <StatCard
                title="Completed Today"
                value={stats.completedToday}
                icon={CheckCircleIcon}
                gradient="from-purple-500 to-indigo-700"
                trend={{ value: 15, positive: true }}
                description="Successfully treated"
              />
            </div>
            
            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Today's Schedule */}
              <motion.div 
                className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <CalendarDaysIcon className="w-8 h-8 mr-4 text-blue-600" />
                    </motion.div>
                    Today's Schedule
                  </h3>
                  <motion.span 
                    className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-xl font-semibold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {currentTime.toLocaleDateString()}
                  </motion.span>
                </div>
                
                <div className="space-y-4">
                  {appointments.length > 0 ? appointments.map((appointment, index) => (
                    <motion.div
                      key={appointment.id}
                      className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <UserGroupIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 text-lg">{appointment.patientName}</h4>
                          <p className="text-gray-600 font-medium">{appointment.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800 text-lg">{appointment.time}</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          appointment.status === 'confirmed' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </motion.div>
                  )) : (
                    <motion.div 
                      className="text-center py-12"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <CalendarDaysIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No appointments scheduled for today</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Recent Patients */}
              <motion.div 
                className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <HeartIconSolid className="w-8 h-8 mr-4 text-red-500" />
                    </motion.div>
                    Recent Patients
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {patients.length > 0 ? patients.map((patient, index) => (
                    <motion.div
                      key={patient.id}
                      className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border border-emerald-100 hover:shadow-lg transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {patient.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 text-lg">{patient.name}</h4>
                          <p className="text-gray-600 font-medium">{patient.condition}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 font-medium">Last visit</p>
                        <p className="font-semibold text-gray-800">{patient.lastVisit}</p>
                      </div>
                    </motion.div>
                  )) : (
                    <motion.div 
                      className="text-center py-12"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No recent patients</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        );

      case 'appointments':
        return (
          <motion.div 
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Appointment Management</h2>
            <p className="text-gray-600 text-lg">Appointment features coming soon...</p>
          </motion.div>
        );

      case 'patients':
        return (
          <motion.div 
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Patient Management</h2>
            <p className="text-gray-600 text-lg">Patient management features coming soon...</p>
          </motion.div>
        );

      case 'reports':
        return (
          <motion.div 
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Medical Reports</h2>
            <p className="text-gray-600 text-lg">Reports dashboard coming soon...</p>
          </motion.div>
        );

      case 'analytics':
        return (
          <motion.div 
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Analytics Dashboard</h2>
            <p className="text-gray-600 text-lg">Analytics features coming soon...</p>
          </motion.div>
        );

      case 'chat':
        return (
          <motion.div 
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-8">AI Assistant</h2>
            <p className="text-gray-600 text-lg">AI chat features coming soon...</p>
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <HeartIconSolid className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Please wait while we prepare your data...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Toaster position="top-right" />
      
      {/* Top Navigation */}
      <motion.nav 
        className="bg-white/90 backdrop-blur-xl shadow-2xl border-b border-white/30 fixed w-full top-0 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Left side */}
            <div className="flex items-center">
              <motion.button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-3 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 lg:hidden transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bars3Icon className="h-7 w-7" />
              </motion.button>
              
              <div className="flex items-center space-x-4 ml-4 lg:ml-0">
                <motion.div 
                  className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-3 rounded-2xl shadow-xl"
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  transition={{ duration: 0.3 }}
                >
                  <HeartIconSolid className="h-10 w-10 text-white" />
                </motion.div>
                <div>
                  <motion.span 
                    className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Medify Doctor
                  </motion.span>
                  <p className="text-sm text-gray-600 font-medium">Professional Healthcare Platform</p>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-6">
              <motion.div 
                className="text-right bg-gradient-to-r from-white/60 to-blue-50/80 px-4 py-3 rounded-xl border border-white/30 backdrop-blur-lg shadow-lg hidden sm:block"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-xs text-gray-500 font-semibold">Welcome back</p>
                <p className="font-bold text-gray-800">
                  Dr. {localStorage.getItem('userName') || 'Doctor'} 👨‍⚕️
                </p>
              </motion.div>
              
              <motion.button 
                className="relative p-3 text-gray-600 hover:text-blue-600 transition-all duration-300 bg-white/70 rounded-xl shadow-lg hover:shadow-xl border border-white/40 backdrop-blur-lg"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <BellIcon className="w-6 h-6" />
                <motion.span 
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <span className="text-xs text-white font-bold">3</span>
                </motion.span>
              </motion.button>
              
              <motion.button
                onClick={handleSignOut}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Out
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Sidebar */}
      <motion.div 
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-white/90 backdrop-blur-2xl shadow-2xl transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-500 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-white/30`}
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="flex flex-col h-full pt-20">
          {/* Close button for mobile */}
          <div className="flex justify-end p-6 lg:hidden">
            <motion.button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-xl text-gray-600 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <XMarkIcon className="h-6 w-6" />
            </motion.button>
          </div>

          {/* Doctor Info Card */}
          <motion.div 
            className="mx-6 mb-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">
                  Dr. {localStorage.getItem('userName') || 'Doctor'}
                </h3>
                <p className="text-gray-600 text-sm font-medium">Medical Professional</p>
                <div className="flex items-center mt-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-xs text-green-600 font-semibold">Online</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 px-6 pb-6 space-y-3 overflow-y-auto">
            {navigationItems.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-6 py-4 text-left rounded-2xl transition-all duration-300 group ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl scale-105'
                    : 'text-gray-700 hover:bg-white/70 hover:shadow-lg hover:scale-102'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className={`p-2 rounded-xl mr-4 ${
                    activeTab === item.id
                      ? 'bg-white/20'
                      : 'bg-gray-100 group-hover:bg-blue-100'
                  }`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <item.icon className="h-6 w-6" />
                </motion.div>
                <span className="font-semibold text-lg">{item.name}</span>
                {activeTab === item.id && (
                  <motion.div
                    className="ml-auto w-2 h-2 bg-white rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  />
                )}
              </motion.button>
            ))}
          </nav>

          {/* Quick Stats */}
          <motion.div 
            className="mx-6 mb-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border border-emerald-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">Today's Summary</h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-white/60 rounded-xl p-3">
                <p className="text-2xl font-bold text-blue-600">{stats.todayAppointments}</p>
                <p className="text-xs text-gray-600 font-medium">Appointments</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3">
                <p className="text-2xl font-bold text-green-600">{stats.completedToday}</p>
                <p className="text-xs text-gray-600 font-medium">Completed</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="lg:pl-80 pt-20">
        <main className="min-h-screen p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
