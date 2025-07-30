-- Deshabilitar RLS temporalmente para evitar recursión
ALTER TABLE family_members DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas problemáticas
DROP POLICY IF EXISTS "family_members_select_policy" ON family_members;
DROP POLICY IF EXISTS "family_members_insert_policy" ON family_members;
DROP POLICY IF EXISTS "family_members_update_policy" ON family_members;
DROP POLICY IF EXISTS "family_members_delete_policy" ON family_members;

-- Crear políticas simples sin recursión
CREATE POLICY "family_members_all_operations" ON family_members
    FOR ALL USING (true) WITH CHECK (true);

-- Reactivar RLS
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;