const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');
const Person = require('../models/person.model');
const mediaRoutes = require('../routes/media.routes');

// Mock del middleware de autenticación
jest.mock('../middleware/auth.middleware', () => (req, res, next) => {
  req.user = {
    _id: '60d0fe4f5311236168a109ca',
    email: 'test@example.com',
    displayName: 'Test User'
  };
  next();
});

// Mock de multer para pruebas
jest.mock('multer', () => {
  const multer = () => ({
    single: () => (req, res, next) => {
      req.file = {
        fieldname: 'profilePhoto',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: '/tmp/uploads',
        filename: 'test-image-123456.jpg',
        path: '/tmp/uploads/test-image-123456.jpg',
        size: 12345
      };
      next();
    },
    array: () => (req, res, next) => {
      req.files = [
        {
          fieldname: 'photos',
          originalname: 'test-image1.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          destination: '/tmp/uploads',
          filename: 'test-image1-123456.jpg',
          path: '/tmp/uploads/test-image1-123456.jpg',
          size: 12345
        },
        {
          fieldname: 'photos',
          originalname: 'test-image2.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          destination: '/tmp/uploads',
          filename: 'test-image2-123456.jpg',
          path: '/tmp/uploads/test-image2-123456.jpg',
          size: 12345
        }
      ];
      next();
    }
  });
  
  multer.diskStorage = () => ({});
  return multer;
});

// Mock de fs para pruebas
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  unlinkSync: jest.fn(),
  mkdirSync: jest.fn()
}));

// Crear app Express para las pruebas
const app = express();
app.use(express.json());
app.use('/api/media', mediaRoutes);

describe('Rutas de Medios', () => {
  // Datos de prueba
  let testPersonId;
  let testPhotoId;
  let testDocumentId;
  
  // Crear datos de prueba antes de las pruebas
  beforeEach(async () => {
    // Crear una persona de prueba con fotos y documentos
    const testPerson = new Person({
      fullName: 'Juan Pérez',
      birthDate: new Date('1980-01-01'),
      isAlive: true,
      photos: [
        {
          url: '/uploads/test-photo.jpg',
          caption: 'Foto de prueba',
          date: new Date()
        }
      ],
      documents: [
        {
          url: '/uploads/test-document.pdf',
          title: 'Documento de prueba',
          type: 'Otro',
          date: new Date()
        }
      ]
    });
    
    const savedPerson = await testPerson.save();
    testPersonId = savedPerson._id.toString();
    testPhotoId = savedPerson.photos[0]._id.toString();
    testDocumentId = savedPerson.documents[0]._id.toString();
  });
  
  // Prueba para subir una foto de perfil
  test('POST /api/media/profilePhoto/:personId debería subir una foto de perfil', async () => {
    const response = await request(app)
      .post(`/api/media/profilePhoto/${testPersonId}`)
      .attach('profilePhoto', Buffer.from('test image data'), 'test-image.jpg');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.fileUrl).toContain('/uploads/');
    
    // Verificar que la persona se actualizó con la foto de perfil
    const updatedPerson = await Person.findById(testPersonId);
    expect(updatedPerson.profilePhoto).toBe(response.body.data.fileUrl);
  });
  
  // Prueba para subir fotos
  test('POST /api/media/photos/:personId debería subir fotos', async () => {
    const response = await request(app)
      .post(`/api/media/photos/${testPersonId}`)
      .field('captions[0]', 'Primera foto')
      .field('captions[1]', 'Segunda foto')
      .attach('photos', Buffer.from('test image 1 data'), 'test-image1.jpg')
      .attach('photos', Buffer.from('test image 2 data'), 'test-image2.jpg');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.uploadedPhotos.length).toBe(2);
    
    // Verificar que la persona se actualizó con las nuevas fotos
    const updatedPerson = await Person.findById(testPersonId);
    expect(updatedPerson.photos.length).toBe(3); // 1 original + 2 nuevas
  });
  
  // Prueba para subir documentos
  test('POST /api/media/documents/:personId debería subir documentos', async () => {
    const response = await request(app)
      .post(`/api/media/documents/${testPersonId}`)
      .field('titles[0]', 'Primer documento')
      .field('titles[1]', 'Segundo documento')
      .field('types[0]', 'Certificado de nacimiento')
      .field('types[1]', 'Otro')
      .attach('documents', Buffer.from('test document 1 data'), 'test-doc1.pdf')
      .attach('documents', Buffer.from('test document 2 data'), 'test-doc2.pdf');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.uploadedDocuments.length).toBe(2);
    
    // Verificar que la persona se actualizó con los nuevos documentos
    const updatedPerson = await Person.findById(testPersonId);
    expect(updatedPerson.documents.length).toBe(3); // 1 original + 2 nuevos
  });
  
  // Prueba para eliminar una foto
  test('DELETE /api/media/:personId/photos/:fileId debería eliminar una foto', async () => {
    const response = await request(app)
      .delete(`/api/media/${testPersonId}/photos/${testPhotoId}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    // Verificar que la foto se eliminó de la persona
    const updatedPerson = await Person.findById(testPersonId);
    expect(updatedPerson.photos.length).toBe(0);
    
    // Verificar que se intentó eliminar el archivo físico
    expect(fs.unlinkSync).toHaveBeenCalled();
  });
  
  // Prueba para eliminar un documento
  test('DELETE /api/media/:personId/documents/:fileId debería eliminar un documento', async () => {
    const response = await request(app)
      .delete(`/api/media/${testPersonId}/documents/${testDocumentId}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    // Verificar que el documento se eliminó de la persona
    const updatedPerson = await Person.findById(testPersonId);
    expect(updatedPerson.documents.length).toBe(0);
    
    // Verificar que se intentó eliminar el archivo físico
    expect(fs.unlinkSync).toHaveBeenCalled();
  });
});