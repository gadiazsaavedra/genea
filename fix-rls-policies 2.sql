-- Deshabilitar RLS temporalmente para corregir políticas
ALTER TABLE families DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE people DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes que causan recursión
DROP POLICY IF EXISTS "Users can view families they belong to" ON families;
DROP POLICY IF EXISTS "Users can create families" ON families;
DROP POLICY IF EXISTS "Users can update families they admin" ON families;
DROP POLICY IF EXISTS "Users can delete families they admin" ON families;

DROP POLICY IF EXISTS "Users can view family members" ON family_members;
DROP POLICY IF EXISTS "Users can insert family members" ON family_members;
DROP POLICY IF EXISTS "Users can update family members" ON family_members;
DROP POLICY IF EXISTS "Users can delete family members" ON family_members;

DROP POLICY IF EXISTS "Users can view people in their families" ON people;
DROP POLICY IF EXISTS "Users can create people in their families" ON people;
DROP POLICY IF EXISTS "Users can update people in their families" ON people;
DROP POLICY IF EXISTS "Users can delete people in their families" ON people;

-- Crear políticas simples sin recursión
-- Políticas para families
CREATE POLICY "families_select_policy" ON families
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "families_insert_policy" ON families
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "families_update_policy" ON families
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "families_delete_policy" ON families
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() = created_by);

-- Políticas para family_members
CREATE POLICY "family_members_select_policy" ON family_members
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "family_members_insert_policy" ON family_members
    FOR INSERT WITH CHECK (true);

CREATE POLICY "family_members_update_policy" ON family_members
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "family_members_delete_policy" ON family_members
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para people
CREATE POLICY "people_select_policy" ON people
    FOR SELECT USING (true);

CREATE POLICY "people_insert_policy" ON people
    FOR INSERT WITH CHECK (true);

CREATE POLICY "people_update_policy" ON people
    FOR UPDATE USING (true);

CREATE POLICY "people_delete_policy" ON people
    FOR DELETE USING (true);

-- Reactivar RLS
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;