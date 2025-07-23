const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

// Verificar variables de entorno necesarias
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: Variables de entorno de Supabase no configuradas');
  console.error('Asegúrate de configurar SUPABASE_URL, SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Cliente de Supabase con clave anónima (para operaciones públicas)
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cliente de Supabase con clave de servicio (para operaciones administrativas)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

module.exports = { supabaseClient, supabaseAdmin };