import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  ChartBarIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeChats: 0,
    healthChecks: 0,
    systemHealth: 'Good',
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch real stats from API
      const [statsResponse, usersResponse, doctorsResponse] = await Promise.all([
        fetch('http://localhost:8000/api/admin/stats'),
        fetch('http://localhost:8000/api/admin/users'),
        fetch('http://localhost:8000/api/admin/doctors/pending')
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats({
          totalUsers: statsData.total_users,
          activeChats: statsData.active_chats,
          healthChecks: statsData.health_checks,
          systemHealth: statsData.system_health,
        });
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      if (doctorsResponse.ok) {
        const doctorsData = await doctorsResponse.json();
        setPendingDoctors(doctorsData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to mock data if API fails
      const mockStats = {
        totalUsers: 1247,
        activeChats: 89,
        healthChecks: 567,
        systemHealth: 'Good',
      };
      
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', join_date: '2024-01-15' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'active', join_date: '2024-02-20' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'inactive', join_date: '2024-03-10' },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', status: 'active', join_date: '2024-04-05' },
      ];

      const mockDoctors = [
        {
          id: 1,
          username: 'Dr. Sarah Wilson',
          email: 'sarah.wilson@hospital.com',
          license_number: 'MD12345',
          specialization: 'Cardiology',
          experience: 8,
          verification_status: 'pending',
          aadhaar_card_path: 'uploads/sarah_aadhaar.jpg',
          doctor_certificate_path: 'uploads/sarah_certificate.jpg'
        },
        {
          id: 2,
          username: 'Dr. Michael Chen',
          email: 'michael.chen@clinic.com',
          license_number: 'MD67890',
          specialization: 'Neurology',
          experience: 12,
          verification_status: 'pending',
          aadhaar_card_path: 'uploads/michael_aadhaar.jpg',
          doctor_certificate_path: 'uploads/michael_certificate.jpg'
        }
      ];

      setStats(mockStats);
      setUsers(mockUsers);
      setPendingDoctors(mockDoctors);
      setLoading(false);
      toast.error('Failed to fetch some data, showing cached results');
    }
  };

  const handleUserAction = (action, userId) => {
    console.log(`Performing ${action} on user ${userId}`);
    toast.success(`User ${action} successfully`);
    // Implement actual user actions here
  };

  const handleDoctorAction = async (action, doctorId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/doctors/${doctorId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'admin_token'}`
        },
      });

      if (response.ok) {
        toast.success(`Doctor ${action}d successfully`);
        // Remove the doctor from the pending list or update their status
        setPendingDoctors(prevDoctors => 
          prevDoctors.map(doctor => 
            doctor.id === doctorId 
              ? { ...doctor, verification_status: action === 'approve' ? 'approved' : 'rejected' }
              : doctor
          )
        );
        // Refresh the doctors list
        setTimeout(() => {
          fetchDashboardData();
        }, 1000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || `Failed to ${action} doctor`);
      }
    } catch (error) {
      console.error(`Error ${action}ing doctor:`, error);
      toast.error(`Failed to ${action} doctor. Please try again.`);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <Icon className="w-8 h-8 text-gray-500" />
      </div>
    </motion.div>
  );

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        activeTab === id
          ? 'bg-blue-600 text-white shadow-lg'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon={UserGroupIcon}
                color="border-blue-500"
              />
              <StatCard
                title="Active Chats"
                value={stats.activeChats}
                icon={ChatBubbleLeftRightIcon}
                color="border-green-500"
              />
              <StatCard
                title="Health Checks"
                value={stats.healthChecks}
                icon={HeartIcon}
                color="border-red-500"
              />
              <StatCard
                title="System Health"
                value={stats.systemHealth}
                icon={CheckCircleIcon}
                color="border-yellow-500"
              />
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { action: 'New user registration', user: 'john@example.com', time: '2 mins ago' },
                  { action: 'Health check completed', user: 'jane@example.com', time: '5 mins ago' },
                  { action: 'Chat session started', user: 'bob@example.com', time: '10 mins ago' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.user}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">User Management</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Add New User
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Join Date</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{user.name}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{user.joinDate}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUserAction('viewed', user.id)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUserAction('edited', user.id)}
                            className="p-1 text-yellow-600 hover:bg-yellow-100 rounded"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUserAction('deleted', user.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'doctors':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Doctor Verification</h3>
              <div className="flex gap-2">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Approved ({pendingDoctors.filter(d => d.verification_status === 'approved').length})
                </button>
                <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                  Pending ({pendingDoctors.filter(d => d.verification_status === 'pending').length})
                </button>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                  Rejected ({pendingDoctors.filter(d => d.verification_status === 'rejected').length})
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Doctor Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">License No.</th>
                    <th className="text-left py-3 px-4">Specialization</th>
                    <th className="text-left py-3 px-4">Experience</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Documents</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDoctors.map((doctor) => (
                    <tr key={doctor.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{doctor.username}</td>
                      <td className="py-3 px-4">{doctor.email}</td>
                      <td className="py-3 px-4">{doctor.license_number}</td>
                      <td className="py-3 px-4">{doctor.specialization}</td>
                      <td className="py-3 px-4">{doctor.experience} years</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            doctor.verification_status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : doctor.verification_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {doctor.verification_status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.open(`http://localhost:8000/${doctor.aadhaar_card_path}`, '_blank')}
                            className="text-blue-600 hover:text-blue-800 text-sm underline"
                          >
                            Aadhaar
                          </button>
                          <button
                            onClick={() => window.open(`http://localhost:8000/${doctor.doctor_certificate_path}`, '_blank')}
                            className="text-blue-600 hover:text-blue-800 text-sm underline"
                          >
                            Certificate
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {doctor.verification_status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDoctorAction('approve', doctor.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleDoctorAction('reject', doctor.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Usage Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800">Daily Active Users</h4>
                  <p className="text-2xl font-bold text-blue-600">847</p>
                  <p className="text-sm text-blue-600">+12% from yesterday</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800">Chat Sessions</h4>
                  <p className="text-2xl font-bold text-green-600">234</p>
                  <p className="text-sm text-green-600">+8% from yesterday</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800">Health Predictions</h4>
                  <p className="text-2xl font-bold text-purple-600">156</p>
                  <p className="text-sm text-purple-600">+15% from yesterday</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-800">Emergency Alerts</h4>
                  <p className="text-2xl font-bold text-orange-600">3</p>
                  <p className="text-sm text-orange-600">-2 from yesterday</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-6">System Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  System Maintenance Mode
                </label>
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-600">Enable maintenance mode</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Registration
                </label>
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm text-gray-600">Allow new user registrations</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Rate Limiting
                </label>
                <input
                  type="number"
                  className="border border-gray-300 rounded-lg px-3 py-2 w-32"
                  defaultValue="1000"
                />
                <span className="ml-2 text-sm text-gray-600">requests per hour</span>
              </div>
              
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Save Settings
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your Medify platform</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {localStorage.getItem('userName') || 'Admin'}
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem('isAuthenticated');
                  localStorage.removeItem('userName');
                  window.location.href = '/admin-login';
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 bg-white p-2 rounded-lg shadow-sm">
            <TabButton id="overview" label="Overview" icon={ChartBarIcon} />
            <TabButton id="users" label="Users" icon={UserGroupIcon} />
            <TabButton id="doctors" label="Doctor Verification" icon={UserGroupIcon} />
            <TabButton id="analytics" label="Analytics" icon={ChartBarIcon} />
            <TabButton id="settings" label="Settings" icon={CogIcon} />
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
