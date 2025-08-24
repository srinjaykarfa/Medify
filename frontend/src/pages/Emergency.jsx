import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import EmergencyContacts from '../components/EmergencyContacts';
import FacilityList from '../components/FacilityList';
import SearchFilters from '../components/SearchFilters';
import VoiceCommand from '../components/VoiceCommand';
import EmergencyIcon from '../components/EmergencyIcon';
import EmergencyMap from '../components/EmergencyMap';
import BASE_URL from '../config/api';
import toast, { Toaster } from 'react-hot-toast';

const Emergency = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchRadius, setSearchRadius] = useState(10);
  const [showMap, setShowMap] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', number: '' });
  const [editIndex, setEditIndex] = useState(null);
  const [userLocation, setUserLocation] = useState('');
  const [emergencyType, setEmergencyType] = useState('general');
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const toggleMap = () => setShowMap((prev) => !prev);

  // Function to search hospitals based on location
  const searchHospitalsByLocation = useCallback(async (location, emergency_type = 'general') => {
    if (!location || location.trim() === '') {
      toast.error('Please enter a location');
      return;
    }

    setIsSearching(true);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/api/emergency/find-hospitals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: location.trim(),
          emergency_type: emergency_type,
          radius_km: searchRadius
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform data to match our existing facility structure
      const transformedFacilities = data.hospitals.map(hospital => ({
        id: Math.random().toString(36).substr(2, 9),
        name: hospital.name,
        address: hospital.address,
        status: hospital.available_beds > 10 ? 'available' : 
                hospital.available_beds > 0 ? 'partial' : 'full',
        bedsAvailable: hospital.available_beds || 0,
        phone: hospital.phone,
        rating: hospital.rating || 4.0,
        openHours: "24/7",
        distance: hospital.distance_km,
        lat: hospital.lat,
        lng: hospital.lng,
        emergency_services: hospital.emergency_services
      }));

      setFacilities(transformedFacilities);
      setEmergencyContacts(data.emergency_contacts);
      
      toast.success(`Found ${transformedFacilities.length} hospitals near ${data.location_found}`);
      
    } catch (error) {
      console.error('Error searching hospitals:', error);
      setError('Failed to search hospitals. Please try again.');
      toast.error('Failed to search hospitals. Please try again.');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [searchRadius]);

  // Function to get current location and search automatically
  const getCurrentLocationAndSearch = useCallback(() => {
    if (navigator.geolocation) {
      setIsSearching(true);
      toast.loading('Getting your location...');
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Use coordinates directly for better accuracy
            const locationName = `${latitude}, ${longitude}`;
            setUserLocation(locationName);
            
            toast.dismiss();
            toast.loading('Finding nearby hospitals...');
            
            await searchHospitalsByLocation(locationName, emergencyType);
            
            toast.dismiss();
          } catch (error) {
            console.error('Location search error:', error);
            toast.dismiss();
            toast.error('Error finding hospitals near your location');
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.dismiss();
          
          let errorMessage = 'Unable to get your location. ';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please allow location access and try again.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += 'Please enter your location manually.';
              break;
          }
          
          toast.error(errorMessage);
          setIsSearching(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser');
    }
  }, [searchHospitalsByLocation, emergencyType]);

  // Auto-detect location on component mount
  useEffect(() => {
    // Automatically get user location when component loads
    if (navigator.geolocation) {
      getCurrentLocationAndSearch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Send emergency alert
  const sendEmergencyAlert = async () => {
    if (!userLocation) {
      toast.error('Please set your location first');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/emergency/emergency-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: userLocation,
          emergency_type: emergencyType,
          radius_km: searchRadius
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Emergency alert sent! Alert ID: ${data.alert_id}`);
      } else {
        throw new Error('Failed to send alert');
      }
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      toast.error('Failed to send emergency alert');
    }
  };

  useEffect(() => {
    // Load contacts from localStorage
    const saved = localStorage.getItem('emergency_contacts');
    if (saved) setContacts(JSON.parse(saved));
    
    // Automatically get user's current location on page load
    getCurrentLocationAndSearch();
  }, [getCurrentLocationAndSearch]);

  useEffect(() => {
    // Save contacts to localStorage
    localStorage.setItem('emergency_contacts', JSON.stringify(contacts));
  }, [contacts]);

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newContact.name || !newContact.number) return;
    setContacts([...contacts, newContact]);
    setNewContact({ name: '', number: '' });
  };

  const handleDeleteContact = (idx) => {
    setContacts(contacts.filter((_, i) => i !== idx));
  };

  const handleEditContact = (idx) => {
    setEditIndex(idx);
    setNewContact(contacts[idx]);
  };

  const handleUpdateContact = (e) => {
    e.preventDefault();
    if (!newContact.name || !newContact.number) return;
    setContacts(contacts.map((c, i) => (i === editIndex ? newContact : c)));
    setEditIndex(null);
    setNewContact({ name: '', number: '' });
  };

  const filteredFacilities = facilities.filter(facility => {
    if (selectedStatus === 'all') return true;
    return facility.status === selectedStatus;
  });

  const handleCall = (number) => {
    window.location.href = `tel:${number}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading facilities</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800 font-sans relative">
      <Toaster position="top-right" />
      {/* Page Header */}
      <div className="bg-transparent py-12 px-8 border-b border-gray-200 text-center">
        <PageHeader
          title={<span className="text-red-600 text-5xl font-extrabold drop-shadow-xl">Emergency Services</span>}
          subtitle={<span className="text-gray-700 text-lg">Find nearby healthcare facilities and emergency contacts</span>}
        >
          {/* Emergency Search Section */}
          <div className="mt-8 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">🚨 Emergency Hospital Search</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Location Input */}
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="Enter your location..."
                    value={userLocation}
                    onChange={(e) => setUserLocation(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                
                {/* Emergency Type */}
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600 mb-1">Emergency Type</label>
                  <select
                    value={emergencyType}
                    onChange={(e) => setEmergencyType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="general">General Emergency</option>
                    <option value="cardiac">Heart Emergency</option>
                    <option value="trauma">Accident/Trauma</option>
                    <option value="stroke">Stroke</option>
                    <option value="pediatric">Child Emergency</option>
                    <option value="maternity">Pregnancy Emergency</option>
                  </select>
                </div>
                
                {/* Search Radius */}
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600 mb-1">Radius: {searchRadius} km</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row gap-3 justify-center">
                <button
                  onClick={() => searchHospitalsByLocation(userLocation, emergencyType)}
                  disabled={isSearching || !userLocation}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      🔍 Search Hospitals
                    </>
                  )}
                </button>
                
                <button
                  onClick={getCurrentLocationAndSearch}
                  disabled={isSearching}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  📍 Use My Location
                </button>
                
                <button
                  onClick={sendEmergencyAlert}
                  disabled={!userLocation}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  🚨 Send Alert
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
              <div className="flex flex-col bg-white p-6 rounded-xl shadow-2xl hover:scale-105 transition-transform duration-300">
                <label className="text-3xl font-extrabold text-blue-600 mb-4">Status Filter</label>
                <SearchFilters
                  selectedStatus={selectedStatus}
                  onStatusChange={setSelectedStatus}
                  searchRadius={searchRadius}
                  onRadiusChange={setSearchRadius}
                />
              </div>
              <div className="flex flex-col bg-white p-6 rounded-xl shadow-2xl hover:scale-105 transition-transform duration-300">
                <label className="text-3xl font-extrabold text-blue-600 mb-4">Search Radius</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(e.target.value)}
                    className="w-full"
                  />
                  <span className="text-xl font-semibold">{searchRadius} km</span>
                </div>
              </div>
            </div>
          </div>
        </PageHeader>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12 space-y-12">
        {/* Voice Command */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-200 rounded-xl shadow-xl p-8 border border-blue-300 animate-fade-in-up">
          <div className="flex items-center gap-6 mb-4">
            <div className="p-4 bg-blue-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6h13M5 6h.01M5 12h.01M5 18h.01" />
              </svg>
            </div>
            <h2 className="text-4xl font-extrabold text-blue-600 drop-shadow-xl">Voice Command</h2>
          </div>
          <VoiceCommand onCall={handleCall} />
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-200 animate-fade-in-up hover:scale-105 transition-transform duration-300">
          <h2 className="text-4xl font-extrabold text-blue-600 drop-shadow-xl mb-6">Emergency Contacts</h2>
          
          {/* API Emergency Contacts */}
          {emergencyContacts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Regional Emergency Numbers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-red-800">{contact.name}</h4>
                        <p className="text-sm text-gray-600">{contact.type}</p>
                        <p className="text-lg font-mono text-gray-800">{contact.number}</p>
                      </div>
                      <button
                        onClick={() => handleCall(contact.number)}
                        className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        📞 Call
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <EmergencyContacts />
        </div>

        {/* Facility List */}
        <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-200 animate-fade-in-up hover:scale-105 transition-transform duration-300">
          <h2 className="text-4xl font-extrabold text-blue-600 drop-shadow-xl mb-6">Available Facilities</h2>
          
          {facilities.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🏥</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Finding Hospitals Near You...</h3>
              <p className="text-gray-500 mb-4">
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    Automatically detecting your location and searching for nearby hospitals...
                  </>
                ) : (
                  "We're finding hospitals based on your current location. If no results appear, try entering your location manually."
                )}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
                <ol className="text-blue-700 text-sm space-y-1">
                  <li>📍 We automatically detect your current location</li>
                  <li>🏥 Find real hospitals within {searchRadius}km radius</li>
                  <li>📞 Get actual contact numbers and addresses</li>
                  <li>🚨 Emergency contacts for your area</li>
                </ol>
              </div>
            </div>
          ) : (
            <FacilityList
              facilities={filteredFacilities}
              selectedStatus={selectedStatus}
              searchRadius={searchRadius}
            />
          )}
        </div>

        {/* Embedded Google Map */}
        {showMap && (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 animate-fade-in-up hover:scale-105 transition-transform duration-300">
            <EmergencyMap facilities={filteredFacilities} />
          </div>
        )}

        {/* Emergency Contacts Section */}
        <div className="max-w-2xl mx-auto mt-8 mb-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Your Emergency Contacts</h2>
          <form onSubmit={editIndex === null ? handleAddContact : handleUpdateContact} className="flex flex-col md:flex-row gap-2 mb-4">
            <input
              type="text"
              placeholder="Name"
              value={newContact.name}
              onChange={e => setNewContact({ ...newContact, name: e.target.value })}
              className="border rounded-md px-3 py-2 flex-1"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={newContact.number}
              onChange={e => setNewContact({ ...newContact, number: e.target.value })}
              className="border rounded-md px-3 py-2 flex-1"
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
              {editIndex === null ? 'Add' : 'Update'}
            </button>
            {editIndex !== null && (
              <button type="button" onClick={() => { setEditIndex(null); setNewContact({ name: '', number: '' }); }} className="bg-gray-400 text-white px-4 py-2 rounded-md">Cancel</button>
            )}
          </form>
          <ul>
            {contacts.length === 0 && <li className="text-gray-500">No contacts added yet.</li>}
            {contacts.map((contact, idx) => (
              <li key={idx} className="flex items-center justify-between py-2 border-b">
                <span className="font-semibold">{contact.name}:</span>
                <span className="ml-2">{contact.number}</span>
                <div className="flex gap-2 ml-4">
                  <a href={`tel:${contact.number}`} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Call</a>
                  <button onClick={() => handleEditContact(idx)} className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500">Edit</button>
                  <button onClick={() => handleDeleteContact(idx)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Floating Map Toggle Button */}
      <EmergencyIcon onClick={toggleMap} />
    </div>
  );
};

export default Emergency;
