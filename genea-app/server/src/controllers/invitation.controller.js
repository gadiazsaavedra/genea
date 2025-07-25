const { supabaseClient, supabaseAdmin } = require('../config/supabase.config');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configuración de nodemailer (para envío de emails)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const invitationController = {
  // Crear una nueva invitación
  createInvitation: async (req, res) => {
    try {
      const { familyId, invitedEmail, invitedPhone, role, invitationMethod } = req.body;
      const invitedBy = req.user.uid;
      
      // Validar que se proporcione al menos email o teléfono
      if (!invitedEmail && !invitedPhone) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar email o número de teléfono'
        });
      }

      // Verificar si la familia existe
      const { data: family, error: familyError } = await supabaseClient
        .from('families')
        .select('name')
        .eq('id', familyId)
        .single();

      if (familyError || !family) {
        return res.status(404).json({ 
          success: false,
          message: 'Familia no encontrada' 
        });
      }

      // Verificar si el usuario es administrador de la familia
      const { data: memberCheck, error: memberError } = await supabaseClient
        .from('family_members')
        .select('role')
        .eq('family_id', familyId)
        .eq('user_id', invitedBy)
        .single();

      if (memberError || !memberCheck || memberCheck.role !== 'admin') {
        return res.status(403).json({ 
          success: false,
          message: 'No tienes permisos para invitar a esta familia' 
        });
      }

      // Verificar si ya existe una invitación pendiente
      let existingQuery = supabaseClient
        .from('invitations')
        .select('id')
        .eq('family_id', familyId)
        .eq('status', 'pending');
      
      if (invitedEmail) {
        existingQuery = existingQuery.eq('invited_email', invitedEmail);
      }
      if (invitedPhone) {
        existingQuery = existingQuery.eq('invited_phone', invitedPhone);
      }
      
      const { data: existingInvitation } = await existingQuery.single();

      if (existingInvitation) {
        return res.status(400).json({ 
          success: false,
          message: 'Ya existe una invitación pendiente para este contacto' 
        });
      }

      // Generar token único
      const token = crypto.randomBytes(32).toString('hex');
      
      // Calcular fecha de expiración (7 días)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Crear la invitación
      const invitationData = {
        family_id: familyId,
        invited_by: invitedBy,
        role,
        token,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
        invitation_method: invitationMethod || 'email'
      };
      
      if (invitedEmail) invitationData.invited_email = invitedEmail;
      if (invitedPhone) invitationData.invited_phone = invitedPhone;
      
      const { data: invitation, error: createError } = await supabaseClient
        .from('invitations')
        .insert([invitationData])
        .select()
        .single();

      if (createError) throw new Error(createError.message);

      // Enviar invitación según el método seleccionado
      const inviteUrl = `${process.env.FRONTEND_URL}/invitation/accept/${token}`;
      
      if (invitedEmail && (invitationMethod === 'email' || invitationMethod === 'both')) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: invitedEmail,
          subject: `Invitación a unirse a la familia ${family.name} en Genea`,
          html: `
            <h1>Has sido invitado a unirte a la familia ${family.name} en Genea</h1>
            <p>Haz clic en el siguiente enlace para aceptar la invitación:</p>
            <a href="${inviteUrl}" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Aceptar invitación</a>
            <p>Este enlace expirará en 7 días.</p>
            <p>Si no conoces a quien te ha invitado, puedes ignorar este mensaje.</p>
          `
        };
        
        try {
          await transporter.sendMail(mailOptions);
        } catch (emailError) {
          console.error('Error enviando email:', emailError);
        }
      }

      // Generar mensaje para WhatsApp si es necesario
      let whatsappMessage = '';
      if (invitedPhone && (invitationMethod === 'whatsapp' || invitationMethod === 'both')) {
        whatsappMessage = `🌳 *Invitación a Genea*\n\nHas sido invitado a unirte a la familia *${family.name}* en Genea.\n\n🔗 Enlace de invitación:\n${inviteUrl}\n\n⏰ Este enlace expira en 7 días.\n\n📱 Genea - Sistema de Gestión de Árbol Genealógico`;
      }
      
      res.status(201).json({
        success: true,
        message: 'Invitación creada correctamente',
        data: {
          id: invitation.id,
          familyId: invitation.family_id,
          invitedEmail: invitation.invited_email,
          invitedPhone: invitation.invited_phone,
          invitationMethod: invitation.invitation_method,
          status: invitation.status,
          expiresAt: invitation.expires_at,
          inviteUrl,
          whatsappMessage,
          whatsappUrl: invitedPhone ? `https://wa.me/${invitedPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}` : null
        }
      });
    } catch (error) {
      console.error('Error al crear invitación:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al crear invitación', 
        error: error.message 
      });
    }
  },

  // Obtener invitaciones enviadas por un usuario
  getInvitationsSent: async (req, res) => {
    try {
      const userId = req.user.uid;
      
      const { data: invitations, error: invitationsError } = await supabaseClient
        .from('invitations')
        .select(`
          *,
          families:family_id (
            name
          )
        `)
        .eq('invited_by', userId)
        .order('created_at', { ascending: false });
      
      if (invitationsError) throw new Error(invitationsError.message);
      
      res.status(200).json({
        success: true,
        data: invitations
      });
    } catch (error) {
      console.error('Error al obtener invitaciones:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener invitaciones', 
        error: error.message 
      });
    }
  },

  // Obtener invitaciones recibidas por un usuario
  getInvitationsReceived: async (req, res) => {
    try {
      const userEmail = req.user.email;
      const now = new Date().toISOString();
      
      const { data: invitations, error: invitationsError } = await supabaseClient
        .from('invitations')
        .select(`
          *,
          families:family_id (
            name
          )
        `)
        .eq('invited_email', userEmail)
        .eq('status', 'pending')
        .gt('expires_at', now)
        .order('created_at', { ascending: false });
      
      if (invitationsError) throw new Error(invitationsError.message);
      
      res.status(200).json({
        success: true,
        data: invitations
      });
    } catch (error) {
      console.error('Error al obtener invitaciones:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener invitaciones', 
        error: error.message 
      });
    }
  },

  // Verificar y aceptar una invitación
  acceptInvitation: async (req, res) => {
    try {
      const { token } = req.params;
      const userId = req.user.uid;
      const now = new Date().toISOString();
      
      // Buscar la invitación por token
      const { data: invitation, error: invitationError } = await supabaseClient
        .from('invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .gt('expires_at', now)
        .single();
      
      if (invitationError || !invitation) {
        return res.status(404).json({ 
          success: false,
          message: 'Invitación no encontrada o expirada' 
        });
      }
      
      // Verificar que el email de la invitación coincide con el del usuario
      if (invitation.invited_email !== req.user.email) {
        return res.status(403).json({ 
          success: false,
          message: 'Esta invitación no está dirigida a tu cuenta' 
        });
      }
      
      // Verificar que la familia existe
      const { data: family, error: familyError } = await supabaseClient
        .from('families')
        .select('name')
        .eq('id', invitation.family_id)
        .single();
      
      if (familyError || !family) {
        return res.status(404).json({ 
          success: false,
          message: 'Familia no encontrada' 
        });
      }
      
      // Verificar si el usuario ya es miembro de la familia
      const { data: existingMember, error: memberError } = await supabaseClient
        .from('family_members')
        .select('id')
        .eq('family_id', invitation.family_id)
        .eq('user_id', userId)
        .single();
      
      if (existingMember) {
        // Actualizar el rol si es necesario
        if (invitation.role === 'admin') {
          await supabaseClient
            .from('family_members')
            .update({ role: 'admin' })
            .eq('id', existingMember.id);
        }
      } else {
        // Añadir al usuario como miembro de la familia
        await supabaseClient
          .from('family_members')
          .insert([{
            family_id: invitation.family_id,
            user_id: userId,
            role: invitation.role
          }]);
      }
      
      // Actualizar el estado de la invitación
      await supabaseClient
        .from('invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);
      
      res.status(200).json({ 
        success: true,
        message: 'Invitación aceptada correctamente',
        data: {
          family: {
            id: invitation.family_id,
            name: family.name
          }
        }
      });
    } catch (error) {
      console.error('Error al aceptar invitación:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al aceptar invitación', 
        error: error.message 
      });
    }
  },

  // Rechazar una invitación
  rejectInvitation: async (req, res) => {
    try {
      const { token } = req.params;
      
      // Buscar la invitación por token
      const { data: invitation, error: invitationError } = await supabaseClient
        .from('invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .single();
      
      if (invitationError || !invitation) {
        return res.status(404).json({ 
          success: false,
          message: 'Invitación no encontrada' 
        });
      }
      
      // Verificar que el email de la invitación coincide con el del usuario
      if (invitation.invited_email !== req.user.email) {
        return res.status(403).json({ 
          success: false,
          message: 'Esta invitación no está dirigida a tu cuenta' 
        });
      }
      
      // Actualizar el estado de la invitación
      await supabaseClient
        .from('invitations')
        .update({ status: 'rejected' })
        .eq('id', invitation.id);
      
      res.status(200).json({ 
        success: true,
        message: 'Invitación rechazada correctamente' 
      });
    } catch (error) {
      console.error('Error al rechazar invitación:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al rechazar invitación', 
        error: error.message 
      });
    }
  },

  // Cancelar una invitación (por el remitente)
  cancelInvitation: async (req, res) => {
    try {
      const { invitationId } = req.params;
      const userId = req.user.uid;
      
      // Buscar la invitación
      const { data: invitation, error: invitationError } = await supabaseClient
        .from('invitations')
        .select('*')
        .eq('id', invitationId)
        .single();
      
      if (invitationError || !invitation) {
        return res.status(404).json({ 
          success: false,
          message: 'Invitación no encontrada' 
        });
      }
      
      // Verificar que el usuario es quien envió la invitación
      if (invitation.invited_by !== userId) {
        return res.status(403).json({ 
          success: false,
          message: 'No tienes permisos para cancelar esta invitación' 
        });
      }
      
      // Eliminar la invitación
      await supabaseClient
        .from('invitations')
        .delete()
        .eq('id', invitationId);
      
      res.status(200).json({ 
        success: true,
        message: 'Invitación cancelada correctamente' 
      });
    } catch (error) {
      console.error('Error al cancelar invitación:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al cancelar invitación', 
        error: error.message 
      });
    }
  }
};

module.exports = invitationController;