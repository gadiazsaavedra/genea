import axios from 'axios';
import { supabase } from '../config/supabase.config';

// Configuración base de axios
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para añadir el token de autenticación a las solicitudes
api.interceptors.request.use(
  async (config) => {
    // Obtener la sesión actual de Supabase
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    
    if (session) {
      config.headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores de autenticación (401)
    if (error.response && error.response.status === 401) {
      // Cerrar sesión en Supabase
      supabase.auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;