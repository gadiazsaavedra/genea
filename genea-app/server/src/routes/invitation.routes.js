const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitation.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware.verifyToken);

// Crear una nueva invitación
router.post('/', invitationController.createInvitation);

// Obtener invitaciones enviadas por el usuario
router.get('/sent', invitationController.getInvitationsSent);

// Obtener invitaciones recibidas por el usuario
router.get('/received', invitationController.getInvitationsReceived);

// Aceptar una invitación
router.post('/accept/:token', invitationController.acceptInvitation);

// Rechazar una invitación
router.post('/reject/:token', invitationController.rejectInvitation);

// Cancelar una invitación (por el remitente)
router.delete('/:invitationId', invitationController.cancelInvitation);

module.exports = router;