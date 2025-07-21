const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PersonSchema = new Schema({
  // Información personal básica
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  birthDate: {
    type: Date
  },
  deathDate: {
    type: Date
  },
  birthPlace: {
    city: String,
    country: String
  },
  currentResidence: {
    city: String,
    country: String
  },
  
  // Información de contacto
  contactInfo: {
    phoneNumbers: [{
      type: String,
      label: String // "móvil", "fijo", etc.
    }],
    email: String,
    address: String
  },
  
  // Multimedia
  profilePhoto: {
    type: String // URL a la imagen
  },
  photos: [{
    url: String,
    caption: String,
    date: Date
  }],
  documents: [{
    url: String,
    title: String,
    type: String, // "certificado de nacimiento", "matrimonio", etc.
    date: Date
  }],
  
  // Notas y anécdotas
  notes: [{
    content: String,
    date: { type: Date, default: Date.now }
  }],
  
  // Conexiones familiares
  parents: [{
    type: Schema.Types.ObjectId,
    ref: 'Person'
  }],
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'Person'
  }],
  spouses: [{
    person: {
      type: Schema.Types.ObjectId,
      ref: 'Person'
    },
    marriageDate: Date,
    divorceDate: Date,
    isCurrentSpouse: Boolean
  }],
  siblings: [{
    type: Schema.Types.ObjectId,
    ref: 'Person'
  }],
  
  // Otros datos
  ethnicity: String,
  maritalStatus: {
    type: String,
    enum: ['soltero', 'casado', 'divorciado', 'viudo', 'otro']
  },
  occupation: String,
  interests: [String],
  
  // Campos personalizados
  customFields: [{
    fieldName: String,
    fieldValue: Schema.Types.Mixed
  }],
  
  // Metadatos
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isAlive: {
    type: Boolean,
    default: true
  }
});

// Middleware para actualizar la fecha de modificación
PersonSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Person', PersonSchema);