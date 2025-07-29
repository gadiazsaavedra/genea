-- Agregar columna occupation a la tabla people
ALTER TABLE people ADD COLUMN IF NOT EXISTS occupation TEXT;