const express = require('express');
const router = express.Router();
const relationshipController = require('../controllers/relationship.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas de relaciones
router.post('/', relationshipController.createRelationship);
router.get('/', relationshipController.getRelationshipsByFamily);

module.exports = router;