const express = require('express');
const router = express.Router();
const relationshipController = require('../controllers/relationship.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Rutas de relaciones
router.post('/', relationshipController.createRelationship);
router.get('/', relationshipController.getRelationshipsByFamily);

module.exports = router;