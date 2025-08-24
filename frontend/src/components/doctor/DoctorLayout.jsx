import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid';

const DoctorLayout = ({ children, activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Top Navigation - Fixed */}
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

      {/* Sidebar - Fixed */}
      <motion.div 
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-white/90 backdrop-blur-2xl shadow-2xl transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-500 ease-in-out lg:translate-x-0 border-r border-white/30`}
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
        </div>
      </motion.div>

      {/* Main content */}
      <div className="lg:pl-80 pt-20">
        <main className="min-h-screen p-6">
          {children}
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

export default DoctorLayout;
