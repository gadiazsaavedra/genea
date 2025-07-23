import api from './api';

// Servicio para gestionar comentarios
const commentService = {
  // Crear un nuevo comentario
  createComment: async (commentData) => {
    try {
      const response = await api.post('/comments', commentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener comentarios de un medio
  getMediaComments: async (mediaId, params = {}) => {
    try {
      const response = await api.get(`/comments/media/${mediaId}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar un comentario
  updateComment: async (commentId, commentData) => {
    try {
      const response = await api.put(`/comments/${commentId}`, commentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un comentario
  deleteComment: async (commentId) => {
    try {
      const response = await api.delete(`/comments/${commentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default commentService;