-- Agregar columna is_founder a la tabla people
ALTER TABLE people ADD COLUMN IF NOT EXISTS is_founder BOOLEAN DEFAULT false;

-- Actualizar personas existentes como fundadores si no tienen padres
UPDATE people 
SET is_founder = true 
WHERE id NOT IN (
  SELECT DISTINCT person2_id 
  FROM relationships 
  WHERE relationship_type = 'parent' 
  AND person2_id IS NOT NULL
);

-- Verificar la actualización
SELECT id, first_name, last_name, is_founder 
FROM people 
ORDER BY is_founder DESC, first_name;