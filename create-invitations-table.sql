-- Crear tabla de invitaciones
CREATE TABLE IF NOT EXISTS invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID,
  invited_by UUID,
  invited_email VARCHAR(255) NOT NULL,
  invited_phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'viewer',
  token VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  invitation_method VARCHAR(20) DEFAULT 'email',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);

-- Insertar invitación de ejemplo
INSERT INTO invitations (family_id, invited_by, invited_email, role, token, expires_at) VALUES
('638a55dc-0a73-417c-9c80-556ac0028325', '638a55dc-0a73-417c-9c80-556ac0028325', 'ejemplo@email.com', 'viewer', 'sample-token-123', NOW() + INTERVAL '7 days');