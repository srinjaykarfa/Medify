import { Navigate } from 'react-router-dom';              localStorage.removeItem('accessToken');
              localStorage.removeItem('userName');
              localStorage.removeItem('userRole');
              localStorage.removeItem('verificationStatus');
              localStorage.removeItem('isAuthenticated');const DoctorProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  const username = localStorage.getItem('userName');
  const userRole = localStorage.getItem('userRole');
  const verificationStatus = localStorage.getItem('verificationStatus');
  const isAuthenticated = localStorage.getItem('isAuthenticated');

  // Check if user is authenticated
  if (!token || !username) {
    return <Navigate to="/signin" />;
  }

  // Check if user is a doctor
  if (userRole !== 'doctor') {
    return <Navigate to="/" />;
  }

  // Check if doctor is verified
  if (verificationStatus !== 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Account Pending Verification</h3>
          <p className="text-gray-600 mb-6">
            Your doctor account is currently under review by our admin team. 
            You will receive an email notification once your account has been verified.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Status: <span className="font-medium text-yellow-600">
                {verificationStatus === 'pending' ? 'Pending Review' : 'Under Verification'}
              </span>
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('username');
                localStorage.removeItem('userRole');
                localStorage.removeItem('verificationStatus');
                window.location.href = '/signin';
              }}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default DoctorProtectedRoute;
