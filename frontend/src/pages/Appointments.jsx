import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  ClockIcon,
  XMarkIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import DoctorCard from '../components/DoctorCard';
import toast from 'react-hot-toast';

const specializations = [
  "All",
  "Cardiologist",
  "Dermatologist",
  "Orthopedic",
  "Pediatrician",
  "Neurologist",
  "Psychiatrist",
  "Dentist",
];

const Appointments = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Authentication check
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userRole = localStorage.getItem('userRole');
    
    if (!isAuthenticated || userRole !== 'patient') {
      navigate('/signin');
      return;
    }
  }, [navigate]);

  // Fetch my appointments
  const fetchMyAppointments = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch('http://localhost:8000/api/users/my-appointments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  }, []);

  // Fetch approved doctors from API
  const fetchApprovedDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/approved-doctors');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Approved doctors:', data);
        
        // Transform backend data to frontend format
        const transformedDoctors = data.map(doctor => ({
          id: doctor._id || doctor.id,
          name: doctor.full_name || doctor.name,
          specialization: doctor.specialization || 'General Practitioner',
          experience: doctor.experience || 'N/A',
          rating: doctor.rating || 4.5,
          image: doctor.profile_image || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 50)}.jpg`,
          availableSlots: doctor.available_slots || ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"],
          isAvailable: true,
          consultationFee: doctor.consultation_fee || "₹1000",
          languages: doctor.languages || ["Hindi", "English"],
          hospital: doctor.hospital || doctor.clinic_name || "Healthcare Center",
          isDropInAvailable: doctor.drop_in_available || true,
          email: doctor.email,
          phone: doctor.phone_number,
          qualification: doctor.qualification,
          verified: doctor.verification_status === 'approved'
        }));
        
        setDoctors(transformedDoctors);
        setError(null);
      } else {
        console.error('Failed to fetch approved doctors');
        setError('Failed to load doctors. Please try again.');
        setDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching approved doctors:', error);
      setError('Network error. Please check your connection.');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApprovedDoctors();
    fetchMyAppointments();
  }, [fetchApprovedDoctors, fetchMyAppointments]);

  const filteredDoctors = selectedFilter === "All" 
    ? doctors 
    : doctors.filter(doctor => doctor.specialization === selectedFilter);

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token');
      if (!token) {
        toast.error('Please login to book appointment');
        navigate('/signin');
        return;
      }

      const appointmentData = {
        doctor_id: selectedDoctor.id,
        doctor_name: selectedDoctor.name,
        date: selectedDate,
        time: selectedTime,
        symptoms: symptoms || '',
        consultation_fee: selectedDoctor.consultationFee,
        appointment_type: 'scheduled'
      };

      const response = await fetch('http://localhost:8000/api/users/book-appointment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Appointment booked successfully!');
        setShowBookingModal(false);
        setSelectedDoctor(null);
        setSelectedDate("");
        setSelectedTime("");
        setSymptoms("");
        fetchMyAppointments(); // Refresh appointments list
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading approved doctors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-gray-600 text-lg">{error}</p>
          <button 
            onClick={fetchApprovedDoctors}
            className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">Book Appointment</h1>
          <p className="text-gray-600 text-lg">Find and book appointments with verified doctors</p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {specializations.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedFilter(spec)}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${
                  selectedFilter === spec
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-blue-700 mb-2">No Approved Doctors Found</h3>
            <p className="text-gray-600">
              {selectedFilter === "All" 
                ? "No doctors have been approved by admin yet. Please check back later."
                : `No approved doctors found for ${selectedFilter}. Try selecting "All" or another specialization.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onBookAppointment={() => handleDoctorSelect(doctor)}
              />
            ))}
          </div>
        )}

        {/* My Appointments Section */}
        {appointments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100">
            <h2 className="text-2xl font-bold text-blue-700 mb-6">My Appointments</h2>
            
            {/* Upcoming Appointments */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-blue-600 mb-4">Upcoming Appointments</h3>
              <div className="space-y-4">
                {appointments
                  .filter(apt => new Date(apt.date) >= new Date())
                  .map((appointment, index) => (
                    <div key={index} className="border border-blue-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:bg-blue-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-3 rounded-xl">
                            <CalendarIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-blue-700">{appointment.doctor_name}</h4>
                            <p className="text-sm text-gray-600">{appointment.date} at {appointment.time}</p>
                            {appointment.symptoms && (
                              <p className="text-sm text-gray-500">Symptoms: {appointment.symptoms}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            {appointment.status || 'Confirmed'}
                          </span>
                          <p className="text-sm text-gray-600 mt-1">{appointment.consultation_fee}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Past Appointments */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Past Appointments</h3>
              <div className="space-y-4">
                {appointments
                  .filter(apt => new Date(apt.date) < new Date())
                  .map((appointment, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 opacity-75">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gray-100 p-2 rounded-full">
                            <ClockIcon className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{appointment.doctor_name}</h4>
                            <p className="text-sm text-gray-600">{appointment.date} at {appointment.time}</p>
                            {appointment.symptoms && (
                              <p className="text-sm text-gray-500">Symptoms: {appointment.symptoms}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Completed
                          </span>
                          <p className="text-sm text-gray-600 mt-1">{appointment.consultation_fee}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && selectedDoctor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-blue-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-blue-700">Book Appointment</h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-1">
                    Doctor
                  </label>
                  <p className="text-blue-600 font-semibold">{selectedDoctor.name}</p>
                  <p className="text-sm text-gray-600">{selectedDoctor.specialization}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border-2 border-blue-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-1">
                    Time *
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full p-3 border-2 border-blue-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    required
                  >
                    <option value="">Select time</option>
                    {selectedDoctor.availableSlots?.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Symptoms / Notes
                  </label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Describe your symptoms or reason for visit..."
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600">
                    Consultation Fee: <span className="font-medium">{selectedDoctor.consultationFee}</span>
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBookAppointment}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
