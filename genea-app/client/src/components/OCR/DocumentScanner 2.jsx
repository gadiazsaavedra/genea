import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  TextField,
  Chip,
  Alert
} from '@mui/material';
import {
  CloudUpload,
  CameraAlt,
  Save,
  Clear
} from '@mui/icons-material';
import { createWorker } from 'tesseract.js';

const DocumentScanner = ({ onDataExtracted }) => {
  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [extractedData, setExtractedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef();

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        processImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageData) => {
    setLoading(true);
    setProgress(0);

    try {
      const worker = await createWorker('spa', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });

      const { data: { text } } = await worker.recognize(imageData);
      setExtractedText(text);
      
      const structuredData = extractStructuredData(text);
      setExtractedData(structuredData);
      
      await worker.terminate();
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const extractStructuredData = (text) => {
    const data = {};
    
    const patterns = {
      dni: /DNI[:\s]*(\d{1,2}\.?\d{3}\.?\d{3})/i,
      nombre: /NOMBRE[:\s]*([A-ZÁÉÍÓÚÑ\s]+)/i,
      apellido: /APELLIDO[:\s]*([A-ZÁÉÍÓÚÑ\s]+)/i,
      fechaNacimiento: /(?:NACIMIENTO|FECHA DE NAC)[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})/i,
      lugarNacimiento: /(?:LUGAR DE NAC|NACIDO EN)[:\s]*([A-ZÁÉÍÓÚÑ\s,]+)/i,
      fechaDefuncion: /(?:DEFUNCIÓN|FALLECIMIENTO)[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})/i,
      padre: /PADRE[:\s]*([A-ZÁÉÍÓÚÑ\s]+)/i,
      madre: /MADRE[:\s]*([A-ZÁÉÍÓÚÑ\s]+)/i
    };

    Object.keys(patterns).forEach(key => {
      const match = text.match(patterns[key]);
      if (match) {
        data[key] = match[1].trim();
      }
    });

    return data;
  };

  const handleSaveData = () => {
    const personData = {
      first_name: extractedData.nombre || '',
      last_name: extractedData.apellido || '',
      birth_date: extractedData.fechaNacimiento ? convertDate(extractedData.fechaNacimiento) : '',
      birth_place: extractedData.lugarNacimiento || '',
      death_date: extractedData.fechaDefuncion ? convertDate(extractedData.fechaDefuncion) : '',
      document_number: extractedData.dni || '',
      father_name: extractedData.padre || '',
      mother_name: extractedData.madre || '',
      extracted_text: extractedText
    };

    onDataExtracted && onDataExtracted(personData);
  };

  const convertDate = (dateStr) => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateStr;
  };

  const clearAll = () => {
    setImage(null);
    setExtractedText('');
    setExtractedData({});
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        📄 Escáner de Documentos OCR
      </Typography>

      {!image ? (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Sube una foto de un documento para extraer información automáticamente
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={() => fileInputRef.current?.click()}
          >
            Subir Documento
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </Box>
      ) : (
        <Box>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>Imagen Original</Typography>
            <img 
              src={image} 
              alt="Documento" 
              style={{ 
                width: '100%', 
                maxHeight: '300px', 
                objectFit: 'contain',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }} 
            />
          </Box>

          {loading && (
            <Box mb={3}>
              <Typography variant="body2" gutterBottom>
                Procesando documento... {progress}%
              </Typography>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
          )}

          {extractedText && (
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>Texto Extraído</Typography>
              <TextField
                multiline
                rows={6}
                fullWidth
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                variant="outlined"
              />
            </Box>
          )}

          {Object.keys(extractedData).length > 0 && (
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>📋 Datos Estructurados</Typography>
              
              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                {Object.entries(extractedData).map(([key, value]) => (
                  <Chip
                    key={key}
                    label={`${key}: ${value}`}
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                Revisa y corrige los datos extraídos antes de guardar
              </Alert>

              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveData}
                  color="success"
                >
                  Guardar Datos
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Clear />}
                  onClick={clearAll}
                >
                  Limpiar Todo
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default DocumentScanner;