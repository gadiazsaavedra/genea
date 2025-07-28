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

-- Política temporal más permisiva para testing
CREATE POLICY "Users can manage tree layouts" ON tree_layouts
  FOR ALL USING (auth.uid() IS NOT NULL);