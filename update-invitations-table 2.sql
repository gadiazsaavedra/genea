-- Agregar columnas para invitaciones por WhatsApp
ALTER TABLE invitations 
ADD COLUMN IF NOT EXISTS invited_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS invitation_method VARCHAR(10) DEFAULT 'email';

-- Actualizar política para permitir búsqueda por teléfono también
DROP POLICY IF EXISTS "Users can view invitations they sent or received" ON invitations;

CREATE POLICY "Users can view invitations they sent or received" ON invitations
  FOR SELECT USING (
    invited_by = auth.uid() OR 
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
    invited_phone IS NOT NULL
  );