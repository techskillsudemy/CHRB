// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export default function ProtectedRoute({ children, allowedRoles, roles }) {
  const { session, loading, role } = useAuth();
  const permitted = allowedRoles || roles;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (permitted && !permitted.includes(role)) {
    if (role === 'super_admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/depot/saisie" replace />;
  }

  // If used as a layout route (no children), render Outlet
  return children || <Outlet />;
}
