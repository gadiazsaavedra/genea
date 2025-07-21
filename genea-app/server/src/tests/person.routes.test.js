const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Person = require('../models/person.model');
const personRoutes = require('../routes/person.routes');

// Mock del middleware de autenticación
jest.mock('../middleware/auth.middleware', () => ({
  authMiddleware: (req, res, next) => {
    req.user = {
      _id: '60d0fe4f5311236168a109ca',
      email: 'test@example.com',
      displayName: 'Test User'
    };
    next();
  }
}));

// Crear app Express para las pruebas
const app = express();
app.use(express.json());
app.use('/api/persons', personRoutes);

describe('Rutas de Personas', () => {
  // Datos de prueba
  let testPersonId;
  let testPerson2Id;
  
  // Crear personas de prueba antes de las pruebas
  beforeEach(async () => {
    // Crear una persona de prueba
    const testPerson = new Person({
      fullName: 'Juan Pérez',
      birthDate: new Date('1980-01-01'),
      isAlive: true,
      birthPlace: {
        city: 'Madrid',
        country: 'España'
      },
      occupation: 'Ingeniero'
    });
    
    const savedPerson = await testPerson.save();
    testPersonId = savedPerson._id.toString();
    
    // Crear una segunda persona de prueba
    const testPerson2 = new Person({
      fullName: 'María López',
      birthDate: new Date('1985-05-15'),
      isAlive: true,
      birthPlace: {
        city: 'Barcelona',
        country: 'España'
      },
      occupation: 'Médico'
    });
    
    const savedPerson2 = await testPerson2.save();
    testPerson2Id = savedPerson2._id.toString();
  });
  
  // Prueba para obtener todas las personas
  test('GET /api/persons debería devolver todas las personas', async () => {
    const response = await request(app).get('/api/persons');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBe(2);
    expect(response.body.data[0].fullName).toBe('Juan Pérez');
    expect(response.body.data[1].fullName).toBe('María López');
  });
  
  // Prueba para obtener una persona por ID
  test('GET /api/persons/:id debería devolver una persona específica', async () => {
    const response = await request(app).get(`/api/persons/${testPersonId}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data._id).toBe(testPersonId);
    expect(response.body.data.fullName).toBe('Juan Pérez');
  });
  
  // Prueba para crear una nueva persona
  test('POST /api/persons debería crear una nueva persona', async () => {
    const newPerson = {
      fullName: 'Carlos Rodríguez',
      birthDate: '1990-10-20',
      isAlive: true,
      birthPlace: {
        city: 'Valencia',
        country: 'España'
      },
      occupation: 'Abogado'
    };
    
    const response = await request(app)
      .post('/api/persons')
      .send(newPerson);
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.fullName).toBe('Carlos Rodríguez');
    
    // Verificar que la persona se guardó en la base de datos
    const savedPerson = await Person.findById(response.body.data._id);
    expect(savedPerson).not.toBeNull();
    expect(savedPerson.fullName).toBe('Carlos Rodríguez');
  });
  
  // Prueba para actualizar una persona
  test('PUT /api/persons/:id debería actualizar una persona existente', async () => {
    const updatedData = {
      fullName: 'Juan Pérez Gómez',
      occupation: 'Arquitecto'
    };
    
    const response = await request(app)
      .put(`/api/persons/${testPersonId}`)
      .send(updatedData);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.fullName).toBe('Juan Pérez Gómez');
    expect(response.body.data.occupation).toBe('Arquitecto');
    
    // Verificar que la persona se actualizó en la base de datos
    const updatedPerson = await Person.findById(testPersonId);
    expect(updatedPerson.fullName).toBe('Juan Pérez Gómez');
    expect(updatedPerson.occupation).toBe('Arquitecto');
  });
  
  // Prueba para eliminar una persona
  test('DELETE /api/persons/:id debería eliminar una persona', async () => {
    const response = await request(app).delete(`/api/persons/${testPersonId}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    // Verificar que la persona se eliminó de la base de datos
    const deletedPerson = await Person.findById(testPersonId);
    expect(deletedPerson).toBeNull();
  });
  
  // Prueba para agregar una relación familiar
  test('POST /api/persons/relation debería agregar una relación padre-hijo', async () => {
    const relationData = {
      personId: testPersonId,
      relatedPersonId: testPerson2Id,
      relationType: 'parent'
    };
    
    const response = await request(app)
      .post('/api/persons/relation')
      .send(relationData);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    // Verificar que la relación se estableció correctamente
    const parent = await Person.findById(testPersonId);
    const child = await Person.findById(testPerson2Id);
    
    expect(parent.children).toContainEqual(mongoose.Types.ObjectId(testPerson2Id));
    expect(child.parents).toContainEqual(mongoose.Types.ObjectId(testPersonId));
  });
  
  // Prueba para obtener el árbol genealógico
  test('GET /api/persons/:id/tree debería devolver el árbol genealógico', async () => {
    // Primero establecemos una relación padre-hijo
    await request(app)
      .post('/api/persons/relation')
      .send({
        personId: testPersonId,
        relatedPersonId: testPerson2Id,
        relationType: 'parent'
      });
    
    const response = await request(app).get(`/api/persons/${testPersonId}/tree`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data._id).toBe(testPersonId);
    expect(response.body.data.fullName).toBe('Juan Pérez');
    expect(response.body.data.children).toHaveLength(1);
    expect(response.body.data.children[0]._id).toBe(testPerson2Id);
  });
});