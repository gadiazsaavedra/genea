const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware.verifyToken);

// Crear un nuevo comentario
router.post('/', commentController.createComment);

// Obtener comentarios de un medio
router.get('/:mediaType/:mediaId', commentController.getMediaComments);

// Actualizar un comentario
router.put('/:commentId', commentController.updateComment);

// Eliminar un comentario
router.delete('/:commentId', commentController.deleteComment);

module.exports = router;