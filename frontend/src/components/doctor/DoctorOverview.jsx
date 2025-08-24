import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowDownIcon,
  SparklesIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const DoctorOverview = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingConsultations: 0,
    completedToday: 0,
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        console.log('No access token found');
        setLoading(false);
        return;
      }

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
        setAppointments(appointmentsData.appointments || appointmentsData || []);
      }
      if (patientsResponse.ok) {
        const patientsData = await patientsResponse.json();
        setPatients(patientsData.patients || patientsData || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      setLoading(false);
      toast.error('Failed to fetch data');
    }
  };

  const StatCard = ({ title, value, icon: IconComponent, gradient, trend, description }) => (
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
            <IconComponent className="w-8 h-8 text-white" />
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
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
            {appointments.length > 0 ? appointments.slice(0, 3).map((appointment, index) => (
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
            {patients.length > 0 ? patients.slice(0, 3).map((patient, index) => (
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

      {/* Extra Content for Testing Scroll */}
      <motion.div 
        className="mt-10 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Additional Information</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
            <div key={item} className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-gray-800">Information Block {item}</h4>
              <p className="text-gray-600">
                This is a test content block to demonstrate scrolling behavior. 
                The navbar and sidebar should remain fixed while this content scrolls.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DoctorOverview;
