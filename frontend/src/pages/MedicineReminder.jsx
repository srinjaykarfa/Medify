import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  PlusIcon,
  BellIcon,
  TrashIcon,
  CheckIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

const MedicineReminder = () => {
  const [medicines, setMedicines] = useState([
    {
      id: 1,
      name: 'Aspirin',
      dosage: '100mg',
      frequency: 'Daily',
      time: '08:00',
      taken: false,
      nextDue: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    },
    {
      id: 2,
      name: 'Vitamin D',
      dosage: '1000 IU',
      frequency: 'Daily',
      time: '09:00',
      taken: true,
      nextDue: new Date(Date.now() + 23 * 60 * 60 * 1000), // 23 hours from now
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    dosage: '',
    frequency: 'Daily',
    time: '08:00',
  });

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Check for due medicines every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      medicines.forEach(medicine => {
        if (!medicine.taken && medicine.nextDue <= now) {
          showNotification(medicine);
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [medicines]);

  const showNotification = (medicine) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Medicine Reminder', {
        body: `Time to take ${medicine.name} (${medicine.dosage})`,
        icon: '/favicon.ico',
        tag: `medicine-${medicine.id}`,
      });
    }
  };

  const addMedicine = () => {
    if (newMedicine.name && newMedicine.dosage) {
      const nextDue = new Date();
      const [hours, minutes] = newMedicine.time.split(':');
      nextDue.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // If time has passed today, set for tomorrow
      if (nextDue <= new Date()) {
        nextDue.setDate(nextDue.getDate() + 1);
      }

      const medicine = {
        id: Date.now(),
        ...newMedicine,
        taken: false,
        nextDue,
      };

      setMedicines([...medicines, medicine]);
      setNewMedicine({ name: '', dosage: '', frequency: 'Daily', time: '08:00' });
      setShowAddForm(false);
    }
  };

  const markAsTaken = (id) => {
    setMedicines(medicines.map(medicine => {
      if (medicine.id === id) {
        const nextDue = new Date(medicine.nextDue);
        nextDue.setDate(nextDue.getDate() + 1); // Next dose tomorrow
        return { ...medicine, taken: true, nextDue };
      }
      return medicine;
    }));
  };

  const removeMedicine = (id) => {
    setMedicines(medicines.filter(medicine => medicine.id !== id));
  };

  const formatTimeLeft = (nextDue) => {
    const now = new Date();
    const diff = nextDue - now;
    
    if (diff <= 0) return 'Due now!';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getDueMedicines = () => {
    const now = new Date();
    return medicines.filter(medicine => !medicine.taken && medicine.nextDue <= now);
  };

  const dueMedicines = getDueMedicines();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-blue-600 mb-2 flex items-center">
                <BellIcon className="h-8 w-8 mr-3" />
                Medicine Reminders
              </h1>
              <p className="text-gray-600 text-lg">
                Stay on track with your medication schedule
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Medicine</span>
            </button>
          </div>
        </motion.div>

        {/* Due Medicines Alert */}
        {dueMedicines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-800">Medicines Due Now!</h3>
                <p className="text-red-600">
                  {dueMedicines.length} medicine{dueMedicines.length > 1 ? 's' : ''} need{dueMedicines.length === 1 ? 's' : ''} to be taken
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Medicine List */}
        <div className="grid gap-4">
          {medicines.map((medicine, index) => (
            <motion.div
              key={medicine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-lg shadow-md p-6 border ${
                !medicine.taken && medicine.nextDue <= new Date()
                  ? 'border-red-300 bg-red-50'
                  : medicine.taken
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      !medicine.taken && medicine.nextDue <= new Date()
                        ? 'bg-red-100'
                        : medicine.taken
                        ? 'bg-green-100'
                        : 'bg-blue-100'
                    }`}>
                      {medicine.taken ? (
                        <CheckIcon className="h-5 w-5 text-green-600" />
                      ) : medicine.nextDue <= new Date() ? (
                        <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
                      ) : (
                        <ClockIcon className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{medicine.name}</h3>
                      <p className="text-gray-600">{medicine.dosage} • {medicine.frequency} at {medicine.time}</p>
                    </div>
                  </div>
                  <div className="mt-2 ml-10">
                    <p className={`text-sm ${
                      !medicine.taken && medicine.nextDue <= new Date()
                        ? 'text-red-600 font-semibold'
                        : medicine.taken
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }`}>
                      {medicine.taken 
                        ? '✓ Taken today' 
                        : `Next due: ${formatTimeLeft(medicine.nextDue)}`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!medicine.taken && (
                    <button
                      onClick={() => markAsTaken(medicine.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                    >
                      <CheckIcon className="h-4 w-4" />
                      <span>Take</span>
                    </button>
                  )}
                  <button
                    onClick={() => removeMedicine(medicine.id)}
                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {medicines.length === 0 && (
            <div className="text-center py-12">
              <BellIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No medicines added yet</h3>
              <p className="text-gray-500">Click "Add Medicine" to start tracking your medications</p>
            </div>
          )}
        </div>

        {/* Add Medicine Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Medicine</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medicine Name
                  </label>
                  <input
                    type="text"
                    value={newMedicine.name}
                    onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Aspirin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={newMedicine.dosage}
                    onChange={(e) => setNewMedicine({...newMedicine, dosage: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 100mg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select
                    value={newMedicine.frequency}
                    onChange={(e) => setNewMedicine({...newMedicine, frequency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newMedicine.time}
                    onChange={(e) => setNewMedicine({...newMedicine, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={addMedicine}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Medicine
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineReminder;
