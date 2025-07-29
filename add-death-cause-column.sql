-- Agregar columna death_cause a la tabla people
ALTER TABLE people ADD COLUMN IF NOT EXISTS death_cause TEXT;