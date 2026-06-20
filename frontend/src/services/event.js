import api from './api';

// Create Wedding Request Event
export const createRequest = async (requestData) => {
  const response = await api.post('/events', requestData);
  const evt = response.data.data;
  return {
    ...evt,
    weddingType: evt.weddingType || evt.title,
    weddingDate: evt.weddingDate || (evt.eventDate ? evt.eventDate.split('T')[0] : ''),
    venuePreference: evt.venuePreference || evt.venue,
    budget: evt.budget || evt.totalBudget,
    specialRequirements: evt.specialRequirements || evt.description
  };
};

// Get list of events for the logged-in user
export const getMyEvents = async () => {
  const response = await api.get('/events/my-events');
  return response.data.data.map(evt => ({
    ...evt,
    weddingType: evt.weddingType || evt.title,
    weddingDate: evt.weddingDate || (evt.eventDate ? evt.eventDate.split('T')[0] : ''),
    venuePreference: evt.venuePreference || evt.venue,
    budget: evt.budget || evt.totalBudget,
    specialRequirements: evt.specialRequirements || evt.description
  }));
};

// Get tasks for a specific event
export const getTasks = async (eventId) => {
  const response = await api.get(`/events/${eventId}/tasks`);
  return response.data.data;
};

// Update task completion status
export const updateTaskStatus = async (taskId, status) => {
  const response = await api.patch(`/tasks/${taskId}`, { status });
  return response.data.data;
};

// Get meetings list
export const getMeetings = async () => {
  const response = await api.get('/meetings');
  return response.data.data;
};

// Get documents list
export const getDocuments = async () => {
  const response = await api.get('/documents');
  return response.data.data;
};

// Upload a document
export const uploadDocument = async (docName, docType, docSize, eventId = null) => {
  const response = await api.post('/documents/upload', { name: docName, type: docType, size: docSize, eventId });
  return response.data.data;
};
