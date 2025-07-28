const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { supabaseClient } = require('../config/supabase.config');

router.use(verifyToken);

// Obtener notificaciones del usuario
router.get('/', async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const { data: notifications, error } = await supabaseClient
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: notifications || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones',
      error: error.message
    });
  }
});

// Marcar notificación como leída
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    const { error } = await supabaseClient
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Notificación marcada como leída'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al marcar notificación',
      error: error.message
    });
  }
});

// Crear notificación desde frontend
router.post('/', async (req, res) => {
  try {
    const { type, title, message, link } = req.body;
    const userId = req.user.uid;
    
    const { data, error } = await supabaseClient
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        title,
        message,
        link
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear notificación',
      error: error.message
    });
  }
});

// Crear notificación (función helper)
const createNotification = async (userId, type, title, message, link = null) => {
  try {
    const { data, error } = await supabaseClient
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        title,
        message,
        link
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

module.exports = { router, createNotification };