import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext.jsx';

// Protected route component that checks for authentication
const ProtectedRoute = ({
  redirectPath = '/login', // Default redirect path
  requiredPermission = null // Optional specific permission requirement
}) => {
  const { isAuthenticated, user } = useAuth();
  
  // First check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to={redirectPath} replace />;
  }
  
  // If a specific permission is required, check if user has that permission
  if (requiredPermission && user?.permissions) {
    const hasPermission = user.permissions.includes(requiredPermission);
    if (!hasPermission) {
      // Redirect to dashboard or another appropriate page if permission denied
      return <Navigate to="/admin-dashboard" replace />;
    }
  }
  
  // If authenticated and has required permissions, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;