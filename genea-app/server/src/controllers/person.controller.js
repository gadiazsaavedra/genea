const { supabaseClient } = require('../config/supabase.config');

// Obtener todas las personas
exports.getAllPersons = async (req, res) => {
  try {
    const { familyId, query, limit = 20, page = 1 } = req.query;
    const userId = req.user.uid;
    
    // Verificar acceso a la familia
    if (familyId) {
      const { data: memberCheck, error: memberError } = await supabaseClient
        .from('family_members')
        .select('id')
        .eq('family_id', familyId)
        .eq('user_id', userId);
      
      if (memberError || !memberCheck || memberCheck.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta familia'
        });
      }
    }
    
    // Construir la consulta
    let peopleQuery = supabaseClient
      .from('people')
      .select('*', { count: 'exact' });
    
    // Filtrar por familia si se proporciona un ID
    if (familyId) {
      peopleQuery = peopleQuery.eq('family_id', familyId);
    } else {
      // Si no se proporciona un ID de familia, obtener todas las familias a las que el usuario tiene acceso
      const { data: userFamilies, error: familiesError } = await supabaseClient
        .from('family_members')
        .select('family_id')
        .eq('user_id', userId);
      
      if (familiesError) throw new Error(familiesError.message);
      
      if (!userFamilies || userFamilies.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          total: 0,
          data: []
        });
      }
      
      const familyIds = userFamilies.map(f => f.family_id);
      peopleQuery = peopleQuery.in('family_id', familyIds);
    }
    
    // Búsqueda por nombre
    if (query) {
      peopleQuery = peopleQuery.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`);
    }
    
    // Paginación
    const offset = (page - 1) * limit;
    peopleQuery = peopleQuery
      .order('first_name', { ascending: true })
      .range(offset, offset + limit - 1);
    
    // Ejecutar la consulta
    const { data: people, error: peopleError, count } = await peopleQuery;
    
    if (peopleError) throw new Error(peopleError.message);
    
    res.status(200).json({
      success: true,
      count: people.length,
      total: count,
      data: people
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las personas',
      error: error.message
    });
  }
};

// Obtener una persona por ID
exports.getPersonById = async (req, res) => {
  try {
    const personId = req.params.id;
    const userId = req.user.uid;
    
    // Obtener la persona
    const { data: person, error: personError } = await supabaseClient
      .from('people')
      .select('*')
      .eq('id', personId)
      .single();
    
    if (personError || !person) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }
    
    // Verificar acceso a la familia
    const { data: memberCheck, error: memberError } = await supabaseClient
      .from('family_members')
      .select('id')
      .eq('family_id', person.family_id)
      .eq('user_id', userId);
    
    if (memberError || !memberCheck || memberCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta persona'
      });
    }
    
    // Obtener relaciones
    const { data: relationships, error: relError } = await supabaseClient
      .from('relationships')
      .select('*')
      .or(`person1_id.eq.${personId},person2_id.eq.${personId}`);
    
    if (relError) throw new Error(relError.message);
    
    // Procesar relaciones
    const parents = [];
    const children = [];
    const siblings = [];
    const spouses = [];
    
    if (relationships && relationships.length > 0) {
      // Obtener IDs de todas las personas relacionadas
      const relatedPersonIds = new Set();
      relationships.forEach(rel => {
        if (rel.person1_id === personId) {
          relatedPersonIds.add(rel.person2_id);
        } else {
          relatedPersonIds.add(rel.person1_id);
        }
      });
      
      // Obtener detalles de todas las personas relacionadas
      const { data: relatedPeople, error: relatedError } = await supabaseClient
        .from('people')
        .select('*')
        .in('id', Array.from(relatedPersonIds));
      
      if (relatedError) throw new Error(relatedError.message);
      
      // Mapear personas por ID para fácil acceso
      const peopleMap = {};
      if (relatedPeople) {
        relatedPeople.forEach(p => {
          peopleMap[p.id] = p;
        });
      }
      
      // Clasificar relaciones
      relationships.forEach(rel => {
        const relatedId = rel.person1_id === personId ? rel.person2_id : rel.person1_id;
        const relatedPerson = peopleMap[relatedId];
        
        if (!relatedPerson) return;
        
        switch (rel.relationship_type) {
          case 'parent':
            if (rel.person1_id === personId) {
              parents.push(relatedPerson);
            } else {
              children.push(relatedPerson);
            }
            break;
          case 'child':
            if (rel.person1_id === personId) {
              children.push(relatedPerson);
            } else {
              parents.push(relatedPerson);
            }
            break;
          case 'sibling':
            siblings.push(relatedPerson);
            break;
          case 'spouse':
            spouses.push({
              person: relatedPerson,
              marriageDate: rel.marriage_date,
              divorceDate: rel.divorce_date,
              isCurrentSpouse: rel.is_current_spouse
            });
            break;
        }
      });
    }
    
    // Agregar relaciones a la persona
    person.parents = parents;
    person.children = children;
    person.siblings = siblings;
    person.spouses = spouses;
    
    res.status(200).json({
      success: true,
      data: person
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la persona',
      error: error.message
    });
  }
};

// Crear una nueva persona - SIMPLIFICADO
exports.createPerson = async (req, res) => {
  try {
    const { familyId, firstName, lastName, gender, birthDate, isFounder } = req.body;
    
    console.log('Create person request:', { familyId, firstName, lastName, gender, birthDate, isFounder });
    
    if (!familyId || !firstName) {
      return res.status(400).json({
        success: false,
        message: 'ID de familia y nombre son requeridos'
      });
    }
    
    // Crear persona directamente sin verificaciones
    const { data, error } = await supabaseClient
      .from('people')
      .insert({
        family_id: familyId,
        first_name: firstName,
        last_name: lastName || null,
        gender: gender || null,
        birth_date: birthDate || null,
        is_founder: isFounder || false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Create person error:', error);
      return res.status(400).json({
        success: false,
        message: 'Error en base de datos',
        error: error.message
      });
    }
    
    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno',
      error: error.message
    });
  }
};

// Actualizar una persona
exports.updatePerson = async (req, res) => {
  try {
    const personId = req.params.id;
    const {
      firstName,
      lastName,
      maidenName,
      birthDate,
      deathDate,
      birthPlace,
      deathPlace,
      deathCause,
      gender,
      occupation,
      biography,
      photoUrl,
      is_founder
    } = req.body;
    
    const userId = req.user.uid;
    
    // Obtener la persona para verificar acceso
    const { data: person, error: personError } = await supabaseClient
      .from('people')
      .select('family_id')
      .eq('id', personId)
      .single();
    
    if (personError || !person) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }
    
    // Verificar acceso a la familia
    const { data: memberCheck, error: memberError } = await supabaseClient
      .from('family_members')
      .select('id')
      .eq('family_id', person.family_id)
      .eq('user_id', userId);
    
    if (memberError || !memberCheck || memberCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta persona'
      });
    }
    
    // Actualizar la persona
    const updateData = {
      first_name: firstName,
      last_name: lastName,
      maiden_name: maidenName,
      birth_date: birthDate,
      death_date: deathDate,
      birth_place: birthPlace,
      death_place: deathPlace,
      death_cause: deathCause,
      gender,
      occupation,
      biography,
      photo_url: photoUrl,
      updated_at: new Date().toISOString()
    };
    
    // Solo actualizar is_founder si se proporciona
    if (is_founder !== undefined) {
      updateData.is_founder = is_founder;
    }
    
    // Actualizar person_type si se proporciona
    if (req.body.person_type !== undefined) {
      updateData.person_type = req.body.person_type;
    }
    
    const { data: updatedPerson, error: updateError } = await supabaseClient
      .from('people')
      .update(updateData)
      .eq('id', personId)
      .select()
      .single();
    
    if (updateError) throw new Error(updateError.message);
    
    res.status(200).json({
      success: true,
      data: updatedPerson
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar la persona',
      error: error.message
    });
  }
};

// Eliminar una persona
exports.deletePerson = async (req, res) => {
  try {
    const personId = req.params.id;
    const userId = req.user.uid;
    
    // Obtener la persona para verificar acceso
    const { data: person, error: personError } = await supabaseClient
      .from('people')
      .select('family_id')
      .eq('id', personId)
      .single();
    
    if (personError || !person) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }
    
    // Verificar acceso a la familia
    const { data: memberCheck, error: memberError } = await supabaseClient
      .from('family_members')
      .select('role')
      .eq('family_id', person.family_id)
      .eq('user_id', userId)
      .single();
    
    if (memberError || !memberCheck || !['admin', 'editor'].includes(memberCheck.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar esta persona'
      });
    }
    
    // Eliminar todas las relaciones de esta persona
    const { error: relError } = await supabaseClient
      .from('relationships')
      .delete()
      .or(`person1_id.eq.${personId},person2_id.eq.${personId}`);
    
    if (relError) throw new Error(relError.message);
    
    // Eliminar todos los medios asociados a esta persona
    const { error: mediaError } = await supabaseClient
      .from('media')
      .delete()
      .eq('person_id', personId);
    
    if (mediaError) throw new Error(mediaError.message);
    
    // Eliminar la persona
    const { error: deleteError } = await supabaseClient
      .from('people')
      .delete()
      .eq('id', personId);
    
    if (deleteError) throw new Error(deleteError.message);
    
    res.status(200).json({
      success: true,
      message: 'Persona eliminada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la persona',
      error: error.message
    });
  }
};

// Agregar una relación familiar
exports.addRelation = async (req, res) => {
  try {
    const { personId, relatedPersonId, relationType, marriageDate, divorceDate, isCurrentSpouse } = req.body;
    const userId = req.user.uid;
    
    // Validar datos
    if (!personId || !relatedPersonId || !relationType) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos'
      });
    }
    
    // Obtener las personas para verificar acceso
    const { data: persons, error: personsError } = await supabaseClient
      .from('people')
      .select('id, family_id')
      .in('id', [personId, relatedPersonId]);
    
    if (personsError || !persons || persons.length !== 2) {
      return res.status(404).json({
        success: false,
        message: 'Una o ambas personas no fueron encontradas'
      });
    }
    
    // Verificar que ambas personas pertenecen a la misma familia
    const familyId = persons[0].family_id;
    if (persons[0].family_id !== persons[1].family_id) {
      return res.status(400).json({
        success: false,
        message: 'Las personas deben pertenecer a la misma familia'
      });
    }
    
    // Verificar acceso a la familia
    const { data: memberCheck, error: memberError } = await supabaseClient
      .from('family_members')
      .select('role')
      .eq('family_id', familyId)
      .eq('user_id', userId)
      .single();
    
    if (memberError || !memberCheck || !['admin', 'editor'].includes(memberCheck.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para agregar relaciones'
      });
    }
    
    // Verificar si la relación ya existe
    const { data: existingRel, error: existingError } = await supabaseClient
      .from('relationships')
      .select('id')
      .or(`and(person1_id.eq.${personId},person2_id.eq.${relatedPersonId}),and(person1_id.eq.${relatedPersonId},person2_id.eq.${personId})`)
      .eq('relationship_type', relationType);
    
    if (existingError) throw new Error(existingError.message);
    
    if (existingRel && existingRel.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Esta relación ya existe'
      });
    }
    
    // Crear la relación
    const relationData = {
      person1_id: personId,
      person2_id: relatedPersonId,
      relationship_type: relationType
    };
    
    // Agregar datos adicionales para relaciones de cónyuge
    if (relationType === 'spouse') {
      relationData.marriage_date = marriageDate || null;
      relationData.divorce_date = divorceDate || null;
      relationData.is_current_spouse = isCurrentSpouse !== undefined ? isCurrentSpouse : true;
    }
    
    const { error: insertError } = await supabaseClient
      .from('relationships')
      .insert([relationData]);
    
    if (insertError) throw new Error(insertError.message);
    
    res.status(200).json({
      success: true,
      message: 'Relación agregada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al agregar la relación',
      error: error.message
    });
  }
};

// Eliminar una relación familiar
exports.removeRelation = async (req, res) => {
  try {
    const { personId, relatedPersonId, relationType } = req.body;
    const userId = req.user.uid;
    
    // Validar datos
    if (!personId || !relatedPersonId || !relationType) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos'
      });
    }
    
    // Obtener las personas para verificar acceso
    const { data: person, error: personError } = await supabaseClient
      .from('people')
      .select('family_id')
      .eq('id', personId)
      .single();
    
    if (personError || !person) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }
    
    // Verificar acceso a la familia
    const { data: memberCheck, error: memberError } = await supabaseClient
      .from('family_members')
      .select('role')
      .eq('family_id', person.family_id)
      .eq('user_id', userId)
      .single();
    
    if (memberError || !memberCheck || !['admin', 'editor'].includes(memberCheck.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar relaciones'
      });
    }
    
    // Eliminar la relación
    const { error: deleteError } = await supabaseClient
      .from('relationships')
      .delete()
      .or(`and(person1_id.eq.${personId},person2_id.eq.${relatedPersonId}),and(person1_id.eq.${relatedPersonId},person2_id.eq.${personId})`)
      .eq('relationship_type', relationType);
    
    if (deleteError) throw new Error(deleteError.message);
    
    res.status(200).json({
      success: true,
      message: 'Relación eliminada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la relación',
      error: error.message
    });
  }
};

// Obtener el árbol genealógico de una persona
exports.getPersonTree = async (req, res) => {
  try {
    const personId = req.params.id;
    const userId = req.user.uid;
    
    // Obtener la persona
    const { data: person, error: personError } = await supabaseClient
      .from('people')
      .select('*')
      .eq('id', personId)
      .single();
    
    if (personError || !person) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }
    
    // Verificar acceso a la familia
    const { data: memberCheck, error: memberError } = await supabaseClient
      .from('family_members')
      .select('id')
      .eq('family_id', person.family_id)
      .eq('user_id', userId);
    
    if (memberError || !memberCheck || memberCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta familia'
      });
    }
    
    // Obtener todas las personas de la familia
    const { data: allPeople, error: peopleError } = await supabaseClient
      .from('people')
      .select('*')
      .eq('family_id', person.family_id);
    
    if (peopleError) throw new Error(peopleError.message);
    
    // Obtener todas las relaciones de la familia
    const { data: relationships, error: relError } = await supabaseClient
      .from('relationships')
      .select('*');
    
    if (relError) throw new Error(relError.message);
    
    res.status(200).json({
      success: true,
      data: {
        people: allPeople || [],
        relationships: relationships || [],
        rootPerson: person
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el árbol genealógico',
      error: error.message
    });
  }
};