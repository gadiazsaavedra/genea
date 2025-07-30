-- Tabla para solicitudes de pago
CREATE TABLE payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, cancelled
  external_reference VARCHAR(255),
  payment_id VARCHAR(255), -- ID del pago en Mercado Pago
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Agregar columnas de licencia a la tabla families si no existen
ALTER TABLE families 
ADD COLUMN IF NOT EXISTS license_status VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS license_expires_at TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP DEFAULT NOW();

-- Índices para mejor rendimiento
CREATE INDEX idx_payment_requests_family_id ON payment_requests(family_id);
CREATE INDEX idx_payment_requests_user_id ON payment_requests(user_id);
CREATE INDEX idx_payment_requests_preference_id ON payment_requests(preference_id);
CREATE INDEX idx_payment_requests_status ON payment_requests(status);

-- RLS para payment_requests
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean sus propias solicitudes de pago
CREATE POLICY "Users can view their payment requests" ON payment_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create payment requests" ON payment_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());