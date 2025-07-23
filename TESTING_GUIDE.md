# Guía de Pruebas para Genea con Supabase

Esta guía te ayudará a probar la aplicación Genea con Supabase para asegurarte de que todo funciona correctamente.

## 1. Instalación de dependencias

Ejecuta el siguiente comando para instalar todas las dependencias necesarias:

```bash
./install-dependencies.sh
```

Este script instalará las dependencias tanto para el backend como para el frontend.

## 2. Verificar la conexión a Supabase

Antes de iniciar la aplicación, verifica que la conexión a Supabase funciona correctamente:

```bash
# Asegúrate de estar en el directorio del servidor
cd /home/gustavo/Documents/dev/genea/genea-app/server

# Ejecutar el script de prueba
node ../../test-backend-connection.js
```

Este script verificará:
- La conexión con el cliente anónimo de Supabase
- La conexión con el cliente admin de Supabase
- El acceso a las tablas principales (families, people, relationships, family_members)

## 3. Iniciar la aplicación

Para iniciar tanto el backend como el frontend en una sesión de tmux:

```bash
./start-app.sh
```

Este script:
- Inicia el backend en modo desarrollo
- Inicia el frontend en modo desarrollo
- Muestra ambos en una sesión de tmux dividida

Para salir de tmux sin detener los procesos: presiona `Ctrl+B`, luego `D`.
Para volver a la sesión: ejecuta `tmux attach-session -t genea`.

## 4. Probar funcionalidades principales

Una vez que la aplicación esté en funcionamiento, puedes probar las funcionalidades principales:

### Pruebas manuales

1. **Autenticación**:
   - Registrar un nuevo usuario
   - Iniciar sesión
   - Cerrar sesión

2. **Gestión de familias**:
   - Crear una nueva familia
   - Ver detalles de la familia
   - Editar la familia
   - Invitar a un miembro

3. **Gestión de personas**:
   - Crear una nueva persona
   - Ver detalles de la persona
   - Editar la persona
   - Añadir relaciones

4. **Gestión de medios**:
   - Subir una foto de perfil
   - Subir fotos y documentos
   - Ver y eliminar medios

### Pruebas automatizadas

También puedes ejecutar el script de pruebas automatizadas:

```bash
# Asegúrate de estar en el directorio del servidor
cd /home/gustavo/Documents/dev/genea/genea-app/server

# Ejecutar el script de prueba
node ../../test-functionality.js
```

Este script probará:
- Autenticación (registro e inicio de sesión)
- Creación y obtención de familias
- Creación y obtención de personas

## 5. Verificar logs

Si encuentras algún problema, verifica los logs:

```bash
# Logs del backend
cd /home/gustavo/Documents/dev/genea/genea-app/server
cat logs/app.log

# Logs del frontend (en la consola del navegador)
```

## 6. Solución de problemas comunes

### Problemas de conexión a Supabase

- Verifica que las variables de entorno estén configuradas correctamente
- Asegúrate de que las políticas de seguridad (RLS) estén configuradas en Supabase
- Verifica que el bucket de almacenamiento exista en Supabase

### Problemas de autenticación

- Limpia el almacenamiento local del navegador
- Verifica que el token JWT se esté enviando correctamente en las solicitudes
- Comprueba que la configuración de autenticación en Supabase sea correcta

### Problemas con el frontend

- Verifica que la URL de la API sea correcta en el archivo `.env`
- Asegúrate de que el proxy esté configurado correctamente en `package.json`
- Comprueba que las dependencias estén instaladas correctamente