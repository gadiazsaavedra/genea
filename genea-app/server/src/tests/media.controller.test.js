// Mock de fs y path
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  unlinkSync: jest.fn()
}));

jest.mock('path', () => ({
  join: jest.fn().mockImplementation((...args) => args.join('/'))
}));

// Mock del modelo Person
jest.mock('../models/person.model', () => {
  return {
    findById: jest.fn()
  };
});

const fs = require('fs');
const path = require('path');
const Person = require('../models/person.model');
const mediaController = require('../controllers/media.controller');

describe('Media Controller', () => {
  let req;
  let res;
  
  beforeEach(() => {
    req = {
      params: { 
        personId: 'person123',
        type: 'photos',
        fileId: 'file123'
      },
      file: {
        fieldname: 'profilePhoto',
        originalname: 'test-image.jpg',
        path: '/tmp/uploads/test-image-123456.jpg',
        filename: 'test-image-123456.jpg'
      },
      files: [
        {
          fieldname: 'photos',
          originalname: 'test-image1.jpg',
          path: '/tmp/uploads/test-image1-123456.jpg',
          filename: 'test-image1-123456.jpg'
        },
        {
          fieldname: 'photos',
          originalname: 'test-image2.jpg',
          path: '/tmp/uploads/test-image2-123456.jpg',
          filename: 'test-image2-123456.jpg'
        }
      ],
      body: {
        captions: ['Primera foto', 'Segunda foto'],
        titles: ['Primer documento', 'Segundo documento'],
        types: ['Certificado de nacimiento', 'Otro']
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Limpiar todos los mocks
    jest.clearAllMocks();
  });
  
  describe('uploadProfilePhoto', () => {
    test('debería subir una foto de perfil', async () => {
      // Mock de la persona
      const mockPerson = {
        _id: 'person123',
        fullName: 'Juan Pérez',
        profilePhoto: null,
        save: jest.fn().mockResolvedValue(true)
      };
      
      // Configurar mock
      Person.findById.mockResolvedValue(mockPerson);
      
      // Llamar al controlador
      await mediaController.uploadProfilePhoto(req, res);
      
      // Verificar que se actualizó la foto de perfil
      expect(mockPerson.profilePhoto).toBe('/uploads/test-image-123456.jpg');
      expect(mockPerson.save).toHaveBeenCalled();
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Foto de perfil actualizada correctamente',
        data: {
          fileUrl: '/uploads/test-image-123456.jpg',
          person: mockPerson
        }
      });
    });
    
    test('debería eliminar la foto anterior al subir una nueva', async () => {
      // Mock de la persona con foto existente
      const mockPerson = {
        _id: 'person123',
        fullName: 'Juan Pérez',
        profilePhoto: '/uploads/old-photo.jpg',
        save: jest.fn().mockResolvedValue(true)
      };
      
      // Configurar mock
      Person.findById.mockResolvedValue(mockPerson);
      
      // Mock path.join para devolver una ruta predecible
      path.join.mockImplementation((...args) => {
        if (args.includes('/uploads/old-photo.jpg')) {
          return '../..//uploads/old-photo.jpg';
        }
        return args.join('/');
      });
      
      // Llamar al controlador
      await mediaController.uploadProfilePhoto(req, res);
      
      // Verificar que se intentó eliminar la foto anterior
      expect(fs.unlinkSync).toHaveBeenCalled();
      
      // Verificar que se actualizó la foto de perfil
      expect(mockPerson.profilePhoto).toBe('/uploads/test-image-123456.jpg');
    });
    
    test('debería manejar persona no encontrada', async () => {
      // Configurar mock para persona no encontrada
      Person.findById.mockResolvedValue(null);
      
      // Llamar al controlador
      await mediaController.uploadProfilePhoto(req, res);
      
      // Verificar que se eliminó el archivo subido
      expect(fs.unlinkSync).toHaveBeenCalledWith(req.file.path);
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Persona no encontrada'
      });
    });
  });
  
  describe('uploadPhotos', () => {
    test('debería subir múltiples fotos', async () => {
      // Mock de la persona
      const mockPerson = {
        _id: 'person123',
        fullName: 'Juan Pérez',
        photos: [],
        save: jest.fn().mockResolvedValue(true)
      };
      
      // Configurar mock
      Person.findById.mockResolvedValue(mockPerson);
      
      // Llamar al controlador
      await mediaController.uploadPhotos(req, res);
      
      // Verificar que se agregaron las fotos
      expect(mockPerson.photos.length).toBe(2);
      expect(mockPerson.photos[0].url).toBe('/uploads/test-image1-123456.jpg');
      expect(mockPerson.photos[0].caption).toBe('Primera foto');
      expect(mockPerson.photos[1].url).toBe('/uploads/test-image2-123456.jpg');
      expect(mockPerson.photos[1].caption).toBe('Segunda foto');
      
      // Verificar que se guardó la persona
      expect(mockPerson.save).toHaveBeenCalled();
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Fotos subidas correctamente',
        data: {
          uploadedPhotos: expect.any(Array),
          person: mockPerson
        }
      });
    });
  });
  
  describe('deleteMedia', () => {
    test('debería eliminar una foto', async () => {
      // Mock de la persona con fotos
      const mockPerson = {
        _id: 'person123',
        fullName: 'Juan Pérez',
        photos: [
          { _id: 'file123', url: '/uploads/photo1.jpg', caption: 'Foto 1' },
          { _id: 'file456', url: '/uploads/photo2.jpg', caption: 'Foto 2' }
        ],
        save: jest.fn().mockResolvedValue(true)
      };
      
      // Configurar mock
      Person.findById.mockResolvedValue(mockPerson);
      
      // Mock path.join para devolver una ruta predecible
      path.join.mockImplementation((...args) => {
        if (args.includes('/uploads/photo1.jpg')) {
          return '../..//uploads/photo1.jpg';
        }
        return args.join('/');
      });
      
      // Llamar al controlador
      await mediaController.deleteMedia(req, res);
      
      // Verificar que se eliminó la foto de la persona
      expect(mockPerson.photos.length).toBe(1);
      expect(mockPerson.photos[0]._id).toBe('file456');
      
      // Verificar que se intentó eliminar el archivo físico
      expect(fs.unlinkSync).toHaveBeenCalled();
      
      // Verificar que se guardó la persona
      expect(mockPerson.save).toHaveBeenCalled();
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Archivo eliminado correctamente'
      });
    });
    
    test('debería manejar archivo no encontrado', async () => {
      // Configurar parámetros para un archivo que no existe
      req.params.fileId = 'nonexistent';
      
      // Mock de la persona con fotos
      const mockPerson = {
        _id: 'person123',
        fullName: 'Juan Pérez',
        photos: [
          { _id: 'file123', url: '/uploads/photo1.jpg', caption: 'Foto 1' }
        ],
        save: jest.fn().mockResolvedValue(true)
      };
      
      // Configurar mock
      Person.findById.mockResolvedValue(mockPerson);
      
      // Llamar al controlador
      await mediaController.deleteMedia(req, res);
      
      // Verificar resultados
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Foto no encontrada'
      });
    });
  });
});