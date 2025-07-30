-- Agregar campos faltantes a la tabla people
ALTER TABLE people ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE people ADD COLUMN IF NOT EXISTS death_cause TEXT;
ALTER TABLE people ADD COLUMN IF NOT EXISTS is_alive BOOLEAN DEFAULT TRUE;
ALTER TABLE people ADD COLUMN IF NOT EXISTS is_founder BOOLEAN DEFAULT FALSE;
ALTER TABLE people ADD COLUMN IF NOT EXISTS person_type VARCHAR(50) DEFAULT 'descendant';

-- Actualizar is_alive basado en death_date existente
UPDATE people SET is_alive = (death_date IS NULL) WHERE is_alive IS NULL;
