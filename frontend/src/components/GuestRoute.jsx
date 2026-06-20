import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory dark:bg-darkbg flex items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-rosegold/30 border-t-rosegold dark:border-goldAccent/30 dark:border-t-goldAccent rounded-full animate-spin"></div>
          <p className="mt-4 font-playfair text-xs tracking-widest text-darktext/60 dark:text-gray-400 uppercase animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (user) {
    switch (user.role) {
      case "vendor":
        return <Navigate to="/vendor/dashboard" replace />;
      case "client":
        return <Navigate to="/client/dashboard" replace />;
      case "planner":
        return <Navigate to="/planner/dashboard" replace />;
      case "superadmin":
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default GuestRoute;
