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
    const { email, phone, role, method } = req.body;
    const userId = req.user.uid;
    
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Rol es requerido'
      });
    }
    
    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Email o teléfono son requeridos'
      });
    }
    
    // Generar token único
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    const invitationData = {
      family_id: '638a55dc-0a73-417c-9c80-556ac0028325',
      invited_by: userId,
      role,
      token,
      expires_at: expiresAt.toISOString(),
      invitation_method: method || 'email'
    };
    
    if (email) invitationData.invited_email = email;
    if (phone) invitationData.invited_phone = phone;
    
    const { data: invitation, error } = await supabaseClient
      .from('invitations')
      .insert([invitationData])
      .select()
      .single();
    
    if (error) throw error;
    
    // Generar URLs y mensajes
    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invitation/accept/${token}`;
    let whatsappMessage = '';
    let whatsappUrl = null;
    
    if (phone && (method === 'whatsapp' || method === 'both')) {
      whatsappMessage = `🌳 *Invitación a Genea*\n\nHas sido invitado a unirte a nuestra familia en Genea.\n\n🔗 Enlace de invitación:\n${inviteUrl}\n\n⏰ Este enlace expira en 7 días.\n\n📱 Genea - Sistema de Gestión de Árbol Genealógico`;
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;
    }
    
    // Crear notificación para el invitado (si tiene cuenta)
    const { createNotification } = require('./notifications.routes');
    if (email) {
      try {
        const { data: existingUser } = await supabaseClient.auth.admin.getUserByEmail(email);
        if (existingUser?.user) {
          await createNotification(
            existingUser.user.id,
            'invitation',
            '📧 Nueva invitación familiar',
            `Has recibido una invitación para unirte a una familia en Genea`,
            `/invitation/accept/${token}`
          );
        }
      } catch (notifError) {
        console.log('Error creating notification:', notifError.message);
      }
    }
    
    // Logs para debugging
    if (email) console.log(`📧 Email: ${email}`);
    if (phone) console.log(`📱 WhatsApp: ${phone}`);
    console.log(`🔗 Link: ${inviteUrl}`);
    
    res.status(201).json({
      success: true,
      message: 'Invitación creada correctamente',
      data: {
        ...invitation,
        inviteUrl,
        whatsappMessage,
        whatsappUrl
      }
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