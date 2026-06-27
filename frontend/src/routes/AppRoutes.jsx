import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Pricing from '../pages/Pricing';
import Billing from '../pages/Billing';

// Client Dashboard components
import ClientLayout from '../layouts/ClientLayout';
import ClientDashboard from '../pages/client/ClientDashboard';
import FindPlanners from '../pages/client/FindPlanners';
import PlannerProfile from '../pages/client/PlannerProfile';
import DirectChat from '../pages/client/DirectChat';
import ClientProfilePage from '../pages/client/ClientProfilePage';
import AITestPage from '../pages/client/AITestPage';

// Planner Dashboard components
import PlannerLayout from '../layouts/PlannerLayout';
import PlannerDashboard from '../pages/planner/PlannerDashboard';
import AvailableVendors from '../pages/planner/AvailableVendors';
import VendorProfile from '../pages/planner/VendorProfile';

// Vendor Dashboard components
import VendorLayout from '../layouts/VendorLayout';
import VendorDashboard from '../pages/vendor/VendorDashboard';

// Admin Dashboard components
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';

import GuestRoute from '../components/GuestRoute';
import ProtectedRoute from '../components/ProtectedRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={
        <GuestRoute>
          <Login />
        </GuestRoute>
      } />
      <Route path="/register" element={
        <GuestRoute>
          <Register />
        </GuestRoute>
      } />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/billing" element={<Billing />} />

      {/* Client Dashboard Routes */}
      <Route path="/client" element={
        <ProtectedRoute allowedRoles={['client']}>
          <ClientLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/client/dashboard" replace />} />
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="planners" element={<FindPlanners />} />
        <Route path="planners/:plannerId" element={<PlannerProfile />} />
        <Route path="vendors/:vendorId" element={<VendorProfile />} />
        <Route path="chat/:plannerId" element={<DirectChat />} />
        <Route path="profile" element={<ClientProfilePage />} />
        <Route path="ai-test" element={<AITestPage />} />
      </Route>

      {/* Planner Dashboard Routes */}
      <Route path="/planner" element={
        <ProtectedRoute allowedRoles={['planner']}>
          <PlannerLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/planner/dashboard" replace />} />
        <Route path="dashboard" element={<PlannerDashboard />} />
        <Route path="vendors" element={<AvailableVendors />} />
        <Route path="vendors/:vendorId" element={<VendorProfile />} />
        <Route path="chat/:plannerId" element={<DirectChat />} />
      </Route>

      {/* Vendor Dashboard Routes */}
      <Route path="/vendor" element={
        <ProtectedRoute allowedRoles={['vendor']}>
          <VendorLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/vendor/dashboard" replace />} />
        <Route path="dashboard" element={<VendorDashboard />} />
        <Route path="planners/:plannerId" element={<PlannerProfile />} />
        <Route path="chat/:plannerId" element={<DirectChat />} />
      </Route>

      {/* Admin Dashboard Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['superadmin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
