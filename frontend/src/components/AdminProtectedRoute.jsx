import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  const userRole = localStorage.getItem('userRole');
  
  if (!isAuthenticated || userRole !== 'admin') {
    return <Navigate to="/admin-login" replace />;
  }
  
  return children;
};

export default AdminProtectedRoute;
