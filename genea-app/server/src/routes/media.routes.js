const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/auth.middleware');
const mediaController = require('../controllers/media.controller');

// Configuración de multer para almacenamiento de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Crear el directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar un nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filtro para tipos de archivos permitidos
const fileFilter = (req, file, cb) => {
  // Aceptar imágenes y documentos comunes
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, gif) y documentos (pdf, doc, docx)'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Límite de 10MB
});

// Rutas protegidas por autenticación
router.use(verifyToken);

// Subir una foto de perfil para una persona
router.post('/profilePhoto/:personId', upload.single('profilePhoto'), mediaController.uploadProfilePhoto);

// Subir fotos para una persona
router.post('/photos/:personId', upload.array('photos', 5), mediaController.uploadPhotos);

// Subir documentos para una persona
router.post('/documents/:personId', upload.array('documents', 5), mediaController.uploadDocuments);

// Eliminar un archivo multimedia
router.delete('/:personId/:type/:fileId?', mediaController.deleteMedia);

module.exports = router;