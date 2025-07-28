const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { supabaseClient } = require('../config/supabase.config');

router.use(verifyToken);

// Obtener todos los comentarios
router.get('/', async (req, res) => {
  try {
    const { data: comments, error } = await supabaseClient
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: comments || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener comentarios',
      error: error.message
    });
  }
});

// Crear comentario
router.post('/', async (req, res) => {
  try {
    const { content, media_id } = req.body;
    const userId = req.user.uid;
    
    if (!content || !media_id) {
      return res.status(400).json({
        success: false,
        message: 'Contenido y foto son requeridos'
      });
    }
    
    // Obtener nombre del usuario
    const { data: user, error: userError } = await supabaseClient.auth.admin.getUserById(userId);
    const userName = user?.user?.user_metadata?.full_name || user?.user?.email || 'Usuario';
    
    const { data: comment, error } = await supabaseClient
      .from('comments')
      .insert([{
        media_id,
        user_id: userId,
        user_name: userName,
        content
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear comentario',
      error: error.message
    });
  }
});

module.exports = router;