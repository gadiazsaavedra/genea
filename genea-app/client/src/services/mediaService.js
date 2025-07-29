import api from './api';
import { supabase } from '../config/supabase.config';

// Servicio para gestionar medios (fotos y documentos)
const mediaService = {
  // Subir foto de perfil
  uploadProfilePhoto: async (personId, file) => {
    try {
      // Subir directamente a Supabase Storage
      const uploadResult = await mediaService.uploadToStorage(file, 'profiles', `profile_${personId}`);
      
      // Actualizar la persona con la nueva URL de foto
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/persons/${personId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          photo_url: uploadResult.url
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error updating person:', errorData);
        throw new Error(errorData.message || 'Error al actualizar foto de perfil');
      }
      
      return {
        success: true,
        data: {
          fileUrl: uploadResult.url
        }
      };
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw error;
    }
  },

  // Subir fotos
  uploadPhotos: async (personId, files, captions = []) => {
    try {
      const uploadedPhotos = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const caption = captions[i] || '';
        
        // Subir archivo a Supabase Storage
        const uploadResult = await mediaService.uploadToStorage(file, 'photos', `photo_${personId}_${Date.now()}_${i}`);
        
        // Guardar en tabla media
        const { data: mediaRecord, error } = await supabase
          .from('media')
          .insert({
            person_id: personId,
            url: uploadResult.url,
            media_type: 'photo',
            caption: caption
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error saving photo to database:', error);
          throw error;
        }
        
        uploadedPhotos.push({
          _id: mediaRecord?.id || `temp_${Date.now()}_${i}`,
          url: uploadResult.url,
          caption: caption,
          date: new Date().toISOString()
        });
      }
      
      return {
        success: true,
        data: {
          uploadedPhotos
        }
      };
    } catch (error) {
      console.error('Error uploading photos:', error);
      throw error;
    }
  },
  
  // Subir documentos
  uploadDocuments: async (personId, files, titles = [], types = []) => {
    try {
      const uploadedDocuments = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const title = titles[i] || file.name;
        const type = types[i] || 'Otro';
        
        // Subir archivo a Supabase Storage
        const uploadResult = await mediaService.uploadToStorage(file, 'documents', `doc_${personId}_${Date.now()}_${i}`);
        
        // Guardar en tabla media
        const { data: mediaRecord, error } = await supabase
          .from('media')
          .insert({
            person_id: personId,
            url: uploadResult.url,
            media_type: 'document',
            title: title,
            file_type: type
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error saving document to database:', error);
          throw error;
        }
        
        uploadedDocuments.push({
          _id: mediaRecord?.id || `temp_${Date.now()}_${i}`,
          url: uploadResult.url,
          title: title,
          type: type,
          date: new Date().toISOString()
        });
      }
      
      return {
        success: true,
        data: {
          uploadedDocuments
        }
      };
    } catch (error) {
      console.error('Error uploading documents:', error);
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
          upsert: true
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