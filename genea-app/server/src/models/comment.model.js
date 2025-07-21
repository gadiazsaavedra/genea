const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  mediaId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  mediaType: {
    type: String,
    enum: ['photo', 'document'],
    required: true
  },
  userId: {
    type: String, // UID del usuario que comenta
    required: true
  },
  userName: {
    type: String, // Nombre del usuario que comenta
    required: true
  },
  userPhotoURL: {
    type: String, // URL de la foto de perfil del usuario
    default: null
  },
  text: {
    type: String,
    required: true,
    maxlength: 500
  },
  mentions: [{
    userId: String,
    userName: String
  }]
}, {
  timestamps: true
});

// Índice para búsquedas rápidas por mediaId y mediaType
commentSchema.index({ mediaId: 1, mediaType: 1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;