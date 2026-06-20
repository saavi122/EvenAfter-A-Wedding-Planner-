import api from './api';

// Get list of all platform users
export const getAdminUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data.data;
};

// Update status (suspend/activate) of user accounts
export const updateUserStatus = async (userId, status) => {
  const response = await api.patch(`/admin/users/${userId}`, { status });
  return response.data;
};

// Get list of pending vendor registrations
export const getPendingVendors = async () => {
  const response = await api.get('/admin/vendors/pending');
  return response.data.data;
};

// Approve/decline vendor accounts
export const approveVendorStatus = async (vendorId, isApproved) => {
  const response = await api.patch(`/admin/vendors/${vendorId}/verify`, { isApproved });
  return response.data;
};

// Get platform operations audit trails
export const getAuditLogs = async () => {
  const response = await api.get('/admin/audit-logs');
  return response.data.data;
};
