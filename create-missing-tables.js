const { supabaseAdmin } = require('./genea-app/server/src/config/supabase.config');

async function createMissingTables() {
  console.log('🔧 Creando tablas faltantes en Supabase...\n');
  
  // Crear tabla people (persons)
  const createPeopleTable = `
    CREATE TABLE IF NOT EXISTS people (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      family_id UUID,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255),
      maiden_name VARCHAR(255),
      birth_date DATE,
      death_date DATE,
      birth_place VARCHAR(255),
      death_place VARCHAR(255),
      gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
      biography TEXT,
      photo_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;
  
  // Crear tabla users (para compatibilidad con el backend)
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255),
      display_name VARCHAR(255),
      photo_url VARCHAR(500),
      email_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;
  
  try {
    // Crear tabla people
    console.log('📝 Creando tabla people...');
    const { error: peopleError } = await supabaseAdmin.rpc('exec_sql', {
      sql: createPeopleTable
    });
    
    if (peopleError) {
      console.log('❌ Error creando tabla people:', peopleError.message);
    } else {
      console.log('✅ Tabla people creada exitosamente');
    }
    
    // Crear tabla users
    console.log('📝 Creando tabla users...');
    const { error: usersError } = await supabaseAdmin.rpc('exec_sql', {
      sql: createUsersTable
    });
    
    if (usersError) {
      console.log('❌ Error creando tabla users:', usersError.message);
    } else {
      console.log('✅ Tabla users creada exitosamente');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
  
  console.log('\n✨ Proceso completado');
}

createMissingTables();