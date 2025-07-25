const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const path = require('path');

// Configuración
dotenv.config();

// Validar variables de entorno críticas
const validateEnv = require('./utils/env-validator');
if (!validateEnv()) {
  console.error('Error: Variables de entorno requeridas no están configuradas. Saliendo...');
  process.exit(1);
}

// Importar configuración de Supabase
const { supabaseClient } = require('./config/supabase.config');
const initializeSupabase = require('./utils/supabase-init');

// Importar rutas
const personRoutes = require('./routes/person.routes');
const familyRoutes = require('./routes/family.routes');
const mediaRoutes = require('./routes/media.routes');
const authRoutes = require('./routes/auth.routes');
// const treeRoutes = require('./routes/tree.routes'); // Comentado temporalmente
const invitationRoutes = require('./routes/invitation.routes');
const notificationRoutes = require('./routes/notification.routes');
const commentRoutes = require('./routes/comment.routes');
const gedcomRoutes = require('./routes/gedcom.routes');
const statsRoutes = require('./routes/stats.routes');
const timelineRoutes = require('./routes/timeline.routes');
const licenseRoutes = require('./routes/license.routes');
const descendantRoutes = require('./routes/descendant.routes');
const paymentRoutes = require('./routes/payment.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Crear directorio de uploads si no existe
const fs = require('fs');
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL] 
    : ['http://localhost:3000'],
  credentials: true
}));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Inicializar Supabase
initializeSupabase()
  .then(success => {
    if (!success) {
      console.error('Error al inicializar Supabase. Saliendo...');
      process.exit(1);
    }
    
    // Rutas
    app.use('/api/persons', personRoutes);
    app.use('/api/families', familyRoutes);
    app.use('/api/media', mediaRoutes);
    app.use('/api/auth', authRoutes);
    // app.use('/api/tree', treeRoutes); // Comentado temporalmente
    app.use('/api/invitations', invitationRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/comments', commentRoutes);
    app.use('/api/gedcom', gedcomRoutes);
    app.use('/api/stats', statsRoutes);
    app.use('/api/timeline', timelineRoutes);
    app.use('/api/license', licenseRoutes);
    app.use('/api/descendant', descendantRoutes);
    app.use('/api/payments', paymentRoutes);

    // Ruta de prueba
    app.get('/', (req, res) => {
      res.send('API de Genea funcionando correctamente con Supabase');
    });

    // Ruta de estado de salud
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database: 'supabase'
      });
    });

    // Manejo de errores global
    app.use((err, req, res, next) => {
      console.error('Error no controlado:', err);
      
      // Eliminar archivos subidos en caso de error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      if (req.files) {
        req.files.forEach(file => fs.unlinkSync(file.path));
      }
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
      });
    });

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Error fatal al inicializar la aplicación:', error);
    process.exit(1);
  });