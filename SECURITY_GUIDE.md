# Guía de Seguridad para Genea

Esta guía proporciona instrucciones para configurar correctamente las variables de entorno y mejorar la seguridad de la aplicación Genea.

## Variables de Entorno

### Backend (Servidor)

Las siguientes variables de entorno son **requeridas** para el funcionamiento seguro del servidor:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `MONGODB_URI` | URI de conexión a MongoDB | `mongodb+srv://usuario:contraseña@cluster.mongodb.net/genea` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | `clave-secreta-larga-y-aleatoria` |
| `FIREBASE_SERVICE_ACCOUNT` | Credenciales de Firebase Admin (JSON) | `{"type": "service_account", ...}` |
| `EMAIL_SERVICE` | Servicio de correo electrónico | `gmail` |
| `EMAIL_USER` | Usuario de correo electrónico | `tu-email@gmail.com` |
| `EMAIL_PASSWORD` | Contraseña de aplicación | `contraseña-de-aplicación` |
| `FRONTEND_URL` | URL del frontend | `https://genea.vercel.app` |

### Frontend (Cliente)

Las siguientes variables de entorno son **requeridas** para el funcionamiento seguro del cliente:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `REACT_APP_API_URL` | URL de la API del backend | `https://genea-api.onrender.com/api` |
| `REACT_APP_FIREBASE_API_KEY` | API Key de Firebase | `AIzaSyC...` |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Auth Domain de Firebase | `tu-proyecto.firebaseapp.com` |
| `REACT_APP_FIREBASE_PROJECT_ID` | Project ID de Firebase | `tu-proyecto` |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Storage Bucket de Firebase | `tu-proyecto.appspot.com` |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Messaging Sender ID de Firebase | `123456789` |
| `REACT_APP_FIREBASE_APP_ID` | App ID de Firebase | `1:123456789:web:abc123` |

## Generación de Claves Secretas

Para generar una clave JWT segura, ejecuta:

```bash
cd genea-app/server
npm run generate-secrets
```

## Configuración en Render.com

1. Inicia sesión en [Render.com](https://render.com)
2. Selecciona tu servicio web "genea-api"
3. Ve a la pestaña "Environment"
4. Configura todas las variables de entorno requeridas
5. **IMPORTANTE**: No incluyas estas variables en archivos que se suban al repositorio

## Configuración en Vercel

1. Inicia sesión en [Vercel](https://vercel.com)
2. Selecciona tu proyecto "genea"
3. Ve a "Settings" > "Environment Variables"
4. Configura todas las variables de entorno requeridas
5. **IMPORTANTE**: No incluyas estas variables en archivos que se suban al repositorio

## Mejores Prácticas de Seguridad

1. **Nunca** incluyas credenciales o claves secretas en el código fuente
2. **Nunca** subas archivos `.env` con credenciales reales al repositorio
3. Utiliza `.env.example` como plantilla para mostrar qué variables son necesarias
4. Rota regularmente las claves secretas (JWT_SECRET, etc.)
5. Utiliza contraseñas de aplicación para servicios de correo electrónico
6. Configura reglas de seguridad adecuadas en Firebase Storage
7. Ejecuta regularmente `npm audit` para verificar vulnerabilidades en dependencias
8. Mantén todas las dependencias actualizadas

## Verificación de Seguridad

Para verificar vulnerabilidades en las dependencias, ejecuta:

```bash
cd genea-app/server
npm run security-check
```

## Contacto

Si encuentras algún problema de seguridad, por favor contacta a:

**Gustavo Diaz Saavedra**  
Email: gadiazsaavedra@gmail.com