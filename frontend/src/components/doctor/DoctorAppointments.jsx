import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        console.log('No access token found');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/doctor/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || data || []);
      } else {
        throw new Error('Failed to fetch appointments');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
      toast.error('Failed to fetch appointments');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
    toast.success('Appointments refreshed');
  };

  const handleAppointmentStatus = async (appointmentId, status) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        toast.error('No access token found');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/doctor/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        await fetchAppointments();
        toast.success(`Appointment ${status} successfully`);
      } else {
        throw new Error(`Failed to ${status} appointment`);
      }
    } catch (error) {
      console.error(`Error ${status} appointment:`, error);
      toast.error(`Failed to ${status} appointment`);
    }
  };

  const acceptAppointment = (appointmentId) => {
    handleAppointmentStatus(appointmentId, 'accepted');
  };

  const rejectAppointment = (appointmentId) => {
    handleAppointmentStatus(appointmentId, 'rejected');
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesFilter = filter === 'all' || appointment.status === filter;
    const matchesSearch = appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.type?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
            <CalendarDaysIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Appointments</h2>
          <p className="text-gray-600">Please wait while we fetch your appointments...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <motion.div 
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
            <CalendarDaysIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Appointments</h1>
            <p className="text-gray-600 font-medium">Manage your consultations</p>
          </div>
        </motion.div>

        <motion.button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </motion.button>
      </div>

      {/* Filters and Search */}
      <motion.div 
        className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center space-x-3">
            <FunnelIcon className="w-5 h-5 text-gray-500" />
            {['all', 'pending', 'accepted', 'rejected'].map((filterOption) => (
              <motion.button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  filter === filterOption
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Appointments List */}
      <div className="grid gap-6">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.01, y: -4 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Patient Info */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <UserIcon className="w-8 h-8 text-white" />
                    </div>
                    <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-white ${
                      appointment.status === 'accepted' ? 'bg-green-500' :
                      appointment.status === 'rejected' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`}></div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-800">{appointment.patientName}</h3>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="flex items-center space-x-2">
                        <HeartIconSolid className="w-5 h-5 text-red-500" />
                        <span className="font-semibold">{appointment.type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-5 h-5 text-blue-500" />
                        <span className="font-semibold">{appointment.time}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                  <span className={`px-4 py-2 rounded-xl font-bold text-sm ${
                    appointment.status === 'accepted' 
                      ? 'bg-green-100 text-green-700 border border-green-200' :
                    appointment.status === 'rejected' 
                      ? 'bg-red-100 text-red-700 border border-red-200' :
                    'bg-yellow-100 text-yellow-700 border border-yellow-200'
                  }`}>
                    {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
                  </span>

                  {appointment.status === 'pending' && (
                    <div className="flex space-x-3">
                      <motion.button
                        onClick={() => acceptAppointment(appointment.id)}
                        className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                        <span>Accept</span>
                      </motion.button>
                      
                      <motion.button
                        onClick={() => rejectAppointment(appointment.id)}
                        className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <XCircleIcon className="w-5 h-5" />
                        <span>Reject</span>
                      </motion.button>
                    </div>
                  )}

                  {appointment.status === 'accepted' && (
                    <div className="flex space-x-3">
                      <motion.button
                        className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <PhoneIcon className="w-5 h-5" />
                        <span>Call</span>
                      </motion.button>
                      
                      <motion.button
                        className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                        <span>Chat</span>
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/30">
              <CalendarDaysIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No appointments found</h3>
              <p className="text-gray-600 font-medium">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'You have no appointments scheduled'
                }
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DoctorAppointments;
