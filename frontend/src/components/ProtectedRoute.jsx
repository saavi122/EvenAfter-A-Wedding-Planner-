import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory dark:bg-darkbg flex items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-rosegold/30 border-t-rosegold dark:border-goldAccent/30 dark:border-t-goldAccent rounded-full animate-spin"></div>
          <p className="mt-4 font-playfair text-xs tracking-widest text-darktext/60 dark:text-gray-400 uppercase animate-pulse">
            Loading your registry...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const dashboardMap = {
      superadmin: '/admin/dashboard',
      planner: '/planner/dashboard',
      vendor: '/vendor/dashboard',
      client: '/client/dashboard',
    };
    const redirectPath = dashboardMap[user.role] || '/';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
