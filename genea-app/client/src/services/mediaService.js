import api from './api';

// Servicio para gestionar medios (fotos y documentos)
const mediaService = {
  // Subir foto de perfil
  uploadProfilePhoto: async (personId, file) => {
    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);
      
      const response = await api.post(`/media/profilePhoto/${personId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Subir fotos
  uploadPhotos: async (personId, files, captions = []) => {
    try {
      const formData = new FormData();
      
      // Añadir cada archivo al FormData
      files.forEach(file => {
        formData.append('photos', file);
      });
      
      // Añadir leyendas si existen
      if (captions.length > 0) {
        captions.forEach((caption, index) => {
          formData.append('captions', caption);
        });
      }
      
      const response = await api.post(`/media/photos/${personId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Subir documentos
  uploadDocuments: async (personId, files, titles = [], types = []) => {
    try {
      const formData = new FormData();
      
      // Añadir cada archivo al FormData
      files.forEach(file => {
        formData.append('documents', file);
      });
      
      // Añadir títulos si existen
      if (titles.length > 0) {
        titles.forEach((title, index) => {
          formData.append('titles', title);
        });
      }
      
      // Añadir tipos si existen
      if (types.length > 0) {
        types.forEach((type, index) => {
          formData.append('types', type);
        });
      }
      
      const response = await api.post(`/media/documents/${personId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un archivo multimedia
  deleteMedia: async (personId, type, fileId) => {
    try {
      const response = await api.delete(`/media/${personId}/${type}/${fileId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default mediaService;