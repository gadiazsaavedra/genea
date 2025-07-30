const { supabaseAdmin } = require('./genea-app/server/src/config/supabase.config');

async function verifyTables() {
  console.log('🔍 Verificando tablas de Supabase...\n');
  
  const tables = ['users', 'families', 'people', 'invitations', 'notifications', 'comments'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Tabla '${table}': NO EXISTE o hay error`);
        console.log(`   Error: ${error.message}\n`);
      } else {
        console.log(`✅ Tabla '${table}': EXISTE y es accesible\n`);
      }
    } catch (err) {
      console.log(`❌ Tabla '${table}': ERROR de conexión`);
      console.log(`   Error: ${err.message}\n`);
    }
  }
  
  console.log('✨ Verificación completada');
}

verifyTables().catch(console.error);