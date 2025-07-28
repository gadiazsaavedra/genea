const { supabaseClient } = require('../config/supabase.config');

// Obtener todos los eventos
exports.getAllEvents = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const { data: events, error } = await supabaseClient
      .from('events')
      .select(`
        *,
        media:event_media(*)
      `)
      .order('event_date', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: events || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener eventos',
      error: error.message
    });
  }
};

// Eliminar evento
exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.uid;
    
    const { error } = await supabaseClient
      .from('events')
      .delete()
      .eq('id', eventId);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Evento eliminado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar evento',
      error: error.message
    });
  }
};

// Crear evento
exports.createEvent = async (req, res) => {
  try {
    const { title, description, event_date, location, event_type } = req.body;
    const userId = req.user.uid;
    
    const { data: event, error } = await supabaseClient
      .from('events')
      .insert([{
        title,
        description,
        event_date,
        location,
        event_type,
        created_by: userId
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear evento',
      error: error.message
    });
  }
};

// Subir fotos a evento
exports.uploadEventPhotos = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { descriptions = [] } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron archivos'
      });
    }
    
    const uploadPromises = req.files.map(async (file, index) => {
      const { data: media, error } = await supabaseClient
        .from('event_media')
        .insert([{
          event_id: eventId,
          file_name: file.originalname,
          file_url: `/uploads/${file.filename}`,
          file_type: 'photo',
          description: descriptions[index] || ''
        }])
        .select()
        .single();
      
      if (error) throw error;
      return media;
    });
    
    const uploadedMedia = await Promise.all(uploadPromises);
    
    res.json({
      success: true,
      data: uploadedMedia
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al subir fotos',
      error: error.message
    });
  }
};