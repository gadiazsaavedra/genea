# Solucionar "Acceso bloqueado" Google OAuth

## 1. En Google Cloud Console (console.cloud.google.com):

### A. Verificar OAuth Consent Screen:
1. Ir a "APIs & Services" → "OAuth consent screen"
2. Configurar:
   - User Type: External
   - App name: Genea
   - User support email: gadiazsaavedra@gmail.com
   - Developer contact: gadiazsaavedra@gmail.com
   - App domain: tu-dominio.com (opcional)
3. Scopes: email, profile, openid
4. Test users: Agregar tu email para testing

### B. Verificar Credentials:
1. Ir a "Credentials" → Tu OAuth 2.0 Client ID
2. Authorized redirect URIs debe incluir:
   - http://localhost:3000/auth/callback (desarrollo)
   - https://tu-proyecto.supabase.co/auth/v1/callback (producción)
   - https://tu-dominio.com/auth/callback (si tienes dominio)

### C. Authorized JavaScript origins:
   - http://localhost:3000 (desarrollo)
   - https://tu-dominio.com (producción)

## 2. En Supabase Dashboard:

### Authentication → Settings → Auth Providers → Google:
1. Enable Google provider: ON
2. Client ID: (de Google Console)
3. Client Secret: (de Google Console)
4. Redirect URL: https://tu-proyecto.supabase.co/auth/v1/callback

## 3. URLs correctas:
- Desarrollo: http://localhost:3000/auth/callback
- Producción: https://tu-dominio.com/auth/callback
- Supabase: https://tu-proyecto.supabase.co/auth/v1/callback

## 4. Si persiste el error:
- Verificar que el proyecto de Google esté en modo "Testing" o "Production"
- Agregar tu email como test user
- Esperar 5-10 minutos para propagación de cambios