import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase.config';
import { Session, User as SupabaseUser, AuthError } from '@supabase/supabase-js';
import axios from 'axios';

// Interfaz para el usuario
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  token: string;
}

// Interfaz para el contexto de autenticación
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isEmailVerified: () => boolean;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

// Proveedor del contexto
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Configurar el token de autenticación para las solicitudes API
  useEffect(() => {
    if (currentUser?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${currentUser.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [currentUser]);

  // Observar cambios en el estado de autenticación
  useEffect(() => {
    // Obtener la sesión inicial
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSessionData(session);
      setLoading(false);
    };

    getInitialSession();

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionData(session);
    });

    // Función para procesar los datos de la sesión
    const setSessionData = (session: Session | null) => {
      if (session) {
        const user = session.user;
        setCurrentUser({
          uid: user.id,
          email: user.email,
          displayName: user.user_metadata?.displayName || user.email?.split('@')[0] || null,
          photoURL: user.user_metadata?.photoURL || null,
          token: session.access_token
        });
      } else {
        setCurrentUser(null);
      }
    };

    // Limpiar suscripción
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Función para registrar un nuevo usuario
  async function register(email: string, password: string, displayName: string) {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            displayName
          }
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  }

  // Función para iniciar sesión
  async function login(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }

  // Función para cerrar sesión
  async function logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  // Función para actualizar el perfil del usuario
  async function updateUserProfile(displayName: string, photoURL?: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          displayName,
          photoURL: photoURL || currentUser?.photoURL
        }
      });
      
      if (error) throw error;
      
      // Actualizar el estado local
      if (currentUser && data.user) {
        setCurrentUser({
          ...currentUser,
          displayName,
          photoURL: photoURL || currentUser.photoURL
        });
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  }

  // Función para iniciar sesión con Google
  async function loginWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      throw error;
    }
  }

  // Función para enviar correo de restablecimiento de contraseña
  async function resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error al enviar correo de restablecimiento:', error);
      throw error;
    }
  }

  // Función para enviar correo de verificación
  async function verifyEmail() {
    // En Supabase, esto se maneja automáticamente al registrarse
    // Esta función se mantiene por compatibilidad
    console.log('La verificación de correo se maneja automáticamente en Supabase');
    return Promise.resolve();
  }

  // Función para actualizar la contraseña del usuario
  async function updateUserPassword(currentPassword: string, newPassword: string) {
    try {
      // Primero reautenticamos al usuario
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email: currentUser?.email || '',
        password: currentPassword
      });
      
      if (signInError) throw new Error('Contraseña actual incorrecta');
      
      // Luego actualizamos la contraseña
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      throw error;
    }
  }

  // Función para verificar si el correo está verificado
  function isEmailVerified() {
    // Supabase proporciona esta información en la sesión
    return supabase.auth.getSession().then(({ data }) => {
      return !!data.session?.user.email_confirmed_at;
    });
  }

  const value = {
    currentUser,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    verifyEmail,
    updateUserPassword,
    isEmailVerified
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}