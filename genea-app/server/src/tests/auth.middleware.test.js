// Mock de firebase-admin y User
jest.mock('firebase-admin', () => {
  const mockVerifyIdToken = jest.fn();
  return {
    auth: () => ({
      verifyIdToken: mockVerifyIdToken
    })
  };
});

// Mock del modelo User para auth middleware
const MockUser = {
  findOne: jest.fn(),
  prototype: {
    save: jest.fn()
  }
};

// Mock constructor para User
MockUser.mockImplementation = jest.fn(function(data) {
  return {
    ...data,
    save: jest.fn().mockResolvedValue(true)
  };
});

jest.mock('../models/user.model', () => MockUser);

const admin = require('firebase-admin');
const User = require('../models/user.model');
const { authMiddleware } = require('../middleware/auth.middleware');

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;
  
  beforeEach(() => {
    // Reiniciar mocks
    jest.clearAllMocks();
    
    // Configurar objetos de prueba
    req = {
      headers: {
        authorization: 'Bearer test-token'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
    
    // No need to re-mock User constructor here as it's already set up in the jest.mock section
  });
  
  test('debería pasar al siguiente middleware si el token es válido y el usuario existe', async () => {
    // Configurar mocks para un escenario exitoso
    admin.auth().verifyIdToken.mockResolvedValue({
      uid: 'test-uid',
      email: 'test@example.com',
      name: 'Test User'
    });
    
    const mockUser = {
      _id: '60d0fe4f5311236168a109ca',
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      lastLogin: new Date(),
      save: jest.fn().mockResolvedValue(true)
    };
    
    User.findOne.mockResolvedValue(mockUser);
    
    // Ejecutar middleware
    await authMiddleware(req, res, next);
    
    // Verificar que se llamó a verifyIdToken con el token correcto
    expect(admin.auth().verifyIdToken).toHaveBeenCalledWith('test-token');
    
    // Verificar que se buscó al usuario
    expect(User.findOne).toHaveBeenCalledWith({ uid: 'test-uid' });
    
    // Verificar que se actualizó la última vez que inició sesión
    expect(mockUser.save).toHaveBeenCalled();
    
    // Verificar que se agregó el usuario al objeto de solicitud
    expect(req.user).toBe(mockUser);
    
    // Verificar que se llamó al siguiente middleware
    expect(next).toHaveBeenCalled();
    
    // Verificar que no se llamó a res.status o res.json
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
  
  test('debería devolver un error 401 si no hay token de autorización', async () => {
    // Configurar req sin token
    req.headers.authorization = undefined;
    
    // Ejecutar middleware
    await authMiddleware(req, res, next);
    
    // Verificar que se devolvió un error 401
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'No autorizado, token no proporcionado'
    });
    
    // Verificar que no se llamó al siguiente middleware
    expect(next).not.toHaveBeenCalled();
  });
});