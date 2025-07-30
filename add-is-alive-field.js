const { supabaseClient } = require('./genea-app/server/src/config/supabase.config');

async function addIsAliveField() {
  try {
    // Primero intentar agregar la columna is_alive
    console.log('Agregando campo is_alive...');
    
    // Como no podemos ejecutar ALTER TABLE directamente, vamos a actualizar los registros existentes
    // para calcular is_alive basado en death_date
    
    // Obtener todas las personas
    const { data: people, error: fetchError } = await supabaseClient
      .from('people')
      .select('id, death_date');
    
    if (fetchError) {
      console.error('Error obteniendo personas:', fetchError);
      return;
    }
    
    console.log(`Encontradas ${people.length} personas`);
    
    // Actualizar cada persona con el campo is_alive calculado
    for (const person of people) {
      const isAlive = !person.death_date; // Si no tiene death_date, está vivo
      
      const { error: updateError } = await supabaseClient
        .from('people')
        .update({ is_alive: isAlive })
        .eq('id', person.id);
      
      if (updateError) {
        console.error(`Error actualizando persona ${person.id}:`, updateError);
      } else {
        console.log(`✓ Actualizada persona ${person.id}: is_alive = ${isAlive}`);
      }
    }
    
    console.log('Campo is_alive agregado y calculado para todas las personas');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

addIsAliveField();