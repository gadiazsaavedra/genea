const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true
  },
  invitedBy: {
    type: String, // UID del usuario que envía la invitación
    required: true
  },
  invitedEmail: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'editor', 'viewer'],
    default: 'viewer'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  token: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(+new Date() + 7*24*60*60*1000) // 7 días por defecto
  }
}, {
  timestamps: true
});

// Índice para búsquedas rápidas por token
invitationSchema.index({ token: 1 });

// Índice para búsquedas por email y estado
invitationSchema.index({ invitedEmail: 1, status: 1 });

const Invitation = mongoose.model('Invitation', invitationSchema);

module.exports = Invitation;