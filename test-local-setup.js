const axios = require('axios');

async function testLocalSetup() {
  console.log('🧪 Probando configuración local de Genea...\n');

  // Test 1: Backend
  console.log('1. Probando backend local...');
  try {
    const backendResponse = await axios.get('http://localhost:5000', { timeout: 5000 });
    console.log('   ✅ Backend funcionando');
  } catch (error) {
    console.log('   ❌ Backend no disponible - ejecuta: ./start-local-dev.sh');
  }

  // Test 2: API Health
  console.log('2. Probando API health...');
  try {
    const healthResponse = await axios.get('http://localhost:5000/api/health', { timeout: 5000 });
    console.log('   ✅ API health funcionando');
    console.log(`   📊 Environment: ${healthResponse.data.environment}`);
  } catch (error) {
    console.log('   ❌ API health no disponible');
  }

  // Test 3: Frontend
  console.log('3. Probando frontend local...');
  try {
    const frontendResponse = await axios.get('http://localhost:3000', { timeout: 5000 });
    console.log('   ✅ Frontend funcionando');
  } catch (error) {
    console.log('   ❌ Frontend no disponible - ejecuta: ./start-local-dev.sh');
  }

  console.log('\n📋 URLs de desarrollo:');
  console.log('   Frontend: http://localhost:3000');
  console.log('   Backend:  http://localhost:5000');
  console.log('   API:      http://localhost:5000/api');
  console.log('   Supabase: https://hsdjbqqijtxehepifbfk.supabase.co');

  console.log('\n🚀 Para iniciar desarrollo:');
  console.log('   ./start-local-dev.sh');
}

testLocalSetup().catch(console.error);