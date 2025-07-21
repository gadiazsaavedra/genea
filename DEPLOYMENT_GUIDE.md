# Guía de Despliegue de Genea

Esta guía simplificada te ayudará a desplegar Genea en producción usando servicios gratuitos.

## Requisitos previos

1. Cuenta en [GitHub](https://github.com)
2. Cuenta en [Render.com](https://render.com)
3. Cuenta en [Vercel](https://vercel.com)
4. MongoDB Atlas configurado (ya completado)

## Paso 1: Subir el código a GitHub

```bash
# Inicializar repositorio Git (si no existe)
git init

# Añadir todos los archivos
git add .

# Hacer commit
git commit -m "Versión lista para producción"

# Conectar con repositorio remoto (reemplaza USERNAME con tu nombre de usuario)
git remote add origin https://github.com/USERNAME/genea.git

# Subir código
git push -u origin main
```

## Paso 2: Desplegar el backend en Render.com

1. Inicia sesión en [Render.com](https://render.com)
2. Haz clic en "New" y selecciona "Web Service"
3. Conecta tu repositorio de GitHub
4. Configura el servicio:
   - **Name**: genea-api
   - **Root Directory**: genea-app/server
   - **Environment**: Node
   - **Build Command**: npm install
   - **Start Command**: npm start
   - **Plan**: Free

5. Configura las variables de entorno:
   - `NODE_ENV`: production
   - `PORT`: 8080
   - `MONGODB_URI`: (tu cadena de conexión de MongoDB Atlas)
   - `JWT_SECRET`: (una clave secreta larga y aleatoria)
   - `JWT_EXPIRES_IN`: 7d
   - `UPLOAD_DIR`: ./uploads
   - `EMAIL_SERVICE`: gmail
   - `EMAIL_USER`: (tu correo electrónico)
   - `EMAIL_PASSWORD`: (tu contraseña de aplicación)
   - `FRONTEND_URL`: (URL de tu frontend en Vercel)

6. Haz clic en "Create Web Service"

## Paso 3: Desplegar el frontend en Vercel

1. Inicia sesión en [Vercel](https://vercel.com)
2. Haz clic en "New Project"
3. Importa tu repositorio de GitHub
4. Configura el proyecto:
   - **Framework Preset**: Create React App
   - **Root Directory**: genea-app/client
   - **Build Command**: npm run build
   - **Output Directory**: build

5. Configura las variables de entorno:
   - `REACT_APP_API_URL`: https://genea-api.onrender.com/api

6. Haz clic en "Deploy"

## Paso 4: Verificar el despliegue

1. Espera a que ambos despliegues se completen
2. Visita tu frontend en Vercel (ej. https://genea.vercel.app)
3. Registra una cuenta y prueba todas las funcionalidades

## Notas importantes

- **Almacenamiento de archivos**: En Render.com, el almacenamiento es efímero. Para una solución permanente, considera migrar a AWS S3 o similar.
- **Límites gratuitos**: Render.com tiene un límite de 750 horas/mes y el servicio se suspende después de 15 minutos de inactividad.
- **Dominio personalizado**: Puedes configurar un dominio personalizado tanto en Render.com como en Vercel.

## Desarrollado por

**Gustavo Diaz Saavedra**  
Teléfono: +54 11-4973-7619  
Email: gadiazsaavedra@gmail.com