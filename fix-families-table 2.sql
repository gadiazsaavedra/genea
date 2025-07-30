-- Agregar columna user_id a la tabla families si no existe
ALTER TABLE families 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Actualizar familias existentes sin user_id
UPDATE families 
SET user_id = created_by 
WHERE user_id IS NULL AND created_by IS NOT NULL;

-- Crear índice para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_families_user_id ON families(user_id);

-- Verificar estructura de la tabla
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'families' 
ORDER BY ordinal_position;