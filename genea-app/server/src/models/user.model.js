const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  uid: {
    type: String,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  photoURL: {
    type: String
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  personId: {
    type: Schema.Types.ObjectId,
    ref: 'Person'
  },
  families: [{
    family: {
      type: Schema.Types.ObjectId,
      ref: 'Family'
    },
    role: {
      type: String,
      enum: ['admin', 'editor', 'viewer'],
      default: 'viewer'
    }
  }],
  preferences: {
    language: {
      type: String,
      default: 'es'
    },
    theme: {
      type: String,
      default: 'light'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);