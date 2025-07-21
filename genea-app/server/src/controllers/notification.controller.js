const Notification = require('../models/notification.model');

const notificationController = {
  // Crear una nueva notificación
  createNotification: async (req, res) => {
    try {
      const { userId, type, title, message, data, link } = req.body;
      
      // Verificar que el usuario que crea la notificación tiene permisos
      // (solo administradores o el propio sistema pueden crear notificaciones)
      if (req.user.role !== 'admin' && req.user.uid !== 'system') {
        return res.status(403).json({ message: 'No tienes permisos para crear notificaciones' });
      }
      
      const notification = new Notification({
        userId,
        type,
        title,
        message,
        data,
        link
      });
      
      await notification.save();
      
      res.status(201).json({
        message: 'Notificación creada correctamente',
        notification
      });
    } catch (error) {
      console.error('Error al crear notificación:', error);
      res.status(500).json({ message: 'Error al crear notificación', error: error.message });
    }
  },
  
  // Obtener notificaciones del usuario actual
  getUserNotifications: async (req, res) => {
    try {
      const userId = req.user.uid;
      const { page = 1, limit = 10, unreadOnly = false } = req.query;
      
      const query = { userId };
      if (unreadOnly === 'true') {
        query.read = false;
      }
      
      const options = {
        sort: { createdAt: -1 },
        limit: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      };
      
      const notifications = await Notification.find(query, null, options);
      const total = await Notification.countDocuments(query);
      
      res.status(200).json({
        notifications,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        totalNotifications: total
      });
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      res.status(500).json({ message: 'Error al obtener notificaciones', error: error.message });
    }
  },
  
  // Marcar notificación como leída
  markAsRead: async (req, res) => {
    try {
      const { notificationId } = req.params;
      const userId = req.user.uid;
      
      const notification = await Notification.findById(notificationId);
      
      if (!notification) {
        return res.status(404).json({ message: 'Notificación no encontrada' });
      }
      
      // Verificar que la notificación pertenece al usuario
      if (notification.userId !== userId) {
        return res.status(403).json({ message: 'No tienes permisos para modificar esta notificación' });
      }
      
      notification.read = true;
      await notification.save();
      
      res.status(200).json({ message: 'Notificación marcada como leída' });
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      res.status(500).json({ message: 'Error al marcar notificación', error: error.message });
    }
  },
  
  // Marcar todas las notificaciones como leídas
  markAllAsRead: async (req, res) => {
    try {
      const userId = req.user.uid;
      
      await Notification.updateMany(
        { userId, read: false },
        { $set: { read: true } }
      );
      
      res.status(200).json({ message: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
      console.error('Error al marcar todas las notificaciones:', error);
      res.status(500).json({ message: 'Error al marcar notificaciones', error: error.message });
    }
  },
  
  // Eliminar una notificación
  deleteNotification: async (req, res) => {
    try {
      const { notificationId } = req.params;
      const userId = req.user.uid;
      
      const notification = await Notification.findById(notificationId);
      
      if (!notification) {
        return res.status(404).json({ message: 'Notificación no encontrada' });
      }
      
      // Verificar que la notificación pertenece al usuario
      if (notification.userId !== userId) {
        return res.status(403).json({ message: 'No tienes permisos para eliminar esta notificación' });
      }
      
      await Notification.findByIdAndDelete(notificationId);
      
      res.status(200).json({ message: 'Notificación eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      res.status(500).json({ message: 'Error al eliminar notificación', error: error.message });
    }
  },
  
  // Obtener el número de notificaciones no leídas
  getUnreadCount: async (req, res) => {
    try {
      const userId = req.user.uid;
      
      const count = await Notification.countDocuments({ userId, read: false });
      
      res.status(200).json({ unreadCount: count });
    } catch (error) {
      console.error('Error al obtener conteo de notificaciones:', error);
      res.status(500).json({ message: 'Error al obtener conteo', error: error.message });
    }
  }
};

module.exports = notificationController;