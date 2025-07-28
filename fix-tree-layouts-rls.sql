-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view tree layouts of their families" ON tree_layouts;
DROP POLICY IF EXISTS "Users can create tree layouts in their families" ON tree_layouts;
DROP POLICY IF EXISTS "Users can update tree layouts of their families" ON tree_layouts;
DROP POLICY IF EXISTS "Users can delete tree layouts of their families" ON tree_layouts;
DROP POLICY IF EXISTS "Users can manage tree layouts" ON tree_layouts;

-- Crear política simple para testing
CREATE POLICY "Users can manage tree layouts" ON tree_layouts
  FOR ALL USING (auth.uid() IS NOT NULL);