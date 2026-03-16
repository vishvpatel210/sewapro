import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRole }) => {
  const { isAuthenticated, role } = useSelector(s => s.auth);
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (allowedRole && role !== allowedRole) {
    const redirect = role === 'client' ? '/client/dashboard' : role === 'admin' ? '/admin/dashboard' : '/worker/dashboard';
    return <Navigate to={redirect} replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
