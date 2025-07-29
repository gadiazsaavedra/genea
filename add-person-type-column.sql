-- Agregar columna person_type a la tabla people
ALTER TABLE people ADD COLUMN IF NOT EXISTS person_type TEXT DEFAULT 'descendant';

-- Actualizar registros existentes basándose en is_founder
UPDATE people 
SET person_type = CASE 
  WHEN is_founder = true THEN 'founder'
  ELSE 'descendant'
END
WHERE person_type IS NULL OR person_type = 'descendant';