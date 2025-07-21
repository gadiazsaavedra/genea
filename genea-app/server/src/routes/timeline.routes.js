const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timeline.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware.verifyToken);

// Obtener línea temporal de una familia
router.get('/family/:familyId', timelineController.getFamilyTimeline);

// Obtener línea temporal de una persona
router.get('/person/:personId', timelineController.getPersonTimeline);

module.exports = router;