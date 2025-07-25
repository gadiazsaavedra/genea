-- Tabla para conexiones entre familias
CREATE TABLE family_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requesting_family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  target_family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  requesting_person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  target_person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  suggested_relationship VARCHAR(50) NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  requested_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  responded_by UUID REFERENCES auth.users(id),
  response_message TEXT,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla para sugerencias rechazadas (mejorar IA)
CREATE TABLE rejected_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person1_id UUID REFERENCES people(id) ON DELETE CASCADE,
  person2_id UUID REFERENCES people(id) ON DELETE CASCADE,
  rejected_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  suggestion_type VARCHAR(50) DEFAULT 'relationship',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Agregar columna para familias públicas
ALTER TABLE families 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS description_public TEXT;

-- Agregar columna para relaciones entre familias
ALTER TABLE relationships 
ADD COLUMN IF NOT EXISTS is_cross_family BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Índices para mejor rendimiento
CREATE INDEX idx_family_connections_requesting ON family_connections(requesting_family_id);
CREATE INDEX idx_family_connections_target ON family_connections(target_family_id);
CREATE INDEX idx_family_connections_status ON family_connections(status);
CREATE INDEX idx_rejected_suggestions_person1 ON rejected_suggestions(person1_id);
CREATE INDEX idx_rejected_suggestions_person2 ON rejected_suggestions(person2_id);
CREATE INDEX idx_families_public ON families(is_public);

-- RLS (Row Level Security)
ALTER TABLE family_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE rejected_suggestions ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para family_connections
CREATE POLICY "Family members can view connections" ON family_connections
  FOR SELECT USING (
    requesting_family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    ) OR
    target_family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create connection requests" ON family_connections
  FOR INSERT WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Target family admins can update connections" ON family_connections
  FOR UPDATE USING (
    target_family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para rejected_suggestions
CREATE POLICY "Users can view their rejected suggestions" ON rejected_suggestions
  FOR SELECT USING (rejected_by = auth.uid());

CREATE POLICY "Users can create rejected suggestions" ON rejected_suggestions
  FOR INSERT WITH CHECK (rejected_by = auth.uid());