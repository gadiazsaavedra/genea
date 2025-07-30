const { supabaseClient } = require('./genea-app/server/src/config/supabase.config');

async function checkTableSchema() {
  try {
    // Verificar estructura actual de la tabla people
    const { data, error } = await supabaseClient
      .from('people')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error al consultar tabla:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('Campos disponibles en la tabla people:');
      console.log(Object.keys(data[0]));
    } else {
      console.log('No hay datos en la tabla people');
    }
    
    // Intentar obtener una persona específica para ver todos los campos
    const { data: allData, error: allError } = await supabaseClient
      .from('people')
      .select('*')
      .ilike('first_name', '%matilde%');
    
    if (allError) {
      console.error('Error buscando Matilde:', allError);
    } else if (allData && allData.length > 0) {
      console.log('\nDatos de Matilde:');
      console.log(JSON.stringify(allData[0], null, 2));
    } else {
      console.log('\nNo se encontró a Matilde');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTableSchema();