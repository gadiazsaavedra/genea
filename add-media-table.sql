-- Crear tabla media para almacenar fotos y documentos
CREATE TABLE media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  media_type VARCHAR(20) NOT NULL,
  title TEXT,
  caption TEXT,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_media_person_id ON media(person_id);
CREATE INDEX idx_media_type ON media(media_type);