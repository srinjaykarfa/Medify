import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:8000';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token');
      
      if (!token) {
        toast.error('Please login to view appointments');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/doctor/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
        toast.success(`Loaded ${data.length} appointments`);
      } else {
        throw new Error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token');
      
      const response = await fetch(`${API_BASE_URL}/api/doctor/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        setAppointments(appointments.map(apt => 
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        ));
        toast.success(`Appointment ${newStatus} successfully`);
      } else {
        throw new Error('Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const filteredAppointments = appointments.filter(apt => 
    selectedStatus === 'all' || apt.status === selectedStatus
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'emergency': return 'text-red-600 font-bold';
      case 'urgent': return 'text-orange-600 font-medium';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
          <p className="text-gray-600">Manage your patient appointments</p>
        </div>
        <button
          onClick={fetchAppointments}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex space-x-2">
        {[
          { key: 'all', label: 'All', count: appointments.length },
          { key: 'pending', label: 'Pending', count: appointments.filter(apt => apt.status === 'pending').length },
          { key: 'confirmed', label: 'Confirmed', count: appointments.filter(apt => apt.status === 'confirmed').length },
          { key: 'completed', label: 'Completed', count: appointments.filter(apt => apt.status === 'completed').length }
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setSelectedStatus(filter.key)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedStatus === filter.key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12">
          <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No appointments found</h3>
          <p className="text-gray-600">
            {selectedStatus === 'all' 
              ? 'No appointments scheduled yet.' 
              : `No ${selectedStatus} appointments.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {appointment.patient_name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                    {appointment.urgency && appointment.urgency !== 'normal' && (
                      <span className={`text-xs font-medium ${getUrgencyColor(appointment.urgency)}`}>
                        {appointment.urgency.toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{new Date(appointment.appointment_date).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4" />
                      <span>{appointment.appointment_time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>📧 {appointment.patient_email}</span>
                    </div>
                  </div>

                  {appointment.phone && (
                    <div className="mt-2 text-sm text-gray-600">
                      📞 {appointment.patient_phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Appointment Details */}
              <div className="space-y-3">
                {appointment.reason && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Reason: </span>
                    <span className="text-sm text-gray-600">{appointment.reason}</span>
                  </div>
                )}
                
                {appointment.symptoms && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Symptoms: </span>
                    <span className="text-sm text-gray-600">{appointment.symptoms}</span>
                  </div>
                )}

                <div>
                  <span className="text-sm font-medium text-gray-700">Consultation Fee: </span>
                  <span className="text-sm text-green-600 font-medium">₹{appointment.consultation_fee}</span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">Booked on: </span>
                  <span className="text-sm text-gray-600">
                    {new Date(appointment.created_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex space-x-3">
                {appointment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                      className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>Confirm</span>
                    </button>
                    <button
                      onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                      className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <XCircleIcon className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </>
                )}
                
                {appointment.status === 'confirmed' && (
                  <button
                    onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                    className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Mark Complete</span>
                  </button>
                )}

                <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  <EyeIcon className="h-4 w-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
