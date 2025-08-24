import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:8000';

const AppointmentBookingDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { doctor } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    reason: '',
    symptoms: '',
    urgency: 'normal'
  });

  // Redirect if no doctor data
  if (!doctor) {
    navigate('/appointments/book');
    return null;
  }

  // Generate available time slots
  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
  ];

  // Generate next 14 days (excluding Sundays)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip Sundays
      if (date.getDay() !== 0) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-IN', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
          })
        });
      }
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.date || !formData.time || !formData.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        toast.error('Please login to book appointment');
        navigate('/signin');
        return;
      }

      const appointmentData = {
        doctor_id: doctor.id,
        date: formData.date,
        time: formData.time,
        reason: formData.reason,
        symptoms: formData.symptoms,
        urgency: formData.urgency,
        consultation_fee: doctor.consultation_fee
      };

      const response = await fetch(`${API_BASE_URL}/api/appointments/book`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Appointment booked successfully!');
        navigate('/appointments', { 
          state: { 
            success: true, 
            appointment: data.appointment 
          } 
        });
      } else {
        throw new Error(data.detail || 'Failed to book appointment');
      }

    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/appointments/book')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Back to Doctors
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Book Appointment</h1>
          <p className="text-gray-600">Schedule your consultation with {doctor.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Doctor Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <div className="text-center mb-4">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                />
                <h3 className="font-semibold text-gray-800 text-lg">{doctor.name}</h3>
                <p className="text-blue-600 font-medium">{doctor.specialization}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-medium">{doctor.experience}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Hospital:</span>
                  <span className="font-medium">{doctor.hospital}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Fee:</span>
                  <span className="font-medium text-green-600">₹{doctor.consultation_fee}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rating:</span>
                  <span className="font-medium">⭐ {doctor.rating}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500">{doctor.qualifications}</p>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarIcon className="h-4 w-4 inline mr-1" />
                    Select Date *
                  </label>
                  <select
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose a date</option>
                    {availableDates.map((date) => (
                      <option key={date.value} value={date.value}>
                        {date.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ClockIcon className="h-4 w-4 inline mr-1" />
                    Select Time *
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setFormData({ ...formData, time })}
                        className={`p-2 text-sm rounded-lg border transition-colors ${
                          formData.time === time
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason for Visit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UserIcon className="h-4 w-4 inline mr-1" />
                    Reason for Visit *
                  </label>
                  <select
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select reason</option>
                    <option value="routine_checkup">Routine Checkup</option>
                    <option value="follow_up">Follow-up Visit</option>
                    <option value="consultation">Medical Consultation</option>
                    <option value="symptoms">Specific Symptoms</option>
                    <option value="medication_review">Medication Review</option>
                    <option value="second_opinion">Second Opinion</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Symptoms/Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Symptoms/Additional Details
                  </label>
                  <textarea
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Please describe your symptoms or provide additional details..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Urgency Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency Level
                  </label>
                  <div className="flex space-x-4">
                    {[
                      { value: 'normal', label: 'Normal', color: 'green' },
                      { value: 'urgent', label: 'Urgent', color: 'yellow' },
                      { value: 'emergency', label: 'Emergency', color: 'red' }
                    ].map((urgency) => (
                      <label key={urgency.value} className="flex items-center">
                        <input
                          type="radio"
                          name="urgency"
                          value={urgency.value}
                          checked={formData.urgency === urgency.value}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span className={`text-${urgency.color}-600 font-medium`}>
                          {urgency.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Booking Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Booking Summary</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Doctor:</span>
                      <span>{doctor.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Specialization:</span>
                      <span>{doctor.specialization}</span>
                    </div>
                    {formData.date && (
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{new Date(formData.date).toLocaleDateString('en-IN')}</span>
                      </div>
                    )}
                    {formData.time && (
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span>{formData.time}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium text-gray-800">
                      <span>Consultation Fee:</span>
                      <span>₹{doctor.consultation_fee}</span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Booking...
                    </div>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5 inline mr-2" />
                      Confirm Booking
                    </>
                  )}
                </button>

              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AppointmentBookingDetails;
