# Configurar Google OAuth en Supabase

## 1. En Google Cloud Console:
1. Ir a https://console.cloud.google.com/
2. Crear nuevo proyecto o seleccionar existente
3. Habilitar Google+ API
4. Ir a "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configurar:
   - Application type: Web application
   - Authorized redirect URIs: https://tu-proyecto.supabase.co/auth/v1/callback

## 2. En Supabase Dashboard:
1. Ir a Authentication → Settings → Auth Providers
2. Habilitar Google provider
3. Agregar:
   - Client ID (de Google Console)
   - Client Secret (de Google Console)
4. Guardar configuración

## 3. URLs de redirect:
- Desarrollo: http://localhost:3000/auth/callback
- Producción: https://tu-dominio.com/auth/callback