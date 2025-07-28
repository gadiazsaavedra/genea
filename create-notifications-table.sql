-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  link VARCHAR(255),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Insertar notificaciones de ejemplo
INSERT INTO notifications (user_id, type, title, message, link) VALUES
('638a55dc-0a73-417c-9c80-556ac0028325', 'invitation', '📧 Nueva invitación familiar', 'Has recibido una invitación para unirte a la familia García', '/invitations'),
('638a55dc-0a73-417c-9c80-556ac0028325', 'person_added', '👤 Nueva persona agregada', 'Se ha agregado a María García al árbol familiar', '/persons'),
('638a55dc-0a73-417c-9c80-556ac0028325', 'photo_uploaded', '📸 Nueva foto subida', 'Se subió una nueva foto al evento "Reunión Familiar 2024"', '/events');