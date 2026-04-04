import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  // Initialize axios interceptor to attach token to headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      
      if (token === 'demo-offline-token') {
        // Skip JWT validation for local offline demo token
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        // Simple expiry check
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          // Sync user state from localStorage but ensure role is fresh from JWT
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser({ ...parsedUser, role: decoded.role });
          }
        }
      } catch (err) {
        logout();
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, [token, logout]);

  const loginWithGoogle = useCallback(async (credential) => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    try {
      const response = await axios.post(`${apiUrl}/api/auth/google`, { credential });
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error('Full Google login error:', error);
      const status = error.response?.status;
      const serverError = error.response?.data?.error;
      const message = serverError ? `[${status}] ${serverError}` : error.message;
      return { success: false, error: `Login error: ${message}` };
    }
  }, []);

  const loginWithDemo = useCallback(async () => {
    try {
      const demoToken = 'demo-offline-token';
      const demoUser = {
        id: 'demo-user-id',
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'USER',
        profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'
      };
      
      setToken(demoToken);
      setUser(demoUser);
      localStorage.setItem('user', JSON.stringify(demoUser));
      // Intercept axios to use demo token locally
      axios.defaults.headers.common['Authorization'] = `Bearer ${demoToken}`;
      return { success: true };
    } catch (error) {
      console.error('Demo login error:', error);
      return { success: false, error: 'Demo login setup failed locally.' };
    }
  }, []);


  const value = useMemo(() => ({
    user,
    token,
    loading,
    loginWithGoogle,
    loginWithDemo,
    logout,
    isAuthenticated: !!token,
  }), [user, token, loading, loginWithGoogle, loginWithDemo, logout]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
