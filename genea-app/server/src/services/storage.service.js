const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Directorio base para almacenamiento de archivos
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');

// Asegurar que los directorios existan
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// Inicializar directorios
ensureDirectoryExists(UPLOAD_DIR);
ensureDirectoryExists(path.join(UPLOAD_DIR, 'profilePhotos'));
ensureDirectoryExists(path.join(UPLOAD_DIR, 'photos'));
ensureDirectoryExists(path.join(UPLOAD_DIR, 'documents'));

const storageService = {
  // Guardar un archivo
  saveFile: async (file, type, userId, familyId = null) => {
    try {
      // Generar un nombre único para el archivo
      const fileExtension = path.extname(file.originalname);
      const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
      
      let filePath;
      let fileUrl;
      
      // Determinar la ruta según el tipo de archivo
      switch (type) {
        case 'profilePhoto':
          const profileDir = path.join(UPLOAD_DIR, 'profilePhotos', userId);
          ensureDirectoryExists(profileDir);
          filePath = path.join(profileDir, fileName);
          fileUrl = `/uploads/profilePhotos/${userId}/${fileName}`;
          break;
        
        case 'photo':
          if (!familyId) throw new Error('Se requiere familyId para fotos');
          const photoDir = path.join(UPLOAD_DIR, 'photos', familyId);
          ensureDirectoryExists(photoDir);
          filePath = path.join(photoDir, fileName);
          fileUrl = `/uploads/photos/${familyId}/${fileName}`;
          break;
        
        case 'document':
          if (!familyId) throw new Error('Se requiere familyId para documentos');
          const docDir = path.join(UPLOAD_DIR, 'documents', familyId);
          ensureDirectoryExists(docDir);
          filePath = path.join(docDir, fileName);
          fileUrl = `/uploads/documents/${familyId}/${fileName}`;
          break;
        
        default:
          throw new Error('Tipo de archivo no válido');
      }
      
      // Guardar el archivo
      await fs.promises.writeFile(filePath, file.buffer);
      
      return {
        fileName,
        filePath,
        fileUrl,
        contentType: file.mimetype,
        size: file.size
      };
    } catch (error) {
      throw error;
    }
  },
  
  // Eliminar un archivo
  deleteFile: async (fileUrl) => {
    try {
      // Convertir URL a ruta de archivo
      const relativePath = fileUrl.replace('/uploads/', '');
      const filePath = path.join(UPLOAD_DIR, relativePath);
      
      // Verificar si el archivo existe
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      
      return false;
    } catch (error) {
      throw error;
    }
  },
  
  // Obtener URL pública de un archivo
  getPublicUrl: (filePath) => {
    const relativePath = path.relative(UPLOAD_DIR, filePath);
    return `/uploads/${relativePath.replace(/\\/g, '/')}`;
  }
};

module.exports = storageService;