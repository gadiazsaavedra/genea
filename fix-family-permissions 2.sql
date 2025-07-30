-- Verificar familias sin miembros
SELECT f.id, f.name, f.created_by, f.user_id
FROM families f
LEFT JOIN family_members fm ON f.id = fm.family_id
WHERE fm.family_id IS NULL;

-- Agregar creadores como admins a sus familias
INSERT INTO family_members (family_id, user_id, role, joined_at)
SELECT f.id, f.created_by, 'admin', f.created_at
FROM families f
LEFT JOIN family_members fm ON f.id = fm.family_id AND fm.user_id = f.created_by
WHERE fm.family_id IS NULL AND f.created_by IS NOT NULL;

-- Verificar resultado
SELECT f.name, fm.user_id, fm.role, au.email
FROM families f
JOIN family_members fm ON f.id = fm.family_id
JOIN auth.users au ON fm.user_id = au.id;