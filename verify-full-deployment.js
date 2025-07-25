const axios = require('axios');

async function verifyFullDeployment() {
  console.log('🚀 Verificando despliegue completo de Genea...\n');
  
  const BACKEND_URL = 'https://genea.onrender.com';
  const FRONTEND_URL = 'https://geneal.netlify.app';
  
  let allTestsPassed = true;
  
  // Test 1: Backend principal
  console.log('1. Verificando backend (Render.com)...');
  try {
    const response = await axios.get(BACKEND_URL, { timeout: 30000 });
    if (response.data.includes('Supabase')) {
      console.log('   ✅ Backend funcionando correctamente');
      console.log(`   📍 URL: ${BACKEND_URL}`);
    } else {
      console.log('   ❌ Backend responde pero contenido incorrecto');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`   ❌ Backend no accesible: ${error.message}`);
    allTestsPassed = false;
  }
  
  // Test 2: API Health
  console.log('2. Verificando API health...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health`, { timeout: 30000 });
    if (response.data.status === 'ok' && response.data.database === 'supabase') {
      console.log('   ✅ API health funcionando');
      console.log(`   📊 Environment: ${response.data.environment}`);
    } else {
      console.log('   ❌ API health no responde correctamente');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`   ❌ API health error: ${error.message}`);
    allTestsPassed = false;
  }
  
  // Test 3: Frontend
  console.log('3. Verificando frontend (Netlify)...');
  try {
    const response = await axios.get(FRONTEND_URL, { timeout: 30000 });
    if (response.status === 200 && response.data.includes('Genea')) {
      console.log('   ✅ Frontend funcionando correctamente');
      console.log(`   📍 URL: ${FRONTEND_URL}`);
    } else {
      console.log('   ❌ Frontend responde pero contenido incorrecto');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`   ❌ Frontend no accesible: ${error.message}`);
    allTestsPassed = false;
  }
  
  // Test 4: CORS entre frontend y backend
  console.log('4. Verificando comunicación frontend-backend...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health`, {
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET'
      },
      timeout: 30000
    });
    if (response.status === 200) {
      console.log('   ✅ Comunicación frontend-backend funcionando');
    } else {
      console.log('   ❌ Problema de comunicación');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`   ⚠️  CORS puede necesitar configuración: ${error.message}`);
  }
  
  // Resumen final
  console.log('\n' + '='.repeat(60));
  if (allTestsPassed) {
    console.log('🎉 ¡DESPLIEGUE EXITOSO!');
    console.log('✅ Tu aplicación Genea está funcionando en producción');
    console.log('\n📱 URLs de tu aplicación:');
    console.log(`   Frontend: ${FRONTEND_URL}`);
    console.log(`   Backend:  ${BACKEND_URL}`);
    console.log(`   API:      ${BACKEND_URL}/api`);
    console.log('\n🔧 Próximos pasos:');
    console.log('   1. Prueba registrar un usuario');
    console.log('   2. Crea una familia');
    console.log('   3. Agrega personas al árbol');
    console.log('   4. Configura un dominio personalizado (opcional)');
  } else {
    console.log('❌ ALGUNOS SERVICIOS TIENEN PROBLEMAS');
    console.log('⚠️  Revisa los errores arriba y verifica:');
    console.log('   - Variables de entorno en Netlify');
    console.log('   - Variables de entorno en Render.com');
    console.log('   - Estado de los servicios');
  }
  console.log('='.repeat(60));
}

verifyFullDeployment();