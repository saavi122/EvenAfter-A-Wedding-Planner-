import api from './api';

// Get list of vendors for marketplace
export const getVendors = async (filters = {}) => {
  const response = await api.get('/vendors', { params: filters });
  return response.data.data;
};

// Book a vendor for an event
export const bookVendor = async (vendorId, details) => {
  const response = await api.post(`/vendors/${vendorId}/book`, details);
  return response.data;
};

// Get vendor's own services
export const getMyServices = async () => {
  const response = await api.get('/vendors/my-services');
  return response.data.data;
};

// Add a service
export const addService = async (serviceData) => {
  const response = await api.post('/vendors/services', serviceData);
  return response.data;
};

// Edit an existing service
export const editService = async (serviceId, serviceData) => {
  const response = await api.put(`/vendors/services/${serviceId}`, serviceData);
  return response.data;
};

// Delete service
export const deleteService = async (serviceId) => {
  const response = await api.delete(`/vendors/services/${serviceId}`);
  return response.data;
};

// Get booking requests for a vendor
export const getBookingRequests = async () => {
  const response = await api.get('/vendors/bookings');
  return response.data.data;
};

// Update booking invitation status
export const updateBookingStatus = async (bookingId, status) => {
  const response = await api.patch(`/vendors/bookings/${bookingId}`, { status });
  return response.data;
};

// Get payments ledger
export const getPayments = async () => {
  const response = await api.get('/vendors/payments');
  return response.data.data;
};

// Get review testimonials
export const getReviews = async () => {
  const response = await api.get('/vendors/reviews');
  return response.data.data;
};
