-- Crear tabla de eventos familiares
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  location VARCHAR(255),
  event_type VARCHAR(50) DEFAULT 'reunion',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de medios para eventos
CREATE TABLE IF NOT EXISTS event_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50) DEFAULT 'photo',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_event_media_event_id ON event_media(event_id);

-- Insertar eventos de ejemplo
INSERT INTO events (title, description, event_date, location, event_type) VALUES
('Reunión Familiar 2024', 'Gran reunión anual de la familia', '2024-07-15', 'Casa de los abuelos', 'reunion'),
('Boda de María y Juan', 'Celebración del matrimonio', '2023-09-20', 'Iglesia San José', 'boda'),
('Cumpleaños de la Abuela', '90 años de vida', '2024-03-10', 'Salón de eventos', 'cumpleanos');