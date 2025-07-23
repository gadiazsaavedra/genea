# Guía de Despliegue con Supabase

Esta guía detalla los pasos para desplegar Genea en producción usando Supabase.

## 1. Configuración de variables de entorno

### Backend (Server)

1. Copia el archivo de configuración para producción:
   ```bash
   cp .env.production.template .env.production
   ```

2. Edita el archivo `.env.production` con tus valores reales:
   - Actualiza `DATABASE_URL` con la cadena de conexión correcta
   - Configura `EMAIL_USER` y `EMAIL_PASSWORD` con tus credenciales reales
   - Establece `FRONTEND_URL` con la URL real de tu frontend desplegado

### Frontend (Client)

1. Copia el archivo de configuración para producción:
   ```bash
   cp .env.production.template .env.production
   ```

2. Edita el archivo `.env.production` con tus valores reales:
   - Actualiza `REACT_APP_API_URL` con la URL real de tu backend desplegado

## 2. Despliegue del Backend

### Opción 1: Render

1. Crea una cuenta en [Render](https://render.com/) si aún no tienes una
2. Conecta tu repositorio de GitHub
3. Crea un nuevo servicio web
4. Selecciona el directorio `genea-app/server`
5. Configura las variables de entorno según el archivo `.env.production`
6. Despliega el servicio

### Opción 2: Heroku

1. Instala la CLI de Heroku y haz login
   ```bash
   heroku login
   ```

2. Crea una nueva aplicación
   ```bash
   heroku create genea-api
   ```

3. Configura las variables de entorno
   ```bash
   heroku config:set SUPABASE_URL=tu-url \
     SUPABASE_ANON_KEY=tu-clave \
     SUPABASE_SERVICE_ROLE_KEY=tu-clave-servicio \
     JWT_SECRET=tu-clave-jwt \
     FRONTEND_URL=tu-url-frontend
   ```

4. Despliega la aplicación
   ```bash
   git subtree push --prefix genea-app/server heroku main
   ```

## 3. Despliegue del Frontend

### Opción 1: Netlify

1. Crea una cuenta en [Netlify](https://www.netlify.com/) si aún no tienes una
2. Conecta tu repositorio de GitHub
3. Configura el directorio base como `genea-app/client`
4. Establece el comando de construcción como `npm run build`
5. Establece el directorio de publicación como `build`
6. Configura las variables de entorno según el archivo `.env.netlify`
7. Despliega el sitio

### Opción 2: Vercel

1. Crea una cuenta en [Vercel](https://vercel.com/) si aún no tienes una
2. Conecta tu repositorio de GitHub
3. Configura el directorio raíz como `genea-app/client`
4. Configura las variables de entorno según el archivo `.env.vercel`
5. Despliega el sitio

## 4. Verificación del despliegue

1. Verifica que el backend esté funcionando correctamente:
   ```
   curl https://tu-api-backend.com/api/health
   ```

2. Accede a tu frontend desplegado y prueba:
   - Registro de usuario
   - Inicio de sesión
   - Creación de familia
   - Subida de imágenes
   - Visualización del árbol genealógico

## 5. Configuración de dominio personalizado (opcional)

### Backend

1. En Render o Heroku, configura un dominio personalizado como `api.tu-dominio.com`
2. Actualiza los registros DNS según las instrucciones de tu proveedor
3. Actualiza `FRONTEND_URL` en las variables de entorno del backend
4. Actualiza `REACT_APP_API_URL` en las variables de entorno del frontend

### Frontend

1. En Netlify o Vercel, configura un dominio personalizado como `app.tu-dominio.com` o `tu-dominio.com`
2. Actualiza los registros DNS según las instrucciones de tu proveedor

## 6. Monitoreo y mantenimiento

1. Configura alertas para errores del servidor
2. Establece un proceso de copia de seguridad regular para la base de datos
3. Monitorea el uso de recursos y escala según sea necesario