import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;