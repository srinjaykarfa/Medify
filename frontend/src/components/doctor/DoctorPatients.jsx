import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarDaysIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        console.log('No access token found');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/doctor/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients || data || []);
      } else {
        throw new Error('Failed to fetch patients');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setLoading(false);
      toast.error('Failed to fetch patients');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPatients();
    setRefreshing(false);
    toast.success('Patient list refreshed');
  };

  const filteredAndSortedPatients = patients
    .filter(patient => 
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name?.localeCompare(b.name) || 0;
        case 'lastVisit':
          return new Date(b.lastVisit) - new Date(a.lastVisit);
        case 'condition':
          return a.condition?.localeCompare(b.condition) || 0;
        default:
          return 0;
      }
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
            className="w-20 h-20 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <UserGroupIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Patients</h2>
          <p className="text-gray-600">Please wait while we fetch your patient list...</p>
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
          <div className="p-4 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl shadow-lg">
            <UserGroupIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Patients</h1>
            <p className="text-gray-600 font-medium">Manage your patient records</p>
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

      {/* Search and Sort */}
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
              placeholder="Search patients by name, condition, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
            />
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-3">
            <FunnelIcon className="w-5 h-5 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
            >
              <option value="name">Sort by Name</option>
              <option value="lastVisit">Sort by Last Visit</option>
              <option value="condition">Sort by Condition</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Patient Stats */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-6 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold">{patients.length}</h3>
              <p className="text-blue-100 font-medium">Total Patients</p>
            </div>
            <UserGroupIcon className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl p-6 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold">{filteredAndSortedPatients.length}</h3>
              <p className="text-emerald-100 font-medium">Filtered Results</p>
            </div>
            <MagnifyingGlassIcon className="w-12 h-12 text-emerald-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-6 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold">
                {patients.filter(p => {
                  const lastVisit = new Date(p.lastVisit);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return lastVisit >= weekAgo;
                }).length}
              </h3>
              <p className="text-orange-100 font-medium">Recent Visits</p>
            </div>
            <CalendarDaysIcon className="w-12 h-12 text-orange-200" />
          </div>
        </div>
      </motion.div>

      {/* Patients List */}
      <div className="grid gap-6">
        {filteredAndSortedPatients.length > 0 ? (
          filteredAndSortedPatients.map((patient, index) => (
            <motion.div
              key={patient.id}
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
                    <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-2xl">
                        {patient.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-800">{patient.name}</h3>
                    <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-6 text-gray-600">
                      <div className="flex items-center space-x-2">
                        <HeartIconSolid className="w-5 h-5 text-red-500" />
                        <span className="font-semibold">{patient.condition}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CalendarDaysIcon className="w-5 h-5 text-blue-500" />
                        <span className="font-semibold">Last visit: {patient.lastVisit}</span>
                      </div>
                      {patient.email && (
                        <div className="flex items-center space-x-2">
                          <UserIcon className="w-5 h-5 text-purple-500" />
                          <span className="font-semibold">{patient.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <EyeIcon className="w-5 h-5" />
                    <span>View</span>
                  </motion.button>

                  <motion.button
                    className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PhoneIcon className="w-5 h-5" />
                    <span>Call</span>
                  </motion.button>

                  <motion.button
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    <span>Chat</span>
                  </motion.button>

                  <motion.button
                    className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <DocumentTextIcon className="w-5 h-5" />
                    <span>Records</span>
                  </motion.button>
                </div>
              </div>

              {/* Additional Patient Details */}
              {patient.recentNotes && (
                <motion.div 
                  className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-100"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 0.2 }}
                >
                  <h4 className="font-semibold text-gray-800 mb-2">Recent Notes:</h4>
                  <p className="text-gray-600 font-medium">{patient.recentNotes}</p>
                </motion.div>
              )}
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
              <UserGroupIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No patients found</h3>
              <p className="text-gray-600 font-medium">
                {searchTerm 
                  ? 'Try adjusting your search criteria' 
                  : 'You have no patients registered'
                }
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DoctorPatients;
