import api from './api';
import { supabase } from '../config/supabase.config';

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

  // Subir archivos multimedia
  uploadMedia: async (personId, files, descriptions = [], fileTypes = []) => {
    try {
      const formData = new FormData();
      
      // Añadir cada archivo al FormData
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Añadir descripciones si existen
      if (descriptions.length > 0) {
        descriptions.forEach((description, index) => {
          formData.append('descriptions', description);
        });
      }
      
      // Añadir tipos de archivo si existen
      if (fileTypes.length > 0) {
        fileTypes.forEach((type, index) => {
          formData.append('fileTypes', type);
        });
      }
      
      const response = await api.post(`/media/${personId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener archivos multimedia de una persona
  getPersonMedia: async (personId) => {
    try {
      const response = await api.get(`/media/${personId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un archivo multimedia
  deleteMedia: async (mediaId) => {
    try {
      const response = await api.delete(`/media/${mediaId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Subir archivo directamente a Supabase Storage
  uploadToStorage: async (file, folder, fileName) => {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${folder}/${fileName || Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('genea-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('genea-media')
        .getPublicUrl(filePath);
      
      return {
        path: filePath,
        url: urlData.publicUrl
      };
    } catch (error) {
      throw error;
    }
  },
  
  // Eliminar archivo de Supabase Storage
  deleteFromStorage: async (filePath) => {
    try {
      const { error } = await supabase.storage
        .from('genea-media')
        .remove([filePath]);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }
};

export default mediaService;