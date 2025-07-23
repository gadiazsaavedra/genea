import { createClient } from '@supabase/supabase-js';

// Obtener variables de entorno
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Verificar que las variables de entorno estén definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Error: Variables de entorno de Supabase no configuradas. ' +
    'Asegúrate de definir REACT_APP_SUPABASE_URL y REACT_APP_SUPABASE_ANON_KEY en tu archivo .env'
  );
}

// Crear cliente de Supabase
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

export default supabase;