const express = require('express');
const router = express.Router();
const descendantController = require('../controllers/descendant.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Rutas protegidas
router.use(verifyToken);

// Verificar y actualizar licencia por descendencia
router.post('/check/:familyId', descendantController.checkAndUpdateDescendantLicense);

// Obtener estado de descendencia
router.get('/status/:familyId', descendantController.getDescendantStatus);

module.exports = router;