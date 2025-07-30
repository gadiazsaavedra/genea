-- Crear tabla de relaciones familiares
CREATE TABLE IF NOT EXISTS relationships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    person1_id UUID REFERENCES people(id) ON DELETE CASCADE,
    person2_id UUID REFERENCES people(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL, -- 'parent', 'child', 'spouse', 'sibling'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Evitar relaciones duplicadas
    UNIQUE(person1_id, person2_id, relationship_type)
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_relationships_person1 ON relationships(person1_id);
CREATE INDEX IF NOT EXISTS idx_relationships_person2 ON relationships(person2_id);
CREATE INDEX IF NOT EXISTS idx_relationships_type ON relationships(relationship_type);