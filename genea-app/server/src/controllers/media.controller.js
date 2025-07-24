const { supabaseClient } = require('../config/supabase.config');
const storageService = require('../services/storage.service');
const fs = require('fs');

// Subir foto de perfil
exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ningún archivo'
      });
    }
    
    const personId = req.params.personId;
    const userId = req.user.uid;
    
    // Verificar si la persona existe y el usuario tiene acceso
    const { data: person, error: personError } = await supabaseClient
      .from('people')
      .select('family_id')
      .eq('id', personId)
      .single();
    
    if (personError || !person) {
      // Eliminar el archivo subido
      fs.unlinkSync(req.file.path);
      
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }
    
    // Verificar acceso a la familia
    const { data: memberCheck, error: memberError } = await supabaseClient
      .from('family_members')
      .select('id')
      .eq('family_id', person.family_id)
      .eq('user_id', userId);
    
    if (memberError || !memberCheck || memberCheck.length === 0) {
      // Eliminar el archivo subido
      fs.unlinkSync(req.file.path);
      
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta persona'
      });
    }
    
    // Subir archivo a Supabase Storage
    const uploadResult = await storageService.uploadFile(
      req.file,
      userId,
      `profiles/${personId}`
    );
    
    // Actualizar la foto de perfil en la base de datos
    const { data: updatedPerson, error: updateError } = await supabaseClient
      .from('people')
      .update({
        photo_url: uploadResult.url,
        updated_at: new Date().toISOString()
      })
      .eq('id', personId)
      .select()
      .single();
    
    if (updateError) throw new Error(updateError.message);
    
    res.status(200).json({
      success: true,
      message: 'Foto de perfil actualizada correctamente',
      data: {
        fileUrl: uploadResult.url,
        person: updatedPerson
      }
    });
  } catch (error) {
    console.error('Error al subir la foto de perfil:', error);
    
    // Eliminar el archivo en caso de error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al subir la foto de perfil',
      error: error.message
    });
  }
};

// Subir archivos multimedia
exports.uploadPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se han proporcionado archivos'
      });
    }
    
    const personId = req.params.personId;
    const userId = req.user.uid;
    const descriptions = req.body.descriptions || [];
    
    // Verificar si la persona existe y el usuario tiene acceso
    const { data: person, error: personError } = await supabaseClient
      .from('people')
      .select('family_id')
      .eq('id', personId)
      .single();
    
    if (personError || !person) {
      // Eliminar los archivos subidos
      req.files.forEach(file => fs.unlinkSync(file.path));
      
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }
    
    // Verificar acceso a la familia
    const { data: memberCheck, error: memberError } = await supabaseClient
      .from('family_members')
      .select('id')
      .eq('family_id', person.family_id)
      .eq('user_id', userId);
    
    if (memberError || !memberCheck || memberCheck.length === 0) {
      // Eliminar los archivos subidos
      req.files.forEach(file => fs.unlinkSync(file.path));
      
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta persona'
      });
    }
    
    // Subir cada archivo a Supabase Storage
    const uploadPromises = req.files.map(async (file, index) => {
      const uploadResult = await storageService.uploadFile(
        file,
        userId,
        `media/${personId}/photo`
      );
      
      // Crear registro en la tabla media
      const { data: mediaRecord, error: mediaError } = await supabaseClient
        .from('media')
        .insert([{
          person_id: personId,
          file_name: file.originalname,
          file_url: uploadResult.url,
          file_type: 'photo',
          description: descriptions[index] || ''
        }])
        .select()
        .single();

      if (mediaError) throw new Error(mediaError.message);

      return mediaRecord;
    });

    const uploadedMedia = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      message: 'Archivos subidos correctamente',
      data: {
        uploadedMedia
      }
    });
  } catch (error) {
    console.error('Error al subir los archivos:', error);

    // Eliminar los archivos en caso de error
    if (req.files) {
      req.files.forEach(file => fs.unlinkSync(file.path));
    }

    res.status(500).json({
      success: false,
      message: 'Error al subir los archivos',
      error: error.message
    });
  }
};

exports.uploadDocuments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se han proporcionado archivos'
      });
    }

    const personId = req.params.personId;
    const userId = req.user.uid;
    const descriptions = req.body.descriptions || [];

    // Verificar si la persona existe y el usuario tiene acceso
    const { data: person, error: personError } = await supabaseClient
      .from('people')
      .select('family_id')
      .eq('id', personId)
      .single();

    if (personError || !person) {
      // Eliminar los archivos subidos
      req.files.forEach(file => fs.unlinkSync(file.path));

      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }

    // Verificar acceso a la familia
    const { data: memberCheck, error: memberError } = await supabaseClient
      .from('family_members')
      .select('id')
      .eq('family_id', person.family_id)
      .eq('user_id', userId);

    if (memberError || !memberCheck || memberCheck.length === 0) {
      // Eliminar los archivos subidos
      req.files.forEach(file => fs.unlinkSync(file.path));

      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta persona'
      });
    }

    // Subir cada archivo a Supabase Storage
    const uploadPromises = req.files.map(async (file, index) => {
      const uploadResult = await storageService.uploadFile(
        file,
        userId,
        `media/${personId}/document`
      );

      // Crear registro en la tabla media
      const { data: mediaRecord, error: mediaError } = await supabaseClient
        .from('media')
        .insert([{
          person_id: personId,
          file_name: file.originalname,
          file_url: uploadResult.url,
          file_type: 'document',
          description: descriptions[index] || ''
        }])
        .select()
        .single();
      
      if (mediaError) throw new Error(mediaError.message);
      
      return mediaRecord;
    });
    
    const uploadedMedia = await Promise.all(uploadPromises);
    
    res.status(200).json({
      success: true,
      message: 'Archivos subidos correctamente',
      data: {
        uploadedMedia
      }
    });
  } catch (error) {
    console.error('Error al subir los archivos:', error);
    
    // Eliminar los archivos en caso de error
    if (req.files) {
      req.files.forEach(file => fs.unlinkSync(file.path));
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al subir los archivos',
      error: error.message
    });
  }
};

// Obtener archivos multimedia de una persona
exports.getPersonMedia = async (req, res) => {
  try {
    const personId = req.params.personId;
    const userId = req.user.uid;
    
    // Verificar si la persona existe y el usuario tiene acceso
    const { data: person, error: personError } = await supabaseClient
      .from('people')
      .select('family_id')
      .eq('id', personId)
      .single();
    
    if (personError || !person) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }
    
    // Verificar acceso a la familia
    const { data: memberCheck, error: memberError } = await supabaseClient
      .from('family_members')
      .select('id')
      .eq('family_id', person.family_id)
      .eq('user_id', userId);
    
    if (memberError || !memberCheck || memberCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta persona'
      });
    }
    
    // Obtener archivos multimedia
    const { data: media, error: mediaError } = await supabaseClient
      .from('media')
      .select('*')
      .eq('person_id', personId)
      .order('created_at', { ascending: false });
    
    if (mediaError) throw new Error(mediaError.message);
    
    // Generar URLs firmadas para cada archivo
    const mediaWithUrls = await Promise.all(media.map(async (item) => {
      const signedUrl = await storageService.getFileUrl(item.file_url);
      return {
        ...item,
        signed_url: signedUrl
      };
    }));
    
    res.status(200).json({
      success: true,
      count: mediaWithUrls.length,
      data: mediaWithUrls
    });
  } catch (error) {
    console.error('Error al obtener archivos multimedia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener archivos multimedia',
      error: error.message
    });
  }
};

// Eliminar un archivo multimedia
exports.deleteMedia = async (req, res) => {
  try {
    const mediaId = req.params.mediaId;
    const userId = req.user._id;
    
    // Obtener información del archivo
    const { data: media, error: mediaError } = await supabaseClient
      .from('media')
      .select('*, people:person_id(family_id)')
      .eq('id', mediaId)
      .single();
    
    if (mediaError || !media) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }
    
    // Verificar acceso a la familia
    const { data: memberCheck, error: memberError } = await supabaseClient
      .from('family_members')
      .select('role')
      .eq('family_id', media.people.family_id)
      .eq('user_id', userId)
      .single();
    
    if (memberError || !memberCheck || !['admin', 'editor'].includes(memberCheck.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este archivo'
      });
    }
    
    // Eliminar el archivo de Supabase Storage
    await storageService.deleteFile(media.file_url);
    
    // Eliminar el registro de la base de datos
    const { error: deleteError } = await supabaseClient
      .from('media')
      .delete()
      .eq('id', mediaId);
    
    if (deleteError) throw new Error(deleteError.message);
    
    res.status(200).json({
      success: true,
      message: 'Archivo eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar el archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el archivo',
      error: error.message
    });
  }
};