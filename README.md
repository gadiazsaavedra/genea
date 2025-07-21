# Genea - Sistema de Gestión de Árbol Genealógico

Genea es una aplicación web y móvil para gestionar, controlar y editar árboles genealógicos familiares. Permite a los miembros de una familia organizar, visualizar y compartir información sobre sus antepasados y parientes, desde la primera pareja fundadora hasta la actualidad.

## Características principales

- **Árbol genealógico interactivo**: Visualización gráfica del árbol familiar con opciones de navegación y filtrado.
- **Perfiles detallados**: Almacenamiento de información completa de cada persona (datos personales, fotos, documentos, etc.).
- **Colaboración familiar**: Acceso multiusuario con diferentes niveles de permisos.
- **Multimedia**: Soporte para fotos, documentos y notas.
- **Exportación e impresión**: Generación de informes y exportación del árbol en diferentes formatos.
- **Accesibilidad multiplataforma**: Disponible en navegadores web y dispositivos móviles.

## Tecnologías utilizadas

### Backend
- Node.js con Express
- MongoDB para la base de datos
- Firebase Authentication para la gestión de usuarios
- Multer para la gestión de archivos

### Frontend
- React con TypeScript
- Material-UI para la interfaz de usuario
- D3.js para la visualización del árbol genealógico
- React Router para la navegación
- Formik y Yup para la validación de formularios

## Estructura del proyecto

```
genea-app/
├── client/                 # Frontend React
│   ├── public/             # Archivos públicos
│   └── src/                # Código fuente
│       ├── components/     # Componentes reutilizables
│       ├── contexts/       # Contextos de React (Auth, etc.)
│       ├── pages/          # Páginas de la aplicación
│       ├── services/       # Servicios para API
│       ├── styles/         # Estilos CSS
│       └── utils/          # Utilidades y helpers
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── config/         # Configuraciones
│   │   ├── controllers/    # Controladores
│   │   ├── middleware/     # Middleware
│   │   ├── models/         # Modelos de datos
│   │   ├── routes/         # Rutas API
│   │   ├── services/       # Servicios
│   │   └── utils/          # Utilidades
│   └── uploads/            # Archivos subidos
```

## Instalación y configuración

### Requisitos previos
- Node.js (v14 o superior)
- MongoDB
- Cuenta en Firebase

### Configuración del backend

1. Navega al directorio del servidor:
   ```
   cd genea-app/server
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Crea un archivo `.env` en el directorio raíz del servidor con las siguientes variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/genea
   NODE_ENV=development
   ```

4. Configura Firebase:
   - Crea un proyecto en Firebase Console
   - Genera una clave privada para Firebase Admin SDK
   - Guarda el archivo JSON de la clave como `firebase-service-account.json` en la raíz del servidor

5. Inicia el servidor:
   ```
   npm run dev
   ```

### Configuración del frontend

1. Navega al directorio del cliente:
   ```
   cd genea-app/client
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Crea un archivo `.env` en el directorio raíz del cliente con las siguientes variables:
   ```
   REACT_APP_FIREBASE_API_KEY=tu_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=tu_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=tu_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=tu_app_id
   ```

4. Inicia la aplicación:
   ```
   npm start
   ```

## Uso

1. Regístrate o inicia sesión en la aplicación
2. Crea una nueva familia o únete a una existente
3. Agrega personas al árbol genealógico
4. Explora y edita el árbol familiar
5. Comparte el árbol con otros miembros de la familia

## Contribución

Si deseas contribuir a este proyecto, por favor:

1. Haz un fork del repositorio
2. Crea una rama para tu función (`git checkout -b feature/nueva-funcion`)
3. Haz commit de tus cambios (`git commit -m 'Añadir nueva función'`)
4. Haz push a la rama (`git push origin feature/nueva-funcion`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## Contacto

Para preguntas o sugerencias, por favor contacta a: info@genea-app.com

## Desarrollo

Este proyecto fue desarrollado por:

**Gustavo Diaz Saavedra**  
Teléfono: +54 11-4973-7619  
Email: gadiazsaavedra@gmail.com