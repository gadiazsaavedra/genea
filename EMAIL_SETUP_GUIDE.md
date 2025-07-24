# Guía de Configuración de Email para Genea

## Paso 1: Generar Gmail App Password

### 1.1 Habilitar verificación en 2 pasos
1. Ve a [myaccount.google.com](https://myaccount.google.com/)
2. Haz clic en **"Seguridad"** en el panel izquierdo
3. En la sección **"Iniciar sesión en Google"**, haz clic en **"Verificación en 2 pasos"**
4. Sigue las instrucciones para habilitar la verificación en 2 pasos si no la tienes activada

### 1.2 Generar contraseña de aplicación
1. Una vez habilitada la verificación en 2 pasos, regresa a **"Seguridad"**
2. En **"Iniciar sesión en Google"**, haz clic en **"Contraseñas de aplicaciones"**
3. Selecciona **"Correo"** como aplicación
4. Selecciona **"Otro (nombre personalizado)"** como dispositivo
5. Escribe **"Genea App"** como nombre personalizado
6. Haz clic en **"Generar"**
7. **Copia la contraseña de 16 caracteres** que aparece (formato: `abcd efgh ijkl mnop`)

## Paso 2: Actualizar archivo de configuración

### 2.1 Editar .env.production
Abre el archivo `/home/gustavo/Documents/dev/genea/genea-app/server/.env.production` y reemplaza:

```bash
EMAIL_PASSWORD=AQUI_TU_APP_PASSWORD
```

Por:

```bash
EMAIL_PASSWORD=tu-contraseña-de-16-caracteres-sin-espacios
```

**Ejemplo:**
```bash
EMAIL_PASSWORD=abcdefghijklmnop
```

### 2.2 Verificar configuración completa
Asegúrate de que estas líneas estén correctas:

```bash
EMAIL_SERVICE=gmail
EMAIL_USER=gadiazsaavedra@gmail.com
EMAIL_PASSWORD=tu-contraseña-de-aplicacion-real
```

## Paso 3: Probar la configuración

### 3.1 Ejecutar script de prueba
```bash
# Desde el directorio del servidor
cd /home/gustavo/Documents/dev/genea/genea-app/server

# Ejecutar script de prueba
node ../../test-email-config.js
```

### 3.2 Verificar resultado
Si todo está configurado correctamente, deberías ver:
```
✅ Configuración de email válida
✅ Email de prueba enviado correctamente
```

Si hay errores, verifica:
- La contraseña de aplicación esté correcta
- No haya espacios en la contraseña
- La verificación en 2 pasos esté habilitada

## Paso 4: Configurar para despliegue

### 4.1 Para Render
En el dashboard de Render, configura la variable de entorno:
- **Nombre:** `EMAIL_PASSWORD`
- **Valor:** tu contraseña de aplicación de 16 caracteres

### 4.2 Para Heroku
```bash
heroku config:set EMAIL_PASSWORD=tu-contraseña-de-aplicacion
```

### 4.3 Para otros servicios
Configura la variable de entorno `EMAIL_PASSWORD` con el valor de tu contraseña de aplicación.

## Solución de problemas comunes

### Error: "Invalid login"
- Verifica que la contraseña de aplicación sea correcta
- Asegúrate de no incluir espacios en la contraseña
- Genera una nueva contraseña de aplicación

### Error: "Less secure app access"
- Gmail ya no permite aplicaciones menos seguras
- Debes usar contraseñas de aplicación obligatoriamente

### Error: "Authentication failed"
- Verifica que la verificación en 2 pasos esté habilitada
- Regenera la contraseña de aplicación
- Verifica que el email sea correcto

## Funcionalidades que usan email

Una vez configurado, el email se usará para:
- Invitaciones a familias
- Restablecimiento de contraseñas
- Notificaciones importantes
- Confirmación de registro (opcional)