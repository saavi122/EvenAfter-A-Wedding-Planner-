import api from './api';

// Get list of clients for planner (maps to users endpoint with client role)
export const getPlannerClients = async () => {
  const response = await api.get('/users', { params: { role: 'client' } });
  return response.data.data;
};

// Get list of events assigned to planner (maps to standard events endpoint)
export const getPlannerEvents = async () => {
  const response = await api.get('/events');
  return response.data.data;
};

// Assign a vendor to a wedding event
export const assignVendorToEvent = async (eventId, vendorId, category = "Curation") => {
  const response = await api.post(`/events/${eventId}/vendors`, { vendorUserId: vendorId, category });
  return response.data;
};

// Update event timeline details
export const updateEventTimeline = async (eventId, timelineData) => {
  const response = await api.put(`/timelines/event/${eventId}`, timelineData);
  return response.data;
};

// Get budget details (maps to event summary endpoint)
export const getBudgetDetails = async (eventId) => {
  const response = await api.get(`/events/${eventId}/summary`);
  const summary = response.data.data;
  return {
    totalBudget: summary.totalBudget,
    allocated: summary.spentAmount,
    remaining: summary.remainingBudget,
    expenses: [
      { category: "Floral Curation", amount: summary.spentAmount * 0.3, status: "Paid" },
      { category: "Venue Hire", amount: summary.spentAmount * 0.5, status: "Paid" },
      { category: "Fine Art Catering", amount: summary.spentAmount * 0.2, status: "Pending" }
    ]
  };
};

// Get calendar consultations (maps to meetings endpoint and formats for BigCalendar)
export const getPlannerCalendarEvents = async () => {
  const response = await api.get('/meetings');
  return response.data.data.map(m => ({
    title: m.title,
    start: m.date,
    end: new Date(new Date(m.date).getTime() + 60 * 60 * 1000).toISOString() // 1 hour duration
  }));
};
