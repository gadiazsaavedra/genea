const Comment = require('../models/comment.model');
const Notification = require('../models/notification.model');
const Family = require('../models/family.model');

const commentController = {
  // Crear un nuevo comentario
  createComment: async (req, res) => {
    try {
      const { mediaId, mediaType, text, mentions } = req.body;
      const userId = req.user.uid;
      const userName = req.user.displayName || 'Usuario';
      const userPhotoURL = req.user.photoURL || null;
      
      // Crear el comentario
      const comment = new Comment({
        mediaId,
        mediaType,
        userId,
        userName,
        userPhotoURL,
        text,
        mentions: mentions || []
      });
      
      await comment.save();
      
      // Crear notificaciones para las menciones
      if (mentions && mentions.length > 0) {
        const notificationPromises = mentions.map(mention => {
          return new Notification({
            userId: mention.userId,
            type: 'mention',
            title: 'Te han mencionado en un comentario',
            message: `${userName} te ha mencionado en un comentario: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
            data: {
              mediaId,
              mediaType,
              commentId: comment._id
            },
            link: `/media/${mediaType}/${mediaId}`
          }).save();
        });
        
        await Promise.all(notificationPromises);
      }
      
      res.status(201).json({
        message: 'Comentario creado correctamente',
        comment
      });
    } catch (error) {
      console.error('Error al crear comentario:', error);
      res.status(500).json({ message: 'Error al crear comentario', error: error.message });
    }
  },
  
  // Obtener comentarios de un medio
  getMediaComments: async (req, res) => {
    try {
      const { mediaId, mediaType } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      const options = {
        sort: { createdAt: -1 },
        limit: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      };
      
      const comments = await Comment.find({ mediaId, mediaType }, null, options);
      const total = await Comment.countDocuments({ mediaId, mediaType });
      
      res.status(200).json({
        comments,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        totalComments: total
      });
    } catch (error) {
      console.error('Error al obtener comentarios:', error);
      res.status(500).json({ message: 'Error al obtener comentarios', error: error.message });
    }
  },
  
  // Actualizar un comentario
  updateComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      const { text, mentions } = req.body;
      const userId = req.user.uid;
      
      // Buscar el comentario
      const comment = await Comment.findById(commentId);
      
      if (!comment) {
        return res.status(404).json({ message: 'Comentario no encontrado' });
      }
      
      // Verificar que el usuario es el autor del comentario
      if (comment.userId !== userId) {
        return res.status(403).json({ message: 'No tienes permisos para editar este comentario' });
      }
      
      // Actualizar el comentario
      comment.text = text;
      comment.mentions = mentions || comment.mentions;
      
      await comment.save();
      
      res.status(200).json({
        message: 'Comentario actualizado correctamente',
        comment
      });
    } catch (error) {
      console.error('Error al actualizar comentario:', error);
      res.status(500).json({ message: 'Error al actualizar comentario', error: error.message });
    }
  },
  
  // Eliminar un comentario
  deleteComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.user.uid;
      
      // Buscar el comentario
      const comment = await Comment.findById(commentId);
      
      if (!comment) {
        return res.status(404).json({ message: 'Comentario no encontrado' });
      }
      
      // Verificar que el usuario es el autor del comentario o un administrador
      if (comment.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'No tienes permisos para eliminar este comentario' });
      }
      
      await Comment.findByIdAndDelete(commentId);
      
      res.status(200).json({ message: 'Comentario eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      res.status(500).json({ message: 'Error al eliminar comentario', error: error.message });
    }
  }
};

module.exports = commentController;