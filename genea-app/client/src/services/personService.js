import api from './api';

// Servicio para gestionar personas
const personService = {
  // Obtener todas las personas
  getAllPersons: async (params = {}) => {
    try {
      const response = await api.get('/persons', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener una persona por ID
  getPersonById: async (id) => {
    try {
      const response = await api.get(`/persons/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear una nueva persona
  createPerson: async (personData) => {
    try {
      const response = await api.post('/persons', personData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar una persona existente
  updatePerson: async (id, personData) => {
    try {
      const response = await api.put(`/persons/${id}`, personData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar una persona
  deletePerson: async (id) => {
    try {
      const response = await api.delete(`/persons/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Añadir una relación entre personas
  addRelation: async (relationData) => {
    try {
      const response = await api.post('/persons/relation', relationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar una relación entre personas
  removeRelation: async (relationData) => {
    try {
      const response = await api.delete('/persons/relation', { data: relationData });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener el árbol genealógico de una persona
  getPersonTree: async (id, params = {}) => {
    try {
      const response = await api.get(`/persons/${id}/tree`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default personService;