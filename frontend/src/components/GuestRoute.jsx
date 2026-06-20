import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b14] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
        return <Navigate to="/superadmin/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default GuestRoute;
