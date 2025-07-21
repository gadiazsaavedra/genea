// Mock de mongoose y el modelo Person
jest.mock('mongoose', () => ({
  Types: {
    ObjectId: jest.fn().mockImplementation((id) => id)
  }
}));

// Mock del modelo Person
const mockPersonPrototype = {
  save: jest.fn().mockResolvedValue(true),
  remove: jest.fn().mockResolvedValue(true)
};

const MockPerson = jest.fn().mockImplementation(function(data) {
  Object.assign(this, data, mockPersonPrototype);
  return this;
});

MockPerson.find = jest.fn();
MockPerson.findById = jest.fn();
MockPerson.findByIdAndUpdate = jest.fn();
MockPerson.countDocuments = jest.fn();
MockPerson.updateMany = jest.fn().mockResolvedValue({});

jest.mock('../models/person.model', () => MockPerson);

const Person = require('../models/person.model');
const personController = require('../controllers/person.controller');

describe('Person Controller', () => {
  let req;
  let res;
  
  beforeEach(() => {
    req = {
      params: { id: '123456789012' },
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
  
  describe('getAllPersons', () => {
    test('debería devolver todas las personas', async () => {
      // Configurar mocks
      const mockPersons = [
        { _id: '1', fullName: 'Juan Pérez' },
        { _id: '2', fullName: 'María López' }
      ];
      
      Person.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue(mockPersons)
      });
      
      Person.countDocuments.mockResolvedValue(2);
      
      // Llamar al controlador
      await personController.getAllPersons(req, res);
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        total: 2,
        data: mockPersons
      });
    });
    
    test('debería manejar errores', async () => {
      // Configurar mock para simular un error
      Person.find.mockImplementation(() => {
        throw new Error('Error de base de datos');
      });
      
      // Llamar al controlador
      await personController.getAllPersons(req, res);
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al obtener las personas',
        error: 'Error de base de datos'
      });
    });
  });
  
  describe('getPersonById', () => {
    test('debería devolver una persona por ID', async () => {
      // Configurar mock
      const mockPerson = {
        _id: '123456789012',
        fullName: 'Juan Pérez',
        birthDate: '1980-01-01'
      };
      
      // Configurar el mock para devolver la persona después de múltiples populate
      const populateParents = jest.fn().mockReturnThis();
      const populateChildren = jest.fn().mockReturnThis();
      const populateSiblings = jest.fn().mockReturnThis();
      const populateSpouses = jest.fn().mockResolvedValue(mockPerson);
      
      Person.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: populateSpouses
            })
          })
        })
      });
      
      // Llamar al controlador
      await personController.getPersonById(req, res);
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPerson
      });
    });
    
    test('debería manejar persona no encontrada', async () => {
      // Configurar mock para persona no encontrada
      Person.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockResolvedValue(null)
            })
          })
        })
      });
      
      // Llamar al controlador
      await personController.getPersonById(req, res);
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Persona no encontrada'
      });
    });
  });
  
  describe('createPerson', () => {
    test('debería crear una nueva persona', async () => {
      // Datos para la nueva persona
      req.body = {
        fullName: 'Carlos Rodríguez',
        birthDate: '1990-10-20',
        isAlive: true
      };
      
      // Mock para la nueva persona
      const mockSavedPerson = {
        _id: 'new123',
        fullName: 'Carlos Rodríguez',
        birthDate: '1990-10-20',
        isAlive: true,
        createdBy: 'user123',
        save: jest.fn().mockResolvedValue({
          _id: 'new123',
          fullName: 'Carlos Rodríguez',
          birthDate: '1990-10-20',
          isAlive: true,
          createdBy: 'user123'
        })
      };
      
      // Configurar el mock del constructor de Person
      Person.mockImplementationOnce(() => mockSavedPerson);
      
      // Llamar al controlador
      await personController.createPerson(req, res);
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          _id: 'new123',
          fullName: 'Carlos Rodríguez'
        })
      });
    });
    
    test('debería manejar errores al crear una persona', async () => {
      // Datos para la nueva persona
      req.body = {
        fullName: 'Carlos Rodríguez',
        birthDate: '1990-10-20',
        isAlive: true
      };
      
      // Configurar el mock para lanzar un error
      const mockErrorPerson = {
        save: jest.fn().mockRejectedValue(new Error('Error al guardar'))
      };
      
      Person.mockImplementationOnce(() => mockErrorPerson);
      
      // Llamar al controlador
      await personController.createPerson(req, res);
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al crear la persona',
        error: 'Error al guardar'
      });
    });
  });
  
  describe('updatePerson', () => {
    test('debería actualizar una persona existente', async () => {
      // Datos para actualizar
      req.params.id = '123456789012';
      req.body = {
        fullName: 'Juan Pérez Actualizado',
        occupation: 'Ingeniero'
      };
      
      // Mock para la persona actualizada
      const mockUpdatedPerson = {
        _id: '123456789012',
        fullName: 'Juan Pérez Actualizado',
        occupation: 'Ingeniero',
        updatedAt: new Date()
      };
      
      // Configurar el mock de findByIdAndUpdate
      Person.findByIdAndUpdate.mockResolvedValue(mockUpdatedPerson);
      
      // Llamar al controlador
      await personController.updatePerson(req, res);
      
      // Verificar resultados
      expect(Person.findByIdAndUpdate).toHaveBeenCalledWith(
        '123456789012',
        { ...req.body, updatedAt: expect.any(Number) },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedPerson
      });
    });
    
    test('debería manejar persona no encontrada al actualizar', async () => {
      // Configurar el mock para devolver null
      Person.findByIdAndUpdate.mockResolvedValue(null);
      
      // Llamar al controlador
      await personController.updatePerson(req, res);
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Persona no encontrada'
      });
    });
    
    test('debería manejar errores al actualizar', async () => {
      // Configurar el mock para lanzar un error
      Person.findByIdAndUpdate.mockRejectedValue(new Error('Error al actualizar'));
      
      // Llamar al controlador
      await personController.updatePerson(req, res);
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al actualizar la persona',
        error: 'Error al actualizar'
      });
    });
  });
  
  describe('deletePerson', () => {
    test('debería eliminar una persona existente', async () => {
      // Mock para la persona a eliminar
      const mockPerson = {
        _id: '123456789012',
        fullName: 'Juan Pérez',
        remove: jest.fn().mockResolvedValue(true)
      };
      
      // Configurar el mock de findById
      Person.findById.mockResolvedValue(mockPerson);
      
      // Llamar al controlador
      await personController.deletePerson(req, res);
      
      // Verificar que se actualizaron las referencias
      expect(Person.updateMany).toHaveBeenCalledTimes(4);
      
      // Verificar que se eliminó la persona
      expect(mockPerson.remove).toHaveBeenCalled();
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Persona eliminada correctamente'
      });
    });
    
    test('debería manejar persona no encontrada al eliminar', async () => {
      // Configurar el mock para devolver null
      Person.findById.mockResolvedValue(null);
      
      // Llamar al controlador
      await personController.deletePerson(req, res);
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Persona no encontrada'
      });
    });
    
    test('debería manejar errores al eliminar', async () => {
      // Configurar el mock para lanzar un error
      Person.findById.mockRejectedValue(new Error('Error al eliminar'));
      
      // Llamar al controlador
      await personController.deletePerson(req, res);
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al eliminar la persona',
        error: 'Error al eliminar'
      });
    });
  });
  
  describe('addRelation', () => {
    test('debería agregar una relación padre-hijo', async () => {
      // Configurar datos de la solicitud
      req.body = {
        personId: '123456789012',
        relatedPersonId: '987654321098',
        relationType: 'parent'
      };
      
      // Mock para las personas
      const mockPerson = {
        _id: '123456789012',
        fullName: 'Juan Pérez',
        parents: [],
        children: [],
        siblings: [],
        spouses: [],
        save: jest.fn().mockResolvedValue(true)
      };
      
      const mockRelatedPerson = {
        _id: '987654321098',
        fullName: 'María López',
        parents: [],
        children: [],
        siblings: [],
        spouses: [],
        save: jest.fn().mockResolvedValue(true)
      };
      
      // Configurar mocks
      Person.findById.mockImplementation((id) => {
        if (id === '123456789012') return Promise.resolve(mockPerson);
        if (id === '987654321098') return Promise.resolve(mockRelatedPerson);
        return Promise.resolve(null);
      });
      
      // Llamar al controlador
      await personController.addRelation(req, res);
      
      // Verificar que se actualizaron las relaciones
      expect(mockPerson.parents).toContain('987654321098');
      expect(mockRelatedPerson.children).toContain('123456789012');
      
      // Verificar que se guardaron las personas
      expect(mockPerson.save).toHaveBeenCalled();
      expect(mockRelatedPerson.save).toHaveBeenCalled();
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Relación agregada correctamente'
      });
    });
    
    test('debería manejar persona no encontrada al agregar relación', async () => {
      // Configurar datos de la solicitud
      req.body = {
        personId: '123456789012',
        relatedPersonId: '987654321098',
        relationType: 'parent'
      };
      
      // Configurar mock para devolver null para una persona
      Person.findById.mockImplementation((id) => {
        if (id === '123456789012') return Promise.resolve({});
        return Promise.resolve(null);
      });
      
      // Llamar al controlador
      await personController.addRelation(req, res);
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Una o ambas personas no fueron encontradas'
      });
    });
    
    test('debería manejar tipo de relación inválido', async () => {
      // Configurar datos de la solicitud con tipo inválido
      req.body = {
        personId: '123456789012',
        relatedPersonId: '987654321098',
        relationType: 'invalid'
      };
      
      // Mock para las personas
      const mockPerson = {
        _id: '123456789012',
        fullName: 'Juan Pérez'
      };
      
      const mockRelatedPerson = {
        _id: '987654321098',
        fullName: 'María López'
      };
      
      // Configurar mocks
      Person.findById.mockImplementation((id) => {
        if (id === '123456789012') return Promise.resolve(mockPerson);
        if (id === '987654321098') return Promise.resolve(mockRelatedPerson);
        return Promise.resolve(null);
      });
      
      // Llamar al controlador
      await personController.addRelation(req, res);
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Tipo de relación no válido'
      });
    });
  });
});