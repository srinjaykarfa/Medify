import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CurrencyRupeeIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:8000';

const AppointmentBooking = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Medical categories
  const categories = [
    { key: 'all', label: 'All Doctors', count: 0 },
    { key: 'cardiology', label: 'Cardiology', count: 0 },
    { key: 'dermatology', label: 'Dermatology', count: 0 },
    { key: 'neurology', label: 'Neurology', count: 0 },
    { key: 'pediatrics', label: 'Pediatrics', count: 0 },
    { key: 'orthopedics', label: 'Orthopedics', count: 0 },
    { key: 'general', label: 'General Medicine', count: 0 },
    { key: 'psychiatry', label: 'Psychiatry', count: 0 },
    { key: 'gynecology', label: 'Gynecology', count: 0 }
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, selectedCategory, searchTerm]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        toast.error('Please login to view doctors');
        navigate('/signin');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/appointments/doctors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.doctors) {
          if (data.doctors.length === 0) {
            // Show demo doctors if no approved doctors found
            const mockDoctors = [
              {
                id: "demo_1",
                name: "Dr. Rajesh Kumar",
                specialization: "Cardiology",
                experience: "10 years",
                rating: 4.8,
                consultation_fee: 1500,
                image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=faces",
                hospital: "Medify Heart Center",
                phone: "+91-9876543210",
                email: "dr.rajesh@medify.com",
                languages: ["Hindi", "English"],
                qualifications: "MBBS, MD (Cardiology)",
                available: true,
                next_available: "Today 2:00 PM"
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
                phone: "+91-9876543211",
                email: "dr.priya@medify.com",
                languages: ["Hindi", "English"],
                qualifications: "MBBS, MD (Dermatology)",
                available: true,
                next_available: "Today 3:30 PM"
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
                phone: "+91-9876543212",
                email: "dr.amit@medify.com",
                languages: ["Hindi", "English", "Gujarati"],
                qualifications: "MBBS, MD (Internal Medicine)",
                available: true,
                next_available: "Tomorrow 9:00 AM"
              }
            ];
            setDoctors(mockDoctors);
            toast.info('Showing demo doctors. Admin needs to approve real doctors.');
          } else {
            // Transform API data to match component structure
            const transformedDoctors = data.doctors.map(doctor => ({
              id: doctor.id,
              name: doctor.name,
              specialization: doctor.specialization,
              experience: `${doctor.experience} years`,
              rating: 4.5, // Default rating since not in API
              consultation_fee: doctor.consultation_fee,
              image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=faces", // Default image
              hospital: "Medify Hospital", // Default hospital
              phone: "+91-9876543210", // Default phone
              email: doctor.email,
              languages: ["Hindi", "English"], // Default languages
              qualifications: doctor.license_number || "MBBS, MD",
              available: true,
              next_available: "Today 2:00 PM", // Default availability
              available_days: doctor.available_days,
              available_time: doctor.available_time
            }));
            setDoctors(transformedDoctors);
            toast.success(`Found ${transformedDoctors.length} approved doctors`);
          }
        } else {
          toast.error('Invalid response format');
          setDoctors([]);
        }
      } else if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.clear();
        navigate('/signin');
      } else {
        toast.error('Failed to fetch doctors');
        setDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Error loading doctors');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doctor => 
        doctor.specialization.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDoctors(filtered);
  };

  const getCategoryCount = (categoryKey) => {
    if (categoryKey === 'all') return doctors.length;
    return doctors.filter(doctor => 
      doctor.specialization.toLowerCase().includes(categoryKey.toLowerCase())
    ).length;
  };

  const handleBookAppointment = (doctor) => {
    // Navigate to booking details with selected doctor
    navigate('/appointments/book-details', { state: { doctor } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Book Appointment</h1>
          <p className="text-gray-600">Find and book appointments with our verified doctors</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctors, specializations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Specializations</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const count = getCategoryCount(category.key);
              return (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-4 py-2 rounded-full transition-all duration-200 ${
                    selectedCategory === category.key
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50'
                  }`}
                >
                  {category.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading approved doctors...</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No doctors found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or category filter.' 
                : 'No approved doctors available. Please contact admin.'}
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="text-blue-500 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-200"
              >
                {/* Doctor Photo & Basic Info */}
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg">{doctor.name}</h3>
                    <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{doctor.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Doctor Details */}
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <AcademicCapIcon className="h-4 w-4" />
                    <span>{doctor.experience}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{doctor.hospital}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CurrencyRupeeIcon className="h-4 w-4" />
                    <span>₹{doctor.consultation_fee}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="h-4 w-4" />
                    <span>{doctor.phone}</span>
                  </div>
                </div>

                {/* Qualifications */}
                <div className="mb-4">
                  <span className="text-xs font-medium text-gray-500">Qualifications:</span>
                  <p className="text-sm text-gray-700">{doctor.qualifications}</p>
                </div>

                {/* Languages */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {doctor.languages?.map((lang, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Availability Status */}
                <div className="mb-4">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    doctor.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {doctor.available ? `Available: ${doctor.next_available}` : 'Not Available'}
                  </span>
                </div>

                {/* Book Button */}
                <button
                  onClick={() => handleBookAppointment(doctor)}
                  disabled={!doctor.available}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    doctor.available
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {doctor.available ? 'Book Appointment' : 'Not Available'}
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Summary */}
        {!loading && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Showing {filteredDoctors.length} of {doctors.length} approved doctors
              {selectedCategory !== 'all' && ` in ${categories.find(c => c.key === selectedCategory)?.label}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentBooking;
