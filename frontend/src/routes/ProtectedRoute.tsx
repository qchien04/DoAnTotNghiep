import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      if (userRole === 'ROLE_ADMIN') {
        return <Navigate to="/admin" replace />;
      }
      if (userRole === 'ROLE_LANDLORD') {
        return <Navigate to="/landlord" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};
