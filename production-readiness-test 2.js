const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5001';

async function runProductionTests() {
  console.log('🚀 Ejecutando pruebas de preparación para producción...\n');
  
  let allTestsPassed = true;
  
  // Test 1: Verificar que el backend esté corriendo
  console.log('1. Verificando backend...');
  try {
    const response = await axios.get(`${API_URL}/`);
    if (response.data.includes('Supabase')) {
      console.log('   ✅ Backend funcionando correctamente con Supabase');
    } else {
      console.log('   ❌ Backend no responde correctamente');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('   ❌ Backend no está accesible');
    allTestsPassed = false;
  }
  
  // Test 2: Verificar ruta de salud
  console.log('2. Verificando ruta de salud...');
  try {
    const response = await axios.get(`${API_URL}/api/health`);
    if (response.data.status === 'ok' && response.data.database === 'supabase') {
      console.log('   ✅ Ruta de salud funcionando');
    } else {
      console.log('   ❌ Ruta de salud no responde correctamente');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('   ❌ Ruta de salud no accesible');
    allTestsPassed = false;
  }
  
  // Test 3: Verificar que el frontend se pueda construir
  console.log('3. Verificando construcción del frontend...');
  const buildPath = path.join(__dirname, 'genea-app/client/build');
  if (fs.existsSync(buildPath)) {
    const indexPath = path.join(buildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log('   ✅ Frontend construido correctamente');
    } else {
      console.log('   ❌ Archivo index.html no encontrado en build');
      allTestsPassed = false;
    }
  } else {
    console.log('   ❌ Carpeta build no encontrada');
    allTestsPassed = false;
  }
  
  // Test 4: Verificar variables de entorno de producción
  console.log('4. Verificando configuración de producción...');
  const serverEnvProd = path.join(__dirname, 'genea-app/server/.env.production');
  const clientEnvProd = path.join(__dirname, 'genea-app/client/.env.production');
  
  if (fs.existsSync(serverEnvProd) && fs.existsSync(clientEnvProd)) {
    console.log('   ✅ Archivos de configuración de producción existen');
  } else {
    console.log('   ❌ Faltan archivos de configuración de producción');
    allTestsPassed = false;
  }
  
  // Test 5: Verificar archivos de despliegue
  console.log('5. Verificando archivos de despliegue...');
  const renderYaml = path.join(__dirname, 'genea-app/server/render.yaml');
  const vercelJson = path.join(__dirname, 'genea-app/client/vercel.json');
  
  if (fs.existsSync(renderYaml) && fs.existsSync(vercelJson)) {
    console.log('   ✅ Archivos de configuración de despliegue existen');
  } else {
    console.log('   ❌ Faltan archivos de configuración de despliegue');
    allTestsPassed = false;
  }
  
  // Resumen final
  console.log('\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('🎉 TODAS LAS PRUEBAS PASARON');
    console.log('✅ El proyecto está listo para despliegue en producción');
    console.log('\nPróximos pasos:');
    console.log('1. Subir código a GitHub');
    console.log('2. Configurar Render.com para el backend');
    console.log('3. Configurar Vercel/Netlify para el frontend');
    console.log('4. Actualizar URLs en variables de entorno');
  } else {
    console.log('❌ ALGUNAS PRUEBAS FALLARON');
    console.log('⚠️  Revisa los errores antes de desplegar');
  }
  console.log('='.repeat(50));
}

// Instalar axios si no está disponible
try {
  require('axios');
  runProductionTests();
} catch (error) {
  console.log('Instalando axios...');
  const { execSync } = require('child_process');
  execSync('npm install axios', { cwd: __dirname });
  runProductionTests();
}