import { useState } from 'react';
import DoctorLayout from '../components/doctor/DoctorLayout';
import DoctorOverview from '../components/doctor/DoctorOverview';
import DoctorAppointments from '../components/doctor/DoctorAppointments';
import DoctorPatients from '../components/doctor/DoctorPatients';
import toast, { Toaster } from 'react-hot-toast';

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DoctorOverview />;
      case 'appointments':
        return <DoctorAppointments />;
      case 'patients':
        return <DoctorPatients />;
      case 'reports':
        return (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Reports Section</h2>
            <p className="text-gray-600 text-lg">Reports functionality coming soon...</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Analytics Section</h2>
            <p className="text-gray-600 text-lg">Analytics dashboard coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Settings Section</h2>
            <p className="text-gray-600 text-lg">Settings panel coming soon...</p>
          </div>
        );
      default:
        return <DoctorOverview />;
    }
  };

  return (
    <DoctorLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
      <Toaster position="top-right" />
    </DoctorLayout>
  );
};

export default DoctorDashboard;
