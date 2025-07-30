const axios = require('axios');

const BACKEND_URL = 'https://genea.onrender.com';
const CHECK_INTERVAL = 10000; // 10 segundos
const MAX_ATTEMPTS = 60; // 10 minutos máximo

async function monitorBackend() {
  console.log('🔍 Monitoreando backend en Render.com...');
  console.log(`📍 URL: ${BACKEND_URL}`);
  console.log('⏳ Esperando que el servicio inicie...\n');
  
  let attempts = 0;
  
  const checkBackend = async () => {
    attempts++;
    const timestamp = new Date().toLocaleTimeString();
    
    try {
      console.log(`[${timestamp}] Intento ${attempts}/${MAX_ATTEMPTS}...`);
      
      const response = await axios.get(BACKEND_URL, { timeout: 15000 });
      
      if (response.data.includes('Supabase')) {
        console.log('\n🎉 ¡BACKEND FUNCIONANDO!');
        console.log(`✅ Respuesta: ${response.data}`);
        
        // Probar API health
        try {
          const healthResponse = await axios.get(`${BACKEND_URL}/api/health`, { timeout: 10000 });
          console.log(`✅ API Health: ${healthResponse.data.status}`);
          console.log(`📊 Environment: ${healthResponse.data.environment}`);
        } catch (healthError) {
          console.log('⚠️  API health no disponible aún');
        }
        
        console.log('\n🚀 Tu aplicación está completamente lista:');
        console.log(`   Frontend: https://geneal.netlify.app`);
        console.log(`   Backend:  ${BACKEND_URL}`);
        console.log('\n✨ Puedes empezar a usar Genea ahora!');
        
        return true;
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log('   ⏳ Timeout - servicio aún iniciando...');
      } else if (error.response?.status === 503) {
        console.log('   🔄 Servicio no disponible - iniciando...');
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    if (attempts >= MAX_ATTEMPTS) {
      console.log('\n❌ Tiempo máximo de espera alcanzado');
      console.log('💡 Posibles soluciones:');
      console.log('   1. Verifica las variables de entorno en Render.com');
      console.log('   2. Revisa los logs en el dashboard de Render.com');
      console.log('   3. Intenta hacer redeploy del servicio');
      return false;
    }
    
    setTimeout(checkBackend, CHECK_INTERVAL);
  };
  
  checkBackend();
}

monitorBackend();