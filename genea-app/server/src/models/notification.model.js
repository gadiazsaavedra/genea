const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String, // UID del usuario que recibe la notificación
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['invitation', 'comment', 'mention', 'system', 'update'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Datos adicionales específicos del tipo de notificación
    default: {}
  },
  link: {
    type: String, // Enlace opcional para redirigir al usuario
    default: null
  }
}, {
  timestamps: true
});

// Índice para búsquedas rápidas por usuario y estado de lectura
notificationSchema.index({ userId: 1, read: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;