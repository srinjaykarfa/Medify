import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BellIcon,
  PlusIcon,
  CheckCircleIcon,
  XMarkIcon,
  HeartIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CurrencyRupeeIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';
import toast, { Toaster } from 'react-hot-toast';
import DoctorAppointments from '../components/DoctorAppointments';

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    todayAppointments: 12,
    totalPatients: 156,
    pendingConsultations: 8,
    completedToday: 15,
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchDoctorData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      // Mock data for demo
      setTimeout(() => {
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
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      setLoading(false);
      toast.error('Failed to fetch data');
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

      {/* Animated sparkles */}
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

  const TabButton = ({ id, label, icon: Icon, count }) => (
    <motion.button
      onClick={() => setActiveTab(id)}
      className={`relative flex items-center gap-4 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
        activeTab === id
          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-2xl scale-105'
          : 'text-gray-600 hover:bg-white/70 bg-white/50 hover:shadow-xl'
      }`}
      whileHover={{ scale: activeTab === id ? 1.05 : 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon className="w-6 h-6" />
      <span className="text-lg">{label}</span>
      {count && (
        <motion.span 
          className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${
            activeTab === id ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
          }`}
          whileHover={{ scale: 1.1 }}
        >
          {count}
        </motion.span>
      )}
      
      {activeTab === id && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl"
          layoutId="activeTab"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
    </motion.button>
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
            {/* Enhanced Stats Grid */}
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
            
            {/* Enhanced Content Grid */}
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
                  <motion.button 
                    className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>View All</span>
                    <ArrowUpIcon className="w-4 h-4 rotate-45" />
                  </motion.button>
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
        return <DoctorAppointments />;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl"
          animate={{ 
            rotate: [360, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <Toaster position="top-right" />
      
      {/* Enhanced Header */}
      <motion.div 
        className="relative bg-white/70 backdrop-blur-2xl shadow-2xl border-b border-white/30 sticky top-0 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-6">
              <motion.div 
                className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-4 rounded-2xl shadow-2xl"
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <HeartIconSolid className="w-8 h-8 text-white" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl"
                  animate={{ 
                    opacity: [0.3, 0.7, 0.3],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <div>
                <motion.h1 
                  className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-600 to-indigo-800"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  Doctor Dashboard
                </motion.h1>
                <motion.p 
                  className="text-gray-600 font-semibold text-lg flex items-center"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  Welcome back, Dr. {localStorage.getItem('username') || 'Doctor'} 
                  <motion.span 
                    className="ml-2 text-2xl"
                    animate={{ rotate: [0, 20, -20, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                  >
                    👨‍⚕️
                  </motion.span>
                </motion.p>
                <motion.p 
                  className="text-sm text-gray-500 font-medium"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </motion.p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <motion.div 
                className="text-right bg-gradient-to-r from-white/60 to-blue-50/80 px-6 py-4 rounded-2xl border border-white/30 backdrop-blur-lg shadow-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Current Time</p>
                <motion.p 
                  className="font-bold text-gray-800 text-xl"
                  key={currentTime.toLocaleTimeString()}
                  initial={{ scale: 0.95, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentTime.toLocaleTimeString()}
                </motion.p>
                <p className="text-xs text-gray-600 font-medium">
                  {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </motion.div>
              
              <motion.button 
                className="relative p-4 text-gray-600 hover:text-blue-600 transition-all duration-300 bg-white/70 rounded-2xl shadow-xl hover:shadow-2xl border border-white/40 backdrop-blur-lg group"
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <BellIcon className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
                <motion.span 
                  className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(239, 68, 68, 0.4)",
                      "0 0 0 10px rgba(239, 68, 68, 0)",
                      "0 0 0 0 rgba(239, 68, 68, 0)"
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <span className="text-xs text-white font-bold">3</span>
                </motion.span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Enhanced Navigation Tabs */}
        <motion.div 
          className="flex flex-wrap gap-4 mb-10 bg-white/50 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-white/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TabButton id="overview" label="Overview" icon={ChartBarIcon} />
          <TabButton id="appointments" label="Appointments" icon={CalendarDaysIcon} count={appointments.length} />
          <TabButton id="patients" label="Patients" icon={UserGroupIcon} count={patients.length} />
          <TabButton id="reports" label="Reports" icon={DocumentTextIcon} />
        </motion.div>

        {/* Tab Content */}
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
      </div>
    </div>
  );
};

export default DoctorDashboard;
