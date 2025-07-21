import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import axios from 'axios';

// Configuración de Firebase
const firebaseConfig = {
  // Aquí deberás colocar tu configuración de Firebase
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        
        setCurrentUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          token
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Función para registrar un nuevo usuario
  async function register(email: string, password: string, displayName: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualizar el perfil del usuario con el nombre
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName
        });
      }
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  }

  // Función para iniciar sesión
  async function login(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }

  // Función para cerrar sesión
  async function logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  // Función para actualizar el perfil del usuario
  async function updateUserProfile(displayName: string, photoURL?: string) {
    try {
      const user = auth.currentUser;
      if (user) {
        await updateProfile(user, {
          displayName,
          photoURL: photoURL || user.photoURL
        });
        
        // Actualizar el estado local
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            displayName,
            photoURL: photoURL || currentUser.photoURL
          });
        }
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  }

  // Función para iniciar sesión con Google
  async function loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      throw error;
    }
  }

  // Función para enviar correo de restablecimiento de contraseña
  async function resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error al enviar correo de restablecimiento:', error);
      throw error;
    }
  }

  // Función para enviar correo de verificación
  async function verifyEmail() {
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
      }
    } catch (error) {
      console.error('Error al enviar correo de verificación:', error);
      throw error;
    }
  }

  // Función para actualizar la contraseña del usuario
  async function updateUserPassword(currentPassword: string, newPassword: string) {
    try {
      const user = auth.currentUser;
      if (user && user.email) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
      }
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      throw error;
    }
  }

  // Función para verificar si el correo está verificado
  function isEmailVerified() {
    return auth.currentUser?.emailVerified || false;
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