const { supabaseClient } = require('../config/supabase.config');
const { FREE_FAMILIES, LICENSE_CONTACT } = require('../middleware/license.middleware');

// Obtener todas las familias del usuario
exports.getAllFamilies = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Buscar familias donde el usuario es miembro
    const { data: familyMembers, error: membersError } = await supabaseClient
      .from('family_members')
      .select('family_id')
      .eq('user_id', userId);
    
    if (membersError) throw new Error(membersError.message);
    
    if (!familyMembers || familyMembers.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
    
    const familyIds = familyMembers.map(member => member.family_id);
    
    // Obtener detalles de las familias
    const { data: families, error: familiesError } = await supabaseClient
      .from('families')
      .select(`
        id,
        name,
        description,
        created_by,
        created_at
      `)
      .in('id', familyIds);
    
    if (familiesError) throw new Error(familiesError.message);
    
    res.status(200).json({
      success: true,
      count: families.length,
      data: families
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las familias',
      error: error.message
    });
  }
};

// Obtener una familia por ID
exports.getFamilyById = async (req, res) => {
  try {
    const familyId = req.params.id;
    const userId = req.user.uid;
    
    // Verificar si el usuario tiene acceso a esta familia
    const { data: memberCheck, error: memberError } = await supabaseClient
      .from('family_members')
      .select('role')
      .eq('family_id', familyId)
      .eq('user_id', userId)
      .single();
    
    if (memberError || !memberCheck) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta familia'
      });
    }
    
    // Obtener detalles de la familia
    const { data: family, error: familyError } = await supabaseClient
      .from('families')
      .select(`
        id,
        name,
        description,
        created_by,
        created_at,
        updated_at
      `)
      .eq('id', familyId)
      .single();
    
    if (familyError || !family) {
      return res.status(404).json({
        success: false,
        message: 'Familia no encontrada'
      });
    }
    
    // Obtener miembros de la familia
    const { data: members, error: membersError } = await supabaseClient
      .from('family_members')
      .select(`
        id,
        user_id,
        role,
        joined_at,
        auth_users:user_id (
          email,
          user_metadata
        )
      `)
      .eq('family_id', familyId);
    
    if (membersError) throw new Error(membersError.message);
    
    // Formatear los datos de los miembros
    const formattedMembers = members.map(member => ({
      id: member.id,
      userId: member.user_id,
      role: member.role,
      joinedAt: member.joined_at,
      email: member.auth_users?.email,
      displayName: member.auth_users?.user_metadata?.displayName || member.auth_users?.email?.split('@')[0],
      photoURL: member.auth_users?.user_metadata?.photoURL
    }));
    
    // Agregar los miembros a la respuesta
    family.members = formattedMembers;
    
    res.status(200).json({
      success: true,
      data: family
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la familia',
      error: error.message
    });
  }
};

// Crear una nueva familia
exports.createFamily = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.uid;
    
    // Validar datos
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la familia es requerido'
      });
    }
    
    // Determinar tipo de licencia
    const familyNameLower = name.toLowerCase();
    const isFreeFamily = FREE_FAMILIES.some(freeName => familyNameLower.includes(freeName));
    
    let licenseData = {
      license_status: 'trial',
      license_type: 'standard',
      license_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 días
    };
    
    if (isFreeFamily) {
      licenseData = {
        license_status: 'active',
        license_type: 'free',
        license_expires_at: '2099-12-31T23:59:59.000Z',
        payment_status: 'free'
      };
    }
    
    // Crear la familia
    const { data: family, error: familyError } = await supabaseClient
      .from('families')
      .insert([
        { 
          name, 
          description, 
          created_by: userId,
          ...licenseData
        }
      ])
      .select()
      .single();
    
    if (familyError) throw new Error(familyError.message);
    
    // Agregar al usuario como miembro administrador
    const { error: memberError } = await supabaseClient
      .from('family_members')
      .insert([
        { 
          family_id: family.id, 
          user_id: userId, 
          role: 'admin' 
        }
      ]);
    
    if (memberError) throw new Error(memberError.message);
    
    res.status(201).json({
      success: true,
      data: family
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear la familia',
      error: error.message
    });
  }
};

// Actualizar una familia
exports.updateFamily = async (req, res) => {
  try {
    const familyId = req.params.id;
    const { name, description } = req.body;
    const userId = req.user.uid;
    
    // Verificar si el usuario es administrador de la familia
    const { data: memberCheck, error: memberError } = await supabaseClient
      .from('family_members')
      .select('role')
      .eq('family_id', familyId)
      .eq('user_id', userId)
      .single();
    
    if (memberError || !memberCheck || memberCheck.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para actualizar esta familia'
      });
    }
    
    // Actualizar la familia
    const { data: updatedFamily, error: updateError } = await supabaseClient
      .from('families')
      .update({ 
        name, 
        description, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', familyId)
      .select()
      .single();
    
    if (updateError) throw new Error(updateError.message);
    
    if (!updatedFamily) {
      return res.status(404).json({
        success: false,
        message: 'Familia no encontrada'
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedFamily
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar la familia',
      error: error.message
    });
  }
};

// Eliminar una familia
exports.deleteFamily = async (req, res) => {
  try {
    const familyId = req.params.id;
    const userId = req.user.uid;
    
    // Verificar si el usuario es administrador de la familia
    const { data: memberCheck, error: memberError } = await supabaseClient
      .from('family_members')
      .select('role')
      .eq('family_id', familyId)
      .eq('user_id', userId)
      .single();
    
    if (memberError || !memberCheck || memberCheck.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar esta familia'
      });
    }
    
    // Eliminar todos los miembros de la familia
    const { error: deleteMembersError } = await supabaseClient
      .from('family_members')
      .delete()
      .eq('family_id', familyId);
    
    if (deleteMembersError) throw new Error(deleteMembersError.message);
    
    // Eliminar todas las personas de la familia
    const { error: deletePeopleError } = await supabaseClient
      .from('people')
      .delete()
      .eq('family_id', familyId);
    
    if (deletePeopleError) throw new Error(deletePeopleError.message);
    
    // Eliminar la familia
    const { error: deleteFamilyError } = await supabaseClient
      .from('families')
      .delete()
      .eq('id', familyId);
    
    if (deleteFamilyError) throw new Error(deleteFamilyError.message);
    
    res.status(200).json({
      success: true,
      message: 'Familia eliminada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la familia',
      error: error.message
    });
  }
};

// Agregar un miembro a la familia
exports.addFamilyMember = async (req, res) => {
  try {
    const { familyId, email, role } = req.body;
    const requestingUserId = req.user.uid;
    
    // Validar datos
    if (!familyId || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos'
      });
    }
    
    // Verificar si el usuario que hace la solicitud es administrador
    const { data: memberCheck, error: memberError } = await supabaseClient
      .from('family_members')
      .select('role')
      .eq('family_id', familyId)
      .eq('user_id', requestingUserId)
      .single();
    
    if (memberError || !memberCheck || memberCheck.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para agregar miembros a esta familia'
      });
    }
    
    // Buscar al usuario por email
    const { data: userData, error: userError } = await supabaseClient
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (userError || !userData) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    const userIdToAdd = userData.id;
    
    // Verificar si el usuario ya es miembro de la familia
    const { data: existingMember, error: existingError } = await supabaseClient
      .from('family_members')
      .select()
      .eq('family_id', familyId)
      .eq('user_id', userIdToAdd)
      .single();
    
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya es miembro de esta familia'
      });
    }
    
    // Agregar el usuario a la familia
    const { error: addError } = await supabaseClient
      .from('family_members')
      .insert([
        { 
          family_id: familyId, 
          user_id: userIdToAdd, 
          role 
        }
      ]);
    
    if (addError) throw new Error(addError.message);
    
    res.status(200).json({
      success: true,
      message: 'Miembro agregado correctamente a la familia'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al agregar el miembro a la familia',
      error: error.message
    });
  }
};