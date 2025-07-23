const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Inicializar Firebase Admin
const initializeFirebaseAdmin = () => {
  // Si ya está inicializado, no hacer nada
  if (admin.apps.length) return;

  try {
    // Verificar si estamos en producción o desarrollo
    if (process.env.NODE_ENV === 'production') {
      // En producción, usar las credenciales de la variable de entorno
      if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT no está definido en las variables de entorno');
      }
      
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
      });
    } else {
      // En desarrollo, intentar usar el archivo de credenciales local
      try {
        const fs = require('fs');
        const path = require('path');
        const serviceAccountPath = path.join(__dirname, '../../../firebase-service-account.json');
        
        if (!fs.existsSync(serviceAccountPath)) {
          throw new Error(`Archivo de credenciales no encontrado: ${serviceAccountPath}`);
        }
        
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      } catch (error) {
        console.error('Error al cargar credenciales de Firebase:', error.message);
        console.error('Por favor, crea el archivo firebase-service-account.json o configura la variable de entorno FIREBASE_SERVICE_ACCOUNT');
        process.exit(1);
      }
    }

    console.log('Firebase Admin inicializado correctamente');
  } catch (error) {
    console.error('Error al inicializar Firebase Admin:', error.message);
    process.exit(1);
  }
};

module.exports = { initializeFirebaseAdmin };