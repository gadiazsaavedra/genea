const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware.verifyToken);

// Crear una nueva notificación (solo admin o sistema)
router.post('/', notificationController.createNotification);

// Obtener notificaciones del usuario actual
router.get('/', notificationController.getUserNotifications);

// Obtener conteo de notificaciones no leídas
router.get('/unread-count', notificationController.getUnreadCount);

// Marcar notificación como leída
router.put('/:notificationId/read', notificationController.markAsRead);

// Marcar todas las notificaciones como leídas
router.put('/mark-all-read', notificationController.markAllAsRead);

// Eliminar una notificación
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;