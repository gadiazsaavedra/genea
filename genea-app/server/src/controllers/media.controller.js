const Person = require('../models/person.model');
const fs = require('fs');
const path = require('path');
const storageService = require('../services/storage.service');

// Subir foto de perfil
exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ningún archivo'
      });
    }
    
    const personId = req.params.personId;
    
    // Verificar si la persona existe
    const person = await Person.findById(personId);
    if (!person) {
      // Eliminar el archivo subido
      fs.unlinkSync(req.file.path);
      
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }
    
    // Si ya existe una foto de perfil, eliminarla
    if (person.profilePhoto) {
      const oldPhotoPath = path.join(__dirname, '../../', person.profilePhoto);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }
    
    // Actualizar la foto de perfil
    const fileUrl = `/uploads/${req.file.filename}`;
    person.profilePhoto = fileUrl;
    await person.save();
    
    res.status(200).json({
      success: true,
      message: 'Foto de perfil actualizada correctamente',
      data: {
        fileUrl,
        person
      }
    });
  } catch (error) {
    console.error('Error al subir la foto de perfil:', error);
    
    // Eliminar el archivo en caso de error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al subir la foto de perfil',
      error: error.message
    });
  }
};

// Subir fotos
exports.uploadPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se han proporcionado archivos'
      });
    }
    
    const personId = req.params.personId;
    const captions = req.body.captions || [];
    
    // Verificar si la persona existe
    const person = await Person.findById(personId);
    if (!person) {
      // Eliminar los archivos subidos
      req.files.forEach(file => fs.unlinkSync(file.path));
      
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }
    
    // Procesar cada archivo
    const uploadedPhotos = req.files.map((file, index) => {
      const fileUrl = `/uploads/${file.filename}`;
      return {
        url: fileUrl,
        caption: captions[index] || '',
        date: new Date()
      };
    });
    
    // Agregar las fotos a la persona
    if (!person.photos) {
      person.photos = [];
    }
    person.photos.push(...uploadedPhotos);
    await person.save();
    
    res.status(200).json({
      success: true,
      message: 'Fotos subidas correctamente',
      data: {
        uploadedPhotos,
        person
      }
    });
  } catch (error) {
    console.error('Error al subir las fotos:', error);
    
    // Eliminar los archivos en caso de error
    if (req.files) {
      req.files.forEach(file => fs.unlinkSync(file.path));
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al subir las fotos',
      error: error.message
    });
  }
};

// Subir documentos
exports.uploadDocuments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se han proporcionado archivos'
      });
    }
    
    const personId = req.params.personId;
    const titles = req.body.titles || [];
    const types = req.body.types || [];
    
    // Verificar si la persona existe
    const person = await Person.findById(personId);
    if (!person) {
      // Eliminar los archivos subidos
      req.files.forEach(file => fs.unlinkSync(file.path));
      
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }
    
    // Procesar cada archivo
    const uploadedDocuments = req.files.map((file, index) => {
      const fileUrl = `/uploads/${file.filename}`;
      return {
        url: fileUrl,
        title: titles[index] || file.originalname,
        type: types[index] || 'Otro',
        date: new Date()
      };
    });
    
    // Agregar los documentos a la persona
    if (!person.documents) {
      person.documents = [];
    }
    person.documents.push(...uploadedDocuments);
    await person.save();
    
    res.status(200).json({
      success: true,
      message: 'Documentos subidos correctamente',
      data: {
        uploadedDocuments,
        person
      }
    });
  } catch (error) {
    console.error('Error al subir los documentos:', error);
    
    // Eliminar los archivos en caso de error
    if (req.files) {
      req.files.forEach(file => fs.unlinkSync(file.path));
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al subir los documentos',
      error: error.message
    });
  }
};

// Eliminar un archivo multimedia
exports.deleteMedia = async (req, res) => {
  try {
    const { personId, type, fileId } = req.params;
    
    // Verificar si la persona existe
    const person = await Person.findById(personId);
    if (!person) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }
    
    let fileUrl;
    
    // Eliminar según el tipo de archivo
    switch (type) {
      case 'profilePhoto':
        fileUrl = person.profilePhoto;
        person.profilePhoto = '';
        break;
      case 'photos':
        const photoIndex = person.photos.findIndex(p => p._id.toString() === fileId);
        if (photoIndex === -1) {
          return res.status(404).json({
            success: false,
            message: 'Foto no encontrada'
          });
        }
        fileUrl = person.photos[photoIndex].url;
        person.photos.splice(photoIndex, 1);
        break;
      case 'documents':
        const docIndex = person.documents.findIndex(d => d._id.toString() === fileId);
        if (docIndex === -1) {
          return res.status(404).json({
            success: false,
            message: 'Documento no encontrado'
          });
        }
        fileUrl = person.documents[docIndex].url;
        person.documents.splice(docIndex, 1);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Tipo de archivo no válido'
        });
    }
    
    await person.save();
    
    // Eliminar el archivo físico
    if (fileUrl) {
      const filePath = path.join(__dirname, '../../', fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Archivo eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar el archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el archivo',
      error: error.message
    });
  }
};