import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data && res.data.success) {
          setUser(res.data.data.user);
          setProfile(res.data.data.profile);
          localStorage.setItem('user', JSON.stringify(res.data.data.user));
          localStorage.setItem('role', res.data.data.user.role);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('role');
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error("Session verification failed:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const login = async (email, password, role) => {
    try {
      const res = await api.post('/auth/login', { email, password, role });
      const result = res.data;
      if (!result || !result.success) {
        throw new Error(result?.message || 'Login failed');
      }

      const { user: loggedInUser, token } = result.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      localStorage.setItem('role', loggedInUser.role);
      setUser(loggedInUser);

      // Fetch /me to populate profile
      try {
        const meRes = await api.get('/auth/me');
        if (meRes.data && meRes.data.success) {
          setProfile(meRes.data.data.profile);
        }
      } catch (e) {
        console.error("Failed to fetch profile info:", e);
      }

      return result.data.user;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(errorMsg);
    }
  };

  const register = async (name, email, phone, password, role, plan) => {
    try {
      const res = await api.post('/auth/register', { name, email, phone, password, role, plan });
      const result = res.data;
      if (!result || !result.success) {
        throw new Error(result?.message || 'Registration failed');
      }
      return result.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(errorMsg);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error("Logout backend call failed:", e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      setUser(null);
      setProfile(null);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data && res.data.success) {
        setUser(res.data.data.user);
        setProfile(res.data.data.profile);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
        localStorage.setItem('role', res.data.data.user.role);
      }
    } catch (error) {
      console.error("Profile refresh failed:", error);
    }
  };

  const value = {
    user,
    profile,
    loading,
    login,
    register,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
