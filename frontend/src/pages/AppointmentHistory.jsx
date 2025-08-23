import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarIcon,
  ClockIcon,
  XMarkIcon,
  CurrencyRupeeIcon,
  MapPinIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:8000';

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, upcoming, completed, cancelled
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/appointments/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      } else {
        toast.error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Error loading appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Appointment cancelled successfully');
        fetchAppointments(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Error cancelling appointment');
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-orange-100 text-orange-800'
    };

    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusBadge = (status) => {
    const badges = {
      pending: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-blue-100 text-blue-800'
    };

    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Appointments</h1>
            <p className="text-gray-600">Manage your appointments and view history</p>
          </div>
          <Link
            to="/appointments/book"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 font-medium"
          >
            Book New Appointment
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
          {[
            { key: 'all', label: 'All' },
            { key: 'scheduled', label: 'Upcoming' },
            { key: 'completed', label: 'Completed' },
            { key: 'cancelled', label: 'Cancelled' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? "You haven't booked any appointments yet." 
                : `No ${filter} appointments found.`}
            </p>
            <Link
              to="/appointments/book"
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Book Your First Appointment
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex space-x-4">
                    <img
                      src={appointment.doctor.image}
                      alt={appointment.doctor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {appointment.doctor.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(appointment.status)}`}>
                          {appointment.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadge(appointment.payment_status)}`}>
                          {appointment.payment_status.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-2">{appointment.doctor.specialization}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="h-4 w-4" />
                          <span>{appointment.appointment_time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CurrencyRupeeIcon className="h-4 w-4" />
                          <span>₹{appointment.consultation_fee}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPinIcon className="h-4 w-4" />
                          <span>{appointment.doctor.hospital}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Type:</span>
                          <span>{appointment.appointment_type.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Ref:</span>
                          <span className="font-mono text-xs">{appointment.booking_reference}</span>
                        </div>
                      </div>

                      {appointment.symptoms && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">Symptoms/Reason: </span>
                            <span className="text-gray-600">{appointment.symptoms}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowDetails(true);
                      }}
                      className="px-3 py-1 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-sm"
                    >
                      View Details
                    </button>
                    
                    {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="px-3 py-1 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Appointment Details Modal */}
        {showDetails && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Appointment Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Doctor Info */}
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedAppointment.doctor.image}
                    alt={selectedAppointment.doctor.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {selectedAppointment.doctor.name}
                    </h3>
                    <p className="text-gray-600">{selectedAppointment.doctor.specialization}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <MapPinIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedAppointment.doctor.hospital}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <PhoneIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedAppointment.doctor.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Appointment Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">Appointment Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <p className="font-medium">{new Date(selectedAppointment.appointment_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Time:</span>
                      <p className="font-medium">{selectedAppointment.appointment_time}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <p className="font-medium">{selectedAppointment.appointment_type.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Fee:</span>
                      <p className="font-medium">₹{selectedAppointment.consultation_fee}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedAppointment.status)}`}>
                        {selectedAppointment.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Payment:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadge(selectedAppointment.payment_status)}`}>
                        {selectedAppointment.payment_status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Symptoms & Notes */}
                {selectedAppointment.symptoms && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Symptoms/Reason for Visit</h4>
                    <p className="text-gray-600 bg-gray-50 rounded-lg p-3">
                      {selectedAppointment.symptoms}
                    </p>
                  </div>
                )}

                {selectedAppointment.notes && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Additional Notes</h4>
                    <p className="text-gray-600 bg-gray-50 rounded-lg p-3">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                )}

                {/* Booking Reference */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Booking Reference</h4>
                  <p className="font-mono text-sm bg-gray-100 rounded-lg p-3">
                    {selectedAppointment.booking_reference}
                  </p>
                </div>

                {/* Timestamps */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Booked: {new Date(selectedAppointment.created_at).toLocaleString()}</p>
                  {selectedAppointment.updated_at && (
                    <p>Last Updated: {new Date(selectedAppointment.updated_at).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentHistory;
