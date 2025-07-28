const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { supabaseClient } = require('../config/supabase.config');
const crypto = require('crypto');

router.use(verifyToken);

// Obtener invitaciones enviadas
router.get('/', async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const { data: invitations, error } = await supabaseClient
      .from('invitations')
      .select('*')
      .eq('invited_by', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: invitations || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener invitaciones',
      error: error.message
    });
  }
});

// Crear invitación
router.post('/', async (req, res) => {
  try {
    const { email, role } = req.body;
    const userId = req.user.uid;
    
    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email y rol son requeridos'
      });
    }
    
    // Generar token único
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    const { data: invitation, error } = await supabaseClient
      .from('invitations')
      .insert([{
        family_id: '638a55dc-0a73-417c-9c80-556ac0028325',
        invited_by: userId,
        invited_email: email,
        role,
        token,
        expires_at: expiresAt.toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Simular envío de email
    console.log(`📧 Email enviado a ${email}`);
    console.log(`🔗 Link: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/invitation/accept/${token}`);
    
    res.status(201).json({
      success: true,
      message: 'Invitación enviada correctamente',
      data: invitation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear invitación',
      error: error.message
    });
  }
});

// Verificar invitación
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const now = new Date().toISOString();
    
    const { data: invitation, error } = await supabaseClient
      .from('invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .gt('expires_at', now)
      .single();
    
    if (error || !invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitación no encontrada o expirada'
      });
    }
    
    res.json({
      success: true,
      data: invitation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar invitación',
      error: error.message
    });
  }
});

// Aceptar invitación
router.post('/accept/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.user.uid;
    const now = new Date().toISOString();
    
    const { data: invitation, error } = await supabaseClient
      .from('invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .gt('expires_at', now)
      .single();
    
    if (error || !invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitación no encontrada o expirada'
      });
    }
    
    // Actualizar estado
    await supabaseClient
      .from('invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id);
    
    res.json({
      success: true,
      message: 'Invitación aceptada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al aceptar invitación',
      error: error.message
    });
  }
});

module.exports = router;