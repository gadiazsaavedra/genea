import React, { useState } from 'react';
import mediaService from '../../services/mediaService';
import './MediaUpload.css';

const MediaUpload = ({ personId, type = 'photos', onUploadComplete }) => {
  const [files, setFiles] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [titles, setTitles] = useState([]);
  const [types, setTypes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState([]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    
    // Generar previsualizaciones
    const newPreviews = selectedFiles.map(file => {
      return {
        file,
        url: URL.createObjectURL(file)
      };
    });
    setPreview(newPreviews);
    
    // Inicializar captions/titles/types con valores vacíos
    if (type === 'photos') {
      setCaptions(new Array(selectedFiles.length).fill(''));
    } else if (type === 'documents') {
      setTitles(new Array(selectedFiles.length).fill(''));
      setTypes(new Array(selectedFiles.length).fill('Otro'));
    }
  };

  const handleCaptionChange = (index, value) => {
    const newCaptions = [...captions];
    newCaptions[index] = value;
    setCaptions(newCaptions);
  };

  const handleTitleChange = (index, value) => {
    const newTitles = [...titles];
    newTitles[index] = value;
    setTitles(newTitles);
  };

  const handleTypeChange = (index, value) => {
    const newTypes = [...types];
    newTypes[index] = value;
    setTypes(newTypes);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      let response;
      
      // Simular progreso de carga
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      if (type === 'profilePhoto') {
        response = await mediaService.uploadProfilePhoto(personId, files[0]);
      } else if (type === 'photos') {
        response = await mediaService.uploadPhotos(personId, files, captions);
      } else if (type === 'documents') {
        response = await mediaService.uploadDocuments(personId, files, titles, types);
      }
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Limpiar previsualizaciones
      preview.forEach(p => URL.revokeObjectURL(p.url));
      
      // Resetear el estado
      setTimeout(() => {
        setFiles([]);
        setCaptions([]);
        setTitles([]);
        setTypes([]);
        setPreview([]);
        setUploading(false);
        setProgress(0);
        
        // Notificar al componente padre
        if (onUploadComplete) {
          onUploadComplete(response);
        }
      }, 1000);
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Error al subir los archivos. Por favor, inténtalo de nuevo.');
      setUploading(false);
    }
  };

  const documentTypes = [
    'Certificado de nacimiento',
    'Certificado de matrimonio',
    'Certificado de defunción',
    'Documento de identidad',
    'Fotografía histórica',
    'Carta',
    'Testamento',
    'Otro'
  ];

  return (
    <div className="media-upload">
      <div className="upload-header">
        <h3>
          {type === 'profilePhoto' && 'Subir foto de perfil'}
          {type === 'photos' && 'Subir fotos'}
          {type === 'documents' && 'Subir documentos'}
        </h3>
      </div>
      
      <div className="upload-content">
        <div className="file-input-container">
          <input
            type="file"
            id="file-input"
            onChange={handleFileChange}
            multiple={type !== 'profilePhoto'}
            accept={type === 'documents' ? ".pdf,.doc,.docx,.txt" : "image/*"}
            disabled={uploading}
          />
          <label htmlFor="file-input" className="file-input-label">
            {files.length > 0 ? `${files.length} archivo(s) seleccionado(s)` : 'Seleccionar archivos'}
          </label>
        </div>
        
        {preview.length > 0 && (
          <div className="preview-container">
            {preview.map((item, index) => (
              <div key={index} className="preview-item">
                {item.file.type.startsWith('image/') ? (
                  <img src={item.url} alt={`Preview ${index}`} className="preview-image" />
                ) : (
                  <div className="document-preview">
                    <span className="document-icon">📄</span>
                    <span className="document-name">{item.file.name}</span>
                  </div>
                )}
                
                {type === 'photos' && (
                  <input
                    type="text"
                    placeholder="Descripción (opcional)"
                    value={captions[index] || ''}
                    onChange={(e) => handleCaptionChange(index, e.target.value)}
                    disabled={uploading}
                    className="caption-input"
                  />
                )}
                
                {type === 'documents' && (
                  <>
                    <input
                      type="text"
                      placeholder="Título del documento"
                      value={titles[index] || ''}
                      onChange={(e) => handleTitleChange(index, e.target.value)}
                      disabled={uploading}
                      className="title-input"
                    />
                    <select
                      value={types[index] || 'Otro'}
                      onChange={(e) => handleTypeChange(index, e.target.value)}
                      disabled={uploading}
                      className="type-select"
                    >
                      {documentTypes.map(docType => (
                        <option key={docType} value={docType}>{docType}</option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        
        {error && <div className="upload-error">{error}</div>}
        
        {uploading && (
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="progress-text">{progress}%</div>
          </div>
        )}
        
        <div className="upload-actions">
          <button
            className="upload-button"
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
          >
            {uploading ? 'Subiendo...' : 'Subir'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaUpload;