-- Crear tabla media para almacenar fotos y documentos
CREATE TABLE IF NOT EXISTS media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('photo', 'document')),
  title TEXT,
  caption TEXT,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_media_person_id ON media(person_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(media_type);