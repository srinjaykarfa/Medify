import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, ClockIcon, UserIcon, AcademicCapIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:8000';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1: Select Doctor, 2: Book Details
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  // Doctors list
  const [doctors] = useState([
    {
      id: "demo_1",
      name: "Dr. Rajesh Kumar",
      specialization: "Cardiology",
      experience: "10 years",
      rating: 4.8,
      consultation_fee: 1500,
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=faces",
      hospital: "Medify Heart Center",
      available: true
    },
    {
      id: "demo_2", 
      name: "Dr. Priya Sharma",
      specialization: "Dermatology",
      experience: "8 years",
      rating: 4.7,
      consultation_fee: 1200,
      image: "https://images.unsplash.com/photo-1594824475827-d0a30c4a9e4c?w=150&h=150&fit=crop&crop=faces",
      hospital: "Medify Skin Care",
      available: true
    },
    {
      id: "demo_3",
      name: "Dr. Amit Patel", 
      specialization: "General Medicine",
      experience: "12 years",
      rating: 4.6,
      consultation_fee: 1000,
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=faces",
      hospital: "Medify General Hospital",
      available: true
    }
  ]);

  // Booking form data
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    reason: '',
    symptoms: '',
    urgency: 'normal'
  });

  // Available time slots
  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  // Get next 7 days
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip Sundays
      if (date.getDay() !== 0) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })
        });
      }
    }
    return dates;
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setBookingStep(2);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingData.date || !bookingData.time || !bookingData.reason) {
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
        doctor_id: selectedDoctor.id,
        doctor_name: selectedDoctor.name,
        doctor_specialization: selectedDoctor.specialization,
        appointment_date: bookingData.date,
        appointment_time: bookingData.time,
        reason: bookingData.reason,
        symptoms: bookingData.symptoms,
        urgency: bookingData.urgency,
        consultation_fee: selectedDoctor.consultation_fee,
        status: 'pending'
      };

      const response = await fetch(`${API_BASE_URL}/api/appointments/book`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Appointment booked successfully!');
        navigate('/appointments');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Error booking appointment');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (bookingStep === 2) {
      setBookingStep(1);
      setSelectedDoctor(null);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {bookingStep === 1 ? 'Select Doctor' : 'Book Appointment'}
            </h1>
            <p className="text-gray-600 mt-1">
              {bookingStep === 1 ? 'Choose a doctor for your appointment' : `Booking with ${selectedDoctor?.name}`}
            </p>
          </div>
          <button
            onClick={goBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Back
          </button>
        </div>

        {/* Step 1: Doctor Selection */}
        {bookingStep === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => handleDoctorSelect(doctor)}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg">{doctor.name}</h3>
                    <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                    <p className="text-sm text-gray-500">{doctor.hospital}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <AcademicCapIcon className="h-4 w-4" />
                    <span>{doctor.experience} experience</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CurrencyRupeeIcon className="h-4 w-4" />
                    <span>₹{doctor.consultation_fee} consultation</span>
                  </div>
                </div>

                <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                  Select Doctor
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Step 2: Booking Details */}
        {bookingStep === 2 && selectedDoctor && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Selected Doctor</h3>
              <div className="flex items-center space-x-4">
                <img
                  src={selectedDoctor.image}
                  alt={selectedDoctor.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-800">{selectedDoctor.name}</p>
                  <p className="text-blue-600 text-sm">{selectedDoctor.specialization}</p>
                  <p className="text-gray-500 text-sm">₹{selectedDoctor.consultation_fee}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleBookingSubmit} className="bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarIcon className="h-4 w-4 inline mr-1" />
                    Appointment Date *
                  </label>
                  <select
                    value={bookingData.date}
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Date</option>
                    {getAvailableDates().map((date) => (
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
                    Appointment Time *
                  </label>
                  <select
                    value={bookingData.time}
                    onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Time</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reason */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit *
                </label>
                <input
                  type="text"
                  value={bookingData.reason}
                  onChange={(e) => setBookingData({...bookingData, reason: e.target.value})}
                  placeholder="e.g., Regular checkup, chest pain, consultation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Symptoms */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Symptoms (Optional)
                </label>
                <textarea
                  value={bookingData.symptoms}
                  onChange={(e) => setBookingData({...bookingData, symptoms: e.target.value})}
                  placeholder="Describe your current symptoms..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Urgency */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level
                </label>
                <select
                  value={bookingData.urgency}
                  onChange={(e) => setBookingData({...bookingData, urgency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors font-medium"
              >
                {loading ? 'Booking...' : `Book Appointment - ₹${selectedDoctor.consultation_fee}`}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;
