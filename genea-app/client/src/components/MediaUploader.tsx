import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  TextField,
  IconButton
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';

interface MediaUploaderProps {
  personId: string;
  mediaType: 'profilePhoto' | 'photos' | 'documents';
  onUploadSuccess: (files: any[]) => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ personId, mediaType, onUploadSuccess }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [captions, setCaptions] = useState<string[]>([]);
  const [titles, setTitles] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Manejar selección de archivos
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const selectedFiles = Array.from(event.target.files);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    
    // Crear previsualizaciones
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    
    // Inicializar captions, titles y types para los nuevos archivos
    setCaptions(prev => [...prev, ...Array(selectedFiles.length).fill('')]);
    setTitles(prev => [...prev, ...selectedFiles.map(file => file.name)]);
    setTypes(prev => [...prev, ...Array(selectedFiles.length).fill('Otro')]);
  };

  // Eliminar un archivo
  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setCaptions(prev => prev.filter((_, i) => i !== index));
    setTitles(prev => prev.filter((_, i) => i !== index));
    setTypes(prev => prev.filter((_, i) => i !== index));
  };

  // Actualizar caption
  const handleCaptionChange = (index: number, value: string) => {
    const newCaptions = [...captions];
    newCaptions[index] = value;
    setCaptions(newCaptions);
  };

  // Actualizar título
  const handleTitleChange = (index: number, value: string) => {
    const newTitles = [...titles];
    newTitles[index] = value;
    setTitles(newTitles);
  };

  // Actualizar tipo
  const handleTypeChange = (index: number, value: string) => {
    const newTypes = [...types];
    newTypes[index] = value;
    setTypes(newTypes);
  };

  // Subir archivos
  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const formData = new FormData();
      
      // Agregar archivos al FormData
      if (mediaType === 'profilePhoto') {
        formData.append('profilePhoto', files[0]);
      } else {
        files.forEach((file, index) => {
          formData.append(mediaType, file);
        });
      }
      
      // Agregar metadatos
      if (mediaType === 'photos') {
        captions.forEach((caption, index) => {
          formData.append(`captions[${index}]`, caption);
        });
      } else if (mediaType === 'documents') {
        titles.forEach((title, index) => {
          formData.append(`titles[${index}]`, title);
        });
        types.forEach((type, index) => {
          formData.append(`types[${index}]`, type);
        });
      }
      
      // Enviar solicitud
      const response = await axios.post(
        `/api/media/${mediaType}/${personId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Manejar respuesta exitosa
      setSuccess('Archivos subidos correctamente');
      onUploadSuccess(response.data.data.uploadedPhotos || response.data.data.uploadedDocuments || [response.data.data]);
      
      // Limpiar formulario
      setFiles([]);
      setPreviews([]);
      setCaptions([]);
      setTitles([]);
      setTypes([]);
    } catch (err: any) {
      console.error('Error al subir archivos:', err);
      setError(err.response?.data?.message || 'Error al subir los archivos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <Box
        sx={{
          border: '2px dashed #ccc',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          mb: 3,
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'rgba(74, 103, 65, 0.05)'
          }
        }}
        onClick={() => document.getElementById(`file-input-${mediaType}`)?.click()}
      >
        <input
          id={`file-input-${mediaType}`}
          type="file"
          multiple={mediaType !== 'profilePhoto'}
          accept={mediaType === 'documents' ? '.pdf,.doc,.docx,.jpg,.jpeg,.png' : 'image/*'}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h6" gutterBottom>
          {mediaType === 'profilePhoto' ? 'Seleccionar foto de perfil' : 
           mediaType === 'photos' ? 'Seleccionar fotos' : 'Seleccionar documentos'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {mediaType === 'profilePhoto' ? 
            'Haz clic para seleccionar una imagen' : 
            'Haz clic para seleccionar uno o más archivos'}
        </Typography>
      </Box>
      
      {files.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            {files.length} {files.length === 1 ? 'archivo seleccionado' : 'archivos seleccionados'}
          </Typography>
          
          <Grid container spacing={2}>
            {previews.map((preview, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box
                  sx={{
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    p: 2,
                    position: 'relative'
                  }}
                >
                  <IconButton
                    size="small"
                    color="error"
                    sx={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      bgcolor: 'rgba(255,255,255,0.7)',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.9)'
                      }
                    }}
                    onClick={() => handleRemoveFile(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                  
                  {files[index].type.startsWith('image/') ? (
                    <Box
                      component="img"
                      src={preview}
                      alt={`Preview ${index}`}
                      sx={{
                        width: '100%',
                        height: 150,
                        objectFit: 'cover',
                        borderRadius: 1,
                        mb: 2
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: 150,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#f5f5f5',
                        borderRadius: 1,
                        mb: 2
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {files[index].name}
                      </Typography>
                    </Box>
                  )}
                  
                  {mediaType === 'photos' && (
                    <TextField
                      fullWidth
                      size="small"
                      label="Descripción"
                      value={captions[index] || ''}
                      onChange={(e) => handleCaptionChange(index, e.target.value)}
                    />
                  )}
                  
                  {mediaType === 'documents' && (
                    <>
                      <TextField
                        fullWidth
                        size="small"
                        label="Título"
                        value={titles[index] || ''}
                        onChange={(e) => handleTitleChange(index, e.target.value)}
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Tipo de documento"
                        value={types[index] || ''}
                        onChange={(e) => handleTypeChange(index, e.target.value)}
                        select
                        SelectProps={{
                          native: true
                        }}
                      >
                        <option value="Certificado de nacimiento">Certificado de nacimiento</option>
                        <option value="Certificado de matrimonio">Certificado de matrimonio</option>
                        <option value="Certificado de defunción">Certificado de defunción</option>
                        <option value="Documento de identidad">Documento de identidad</option>
                        <option value="Otro">Otro</option>
                      </TextField>
                    </>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      <Button
        variant="contained"
        color="primary"
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
        disabled={loading || files.length === 0}
        onClick={handleUpload}
        fullWidth
      >
        {loading ? 'Subiendo...' : 'Subir archivos'}
      </Button>
    </Box>
  );
};

export default MediaUploader;