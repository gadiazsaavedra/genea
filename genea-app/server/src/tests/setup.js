const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno de prueba
dotenv.config({ path: path.join(__dirname, '../../.env.test') });

// Mock para Firebase Admin
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  auth: () => ({
    verifyIdToken: jest.fn().mockResolvedValue({
      uid: 'test-uid',
      email: 'test@example.com',
      name: 'Test User'
    })
  })
}));

// Mock para fs
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  unlinkSync: jest.fn(),
  mkdirSync: jest.fn()
}));