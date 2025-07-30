-- Tabla para historial de investigación
CREATE TABLE research_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  search_params JSONB NOT NULL,
  results JSONB NOT NULL,
  search_type VARCHAR(50) DEFAULT 'public_records',
  success BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla para sugerencias de investigación
CREATE TABLE research_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  suggestion_type VARCHAR(50) NOT NULL,
  priority INTEGER DEFAULT 1,
  suggested_sources JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, dismissed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla para cambios pendientes (colaboración)
CREATE TABLE pending_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id),
  proposed_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  change_type VARCHAR(50) NOT NULL, -- create, update, delete
  current_data JSONB,
  proposed_data JSONB NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX idx_research_history_user_id ON research_history(user_id);
CREATE INDEX idx_research_history_created_at ON research_history(created_at);
CREATE INDEX idx_research_suggestions_family_id ON research_suggestions(family_id);
CREATE INDEX idx_research_suggestions_status ON research_suggestions(status);
CREATE INDEX idx_pending_changes_family_id ON pending_changes(family_id);
CREATE INDEX idx_pending_changes_status ON pending_changes(status);

-- RLS (Row Level Security)
ALTER TABLE research_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_changes ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can view their research history" ON research_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create research history" ON research_history
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Family members can view suggestions" ON research_suggestions
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Family members can view pending changes" ON pending_changes
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create pending changes" ON pending_changes
  FOR INSERT WITH CHECK (proposed_by = auth.uid());