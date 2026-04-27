import { createContext, useContext, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const guestRegister = async (firstName, lastName) => {
    const { data } = await api.post('/auth/guest/register', { firstName, lastName });
    localStorage.setItem('token', data.token);
    localStorage.setItem('guestToken', data.userId);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const hostRegister = async (formData) => {
    const { data } = await api.post('/auth/host/register', formData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const hostLogin = async (email, password) => {
    const { data } = await api.post('/auth/host/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const adminLogin = async (email, password) => {
    const { data } = await api.post('/auth/admin/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('guestToken');
    setUser(null);
  };

  const isAdmin = user?.role === 'Admin' || user?.role === 'SuperAdmin';
  const isSuperAdmin = user?.role === 'SuperAdmin';
  const isHost = user?.role === 'Host';
  const guestToken = localStorage.getItem('guestToken');

  return (
    <AuthContext.Provider value={{ user, guestRegister, hostRegister, hostLogin, adminLogin, logout, isAdmin, isSuperAdmin, isHost, guestToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
