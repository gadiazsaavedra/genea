-- Tabla para solicitudes de licencia
CREATE TABLE license_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  family_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  payment_proof_url VARCHAR(500), -- URL del comprobante de pago
  activated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Agregar columnas de licencia a families si no existen
ALTER TABLE families 
ADD COLUMN IF NOT EXISTS license_status VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS license_expires_at TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP DEFAULT NOW();

-- Índices
CREATE INDEX idx_license_requests_family_id ON license_requests(family_id);
CREATE INDEX idx_license_requests_user_id ON license_requests(user_id);
CREATE INDEX idx_license_requests_status ON license_requests(status);

-- RLS
ALTER TABLE license_requests ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view their license requests" ON license_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create license requests" ON license_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Solo admin puede actualizar (para activar licencias)
CREATE POLICY "Admin can update license requests" ON license_requests
  FOR UPDATE USING (true); -- Implementar lógica de admin después