// Script para probar las funcionalidades principales
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Configuración
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Crear cliente de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Datos de prueba
const testUser = {
  email: 'test@example.com',
  password: 'Test123!',
  displayName: 'Usuario de Prueba'
};

let authToken = null;
let userId = null;
let familyId = null;
let personId = null;

// Función para probar la autenticación
async function testAuth() {
  try {
    console.log('\n=== PROBANDO AUTENTICACIÓN ===');
    
    // Registrar usuario
    console.log('\n1. Registrando usuario...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          displayName: testUser.displayName
        }
      }
    });
    
    if (signUpError) {
      console.log('⚠️ Error al registrar usuario (puede que ya exista):', signUpError.message);
      
      // Intentar iniciar sesión
      console.log('\n   Intentando iniciar sesión...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password
      });
      
      if (signInError) {
        console.error('❌ Error al iniciar sesión:', signInError.message);
        return false;
      }
      
      authToken = signInData.session.access_token;
      userId = signInData.user.id;
      console.log('✅ Inicio de sesión exitoso');
    } else {
      authToken = signUpData.session.access_token;
      userId = signUpData.user.id;
      console.log('✅ Registro exitoso');
    }
    
    // Verificar token
    console.log('\n2. Verificando token...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Error al verificar sesión:', sessionError.message);
      return false;
    }
    
    console.log('✅ Sesión verificada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error en prueba de autenticación:', error.message);
    return false;
  }
}

// Función para probar la API
async function testAPI() {
  try {
    console.log('\n=== PROBANDO API ===');
    
    // Configurar cliente de axios
    const api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    // Verificar estado de salud
    console.log('\n1. Verificando estado de salud...');
    const healthResponse = await api.get('/health');
    console.log('✅ API respondiendo correctamente:', healthResponse.data);
    
    // Crear familia
    console.log('\n2. Creando familia...');
    const familyResponse = await api.post('/families', {
      name: 'Familia de Prueba',
      description: 'Esta es una familia de prueba'
    });
    
    familyId = familyResponse.data.data.id;
    console.log('✅ Familia creada correctamente con ID:', familyId);
    
    // Crear persona
    console.log('\n3. Creando persona...');
    const personResponse = await api.post('/persons', {
      familyId,
      firstName: 'Juan',
      lastName: 'Pérez',
      gender: 'male',
      birthDate: '1980-01-01'
    });
    
    personId = personResponse.data.data.id;
    console.log('✅ Persona creada correctamente con ID:', personId);
    
    // Obtener familia
    console.log('\n4. Obteniendo familia...');
    const getFamilyResponse = await api.get(`/families/${familyId}`);
    console.log('✅ Familia obtenida correctamente:', getFamilyResponse.data.data.name);
    
    // Obtener persona
    console.log('\n5. Obteniendo persona...');
    const getPersonResponse = await api.get(`/persons/${personId}`);
    console.log('✅ Persona obtenida correctamente:', getPersonResponse.data.data.first_name);
    
    return true;
  } catch (error) {
    console.error('❌ Error en prueba de API:', error.message);
    return false;
  }
}

// Función para limpiar datos de prueba
async function cleanup() {
  try {
    console.log('\n=== LIMPIANDO DATOS DE PRUEBA ===');
    
    // Configurar cliente de axios
    const api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    // Eliminar persona
    if (personId) {
      console.log('\n1. Eliminando persona...');
      await api.delete(`/persons/${personId}`);
      console.log('✅ Persona eliminada correctamente');
    }
    
    // Eliminar familia
    if (familyId) {
      console.log('\n2. Eliminando familia...');
      await api.delete(`/families/${familyId}`);
      console.log('✅ Familia eliminada correctamente');
    }
    
    // Cerrar sesión
    console.log('\n3. Cerrando sesión...');
    await supabase.auth.signOut();
    console.log('✅ Sesión cerrada correctamente');
    
    return true;
  } catch (error) {
    console.error('❌ Error en limpieza:', error.message);
    return false;
  }
}

// Función principal
async function main() {
  try {
    console.log('=== INICIANDO PRUEBAS DE FUNCIONALIDAD ===');
    
    // Probar autenticación
    const authSuccess = await testAuth();
    if (!authSuccess) {
      console.error('❌ Prueba de autenticación fallida');
      return;
    }
    
    // Probar API
    const apiSuccess = await testAPI();
    if (!apiSuccess) {
      console.error('❌ Prueba de API fallida');
      return;
    }
    
    // Limpiar datos de prueba
    await cleanup();
    
    console.log('\n=== PRUEBAS COMPLETADAS CON ÉXITO ===');
  } catch (error) {
    console.error('❌ Error en pruebas:', error.message);
  }
}

// Ejecutar pruebas
main();