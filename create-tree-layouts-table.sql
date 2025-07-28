-- Crear tabla para layouts de árboles genealógicos
CREATE TABLE IF NOT EXISTS tree_layouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  positions TEXT NOT NULL DEFAULT '{}',
  connections TEXT NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_tree_layouts_family_id ON tree_layouts(family_id);
CREATE INDEX IF NOT EXISTS idx_tree_layouts_created_by ON tree_layouts(created_by);

-- RLS (Row Level Security)
ALTER TABLE tree_layouts ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean layouts de familias a las que pertenecen
CREATE POLICY "Users can view tree layouts of their families" ON tree_layouts
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

-- Política para que los usuarios puedan crear layouts en sus familias
CREATE POLICY "Users can create tree layouts in their families" ON tree_layouts
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

-- Política para que los usuarios puedan actualizar layouts de sus familias
CREATE POLICY "Users can update tree layouts of their families" ON tree_layouts
  FOR UPDATE USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

-- Política para que los usuarios puedan eliminar layouts de sus familias
CREATE POLICY "Users can delete tree layouts of their families" ON tree_layouts
  FOR DELETE USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );