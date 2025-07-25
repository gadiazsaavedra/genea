const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkLicense } = require('../middleware/license.middleware');

// Todas las rutas requieren autenticación y licencia
router.use(authenticateToken);
router.use(checkLicense);

// Buscar conexiones entre familias
router.get('/connections/:familyId', socialController.findFamilyConnections);

// Solicitar conexión con otra familia
router.post('/connections/request', socialController.requestFamilyConnection);

// Obtener solicitudes pendientes
router.get('/connections/pending', socialController.getPendingConnections);

// Responder a solicitud de conexión
router.post('/connections/:connectionId/respond', socialController.respondToConnection);

// Obtener estadísticas sociales
router.get('/stats', socialController.getSocialStats);

module.exports = router;