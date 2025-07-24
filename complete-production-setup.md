# Lista de tareas para completar la configuración de producción

## 1. Configuración de Supabase

### Crear tablas faltantes
Ejecutar en Supabase SQL Editor:

```sql
-- Tabla de comentarios
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  user_photo_url VARCHAR(500),
  text TEXT NOT NULL,
  mentions JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de notificaciones
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  link VARCHAR(500),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de invitaciones
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  token VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_comments_media_id ON comments(media_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_family_id ON invitations(family_id);

-- RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
```

### Crear políticas de seguridad completas
```sql
-- Políticas para families
CREATE POLICY "Users can insert families" ON families
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their families" ON families
  FOR UPDATE USING (
    id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Users can delete their families" ON families
  FOR DELETE USING (
    id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas similares para people, relationships, media, etc.
```

### Crear bucket de almacenamiento
1. Ir a Supabase Dashboard → Storage
2. Crear bucket llamado `genea-media`
3. Configurar como público
4. Crear políticas de acceso

## 2. Configuración de variables de entorno

### Backend (.env.production)
```bash
# Obtener contraseña real de Supabase
DATABASE_URL=postgresql://postgres:CONTRASEÑA_REAL@db.hsdjbqqijtxehepifbfk.supabase.co:5432/postgres

# Configurar Gmail App Password
EMAIL_PASSWORD=GMAIL_APP_PASSWORD_REAL
```

### Frontend (.env.production)
```bash
# Actualizar con URL real del backend desplegado
REACT_APP_API_URL=https://TU-BACKEND-REAL.onrender.com/api
```

## 3. Verificaciones antes del despliegue

### Probar localmente
```bash
# 1. Instalar dependencias
./install-dependencies.sh

# 2. Probar conexión a Supabase
cd genea-app/server
node ../../test-backend-connection.js

# 3. Probar funcionalidades
node ../../test-functionality.js
```

### Verificar archivos críticos
- [ ] AuthContext.tsx actualizado para Supabase
- [ ] Todas las rutas del backend funcionando
- [ ] Servicios del frontend actualizados
- [ ] Componentes principales funcionando

## 4. Despliegue

### Backend (Render)
1. Conectar repositorio GitHub
2. Configurar variables de entorno
3. Desplegar servicio

### Frontend (Netlify)
1. Conectar repositorio GitHub
2. Configurar variables de entorno
3. Desplegar sitio

## 5. Pruebas post-despliegue
- [ ] Registro de usuario
- [ ] Inicio de sesión
- [ ] Creación de familia
- [ ] Creación de persona
- [ ] Subida de archivos
- [ ] Visualización del árbol