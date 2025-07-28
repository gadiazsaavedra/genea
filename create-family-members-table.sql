-- Crear tabla de miembros de familia
CREATE TABLE IF NOT EXISTS family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role VARCHAR(50) DEFAULT 'viewer',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);

-- Insertar miembros de ejemplo (ajustar IDs según tus usuarios reales)
INSERT INTO family_members (family_id, user_id, role) VALUES
('638a55dc-0a73-417c-9c80-556ac0028325', '638a55dc-0a73-417c-9c80-556ac0028325', 'admin');