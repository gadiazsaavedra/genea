# Solución Alternativa para Genea sin Firebase

Este documento describe una solución alternativa para implementar Genea sin depender de Firebase, utilizando JWT para autenticación y almacenamiento local para archivos.

## 1. Autenticación con JWT

En lugar de Firebase Authentication, esta solución utiliza JSON Web Tokens (JWT) para la autenticación de usuarios.

### Ventajas:
- No requiere configuración externa
- Control total sobre el proceso de autenticación
- Fácil de implementar y mantener

### Componentes implementados:
- Servicio de autenticación (`auth.service.js`)
- Middleware de verificación de token (`auth.middleware.js`)
- Controlador de autenticación (`auth.controller.js`)
- Rutas de autenticación (`auth.routes.js`)

## 2. Almacenamiento Local de Archivos

En lugar de Firebase Storage, esta solución utiliza el sistema de archivos local para almacenar fotos y documentos.

### Ventajas:
- No requiere configuración externa
- Control total sobre los archivos
- Fácil de implementar y mantener

### Componentes implementados:
- Servicio de almacenamiento (`storage.service.js`)
- Integración con el controlador de medios existente

## 3. Configuración

### Variables de entorno necesarias:
```
# Clave secreta para JWT
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=7d

# Directorio para almacenamiento de archivos
UPLOAD_DIR=./uploads
```

## 4. Despliegue

Para desplegar esta solución en producción:

1. **Configurar MongoDB Atlas** (ya completado)
2. **Desplegar el backend en Render.com**:
   - Seguir las instrucciones en `deploy-instructions.md`
   - Asegurarse de configurar las variables de entorno JWT_SECRET y UPLOAD_DIR
   - Render.com proporciona almacenamiento efímero, por lo que los archivos subidos se perderán si el servicio se reinicia. Para una solución más robusta, considera usar un servicio de almacenamiento como AWS S3.

3. **Desplegar el frontend en Vercel**:
   - Seguir las instrucciones en `deploy-instructions.md`
   - Actualizar la configuración para usar la API JWT en lugar de Firebase

## 5. Limitaciones

Esta solución tiene algunas limitaciones comparada con Firebase:

1. **Almacenamiento de archivos**: Los archivos se almacenan localmente, lo que puede ser un problema en servicios como Render.com que tienen almacenamiento efímero.
2. **Escalabilidad**: Para aplicaciones con muchos usuarios, se recomienda migrar a un servicio de almacenamiento en la nube como AWS S3.
3. **Autenticación social**: No incluye inicio de sesión con Google u otros proveedores sociales.

## 6. Próximos pasos recomendados

1. **Implementar verificación de correo electrónico**
2. **Añadir recuperación de contraseña**
3. **Migrar el almacenamiento a AWS S3 o similar para producción**
4. **Implementar autenticación social (Google, Facebook, etc.)**

## Desarrollado por

**Gustavo Diaz Saavedra**  
Teléfono: +54 11-4973-7619  
Email: gadiazsaavedra@gmail.com