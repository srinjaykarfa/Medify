import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChatBubbleLeftIcon,
  HeartIcon,
  CalendarIcon,
  UserCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  FunnelIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/solid';

const HealthHistory = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const activities = [
    {
      id: 1,
      type: 'chat',
      title: 'AI Health Consultation',
      description: 'Discussed chest pain and breathing difficulties',
      time: '2 hours ago',
      date: '2024-01-15',
      status: 'completed',
      icon: ChatBubbleLeftIcon,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 2,
      type: 'metrics',
      title: 'Blood Pressure Reading',
      description: 'Systolic: 120 mmHg, Diastolic: 80 mmHg',
      time: '1 day ago',
      date: '2024-01-14',
      status: 'normal',
      icon: HeartIcon,
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 3,
      type: 'appointment',
      title: 'Cardiology Appointment',
      description: 'Dr. Sarah Johnson - Regular checkup completed',
      time: '3 days ago',
      date: '2024-01-12',
      status: 'completed',
      icon: CalendarIcon,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 4,
      type: 'checkup',
      title: 'Quick Health Assessment',
      description: 'Overall health score: 85/100 - Good condition',
      time: '5 days ago',
      date: '2024-01-10',
      status: 'completed',
      icon: UserCircleIcon,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 5,
      type: 'prediction',
      title: 'Diabetes Risk Assessment',
      description: 'Low risk - Continue healthy lifestyle',
      time: '1 week ago',
      date: '2024-01-08',
      status: 'low-risk',
      icon: DocumentTextIcon,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 6,
      type: 'metrics',
      title: 'Weight Tracking',
      description: 'Weight: 70 kg, BMI: 22.5 (Normal)',
      time: '1 week ago',
      date: '2024-01-07',
      status: 'normal',
      icon: HeartIcon,
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 7,
      type: 'chat',
      title: 'Nutrition Consultation',
      description: 'Discussed meal planning and dietary requirements',
      time: '10 days ago',
      date: '2024-01-05',
      status: 'completed',
      icon: ChatBubbleLeftIcon,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 8,
      type: 'appointment',
      title: 'General Medicine Checkup',
      description: 'Dr. Michael Chen - Annual physical examination',
      time: '2 weeks ago',
      date: '2024-01-01',
      status: 'completed',
      icon: CalendarIcon,
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const filters = [
    { key: 'all', label: 'All Activities', count: activities.length },
    { key: 'chat', label: 'Consultations', count: activities.filter(a => a.type === 'chat').length },
    { key: 'appointment', label: 'Appointments', count: activities.filter(a => a.type === 'appointment').length },
    { key: 'metrics', label: 'Health Metrics', count: activities.filter(a => a.type === 'metrics').length },
    { key: 'checkup', label: 'Checkups', count: activities.filter(a => a.type === 'checkup').length },
    { key: 'prediction', label: 'Predictions', count: activities.filter(a => a.type === 'prediction').length }
  ];

  const filteredActivities = selectedFilter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === selectedFilter);

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: 'bg-green-100 text-green-800',
      normal: 'bg-blue-100 text-blue-800',
      'low-risk': 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    
    return statusConfig[status] || statusConfig.pending;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link 
            to="/dashboard" 
            className="mr-4 p-2 rounded-lg bg-white shadow hover:shadow-md transition-shadow"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Health History</h1>
            <p className="text-gray-600">Track your complete health journey</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Filter Activities</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedFilter === filter.key
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
                <span className="ml-2 text-xs opacity-75">({filter.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {filteredActivities.map((activity) => (
          <div
            key={activity.id}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className={`p-3 rounded-lg ${activity.color}`}>
                  <activity.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {activity.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(activity.status)}`}>
                      {activity.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{activity.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span>{activity.time}</span>
                    <span className="mx-2">•</span>
                    <span>{activity.date}</span>
                  </div>
                </div>
              </div>
              <ChevronRightIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No {selectedFilter === 'all' ? '' : filters.find(f => f.key === selectedFilter)?.label.toLowerCase()} found
          </h3>
          <p className="text-gray-500">
            Start using our health features to build your history
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Continue Your Health Journey</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/chat"
            className="bg-white/20 hover:bg-white/30 rounded-lg p-4 transition-colors"
          >
            <ChatBubbleLeftIcon className="h-6 w-6 mb-2" />
            <p className="font-medium">Start AI Chat</p>
          </Link>
          <Link
            to="/appointments"
            className="bg-white/20 hover:bg-white/30 rounded-lg p-4 transition-colors"
          >
            <CalendarIcon className="h-6 w-6 mb-2" />
            <p className="font-medium">Book Appointment</p>
          </Link>
          <Link
            to="/health-metrics"
            className="bg-white/20 hover:bg-white/30 rounded-lg p-4 transition-colors"
          >
            <HeartIcon className="h-6 w-6 mb-2" />
            <p className="font-medium">Log Health Data</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HealthHistory;
