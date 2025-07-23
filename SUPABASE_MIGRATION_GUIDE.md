# Guía de Migración a Supabase

Esta guía detalla los pasos para migrar el proyecto Genea de Firebase/MongoDB a Supabase.

## 1. Configuración de Supabase

### Crear proyecto en Supabase

1. Ve a [Supabase](https://supabase.com/) y crea una cuenta o inicia sesión
2. Crea un nuevo proyecto
3. Anota la URL y las claves de API (anónima y de servicio)

### Configurar la base de datos

1. Ve a la sección SQL Editor en Supabase
2. Ejecuta el script SQL que se encuentra en `MIGRATION_TO_SUPABASE.md`

## 2. Actualizar dependencias

### Backend

```bash
cd genea-app/server

# Eliminar dependencias antiguas
npm uninstall mongoose firebase-admin

# Instalar Supabase
npm install @supabase/supabase-js
```

### Frontend

```bash
cd genea-app/client

# Eliminar dependencias antiguas
npm uninstall firebase

# Instalar Supabase
npm install @supabase/supabase-js
```

## 3. Configurar variables de entorno

### Backend (.env)

```
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Base de datos (opcional, para conexiones directas)
DATABASE_URL=postgresql://postgres:password@db.tu-proyecto.supabase.co:5432/postgres

# Servidor
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=tu_clave_secreta_jwt
JWT_EXPIRES_IN=7d

# Directorio para almacenamiento temporal de archivos
UPLOAD_DIR=./uploads

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-password-de-aplicacion

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)

```
# Supabase
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# URL de la API
REACT_APP_API_URL=http://localhost:5000/api

# Configuración de la aplicación
REACT_APP_NAME=Genea
REACT_APP_DESCRIPTION=Sistema de Gestión de Árbol Genealógico
```

## 4. Archivos actualizados

### Backend

- `src/config/supabase.config.js` - Configuración de Supabase
- `src/services/auth.service.js` - Servicio de autenticación
- `src/middleware/auth.middleware.js` - Middleware de autenticación
- `src/services/storage.service.js` - Servicio de almacenamiento

### Frontend

- `src/config/supabase.config.ts` - Configuración de Supabase
- `src/contexts/AuthContext.tsx` - Contexto de autenticación

## 5. Migración de datos

Para migrar los datos existentes de MongoDB a Supabase:

1. Exporta los datos de MongoDB:

```bash
mongoexport --uri="tu-uri-mongodb" --collection=families --out=families.json
mongoexport --uri="tu-uri-mongodb" --collection=people --out=people.json
mongoexport --uri="tu-uri-mongodb" --collection=users --out=users.json
```

2. Transforma los datos al formato de Supabase (puedes usar un script personalizado)

3. Importa los datos a Supabase usando el SQL Editor o la API

## 6. Pruebas

1. Inicia el servidor backend:

```bash
cd genea-app/server
npm run dev
```

2. Inicia el cliente frontend:

```bash
cd genea-app/client
npm start
```

3. Prueba las siguientes funcionalidades:
   - Registro de usuario
   - Inicio de sesión
   - Creación de familia
   - Subida de imágenes
   - Creación de personas
   - Visualización del árbol genealógico

## 7. Despliegue

### Backend

Actualiza el archivo `render.yaml` o configura tu servicio de hosting con las nuevas variables de entorno.

### Frontend

Actualiza la configuración de despliegue en Netlify o Vercel con las nuevas variables de entorno.

## Ventajas de la migración

- **Una sola plataforma**: Base de datos + Auth + Storage
- **Menos configuración**: No más Firebase Service Account
- **Mejor para relaciones**: PostgreSQL es perfecto para árboles genealógicos
- **APIs automáticas**: Supabase genera APIs REST automáticamente
- **Real-time**: Suscripciones en tiempo real incluidas
- **Más espacio gratuito**: 500MB vs 1GB de Firebase (pero más eficiente)