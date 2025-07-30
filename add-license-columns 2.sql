-- Agregar columnas de licencia a la tabla families
ALTER TABLE families 
ADD COLUMN IF NOT EXISTS license_status VARCHAR(20) DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS license_expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS license_type VARCHAR(20) DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending';

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_families_license_status ON families(license_status);
CREATE INDEX IF NOT EXISTS idx_families_license_expires ON families(license_expires_at);

-- Actualizar familia Barbará para que sea gratuita permanente
UPDATE families 
SET 
  license_status = 'active',
  license_type = 'free',
  license_expires_at = '2099-12-31 23:59:59',
  payment_status = 'free'
WHERE LOWER(name) LIKE '%barbar%';

-- Crear tabla de pagos (para futuro)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'pending',
  transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);