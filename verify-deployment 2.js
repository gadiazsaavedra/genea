const axios = require('axios');

async function verifyDeployment() {
  console.log('🔍 Verificando despliegue en producción...\n');
  
  const BACKEND_URL = 'https://genea.onrender.com';
  
  // Test 1: Verificar backend
  console.log('1. Verificando backend en Render.com...');
  try {
    const response = await axios.get(BACKEND_URL, { timeout: 30000 });
    if (response.data.includes('Supabase')) {
      console.log('   ✅ Backend desplegado correctamente');
      console.log(`   📍 URL: ${BACKEND_URL}`);
    } else {
      console.log('   ❌ Backend responde pero contenido incorrecto');
    }
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.log('   ⏳ Backend tardando en responder (normal en primer arranque)');
    } else {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  // Test 2: Verificar API health
  console.log('2. Verificando API health...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health`, { timeout: 30000 });
    if (response.data.status === 'ok') {
      console.log('   ✅ API health funcionando');
    } else {
      console.log('   ❌ API health no responde correctamente');
    }
  } catch (error) {
    console.log(`   ❌ Error en API health: ${error.message}`);
  }
  
  console.log('\n📋 Configuración para Netlify:');
  console.log('Variables de entorno a configurar:');
  console.log('REACT_APP_API_URL=https://genea.onrender.com/api');
  console.log('REACT_APP_SUPABASE_URL=https://hsdjbqqijtxehepifbfk.supabase.co');
  console.log('REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZGpicXFpanR4ZWhlcGlmYmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTE4NDQsImV4cCI6MjA2ODc4Nzg0NH0.q0KQo2E1KOG_0AL4D69PDD2gkVmx39V-_njV0anP2q0');
}

verifyDeployment();