# Cómo obtener la Database URL de Supabase

## Pasos para obtener la URL:

1. **Ve a Supabase Dashboard:**
   - Visita: https://supabase.com/dashboard
   - Haz login con tu cuenta

2. **Selecciona tu proyecto:**
   - Busca el proyecto: `hsdjbqqijtxehepifbfk`
   - Haz clic para entrar

3. **Ve a configuración de base de datos:**
   - En el menú lateral, haz clic en **Settings** (⚙️)
   - Luego haz clic en **Database**

4. **Encuentra la Connection String:**
   - Busca la sección **Connection string**
   - Copia la **URI** (no la JDBC)
   - Debería verse así:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.hsdjbqqijtxehepifbfk.supabase.co:5432/postgres
   ```

5. **Si no tienes la contraseña:**
   - En la misma página, busca **Reset database password**
   - Haz clic y genera una nueva contraseña
   - **IMPORTANTE:** Guarda esta contraseña

## Ejemplo de URL completa:
```
postgresql://postgres:tu-contraseña-aqui@db.hsdjbqqijtxehepifbfk.supabase.co:5432/postgres
```

## Para usar en Render:
Una vez que tengas la URL completa, úsala como variable de entorno:
- **Nombre:** `DATABASE_URL`
- **Valor:** La URL completa con tu contraseña