const { supabaseClient, supabaseAdmin } = require('../config/supabase.config');
const path = require('path');
const fs = require('fs');

// Nombre del bucket para almacenar archivos
const BUCKET_NAME = 'genea-media';

// Servicio para gestionar el almacenamiento de archivos
const storageService = {
  // Inicializar el bucket si no existe
  async initBucket() {
    try {
      // Verificar si el bucket existe
      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME);
      
      // Si no existe, crearlo
      if (!bucketExists) {
        const { error } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
          public: false, // Archivos privados por defecto
          fileSizeLimit: 10485760 // 10MB
        });
        
        if (error) throw new Error(`Error al crear bucket: ${error.message}`);
        
        // Configurar políticas de acceso
        await this.setupBucketPolicies();
        
        console.log(`Bucket ${BUCKET_NAME} creado correctamente`);
      }
    } catch (error) {
      console.error('Error al inicializar bucket:', error);
      throw error;
    }
  },
  
  // Configurar políticas de acceso al bucket
  async setupBucketPolicies() {
    try {
      // Política para que los usuarios puedan ver sus propios archivos
      await supabaseAdmin.storage.from(BUCKET_NAME).createPolicy('read_policy', {
        name: 'Read access for authenticated users',
        definition: {
          role_id: 'authenticated',
          operation: 'SELECT',
          check: "auth.uid() = owner_id"
        }
      });
      
      // Política para que los usuarios puedan subir archivos
      await supabaseAdmin.storage.from(BUCKET_NAME).createPolicy('insert_policy', {
        name: 'Insert access for authenticated users',
        definition: {
          role_id: 'authenticated',
          operation: 'INSERT',
          check: "auth.uid() = owner_id"
        }
      });
      
      console.log('Políticas de bucket configuradas correctamente');
    } catch (error) {
      console.error('Error al configurar políticas de bucket:', error);
      throw error;
    }
  },
  
  // Subir un archivo
  async uploadFile(file, userId, folder = '') {
    try {
      // Crear ruta de almacenamiento
      const filePath = folder ? `${folder}/${file.filename}` : file.filename;
      
      // Leer el archivo
      const fileBuffer = fs.readFileSync(file.path);
      
      // Subir a Supabase Storage
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(filePath, fileBuffer, {
          contentType: file.mimetype,
          upsert: true,
          metadata: {
            owner_id: userId,
            originalName: file.originalname
          }
        });
      
      if (error) throw new Error(`Error al subir archivo: ${error.message}`);
      
      // Eliminar archivo temporal
      fs.unlinkSync(file.path);
      
      // Generar URL firmada para acceso temporal
      const { data: urlData } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, 60 * 60 * 24); // URL válida por 24 horas
      
      return {
        path: filePath,
        url: urlData.signedUrl,
        mimetype: file.mimetype,
        size: file.size
      };
    } catch (error) {
      console.error('Error al subir archivo:', error);
      throw error;
    }
  },
  
  // Obtener URL de un archivo
  async getFileUrl(filePath) {
    try {
      // Generar URL firmada para acceso temporal
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, 60 * 60 * 24); // URL válida por 24 horas
      
      if (error) throw new Error(`Error al obtener URL: ${error.message}`);
      
      return data.signedUrl;
    } catch (error) {
      console.error('Error al obtener URL de archivo:', error);
      throw error;
    }
  },
  
  // Eliminar un archivo
  async deleteFile(filePath) {
    try {
      const { error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .remove([filePath]);
      
      if (error) throw new Error(`Error al eliminar archivo: ${error.message}`);
      
      return true;
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      throw error;
    }
  }
};

module.exports = storageService;