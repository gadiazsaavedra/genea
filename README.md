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
- PostgreSQL (Supabase) para la base de datos
- Supabase Authentication para la gestión de usuarios
- Supabase Storage para el almacenamiento de archivos
- Multer para la gestión temporal de archivos

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
│   └── uploads/            # Archivos temporales
```

## Instalación y configuración

### Requisitos previos
- Node.js (v14 o superior)
- Cuenta en Supabase

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
   # Supabase
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_ANON_KEY=tu-clave-anonima
   SUPABASE_SERVICE_ROLE_KEY=tu-clave-de-servicio
   
   # Servidor
   PORT=5000
   NODE_ENV=development
   
   # JWT
   JWT_SECRET=tu-clave-secreta
   JWT_EXPIRES_IN=7d
   
   # Directorio para almacenamiento temporal
   UPLOAD_DIR=./uploads
   ```

4. Inicia el servidor:
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
   # Supabase
   REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=tu-clave-anonima
   
   # API
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Inicia la aplicación:
   ```
   npm start
   ```

## Configuración de Supabase

1. Crea una cuenta en [Supabase](https://supabase.com/)
2. Crea un nuevo proyecto
3. Ve a la sección SQL Editor y ejecuta el script SQL que se encuentra en `MIGRATION_TO_SUPABASE.md`
4. Configura las políticas de seguridad según tus necesidades

## Pruebas

Para probar la aplicación, sigue estos pasos:

1. **Instalar dependencias**:
   ```bash
   ./install-dependencies.sh
   ```

2. **Verificar conexión a Supabase**:
   ```bash
   cd genea-app/server
   node ../../test-backend-connection.js
   ```

3. **Iniciar la aplicación**:
   ```bash
   ./start-app.sh
   ```

4. **Probar funcionalidades**:
   ```bash
   cd genea-app/server
   node ../../test-functionality.js
   ```

Para más detalles sobre las pruebas, consulta la guía completa en `TESTING_GUIDE.md`.

## Uso

1. Regístrate o inicia sesión en la aplicación
2. Crea una nueva familia o únete a una existente
3. Agrega personas al árbol genealógico
4. Explora y edita el árbol familiar
5. Comparte el árbol con otros miembros de la familia

## Migración desde Firebase/MongoDB

Si estás migrando desde la versión anterior con Firebase/MongoDB, consulta la guía detallada en `MIGRATION_TO_SUPABASE.md`.

## Despliegue

Para desplegar la aplicación en producción, consulta la guía detallada en `DEPLOYMENT_SUPABASE.md`.

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

### Desarrollador Principal

**Gustavo Díaz Saavedra**  
*Desarrollador Full Stack*

- 📧 **Email:** [gadiazsaavedra@gmail.com](mailto:gadiazsaavedra@gmail.com)
- 📱 **WhatsApp:** [+54 11 4973-7619](https://wa.me/5491149737619)
- 💼 **GitHub:** [github.com/gadiazsaavedra](https://github.com/gadiazsaavedra)
- 🌐 **LinkedIn:** [linkedin.com/in/gadiazsaavedra](https://linkedin.com/in/gadiazsaavedra)

### Sobre el Proyecto

Genea es un sistema completo de gestión de árboles genealógicos desarrollado con tecnologías modernas como React, Node.js y Supabase. El proyecto incluye funcionalidades avanzadas como autenticación, gestión de medios, colaboración familiar y visualización interactiva de árboles genealógicos.

### Servicios de Desarrollo

Si necesitas desarrollo de aplicaciones web o móviles similares, no dudes en contactarme. Ofrezco servicios de:

- Desarrollo Full Stack (React, Node.js, Python)
- Aplicaciones web y móviles
- Bases de datos y APIs
- Integración con servicios en la nube
- Consultoría técnica