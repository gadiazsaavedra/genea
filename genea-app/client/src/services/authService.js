import api from './api';
import firebase from 'firebase/app';
import 'firebase/auth';

// Servicio para gestionar la autenticación
const authService = {
  // Inicializar Firebase (llamar al inicio de la aplicación)
  initFirebase: () => {
    // Configuración de Firebase (reemplazar con tus propias credenciales)
    const firebaseConfig = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID
    };
    
    // Inicializar Firebase solo si no está ya inicializado
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
  },

  // Registrar un nuevo usuario
  register: async (email, password, displayName) => {
    try {
      // Crear usuario en Firebase
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      
      // Actualizar el perfil del usuario
      await userCredential.user.updateProfile({
        displayName
      });
      
      // Obtener el token ID
      const token = await userCredential.user.getIdToken();
      
      // Guardar el token en localStorage
      localStorage.setItem('authToken', token);
      
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  // Iniciar sesión
  login: async (email, password) => {
    try {
      // Iniciar sesión en Firebase
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      
      // Obtener el token ID
      const token = await userCredential.user.getIdToken();
      
      // Guardar el token en localStorage
      localStorage.setItem('authToken', token);
      
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  // Iniciar sesión con Google
  loginWithGoogle: async () => {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const userCredential = await firebase.auth().signInWithPopup(provider);
      
      // Obtener el token ID
      const token = await userCredential.user.getIdToken();
      
      // Guardar el token en localStorage
      localStorage.setItem('authToken', token);
      
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  // Cerrar sesión
  logout: async () => {
    try {
      await firebase.auth().signOut();
      localStorage.removeItem('authToken');
    } catch (error) {
      throw error;
    }
  },

  // Restablecer contraseña
  resetPassword: async (email) => {
    try {
      await firebase.auth().sendPasswordResetEmail(email);
    } catch (error) {
      throw error;
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    return localStorage.getItem('authToken') !== null;
  },

  // Obtener el usuario actual
  getCurrentUser: () => {
    return firebase.auth().currentUser;
  }
};

export default authService;