const Invitation = require('../models/invitation.model');
const Family = require('../models/family.model');
const admin = require('firebase-admin');
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
      const { familyId, invitedEmail, role } = req.body;
      const invitedBy = req.user.uid;

      // Verificar si el usuario tiene permisos para invitar (debe ser admin de la familia)
      const family = await Family.findById(familyId);
      if (!family) {
        return res.status(404).json({ message: 'Familia no encontrada' });
      }

      // Verificar si el usuario es administrador de la familia
      if (family.admins.indexOf(invitedBy) === -1) {
        return res.status(403).json({ message: 'No tienes permisos para invitar a esta familia' });
      }

      // Verificar si ya existe una invitación pendiente para este email en esta familia
      const existingInvitation = await Invitation.findOne({
        familyId,
        invitedEmail,
        status: 'pending'
      });

      if (existingInvitation) {
        return res.status(400).json({ message: 'Ya existe una invitación pendiente para este email' });
      }

      // Generar token único
      const token = crypto.randomBytes(32).toString('hex');

      // Crear la invitación
      const invitation = new Invitation({
        familyId,
        invitedBy,
        invitedEmail,
        role,
        token,
        expiresAt: new Date(+new Date() + 7*24*60*60*1000) // 7 días
      });

      await invitation.save();

      // Enviar email de invitación
      const inviteUrl = `${process.env.FRONTEND_URL}/invitation/accept/${token}`;
      
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

      await transporter.sendMail(mailOptions);

      res.status(201).json({
        message: 'Invitación enviada correctamente',
        invitation: {
          id: invitation._id,
          familyId: invitation.familyId,
          invitedEmail: invitation.invitedEmail,
          status: invitation.status,
          expiresAt: invitation.expiresAt
        }
      });
    } catch (error) {
      console.error('Error al crear invitación:', error);
      res.status(500).json({ message: 'Error al crear invitación', error: error.message });
    }
  },

  // Obtener invitaciones enviadas por un usuario
  getInvitationsSent: async (req, res) => {
    try {
      const userId = req.user.uid;
      
      const invitations = await Invitation.find({ invitedBy: userId })
        .sort({ createdAt: -1 });
      
      res.status(200).json(invitations);
    } catch (error) {
      console.error('Error al obtener invitaciones:', error);
      res.status(500).json({ message: 'Error al obtener invitaciones', error: error.message });
    }
  },

  // Obtener invitaciones recibidas por un usuario
  getInvitationsReceived: async (req, res) => {
    try {
      const userEmail = req.user.email;
      
      const invitations = await Invitation.find({ 
        invitedEmail: userEmail,
        status: 'pending',
        expiresAt: { $gt: new Date() }
      }).sort({ createdAt: -1 });
      
      res.status(200).json(invitations);
    } catch (error) {
      console.error('Error al obtener invitaciones:', error);
      res.status(500).json({ message: 'Error al obtener invitaciones', error: error.message });
    }
  },

  // Verificar y aceptar una invitación
  acceptInvitation: async (req, res) => {
    try {
      const { token } = req.params;
      const userId = req.user.uid;
      
      // Buscar la invitación por token
      const invitation = await Invitation.findOne({ 
        token,
        status: 'pending',
        expiresAt: { $gt: new Date() }
      });
      
      if (!invitation) {
        return res.status(404).json({ message: 'Invitación no encontrada o expirada' });
      }
      
      // Verificar que el email de la invitación coincide con el del usuario
      if (invitation.invitedEmail !== req.user.email) {
        return res.status(403).json({ message: 'Esta invitación no está dirigida a tu cuenta' });
      }
      
      // Actualizar la familia para añadir al usuario
      const family = await Family.findById(invitation.familyId);
      
      if (!family) {
        return res.status(404).json({ message: 'Familia no encontrada' });
      }
      
      // Añadir al usuario según el rol
      if (invitation.role === 'admin') {
        if (!family.admins.includes(userId)) {
          family.admins.push(userId);
        }
      } else if (invitation.role === 'editor') {
        if (!family.editors.includes(userId)) {
          family.editors.push(userId);
        }
      } else {
        if (!family.members.includes(userId)) {
          family.members.push(userId);
        }
      }
      
      await family.save();
      
      // Actualizar el estado de la invitación
      invitation.status = 'accepted';
      await invitation.save();
      
      res.status(200).json({ 
        message: 'Invitación aceptada correctamente',
        family: {
          id: family._id,
          name: family.name
        }
      });
    } catch (error) {
      console.error('Error al aceptar invitación:', error);
      res.status(500).json({ message: 'Error al aceptar invitación', error: error.message });
    }
  },

  // Rechazar una invitación
  rejectInvitation: async (req, res) => {
    try {
      const { token } = req.params;
      
      // Buscar la invitación por token
      const invitation = await Invitation.findOne({ 
        token,
        status: 'pending'
      });
      
      if (!invitation) {
        return res.status(404).json({ message: 'Invitación no encontrada' });
      }
      
      // Verificar que el email de la invitación coincide con el del usuario
      if (invitation.invitedEmail !== req.user.email) {
        return res.status(403).json({ message: 'Esta invitación no está dirigida a tu cuenta' });
      }
      
      // Actualizar el estado de la invitación
      invitation.status = 'rejected';
      await invitation.save();
      
      res.status(200).json({ message: 'Invitación rechazada correctamente' });
    } catch (error) {
      console.error('Error al rechazar invitación:', error);
      res.status(500).json({ message: 'Error al rechazar invitación', error: error.message });
    }
  },

  // Cancelar una invitación (por el remitente)
  cancelInvitation: async (req, res) => {
    try {
      const { invitationId } = req.params;
      const userId = req.user.uid;
      
      // Buscar la invitación
      const invitation = await Invitation.findById(invitationId);
      
      if (!invitation) {
        return res.status(404).json({ message: 'Invitación no encontrada' });
      }
      
      // Verificar que el usuario es quien envió la invitación
      if (invitation.invitedBy !== userId) {
        return res.status(403).json({ message: 'No tienes permisos para cancelar esta invitación' });
      }
      
      // Eliminar la invitación
      await Invitation.findByIdAndDelete(invitationId);
      
      res.status(200).json({ message: 'Invitación cancelada correctamente' });
    } catch (error) {
      console.error('Error al cancelar invitación:', error);
      res.status(500).json({ message: 'Error al cancelar invitación', error: error.message });
    }
  }
};

module.exports = invitationController;