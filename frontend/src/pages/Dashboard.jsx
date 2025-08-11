import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  UserIcon,
  ChartBarIcon,
  ClockIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName] = useState(localStorage.getItem('userName') || 'Patient');
  const [healthMetrics, setHealthMetrics] = useState({
    heartRate: 72,
    bloodPressure: '120/80',
    temperature: '98.6°F',
    weight: '70 kg',
  });

  const quickActions = [
    {
      title: 'Book Appointment',
      description: 'Schedule with verified doctors',
      icon: CalendarDaysIcon,
      color: 'from-blue-500 to-blue-600',
      action: () => navigate('/appointments'),
    },
    {
      title: 'AI Chat',
      description: 'Get instant medical consultation',
      icon: ChatBubbleLeftRightIcon,
      color: 'from-green-500 to-green-600',
      action: () => navigate('/chat'),
    },
    {
      title: 'Health Predict',
      description: 'AI-powered health predictions',
      icon: HeartIcon,
      color: 'from-purple-500 to-purple-600',
      action: () => navigate('/health-predict'),
    },
    {
      title: 'Emergency',
      description: '24/7 emergency services',
      icon: ExclamationTriangleIcon,
      color: 'from-red-500 to-red-600',
      action: () => navigate('/emergency'),
    },
  ];

  const recentActivities = [
    { action: 'Health checkup completed', time: '2 hours ago', type: 'checkup' },
    { action: 'Appointment booked with Dr. Smith', time: '1 day ago', type: 'appointment' },
    { action: 'AI chat session', time: '2 days ago', type: 'chat' },
    { action: 'Emergency alert resolved', time: '3 days ago', type: 'emergency' },
  ];

  const upcomingAppointments = [
    { doctor: 'Dr. Sarah Wilson', specialty: 'Cardiologist', date: 'Tomorrow', time: '10:00 AM' },
    { doctor: 'Dr. Michael Chen', specialty: 'Neurologist', date: 'Dec 15', time: '2:00 PM' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Here's your health overview for today
          </p>
        </motion.div>

        {/* Health Metrics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Heart Rate</p>
                <p className="text-2xl font-bold text-blue-600">{healthMetrics.heartRate}</p>
                <p className="text-sm text-gray-500">BPM</p>
              </div>
              <div className="bg-red-100 p-3 rounded-xl">
                <HeartIcon className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Blood Pressure</p>
                <p className="text-2xl font-bold text-blue-600">{healthMetrics.bloodPressure}</p>
                <p className="text-sm text-gray-500">mmHg</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <ChartBarIcon className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Temperature</p>
                <p className="text-2xl font-bold text-blue-600">{healthMetrics.temperature}</p>
                <p className="text-sm text-gray-500">Fahrenheit</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">°</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Weight</p>
                <p className="text-2xl font-bold text-blue-600">{healthMetrics.weight}</p>
                <p className="text-sm text-gray-500">Kilograms</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <UserIcon className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-blue-700 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 border border-blue-100 group"
                onClick={action.action}
              >
                <div className={`bg-gradient-to-r ${action.color} p-4 rounded-2xl w-fit mb-4 group-hover:shadow-lg transition-all duration-300`}>
                  <action.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-blue-700 mb-2">
                  {action.title}
                </h3>
                <p className="text-gray-600">
                  {action.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100 hover:shadow-2xl transition-all duration-300"
          >
            <h2 className="text-xl font-bold text-blue-700 mb-6">Recent Activities</h2>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                  <div className={`p-3 rounded-xl ${
                    activity.type === 'checkup' ? 'bg-blue-100' :
                    activity.type === 'appointment' ? 'bg-green-100' :
                    activity.type === 'chat' ? 'bg-purple-100' :
                    'bg-red-100'
                  }`}>
                    {activity.type === 'checkup' && <HeartIcon className="w-5 h-5 text-blue-600" />}
                    {activity.type === 'appointment' && <CalendarDaysIcon className="w-5 h-5 text-green-600" />}
                    {activity.type === 'chat' && <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-600" />}
                    {activity.type === 'emergency' && <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-700">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Appointments */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100 hover:shadow-2xl transition-all duration-300"
          >
            <h2 className="text-xl font-bold text-blue-700 mb-6">Upcoming Appointments</h2>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment, index) => (
                <div key={index} className="border border-blue-200 rounded-xl p-4 hover:bg-blue-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-blue-700">{appointment.doctor}</h3>
                      <p className="text-sm text-gray-600">{appointment.specialty}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">{appointment.date}</p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {appointment.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => navigate('/appointments')}
                className="w-full text-center py-3 text-blue-600 hover:text-blue-700 font-semibold transition-colors bg-blue-50 rounded-xl hover:bg-blue-100"
              >
                View All Appointments →
              </button>
            </div>
          </motion.div>
        </div>

        {/* Health Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white border border-blue-200"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <BellIcon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Today's Health Tip</h3>
              <p className="mt-2 text-blue-100">
                Remember to drink at least 8 glasses of water today and take a 30-minute walk for better cardiovascular health!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
