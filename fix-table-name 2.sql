-- Verificar si existe la tabla people
SELECT table_name FROM information_schema.tables WHERE table_name = 'people';

-- Si no existe, crear la tabla people
CREATE TABLE IF NOT EXISTS people (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    gender VARCHAR(20),
    birth_date DATE,
    death_date DATE,
    birth_place TEXT,
    death_place TEXT,
    biography TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);