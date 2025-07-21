const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Person = require('../models/person.model');
const treeRoutes = require('../routes/tree.routes');

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
app.use('/api/tree', treeRoutes);

describe('Rutas del Árbol Genealógico', () => {
  // Datos de prueba
  let rootPersonId;
  let childPersonId;
  let grandchildPersonId;
  let spousePersonId;
  
  // Crear datos de prueba antes de las pruebas
  beforeEach(async () => {
    // Crear personas para formar un árbol genealógico
    
    // Persona raíz (abuelo)
    const rootPerson = new Person({
      fullName: 'Abuelo Pérez',
      birthDate: new Date('1940-01-01'),
      isAlive: false,
      deathDate: new Date('2010-01-01')
    });
    const savedRootPerson = await rootPerson.save();
    rootPersonId = savedRootPerson._id.toString();
    
    // Cónyuge de la persona raíz (abuela)
    const spousePerson = new Person({
      fullName: 'Abuela Pérez',
      birthDate: new Date('1945-01-01'),
      isAlive: false,
      deathDate: new Date('2015-01-01')
    });
    const savedSpousePerson = await spousePerson.save();
    spousePersonId = savedSpousePerson._id.toString();
    
    // Establecer relación de cónyuges
    savedRootPerson.spouses = [{
      person: savedSpousePerson._id,
      marriageDate: new Date('1965-01-01'),
      isCurrentSpouse: true
    }];
    await savedRootPerson.save();
    
    savedSpousePerson.spouses = [{
      person: savedRootPerson._id,
      marriageDate: new Date('1965-01-01'),
      isCurrentSpouse: true
    }];
    await savedSpousePerson.save();
    
    // Hijo (padre)
    const childPerson = new Person({
      fullName: 'Padre Pérez',
      birthDate: new Date('1970-01-01'),
      isAlive: true,
      parents: [savedRootPerson._id, savedSpousePerson._id]
    });
    const savedChildPerson = await childPerson.save();
    childPersonId = savedChildPerson._id.toString();
    
    // Actualizar padres con el hijo
    savedRootPerson.children = [savedChildPerson._id];
    await savedRootPerson.save();
    
    savedSpousePerson.children = [savedChildPerson._id];
    await savedSpousePerson.save();
    
    // Nieto (hijo)
    const grandchildPerson = new Person({
      fullName: 'Hijo Pérez',
      birthDate: new Date('2000-01-01'),
      isAlive: true,
      parents: [savedChildPerson._id]
    });
    const savedGrandchildPerson = await grandchildPerson.save();
    grandchildPersonId = savedGrandchildPerson._id.toString();
    
    // Actualizar padre con el hijo
    savedChildPerson.children = [savedGrandchildPerson._id];
    await savedChildPerson.save();
  });
  
  // Prueba para obtener el árbol genealógico completo
  test('GET /api/tree/:personId debería devolver el árbol genealógico completo', async () => {
    const response = await request(app)
      .get(`/api/tree/${rootPersonId}`)
      .query({ generations: 3, includeSpouses: true });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    // Verificar la estructura del árbol
    const tree = response.body.data;
    expect(tree._id).toBe(rootPersonId);
    expect(tree.fullName).toBe('Abuelo Pérez');
    
    // Verificar cónyuge
    expect(tree.spouses).toHaveLength(1);
    expect(tree.spouses[0].person._id).toBe(spousePersonId);
    
    // Verificar hijo
    expect(tree.children).toHaveLength(1);
    expect(tree.children[0]._id).toBe(childPersonId);
    expect(tree.children[0].fullName).toBe('Padre Pérez');
    
    // Verificar nieto
    expect(tree.children[0].children).toHaveLength(1);
    expect(tree.children[0].children[0]._id).toBe(grandchildPersonId);
    expect(tree.children[0].children[0].fullName).toBe('Hijo Pérez');
  });
  
  // Prueba para obtener el árbol genealógico con límite de generaciones
  test('GET /api/tree/:personId debería respetar el límite de generaciones', async () => {
    const response = await request(app)
      .get(`/api/tree/${rootPersonId}`)
      .query({ generations: 1, includeSpouses: true });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    // Verificar la estructura del árbol
    const tree = response.body.data;
    expect(tree._id).toBe(rootPersonId);
    
    // Verificar que incluye al hijo pero no al nieto
    expect(tree.children).toHaveLength(1);
    expect(tree.children[0]._id).toBe(childPersonId);
    expect(tree.children[0].children).toBeUndefined();
  });
  
  // Prueba para obtener el árbol genealógico sin cónyuges
  test('GET /api/tree/:personId debería respetar la opción de incluir cónyuges', async () => {
    const response = await request(app)
      .get(`/api/tree/${rootPersonId}`)
      .query({ generations: 3, includeSpouses: false });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    // Verificar la estructura del árbol
    const tree = response.body.data;
    expect(tree._id).toBe(rootPersonId);
    
    // Verificar que no incluye cónyuges
    expect(tree.spouses).toBeUndefined();
  });
  
  // Prueba para manejar persona no encontrada
  test('GET /api/tree/:personId debería manejar persona no encontrada', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    
    const response = await request(app)
      .get(`/api/tree/${nonExistentId}`);
    
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Persona no encontrada');
  });
});