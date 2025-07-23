import api from './api';

// Servicio para gestionar invitaciones
const invitationService = {
  // Crear una nueva invitación
  createInvitation: async (invitationData) => {
    try {
      const response = await api.post('/invitations', invitationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener invitaciones enviadas por el usuario
  getInvitationsSent: async () => {
    try {
      const response = await api.get('/invitations/sent');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener invitaciones recibidas por el usuario
  getInvitationsReceived: async () => {
    try {
      const response = await api.get('/invitations/received');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Aceptar una invitación
  acceptInvitation: async (token) => {
    try {
      const response = await api.post(`/invitations/accept/${token}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Rechazar una invitación
  rejectInvitation: async (token) => {
    try {
      const response = await api.post(`/invitations/reject/${token}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cancelar una invitación
  cancelInvitation: async (invitationId) => {
    try {
      const response = await api.delete(`/invitations/${invitationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default invitationService;