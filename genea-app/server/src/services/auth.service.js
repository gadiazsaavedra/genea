const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'genea-secret-key';
const JWT_EXPIRES_IN = '7d';

const authService = {
  // Registrar un nuevo usuario
  async register(email, password, displayName) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('El usuario ya existe');
      }

      // Encriptar la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Crear el usuario
      const user = new User({
        email,
        password: hashedPassword,
        displayName,
        photoURL: null,
        emailVerified: false
      });

      await user.save();

      // Generar token
      const token = jwt.sign(
        { 
          uid: user._id,
          email: user.email,
          displayName: user.displayName
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return {
        token,
        user: {
          uid: user._id,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified
        }
      };
    } catch (error) {
      throw error;
    }
  },

  // Iniciar sesión
  async login(email, password) {
    try {
      // Buscar el usuario
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Credenciales inválidas');
      }

      // Verificar la contraseña
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error('Credenciales inválidas');
      }

      // Generar token
      const token = jwt.sign(
        { 
          uid: user._id,
          email: user.email,
          displayName: user.displayName
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return {
        token,
        user: {
          uid: user._id,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified
        }
      };
    } catch (error) {
      throw error;
    }
  },

  // Verificar token
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Token inválido');
    }
  },

  // Actualizar perfil de usuario
  async updateProfile(userId, data) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Actualizar campos
      if (data.displayName) user.displayName = data.displayName;
      if (data.photoURL) user.photoURL = data.photoURL;

      await user.save();

      return {
        uid: user._id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified
      };
    } catch (error) {
      throw error;
    }
  },

  // Cambiar contraseña
  async updatePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar la contraseña actual
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Encriptar la nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;

      await user.save();
      return true;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = authService;