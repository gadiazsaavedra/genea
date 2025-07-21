# Guía de Despliegue de Genea

Esta guía explica cómo desplegar la aplicación Genea utilizando servicios gratuitos.

## Despliegue del Frontend

### Opción 1: Netlify (Recomendado)

1. Crea una cuenta en [Netlify](https://www.netlify.com/)
2. Conecta tu repositorio de GitHub
3. Configura el proyecto:
   - Build command: `npm run build`
   - Publish directory: `build`
4. Configura las variables de entorno en Netlify:
   - Copia las variables de `.env.example` y configúralas en la sección "Environment variables" de Netlify
   - Asegúrate de configurar `REACT_APP_API_URL` con la URL de tu backend

### Opción 2: Vercel

1. Crea una cuenta en [Vercel](https://vercel.com/)
2. Conecta tu repositorio de GitHub
3. Configura el proyecto:
   - Framework Preset: Create React App
4. Configura las variables de entorno en Vercel:
   - Copia las variables de `.env.example` y configúralas en la sección "Environment Variables" de Vercel

## Despliegue del Backend

### Opción 1: Render.com (Recomendado)

1. Crea una cuenta en [Render](https://render.com/)
2. Crea un nuevo Web Service
3. Conecta tu repositorio de GitHub
4. Configura el servicio:
   - Name: genea-api
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Configura las variables de entorno:
   - `NODE_ENV`: production
   - `PORT`: 10000
   - `MONGODB_URI`: tu URI de MongoDB Atlas
   - Variables de Firebase (ver abajo)

### Opción 2: Railway.app

1. Crea una cuenta en [Railway](https://railway.app/)
2. Crea un nuevo proyecto
3. Conecta tu repositorio de GitHub
4. Configura las variables de entorno:
   - `NODE_ENV`: production
   - `PORT`: 10000
   - `MONGODB_URI`: tu URI de MongoDB Atlas
   - Variables de Firebase (ver abajo)

## Base de Datos: MongoDB Atlas

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un nuevo cluster (tier gratuito)
3. Configura el acceso a la base de datos:
   - Crea un usuario de base de datos
   - Configura el acceso de red (IP Whitelist)
4. Obtén la URI de conexión y configúrala como `MONGODB_URI` en tu backend

## Almacenamiento: Firebase Storage

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Firebase Authentication y Storage
3. Configura las reglas de Storage para permitir acceso autenticado
4. Obtén las credenciales de Firebase:
   - En la configuración del proyecto, obtén las credenciales web
   - Configura estas credenciales en el frontend
5. Para el backend, genera una clave privada:
   - Ve a Configuración del proyecto > Cuentas de servicio
   - Genera una nueva clave privada
   - Configura las siguientes variables de entorno en tu backend:
     - `FIREBASE_PROJECT_ID`
     - `FIREBASE_PRIVATE_KEY`
     - `FIREBASE_CLIENT_EMAIL`

## Configuración de CORS

Para permitir que el frontend se comunique con el backend, asegúrate de configurar CORS correctamente en el backend:

```javascript
// En server/src/app.js o similar
const cors = require('cors');

// Configurar CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

## Verificación del Despliegue

1. Verifica que el frontend puede comunicarse con el backend
2. Prueba el registro e inicio de sesión
3. Verifica la subida de archivos a Firebase Storage
4. Prueba la visualización del árbol genealógico

## Optimización para Producción

1. Configura un dominio personalizado (opcional)
2. Configura HTTPS
3. Implementa un sistema de monitoreo (como Sentry para errores)
4. Configura copias de seguridad automáticas de la base de datos