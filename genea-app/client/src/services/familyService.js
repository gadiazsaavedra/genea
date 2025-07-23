import api from './api';
import { supabase } from '../config/supabase.config';

// Servicio para gestionar familias
const familyService = {
  // Obtener todas las familias del usuario
  getAllFamilies: async () => {
    try {
      // Opción 1: Usar la API del backend
      const response = await api.get('/families');
      return response.data;
      
      // Opción 2: Usar Supabase directamente (comentada)
      /*
      const { data, error } = await supabase
        .from('family_members')
        .select(`
          family_id,
          role,
          families:family_id (
            id,
            name,
            description,
            created_by,
            created_at
          )
        `);
      
      if (error) throw error;
      return {
        success: true,
        data: data.map(item => item.families)
      };
      */
    } catch (error) {
      throw error;
    }
  },

  // Obtener una familia por ID
  getFamilyById: async (id) => {
    try {
      const response = await api.get(`/families/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear una nueva familia
  createFamily: async (familyData) => {
    try {
      const response = await api.post('/families', familyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar una familia existente
  updateFamily: async (id, familyData) => {
    try {
      const response = await api.put(`/families/${id}`, familyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar una familia
  deleteFamily: async (id) => {
    try {
      const response = await api.delete(`/families/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Añadir un miembro a la familia
  addFamilyMember: async (memberData) => {
    try {
      const response = await api.post('/families/member', memberData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un miembro de la familia
  removeFamilyMember: async (memberData) => {
    try {
      const response = await api.delete('/families/member', { data: memberData });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar el rol de un miembro en la familia
  updateMemberRole: async (memberData) => {
    try {
      const response = await api.put('/families/member', memberData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Obtener miembros de una familia
  getFamilyMembers: async (familyId) => {
    try {
      const response = await api.get(`/families/${familyId}/members`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default familyService;