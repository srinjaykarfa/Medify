import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingConsultations: 0,
    completedToday: 0,
  });

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      // Fetch doctor-specific data from API
      const [statsResponse, appointmentsResponse, patientsResponse] = await Promise.all([
        fetch('http://localhost:8000/api/doctor/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }),
        fetch('http://localhost:8000/api/doctor/appointments', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }),
        fetch('http://localhost:8000/api/doctor/patients', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        })
      ]);

      let statsData = {};
      let appointmentsData = [];
      let patientsData = [];

      if (statsResponse.ok) {
        statsData = await statsResponse.json();
        setStats({
          todayAppointments: statsData.today_appointments || 0,
          totalPatients: statsData.total_patients || 0,
          pendingConsultations: statsData.pending_consultations || 0,
          completedToday: statsData.completed_today || 0,
        });
      }

      if (appointmentsResponse.ok) {
        appointmentsData = await appointmentsResponse.json();
        setAppointments(appointmentsData);
      }

      if (patientsResponse.ok) {
        patientsData = await patientsResponse.json();
        setPatients(patientsData);
      }

      // Fallback to mock data if API calls fail
      if (!statsResponse.ok || !appointmentsResponse.ok || !patientsResponse.ok) {
        console.log('Using fallback mock data');
        const mockStats = {
          todayAppointments: 8,
          totalPatients: 156,
          pendingConsultations: 3,
          completedToday: 5,
        };

        const mockAppointments = [
          {
            id: 1,
            patient_name: 'John Doe',
            patient_age: 34,
            time: '09:00 AM',
            date: '2024-08-11',
            type: 'Follow-up',
            status: 'scheduled',
            symptoms: 'Chest pain, shortness of breath'
          },
          {
            id: 2,
            patient_name: 'Sarah Wilson',
            patient_age: 28,
            time: '10:30 AM',
            date: '2024-08-11',
            type: 'Consultation',
            status: 'in-progress',
            symptoms: 'Persistent headache'
          },
          {
            id: 3,
            patient_name: 'Michael Chen',
            patient_age: 45,
            time: '02:00 PM',
            date: '2024-08-11',
            type: 'Check-up',
            status: 'scheduled',
            symptoms: 'Regular health check'
          }
        ];

        const mockPatients = [
          {
            id: 1,
            name: 'John Doe',
            age: 34,
            gender: 'Male',
            last_visit: '2024-08-05',
            condition: 'Hypertension',
            status: 'Active'
          },
          {
            id: 2,
            name: 'Sarah Wilson',
            age: 28,
            gender: 'Female',
            last_visit: '2024-08-08',
            condition: 'Migraine',
            status: 'Active'
          }
        ];

        if (!statsResponse.ok) setStats(mockStats);
        if (!appointmentsResponse.ok) setAppointments(mockAppointments);
        if (!patientsResponse.ok) setPatients(mockPatients);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      setLoading(false);
      toast.error('Failed to fetch data');
    }
  };  const handleAppointmentAction = (action, appointmentId) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: action === 'complete' ? 'completed' : 'cancelled' }
          : apt
      )
    );
    toast.success(`Appointment ${action}d successfully`);
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {trend && (
            <p className={`text-sm ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value}% from yesterday
            </p>
          )}
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
                title="Today's Appointments"
                value={stats.todayAppointments}
                icon={CalendarDaysIcon}
                color="border-blue-500"
                trend={{ value: 12, positive: true }}
              />
              <StatCard
                title="Total Patients"
                value={stats.totalPatients}
                icon={UserGroupIcon}
                color="border-green-500"
                trend={{ value: 8, positive: true }}
              />
              <StatCard
                title="Pending Consultations"
                value={stats.pendingConsultations}
                icon={ClockIcon}
                color="border-yellow-500"
              />
              <StatCard
                title="Completed Today"
                value={stats.completedToday}
                icon={CheckCircleIcon}
                color="border-purple-500"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Schedule */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Today's Schedule</h3>
                <div className="space-y-3">
                  {appointments.filter(apt => apt.date === '2024-08-11').map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{appointment.patient_name}</p>
                        <p className="text-sm text-gray-600">{appointment.time} - {appointment.type}</p>
                        <p className="text-xs text-gray-500">{appointment.symptoms}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          appointment.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : appointment.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Patients */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Patients</h3>
                <div className="space-y-3">
                  {patients.slice(0, 5).map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-gray-600">{patient.age} years, {patient.gender}</p>
                        <p className="text-xs text-gray-500">Last visit: {patient.last_visit}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{patient.condition}</p>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          {patient.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'appointments':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Appointment Management</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                Schedule New
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Patient</th>
                    <th className="text-left py-3 px-4">Date & Time</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Symptoms</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{appointment.patient_name}</p>
                          <p className="text-sm text-gray-600">{appointment.patient_age} years</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{appointment.date}</p>
                          <p className="text-sm text-gray-600">{appointment.time}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{appointment.type}</td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-600">{appointment.symptoms}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          appointment.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : appointment.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : appointment.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {appointment.status === 'scheduled' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAppointmentAction('complete', appointment.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleAppointmentAction('cancel', appointment.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                              Cancel
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

      case 'patients':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Patient Records</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                Add Patient
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Patient Name</th>
                    <th className="text-left py-3 px-4">Age & Gender</th>
                    <th className="text-left py-3 px-4">Last Visit</th>
                    <th className="text-left py-3 px-4">Condition</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{patient.name}</td>
                      <td className="py-3 px-4">{patient.age} years, {patient.gender}</td>
                      <td className="py-3 px-4">{patient.last_visit}</td>
                      <td className="py-3 px-4">{patient.condition}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          {patient.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm underline">
                            View History
                          </button>
                          <button className="text-green-600 hover:text-green-800 text-sm underline">
                            Prescribe
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

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Practice Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800">This Week's Appointments</h4>
                  <p className="text-2xl font-bold text-blue-600">34</p>
                  <p className="text-sm text-blue-600">+15% from last week</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800">Patient Satisfaction</h4>
                  <p className="text-2xl font-bold text-green-600">4.8/5</p>
                  <p className="text-sm text-green-600">Based on 127 reviews</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800">Average Consultation Time</h4>
                  <p className="text-2xl font-bold text-purple-600">22 min</p>
                  <p className="text-sm text-purple-600">-3 min from last month</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-800">Revenue This Month</h4>
                  <p className="text-2xl font-bold text-orange-600">₹1,24,500</p>
                  <p className="text-sm text-orange-600">+12% from last month</p>
                </div>
              </div>
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
              <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
              <p className="text-gray-600">Welcome back, Dr. {localStorage.getItem('username') || 'Doctor'}</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <BellIcon className="w-6 h-6" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-400 rounded-full"></span>
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('access_token');
                  localStorage.removeItem('username');
                  localStorage.removeItem('userRole');
                  window.location.href = '/signin';
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
            <TabButton id="appointments" label="Appointments" icon={CalendarDaysIcon} />
            <TabButton id="patients" label="Patients" icon={UserGroupIcon} />
            <TabButton id="analytics" label="Analytics" icon={DocumentTextIcon} />
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

export default DoctorDashboard;
