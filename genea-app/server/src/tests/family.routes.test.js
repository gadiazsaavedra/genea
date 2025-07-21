const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Family = require('../models/family.model');
const Person = require('../models/person.model');
const User = require('../models/user.model');
const familyRoutes = require('../routes/family.routes');

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
app.use('/api/families', familyRoutes);

describe('Rutas de Familias', () => {
  // Datos de prueba
  let testUserId;
  let testFamilyId;
  let testPersonId;
  
  // Crear datos de prueba antes de las pruebas
  beforeEach(async () => {
    // Crear un usuario de prueba
    const testUser = new User({
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      _id: '60d0fe4f5311236168a109ca'
    });
    
    await testUser.save();
    testUserId = testUser._id.toString();
    
    // Crear una persona de prueba
    const testPerson = new Person({
      fullName: 'Juan Pérez',
      birthDate: new Date('1980-01-01'),
      isAlive: true
    });
    
    const savedPerson = await testPerson.save();
    testPersonId = savedPerson._id.toString();
    
    // Crear una familia de prueba
    const testFamily = new Family({
      name: 'Familia Pérez',
      description: 'Familia de prueba',
      founders: [savedPerson._id],
      members: [{ person: testUserId, role: 'admin' }],
      createdBy: testUserId
    });
    
    const savedFamily = await testFamily.save();
    testFamilyId = savedFamily._id.toString();
    
    // Actualizar el usuario con la familia
    await User.findByIdAndUpdate(testUserId, {
      $push: { families: { family: savedFamily._id, role: 'admin' } }
    });
  });
  
  // Prueba para obtener todas las familias del usuario
  test('GET /api/families debería devolver las familias del usuario', async () => {
    const response = await request(app).get('/api/families');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].name).toBe('Familia Pérez');
  });
  
  // Prueba para obtener una familia por ID
  test('GET /api/families/:id debería devolver una familia específica', async () => {
    const response = await request(app).get(`/api/families/${testFamilyId}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data._id).toBe(testFamilyId);
    expect(response.body.data.name).toBe('Familia Pérez');
  });
  
  // Prueba para crear una nueva familia
  test('POST /api/families debería crear una nueva familia', async () => {
    const newFamily = {
      name: 'Familia Rodríguez',
      description: 'Nueva familia de prueba',
      founders: [testPersonId]
    };
    
    const response = await request(app)
      .post('/api/families')
      .send(newFamily);
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Familia Rodríguez');
    
    // Verificar que la familia se guardó en la base de datos
    const savedFamily = await Family.findById(response.body.data._id);
    expect(savedFamily).not.toBeNull();
    expect(savedFamily.name).toBe('Familia Rodríguez');
    
    // Verificar que el usuario se actualizó con la nueva familia
    const updatedUser = await User.findById(testUserId);
    const hasFamily = updatedUser.families.some(f => 
      f.family.toString() === response.body.data._id.toString()
    );
    expect(hasFamily).toBe(true);
  });
  
  // Prueba para actualizar una familia
  test('PUT /api/families/:id debería actualizar una familia existente', async () => {
    const updatedData = {
      name: 'Familia Pérez Actualizada',
      description: 'Descripción actualizada'
    };
    
    const response = await request(app)
      .put(`/api/families/${testFamilyId}`)
      .send(updatedData);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Familia Pérez Actualizada');
    expect(response.body.data.description).toBe('Descripción actualizada');
    
    // Verificar que la familia se actualizó en la base de datos
    const updatedFamily = await Family.findById(testFamilyId);
    expect(updatedFamily.name).toBe('Familia Pérez Actualizada');
  });
  
  // Prueba para agregar un miembro a la familia
  test('POST /api/families/member debería agregar un miembro a la familia', async () => {
    // Crear un nuevo usuario para agregar como miembro
    const newUser = new User({
      uid: 'new-user-uid',
      email: 'newuser@example.com',
      displayName: 'New User'
    });
    
    const savedUser = await newUser.save();
    
    const memberData = {
      familyId: testFamilyId,
      userId: savedUser._id.toString(),
      role: 'viewer'
    };
    
    const response = await request(app)
      .post('/api/families/member')
      .send(memberData);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    // Verificar que el miembro se agregó a la familia
    const updatedFamily = await Family.findById(testFamilyId);
    const memberExists = updatedFamily.members.some(m => 
      m.person.toString() === savedUser._id.toString() && m.role === 'viewer'
    );
    expect(memberExists).toBe(true);
    
    // Verificar que la familia se agregó al usuario
    const updatedUser = await User.findById(savedUser._id);
    const familyExists = updatedUser.families.some(f => 
      f.family.toString() === testFamilyId && f.role === 'viewer'
    );
    expect(familyExists).toBe(true);
  });
});