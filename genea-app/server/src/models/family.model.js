const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FamilySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  founders: [{
    type: Schema.Types.ObjectId,
    ref: 'Person'
  }],
  members: [{
    person: {
      type: Schema.Types.ObjectId,
      ref: 'Person'
    },
    role: String // "administrador", "editor", "visualizador"
  }],
  branches: [{
    name: String,
    description: String,
    rootPerson: {
      type: Schema.Types.ObjectId,
      ref: 'Person'
    }
  }],
  events: [{
    title: String,
    description: String,
    date: Date,
    location: {
      city: String,
      country: String
    },
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'Person'
    }],
    photos: [{
      url: String,
      caption: String
    }]
  }],
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
  privacySettings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    showLivingPersons: {
      type: Boolean,
      default: true
    },
    showContactInfo: {
      type: Boolean,
      default: false
    }
  }
});

// Middleware para actualizar la fecha de modificación
FamilySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Family', FamilySchema);