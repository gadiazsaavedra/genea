const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Inicializar Firebase Admin
const initializeFirebaseAdmin = () => {
  // Si ya está inicializado, no hacer nada
  if (admin.apps.length) return;

  // Verificar si estamos en producción o desarrollo
  if (process.env.NODE_ENV === 'production') {
    // En producción, usar las credenciales de la variable de entorno
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    });
  } else {
    // En desarrollo, usar el archivo de credenciales local
    const serviceAccount = require('../../../firebase-service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  console.log('Firebase Admin inicializado correctamente');
};

module.exports = { initializeFirebaseAdmin };