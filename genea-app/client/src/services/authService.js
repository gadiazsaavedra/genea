import { supabase } from '../config/supabase.config';

// Servicio para gestionar la autenticación
const authService = {
  // Registrar un nuevo usuario
  register: async (email, password, displayName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            displayName
          }
        }
      });
      
      if (error) throw error;
      return data.user;
    } catch (error) {
      throw error;
    }
  },

  // Iniciar sesión
  login: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return data.user;
    } catch (error) {
      throw error;
    }
  },

  // Iniciar sesión con Google
  loginWithGoogle: async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Cerrar sesión
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  },

  // Restablecer contraseña
  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: async () => {
    const { data } = await supabase.auth.getSession();
    return data.session !== null;
  },

  // Obtener el usuario actual
  getCurrentUser: async () => {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },
  
  // Actualizar perfil de usuario
  updateProfile: async (userData) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: userData
      });
      
      if (error) throw error;
      return data.user;
    } catch (error) {
      throw error;
    }
  },
  
  // Cambiar contraseña
  changePassword: async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      return data.user;
    } catch (error) {
      throw error;
    }
  }
};

export default authService;