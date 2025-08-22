import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authApi.login({ email, password });
      const { token, nombre, email: userEmail, rol } = response.data;
      
      console.log('Login response:', response.data);
      console.log('Rol recibido:', rol);
      
      const userData = { nombre, email: userEmail, rol };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      console.log('Usuario establecido:', userData);
      console.log('isAdmin():', isAdmin());
      
      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al iniciar sesión' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('token');
  };

  const isAdmin = () => {
    const isAdminResult = user?.rol === 'Administrador' || 
                         user?.rol === 'Supervisor' || 
                         user?.rol === 'Empleado';
    console.log('isAdmin check - user.rol:', user?.rol, 'result:', isAdminResult);
    return isAdminResult;
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};