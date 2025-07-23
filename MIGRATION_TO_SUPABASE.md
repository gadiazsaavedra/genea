# Migración de MongoDB + Firebase a Supabase

## 📦 Dependencias a actualizar

### Backend (Server)
```bash
# Remover dependencias de MongoDB y Firebase
npm uninstall mongoose firebase-admin

# Instalar Supabase
npm install @supabase/supabase-js
```

### Frontend (Client)
```bash
# Remover dependencias de Firebase
npm uninstall firebase

# Instalar Supabase
npm install @supabase/supabase-js
```

## 🗄️ Esquema de Base de Datos para Genea

Ejecutar en Supabase SQL Editor:

```sql
-- Tabla de usuarios (Supabase Auth se encarga de esto)
-- Solo necesitamos extender con información adicional

-- Tabla de familias
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de personas
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  maiden_name VARCHAR(255),
  birth_date DATE,
  death_date DATE,
  birth_place VARCHAR(255),
  death_place VARCHAR(255),
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  biography TEXT,
  photo_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de relaciones familiares
CREATE TABLE relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person1_id UUID REFERENCES people(id) ON DELETE CASCADE,
  person2_id UUID REFERENCES people(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) NOT NULL, -- 'parent', 'spouse', 'sibling'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de documentos/fotos
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(50), -- 'photo', 'document', 'video'
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de membresías familiares
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- 'admin', 'editor', 'viewer', 'member'
  joined_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejor performance
CREATE INDEX idx_people_family_id ON people(family_id);
CREATE INDEX idx_relationships_person1 ON relationships(person1_id);
CREATE INDEX idx_relationships_person2 ON relationships(person2_id);
CREATE INDEX idx_media_person_id ON media(person_id);
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);

-- RLS (Row Level Security) para seguridad
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad (usuarios solo pueden ver familias donde son miembros)
CREATE POLICY "Users can view families they belong to" ON families
  FOR SELECT USING (
    id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view people from their families" ON people
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

-- Más políticas similares para otras tablas...
```

## 🔄 Archivos a modificar

### 1. Backend
- `src/config/database.js` - Cambiar de Mongoose a Supabase
- `src/models/` - Reemplazar modelos de Mongoose con queries de Supabase
- `src/controllers/` - Actualizar controladores para usar Supabase
- `src/middleware/auth.js` - Cambiar Firebase Auth por Supabase Auth

### 2. Frontend
- `src/contexts/AuthContext.tsx` - Cambiar Firebase Auth por Supabase Auth
- `src/services/` - Actualizar servicios para usar Supabase
- `src/config/` - Reemplazar configuración de Firebase por Supabase

## 🎯 Ventajas de la migración

✅ **Una sola plataforma**: Base de datos + Auth + Storage
✅ **Menos configuración**: No más Firebase Service Account
✅ **Mejor para relaciones**: PostgreSQL es perfecto para árboles genealógicos
✅ **APIs automáticas**: Supabase genera APIs REST automáticamente
✅ **Real-time**: Suscripciones en tiempo real incluidas
✅ **Más espacio gratuito**: 500MB vs 1GB de Firebase (pero más eficiente)
