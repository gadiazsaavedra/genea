const Family = require('../models/family.model');
const User = require('../models/user.model');

// Obtener todas las familias
exports.getAllFamilies = async (req, res) => {
  try {
    const userId = req.user._id; // Asumiendo que el usuario está autenticado
    
    // Buscar familias donde el usuario es miembro
    const user = await User.findById(userId);
    const familyIds = user.families.map(f => f.family);
    
    const families = await Family.find({ _id: { $in: familyIds } })
      .populate('founders', 'fullName profilePhoto')
      .select('name description founders createdAt');
    
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
    const family = await Family.findById(req.params.id)
      .populate('founders')
      .populate('members.person', 'fullName profilePhoto email');
      
    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Familia no encontrada'
      });
    }
    
    // Verificar si el usuario tiene acceso a esta familia
    const userId = req.user._id;
    const user = await User.findById(userId);
    const hasAccess = user.families.some(f => f.family.toString() === req.params.id);
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta familia'
      });
    }
    
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
    const userId = req.user._id;
    
    const newFamily = new Family({
      ...req.body,
      createdBy: userId,
      members: [{ person: userId, role: 'admin' }]
    });
    
    const savedFamily = await newFamily.save();
    
    // Actualizar el usuario para incluir la nueva familia
    await User.findByIdAndUpdate(userId, {
      $push: { families: { family: savedFamily._id, role: 'admin' } }
    });
    
    res.status(201).json({
      success: true,
      data: savedFamily
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
    // Verificar si el usuario es administrador de la familia
    const userId = req.user._id;
    const user = await User.findById(userId);
    const familyRelation = user.families.find(f => f.family.toString() === req.params.id);
    
    if (!familyRelation || familyRelation.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para actualizar esta familia'
      });
    }
    
    const updatedFamily = await Family.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
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
    // Verificar si el usuario es administrador de la familia
    const userId = req.user._id;
    const user = await User.findById(userId);
    const familyRelation = user.families.find(f => f.family.toString() === req.params.id);
    
    if (!familyRelation || familyRelation.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar esta familia'
      });
    }
    
    const family = await Family.findById(req.params.id);
    
    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Familia no encontrada'
      });
    }
    
    // Eliminar la familia
    await family.remove();
    
    // Actualizar todos los usuarios que pertenecen a esta familia
    await User.updateMany(
      { 'families.family': req.params.id },
      { $pull: { families: { family: req.params.id } } }
    );
    
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
    const { familyId, userId, role } = req.body;
    
    // Verificar si el usuario que hace la solicitud es administrador
    const requestingUserId = req.user._id;
    const requestingUser = await User.findById(requestingUserId);
    const familyRelation = requestingUser.families.find(f => f.family.toString() === familyId);
    
    if (!familyRelation || familyRelation.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para agregar miembros a esta familia'
      });
    }
    
    // Verificar si la familia existe
    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Familia no encontrada'
      });
    }
    
    // Verificar si el usuario a agregar existe
    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar si el usuario ya es miembro de la familia
    const isAlreadyMember = family.members.some(m => m.person.toString() === userId);
    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya es miembro de esta familia'
      });
    }
    
    // Agregar el usuario a la familia
    family.members.push({ person: userId, role });
    await family.save();
    
    // Actualizar el usuario
    await User.findByIdAndUpdate(userId, {
      $push: { families: { family: familyId, role } }
    });
    
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