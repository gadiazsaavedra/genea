// Mock de mongoose y los modelos
jest.mock('mongoose', () => ({
  Types: {
    ObjectId: jest.fn().mockImplementation((id) => id)
  }
}));

// Mock del modelo Family
const mockFamilyPrototype = {
  save: jest.fn().mockResolvedValue(true),
  remove: jest.fn().mockResolvedValue(true)
};

const MockFamily = jest.fn().mockImplementation(function(data) {
  Object.assign(this, data, mockFamilyPrototype);
  return this;
});

MockFamily.find = jest.fn();
MockFamily.findById = jest.fn();
MockFamily.findByIdAndUpdate = jest.fn();
MockFamily.updateMany = jest.fn().mockResolvedValue({});

jest.mock('../models/family.model', () => MockFamily);

// Mock del modelo User
const MockUser = {
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  updateMany: jest.fn().mockResolvedValue({})
};

jest.mock('../models/user.model', () => MockUser);

const Family = require('../models/family.model');
const User = require('../models/user.model');
const familyController = require('../controllers/family.controller');

describe('Family Controller', () => {
  let req;
  let res;
  
  beforeEach(() => {
    req = {
      params: { id: 'family123' },
      query: {},
      body: {},
      user: { _id: 'user123' }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Limpiar todos los mocks
    jest.clearAllMocks();
  });
  
  describe('getAllFamilies', () => {
    test('debería devolver todas las familias del usuario', async () => {
      // Mock del usuario con familias
      const mockUser = {
        _id: 'user123',
        families: [
          { family: 'family1' },
          { family: 'family2' }
        ]
      };
      
      // Mock de las familias
      const mockFamilies = [
        { _id: 'family1', name: 'Familia Pérez', description: 'Descripción 1' },
        { _id: 'family2', name: 'Familia López', description: 'Descripción 2' }
      ];
      
      // Configurar mocks
      User.findById.mockResolvedValue(mockUser);
      
      Family.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(mockFamilies)
      });
      
      // Llamar al controlador
      await familyController.getAllFamilies(req, res);
      
      // Verificar resultados
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(Family.find).toHaveBeenCalledWith({ _id: { $in: ['family1', 'family2'] } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockFamilies
      });
    });
    
    test('debería manejar errores', async () => {
      // Configurar mock para simular un error
      User.findById.mockRejectedValue(new Error('Error de base de datos'));
      
      // Llamar al controlador
      await familyController.getAllFamilies(req, res);
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al obtener las familias',
        error: 'Error de base de datos'
      });
    });
  });
  
  describe('getFamilyById', () => {
    test('debería devolver una familia específica', async () => {
      // Mock de la familia
      const mockFamily = {
        _id: 'family123',
        name: 'Familia Pérez',
        description: 'Descripción de la familia'
      };
      
      // Mock del usuario con acceso a la familia
      const mockUser = {
        _id: 'user123',
        families: [
          { family: 'family123', role: 'admin' }
        ]
      };
      
      // Configurar mocks con cadena de populate
      const populateMock = jest.fn();
      populateMock.mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(mockFamily)
      }));
      
      Family.findById.mockReturnValue({
        populate: populateMock
      });
      
      User.findById.mockResolvedValue(mockUser);
      
      // Llamar al controlador
      await familyController.getFamilyById(req, res);
      
      // Verificar resultados
      expect(Family.findById).toHaveBeenCalledWith('family123');
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockFamily
      });
    });
    
    test('debería manejar familia no encontrada', async () => {
      // Configurar mock para familia no encontrada
      const populateMock = jest.fn();
      populateMock.mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(null)
      }));
      
      Family.findById.mockReturnValue({
        populate: populateMock
      });
      
      // Llamar al controlador
      await familyController.getFamilyById(req, res);
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Familia no encontrada'
      });
    });
    
    test('debería manejar usuario sin acceso a la familia', async () => {
      // Mock de la familia
      const mockFamily = {
        _id: 'family123',
        name: 'Familia Pérez'
      };
      
      // Mock del usuario sin acceso a la familia
      const mockUser = {
        _id: 'user123',
        families: [
          { family: 'otherfamily', role: 'admin' }
        ]
      };
      
      // Configurar mocks con cadena de populate
      const populateMock = jest.fn();
      populateMock.mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(mockFamily)
      }));
      
      Family.findById.mockReturnValue({
        populate: populateMock
      });
      
      User.findById.mockResolvedValue(mockUser);
      
      // Llamar al controlador
      await familyController.getFamilyById(req, res);
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No tienes acceso a esta familia'
      });
    });
  });
  
  describe('createFamily', () => {
    test('debería crear una nueva familia', async () => {
      // Datos para la nueva familia
      req.body = {
        name: 'Nueva Familia',
        description: 'Descripción de la nueva familia'
      };
      
      // Mock para la familia guardada
      const mockSavedFamily = {
        _id: 'newfamily',
        name: 'Nueva Familia',
        description: 'Descripción de la nueva familia',
        createdBy: 'user123',
        members: [{ person: 'user123', role: 'admin' }],
        save: jest.fn().mockResolvedValue({
          _id: 'newfamily',
          name: 'Nueva Familia',
          description: 'Descripción de la nueva familia',
          createdBy: 'user123',
          members: [{ person: 'user123', role: 'admin' }]
        })
      };
      
      // Configurar el mock del constructor de Family
      Family.mockImplementationOnce(() => mockSavedFamily);
      
      // Configurar mock para actualizar usuario
      User.findByIdAndUpdate.mockResolvedValue({});
      
      // Llamar al controlador
      await familyController.createFamily(req, res);
      
      // Verificar que se actualizó el usuario
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user123', {
        $push: { families: { family: mockSavedFamily._id, role: 'admin' } }
      });
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          _id: 'newfamily',
          name: 'Nueva Familia'
        })
      });
    });
    
    test('debería manejar errores al crear una familia', async () => {
      // Configurar el mock para lanzar un error
      const mockErrorFamily = {
        save: jest.fn().mockRejectedValue(new Error('Error al guardar'))
      };
      
      Family.mockImplementationOnce(() => mockErrorFamily);
      
      // Llamar al controlador
      await familyController.createFamily(req, res);
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al crear la familia',
        error: 'Error al guardar'
      });
    });
  });
  
  describe('addFamilyMember', () => {
    test('debería agregar un miembro a la familia', async () => {
      // Datos para agregar miembro
      req.body = {
        familyId: 'family123',
        userId: 'newuser',
        role: 'viewer'
      };
      
      // Mock del usuario administrador
      const mockAdmin = {
        _id: 'user123',
        families: [
          { family: 'family123', role: 'admin' }
        ]
      };
      
      // Mock de la familia
      const mockFamily = {
        _id: 'family123',
        name: 'Familia Pérez',
        members: [],
        save: jest.fn().mockResolvedValue(true)
      };
      
      // Mock del usuario a agregar
      const mockNewUser = {
        _id: 'newuser',
        email: 'newuser@example.com'
      };
      
      // Configurar mocks
      User.findById.mockImplementation((id) => {
        if (id === 'user123') return Promise.resolve(mockAdmin);
        if (id === 'newuser') return Promise.resolve(mockNewUser);
        return Promise.resolve(null);
      });
      
      Family.findById.mockResolvedValue(mockFamily);
      User.findByIdAndUpdate.mockResolvedValue({});
      
      // Llamar al controlador
      await familyController.addFamilyMember(req, res);
      
      // Verificar que se agregó el miembro a la familia
      expect(mockFamily.members).toContainEqual({ person: 'newuser', role: 'viewer' });
      expect(mockFamily.save).toHaveBeenCalled();
      
      // Verificar que se actualizó el usuario
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('newuser', {
        $push: { families: { family: 'family123', role: 'viewer' } }
      });
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Miembro agregado correctamente a la familia'
      });
    });
    
    test('debería rechazar si el usuario no es administrador', async () => {
      // Datos para agregar miembro
      req.body = {
        familyId: 'family123',
        userId: 'newuser',
        role: 'viewer'
      };
      
      // Mock del usuario sin permisos de administrador
      const mockUser = {
        _id: 'user123',
        families: [
          { family: 'family123', role: 'viewer' }
        ]
      };
      
      // Configurar mock
      User.findById.mockResolvedValue(mockUser);
      
      // Llamar al controlador
      await familyController.addFamilyMember(req, res);
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No tienes permisos para agregar miembros a esta familia'
      });
    });
  });
});