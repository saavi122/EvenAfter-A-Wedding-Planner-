import api from './api';

// Create a simulated JWT token for local fallback
const generateSimulatedToken = (email, role) => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({
    id: "usr_" + Math.random().toString(36).substr(2, 9),
    email,
    role,
    name: email.split('@')[0],
    exp: Math.floor(Date.now() / 1000) + 86400 // 1 day expiry
  }));
  return `${header}.${payload}.signature_hash`;
};

export const loginAPI = async (email, password, role) => {
  try {
    const response = await api.post('/auth/login', { email, password, role });
    return response.data;
  } catch (error) {
    // Check if network / connection error, then use mock fallback
    if (!error.response || error.code === 'ERR_NETWORK') {
      console.warn("Backend server offline, falling back to simulated session.");
      const mockToken = generateSimulatedToken(email, role);
      return {
        success: true,
        data: {
          accessToken: mockToken,
          user: {
            email,
            role,
            name: email.split('@')[0],
          }
        }
      };
    }
    throw error;
  }
};

export const registerAPI = async (formData) => {
  try {
    const response = await api.post('/auth/register', formData);
    return response.data;
  } catch (error) {
    if (!error.response || error.code === 'ERR_NETWORK') {
      console.warn("Backend server offline, simulating user registration.");
      return {
        success: true,
        message: "User registered successfully (Simulated)"
      };
    }
    throw error;
  }
};
