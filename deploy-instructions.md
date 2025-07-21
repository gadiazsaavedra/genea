# Instrucciones para el despliegue de Genea

## 1. Crear un repositorio en GitHub

1. Ve a [GitHub](https://github.com) e inicia sesión
2. Haz clic en el botón "New" para crear un nuevo repositorio
3. Nombra el repositorio "genea"
4. Deja la descripción como "Sistema de Gestión de Árbol Genealógico"
5. Selecciona "Public" o "Private" según prefieras
6. Haz clic en "Create repository"

## 2. Subir el código al repositorio

```bash
# Inicializar el repositorio Git local
cd /Users/gustavo/Documents/develp/genea
git init

# Agregar todos los archivos
git add .

# Hacer el primer commit
git commit -m "Versión inicial de Genea"

# Agregar el repositorio remoto (reemplaza 'tu-usuario' con tu nombre de usuario de GitHub)
git remote add origin https://github.com/tu-usuario/genea.git

# Subir el código
git push -u origin main
```

## 3. Configurar MongoDB Atlas (Base de datos gratuita)

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) y regístrate o inicia sesión
2. Crea un nuevo proyecto llamado "Genea"
3. Crea un nuevo cluster gratuito (M0):
   - Selecciona el proveedor de nube (AWS, Google Cloud o Azure)
   - Selecciona una región cercana a tus usuarios
   - Mantén las opciones por defecto para el nivel gratuito
   - Haz clic en "Create Cluster"
4. Configura la seguridad:
   - En "Database Access", crea un nuevo usuario con permisos de lectura/escritura
   - En "Network Access", permite el acceso desde cualquier lugar (0.0.0.0/0) para desarrollo
5. Obtén la cadena de conexión:
   - Haz clic en "Connect" en tu cluster
   - Selecciona "Connect your application"
   - Copia la cadena de conexión (se verá así: `mongodb+srv://usuario:<password>@cluster0.xxxxx.mongodb.net/genea?retryWrites=true&w=majority`)
   - Reemplaza `<password>` con la contraseña del usuario que creaste

## 4. Configurar Firebase (Autenticación y almacenamiento gratuitos)

1. Ve a [Firebase Console](https://console.firebase.google.com/) e inicia sesión con tu cuenta de Google
2. Haz clic en "Agregar proyecto" y nombra el proyecto "genea"
3. Sigue los pasos para crear el proyecto (puedes desactivar Google Analytics si no lo necesitas)
4. Configura la autenticación:
   - En el menú lateral, ve a "Authentication"
   - Haz clic en "Get started"
   - Habilita el proveedor de "Email/Password"
5. Configura el almacenamiento (para fotos y documentos):
   - En el menú lateral, ve a "Storage"
   - Haz clic en "Get started"
   - Selecciona una ubicación para tus datos
   - Configura las reglas de seguridad según tus necesidades
6. Obtén las credenciales para el frontend:
   - En la configuración del proyecto, haz clic en el icono de web (</>) para agregar una aplicación web
   - Registra la aplicación con el nombre "genea-web"
   - Copia el objeto de configuración de Firebase (apiKey, authDomain, etc.)
7. Obtén las credenciales para el backend:
   - En la configuración del proyecto, ve a "Cuentas de servicio"
   - Haz clic en "Generar nueva clave privada"
   - Guarda el archivo JSON generado como `firebase-service-account.json`

## 5. Desplegar el backend en Render (Hosting gratuito)

1. Prepara el backend para producción:
   - Asegúrate de que el archivo `package.json` en el directorio del servidor tenga los scripts correctos:
   ```json
   "scripts": {
     "start": "node src/index.js",
     "dev": "nodemon src/index.js"
   }
   ```
   - Crea un archivo `render.yaml` en la raíz del proyecto:
   ```yaml
   services:
     - type: web
       name: genea-api
       env: node
       buildCommand: cd genea-app/server && npm install
       startCommand: cd genea-app/server && npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: PORT
           value: 8080
         - key: MONGODB_URI
           sync: false
         - key: FIREBASE_SERVICE_ACCOUNT
           sync: false
   ```

2. Registrarse en Render:
   - Ve a [Render](https://render.com/) y regístrate con tu cuenta de GitHub
   - Conecta tu repositorio de GitHub

3. Crear un nuevo servicio web:
   - Haz clic en "New" y selecciona "Web Service"
   - Selecciona tu repositorio de GitHub
   - Nombra el servicio "genea-api"
   - Establece el directorio raíz como "genea-app/server"
   - Establece el comando de construcción como "npm install"
   - Establece el comando de inicio como "npm start"
   - Selecciona el plan gratuito
   - Haz clic en "Create Web Service"

4. Configurar variables de entorno:
   - En la sección "Environment" de tu servicio en Render
   - Agrega las siguientes variables:
     - `NODE_ENV`: production
     - `PORT`: 8080
     - `MONGODB_URI`: (la cadena de conexión de MongoDB Atlas)
     - `FIREBASE_SERVICE_ACCOUNT`: (el contenido del archivo JSON de Firebase, como una cadena)

## 6. Desplegar el frontend en Vercel (Hosting gratuito)

1. Prepara el frontend para producción:
   - Actualiza la URL de la API en el frontend para que apunte a tu backend desplegado:
   - Crea un archivo `.env.production` en el directorio del cliente:
   ```
   REACT_APP_API_URL=https://genea-api.onrender.com
   REACT_APP_FIREBASE_API_KEY=tu_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=tu_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=tu_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=tu_app_id
   ```

2. Registrarse en Vercel:
   - Ve a [Vercel](https://vercel.com/) y regístrate con tu cuenta de GitHub
   - Conecta tu repositorio de GitHub

3. Importar el proyecto:
   - Haz clic en "Import Project"
   - Selecciona tu repositorio de GitHub
   - Configura el proyecto:
     - Framework Preset: Create React App
     - Root Directory: genea-app/client
     - Build Command: npm run build
     - Output Directory: build
   - Haz clic en "Deploy"

4. Configurar variables de entorno:
   - En la sección "Settings" > "Environment Variables" de tu proyecto en Vercel
   - Agrega las mismas variables de entorno que definiste en `.env.production`

## 7. Conectar el frontend con el backend

1. Asegúrate de que el backend permita solicitudes CORS desde tu frontend:
   - En el archivo `server/src/index.js`, actualiza la configuración CORS:
   ```javascript
   app.use(cors({
     origin: ['https://genea.vercel.app', 'http://localhost:3000'],
     credentials: true
   }));
   ```

2. Actualiza la URL de la API en el frontend:
   - En los servicios API del frontend, asegúrate de usar la URL de la API desde las variables de entorno:
   ```javascript
   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
   ```

3. Haz commit de los cambios y push al repositorio:
   ```bash
   git add .
   git commit -m "Configuración para despliegue"
   git push origin main
   ```

4. Vercel y Render detectarán automáticamente los cambios y volverán a desplegar tus aplicaciones.

## 8. Verificar el despliegue

1. Visita tu frontend en Vercel (por ejemplo, https://genea.vercel.app)
2. Registra una cuenta de usuario y prueba todas las funcionalidades
3. Verifica que la comunicación entre el frontend y el backend funcione correctamente
4. Comprueba que la autenticación con Firebase y el almacenamiento de datos en MongoDB Atlas funcionen correctamente

¡Felicidades! Has desplegado con éxito tu aplicación Genea utilizando herramientas gratuitas.