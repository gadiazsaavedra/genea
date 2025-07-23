const { supabaseClient, supabaseAdmin } = require('../config/supabase.config');

const notificationController = {
  // Crear una nueva notificación
  createNotification: async (req, res) => {
    try {
      const { userId, type, title, message, data, link } = req.body;
      const requestingUserId = req.user.uid;
      
      // Verificar que el usuario que crea la notificación tiene permisos
      // (solo administradores o el propio sistema pueden crear notificaciones)
      const { data: userRole, error: roleError } = await supabaseClient
        .from('family_members')
        .select('role')
        .eq('user_id', requestingUserId)
        .eq('role', 'admin')
        .single();
      
      const isAdmin = userRole && userRole.role === 'admin';
      const isSystem = requestingUserId === 'system';
      
      if (!isAdmin && !isSystem) {
        return res.status(403).json({ 
          success: false,
          message: 'No tienes permisos para crear notificaciones' 
        });
      }
      
      // Crear la notificación
      const { data: notification, error: notificationError } = await supabaseClient
        .from('notifications')
        .insert([{
          user_id: userId,
          type,
          title,
          message,
          data,
          link
        }])
        .select()
        .single();
      
      if (notificationError) throw new Error(notificationError.message);
      
      res.status(201).json({
        success: true,
        message: 'Notificación creada correctamente',
        data: notification
      });
    } catch (error) {
      console.error('Error al crear notificación:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al crear notificación', 
        error: error.message 
      });
    }
  },
  
  // Obtener notificaciones del usuario actual
  getUserNotifications: async (req, res) => {
    try {
      const userId = req.user.uid;
      const { page = 1, limit = 10, unreadOnly = false } = req.query;
      
      // Calcular paginación
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      // Construir la consulta
      let query = supabaseClient
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);
      
      if (unreadOnly === 'true') {
        query = query.eq('read', false);
      }
      
      // Ejecutar la consulta con paginación y ordenamiento
      const { data: notifications, error: notificationsError, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (notificationsError) throw new Error(notificationsError.message);
      
      res.status(200).json({
        success: true,
        data: {
          notifications,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          totalNotifications: count
        }
      });
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener notificaciones', 
        error: error.message 
      });
    }
  },
  
  // Marcar notificación como leída
  markAsRead: async (req, res) => {
    try {
      const { notificationId } = req.params;
      const userId = req.user.uid;
      
      // Verificar que la notificación existe y pertenece al usuario
      const { data: notification, error: notificationError } = await supabaseClient
        .from('notifications')
        .select('*')
        .eq('id', notificationId)
        .eq('user_id', userId)
        .single();
      
      if (notificationError || !notification) {
        return res.status(404).json({ 
          success: false,
          message: 'Notificación no encontrada' 
        });
      }
      
      // Marcar como leída
      const { error: updateError } = await supabaseClient
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (updateError) throw new Error(updateError.message);
      
      res.status(200).json({ 
        success: true,
        message: 'Notificación marcada como leída' 
      });
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al marcar notificación', 
        error: error.message 
      });
    }
  },
  
  // Marcar todas las notificaciones como leídas
  markAllAsRead: async (req, res) => {
    try {
      const userId = req.user.uid;
      
      // Marcar todas las notificaciones del usuario como leídas
      const { error: updateError } = await supabaseClient
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);
      
      if (updateError) throw new Error(updateError.message);
      
      res.status(200).json({ 
        success: true,
        message: 'Todas las notificaciones marcadas como leídas' 
      });
    } catch (error) {
      console.error('Error al marcar todas las notificaciones:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al marcar notificaciones', 
        error: error.message 
      });
    }
  },
  
  // Eliminar una notificación
  deleteNotification: async (req, res) => {
    try {
      const { notificationId } = req.params;
      const userId = req.user.uid;
      
      // Verificar que la notificación existe y pertenece al usuario
      const { data: notification, error: notificationError } = await supabaseClient
        .from('notifications')
        .select('*')
        .eq('id', notificationId)
        .eq('user_id', userId)
        .single();
      
      if (notificationError || !notification) {
        return res.status(404).json({ 
          success: false,
          message: 'Notificación no encontrada' 
        });
      }
      
      // Eliminar la notificación
      const { error: deleteError } = await supabaseClient
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      
      if (deleteError) throw new Error(deleteError.message);
      
      res.status(200).json({ 
        success: true,
        message: 'Notificación eliminada correctamente' 
      });
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al eliminar notificación', 
        error: error.message 
      });
    }
  },
  
  // Obtener el número de notificaciones no leídas
  getUnreadCount: async (req, res) => {
    try {
      const userId = req.user.uid;
      
      // Contar notificaciones no leídas
      const { count, error: countError } = await supabaseClient
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);
      
      if (countError) throw new Error(countError.message);
      
      res.status(200).json({ 
        success: true,
        data: { unreadCount: count } 
      });
    } catch (error) {
      console.error('Error al obtener conteo de notificaciones:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener conteo', 
        error: error.message 
      });
    }
  }
};

module.exports = notificationController;