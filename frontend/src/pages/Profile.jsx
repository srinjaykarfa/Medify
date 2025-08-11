import { useState, useEffect } from 'react';
import { UserCircleIcon, PencilIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import PageHeader from '../components/PageHeader';
import BASE_URL from '../config/api';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bloodGroup: '',
    allergies: '',
    medications: '',
    conditions: ''
  });

  // Load user details from MongoDB via API
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const response = await fetch(`${BASE_URL}/api/users/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setProfileData({
            name: userData.username || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || '',
            bloodGroup: userData.bloodGroup || '',
            allergies: userData.allergies || '',
            medications: userData.medications || '',
            conditions: userData.conditions || ''
          });
          setError('');
        } else {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.detail || 'Failed to fetch profile data');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Network error occurred while fetching profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }

      // Create FormData for the API request
      const formData = new FormData();
      formData.append('username', profileData.name);
      formData.append('email', profileData.email);
      formData.append('phone', profileData.phone);
      formData.append('address', profileData.address);
      formData.append('bloodGroup', profileData.bloodGroup);
      formData.append('allergies', profileData.allergies);
      formData.append('medications', profileData.medications);
      formData.append('conditions', profileData.conditions);

      const response = await fetch(`${BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        // Update localStorage for immediate UI updates
        localStorage.setItem('userName', profileData.name);
        localStorage.setItem('username', profileData.name);
        
        setIsEditing(false);
        setShowSuccessMessage(true);
        setError('');
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Network error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Success Message Toast */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg transform transition-all duration-500 ease-in-out">
          <CheckCircleIcon className="h-6 w-6 mr-2" />
          <span className="font-medium">Profile updated successfully!</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg">
          <span className="font-medium">{error}</span>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="My Profile"
          subtitle="Manage your personal information and health details"
        />

        {loading ? (
          <div className="mt-8 flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-4 text-gray-600">Loading profile...</span>
          </div>
        ) : (

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <UserCircleIcon className="h-20 w-20 text-white" />
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{profileData.name || 'User'}</h2>
                <p className="text-blue-600 font-medium">{profileData.email}</p>
                <div className="mt-6 w-full">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-blue-700 mb-2">Quick Info</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Blood Group:</span>
                        <span className="font-medium text-gray-900">{profileData.bloodGroup || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium text-gray-900">{profileData.phone || 'Not set'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                  <p className="text-gray-600 mt-1">Keep your information up to date</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <PencilIcon className="h-5 w-5 mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'Full Name', key: 'name', icon: '👤' },
                      { label: 'Email Address', key: 'email', icon: '📧' },
                      { label: 'Phone Number', key: 'phone', icon: '📱' },
                      { label: 'Address', key: 'address', icon: '🏠' },
                      { label: 'Blood Group', key: 'bloodGroup', icon: '🩸' },
                      { label: 'Allergies', key: 'allergies', icon: '⚠️' },
                      { label: 'Current Medications', key: 'medications', icon: '💊' },
                      { label: 'Medical Conditions', key: 'conditions', icon: '🏥' }
                    ].map(({ label, key, icon }) => (
                      <div key={key} className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                          <span className="mr-2">{icon}</span>
                          {label}
                        </label>
                        {key === 'address' ? (
                          <textarea
                            value={profileData[key]}
                            onChange={(e) =>
                              setProfileData({ ...profileData, [key]: e.target.value })
                            }
                            rows={3}
                            className="w-full rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 p-3 resize-none"
                            placeholder="Enter your complete address"
                          />
                        ) : (
                          <input
                            type={key === 'email' ? 'email' : 'text'}
                            value={profileData[key]}
                            onChange={(e) =>
                              setProfileData({ ...profileData, [key]: e.target.value })
                            }
                            className="w-full rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 p-3"
                            placeholder={`Enter your ${label.toLowerCase()}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Full Name', key: 'name', icon: '👤' },
                    { label: 'Email Address', key: 'email', icon: '📧' },
                    { label: 'Phone Number', key: 'phone', icon: '📱' },
                    { label: 'Address', key: 'address', icon: '🏠' },
                    { label: 'Blood Group', key: 'bloodGroup', icon: '🩸' },
                    { label: 'Allergies', key: 'allergies', icon: '⚠️' },
                    { label: 'Current Medications', key: 'medications', icon: '💊' },
                    { label: 'Medical Conditions', key: 'conditions', icon: '🏥' }
                  ].map(({ label, key, icon }) => (
                    <div key={key} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all duration-300">
                      <label className="flex items-center text-sm font-semibold text-gray-600 mb-2">
                        <span className="mr-2">{icon}</span>
                        {label}
                      </label>
                      <p className="text-lg font-medium text-gray-900 min-h-[1.5rem]">
                        {profileData[key] || <span className="text-gray-400 italic">Not provided</span>}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
