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
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google`, { credential });
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    loginWithGoogle,
    logout,
    isAuthenticated: !!token,
  }), [user, token, loading, loginWithGoogle, logout]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
