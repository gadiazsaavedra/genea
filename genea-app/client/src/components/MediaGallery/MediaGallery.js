import React, { useState } from 'react';
import mediaService from '../../services/mediaService';
import './MediaGallery.css';

const MediaGallery = ({ person, mediaType = 'photos', onMediaDelete }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const media = mediaType === 'photos' ? person.photos || [] : person.documents || [];

  const handleMediaClick = (item) => {
    setSelectedMedia(item);
  };

  const handleCloseDetail = () => {
    setSelectedMedia(null);
  };

  const handleDeleteMedia = async (mediaId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este archivo?')) {
      setDeleting(true);
      setError(null);
      
      try {
        await mediaService.deleteMedia(person._id, mediaType, mediaId);
        
        // Cerrar el detalle si está abierto
        if (selectedMedia && selectedMedia._id === mediaId) {
          setSelectedMedia(null);
        }
        
        // Notificar al componente padre
        if (onMediaDelete) {
          onMediaDelete(mediaId);
        }
      } catch (err) {
        console.error('Error deleting media:', err);
        setError('Error al eliminar el archivo. Por favor, inténtalo de nuevo.');
      } finally {
        setDeleting(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const isImage = (url) => {
    const extension = url.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
  };

  const getDocumentIcon = (url) => {
    const extension = url.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📑';
      default:
        return '📁';
    }
  };

  return (
    <div className="media-gallery">
      {error && <div className="gallery-error">{error}</div>}
      
      {media.length === 0 ? (
        <div className="no-media">
          {mediaType === 'photos' ? 'No hay fotos disponibles' : 'No hay documentos disponibles'}
        </div>
      ) : (
        <div className="gallery-grid">
          {media.map((item) => (
            <div 
              key={item._id} 
              className="gallery-item"
              onClick={() => handleMediaClick(item)}
            >
              {mediaType === 'photos' || isImage(item.url) ? (
                <div className="gallery-image-container">
                  <img src={item.url} alt={item.caption || 'Imagen'} className="gallery-image" />
                </div>
              ) : (
                <div className="gallery-document">
                  <span className="document-icon">{getDocumentIcon(item.url)}</span>
                  <span className="document-title">{item.title || 'Documento'}</span>
                </div>
              )}
              
              <div className="gallery-item-info">
                {mediaType === 'photos' ? (
                  <span className="gallery-caption">{item.caption || 'Sin descripción'}</span>
                ) : (
                  <span className="gallery-title">{item.title || 'Sin título'}</span>
                )}
                <span className="gallery-date">{formatDate(item.date)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedMedia && (
        <div className="media-detail-overlay" onClick={handleCloseDetail}>
          <div className="media-detail-container" onClick={(e) => e.stopPropagation()}>
            <div className="media-detail-header">
              <h3>
                {mediaType === 'photos' ? 'Foto' : 'Documento'}
              </h3>
              <button className="close-button" onClick={handleCloseDetail}>×</button>
            </div>
            
            <div className="media-detail-content">
              {mediaType === 'photos' || isImage(selectedMedia.url) ? (
                <img 
                  src={selectedMedia.url} 
                  alt={selectedMedia.caption || 'Imagen'} 
                  className="detail-image" 
                />
              ) : (
                <div className="detail-document">
                  <span className="document-icon large">{getDocumentIcon(selectedMedia.url)}</span>
                  <a 
                    href={selectedMedia.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="document-link"
                  >
                    Ver documento
                  </a>
                </div>
              )}
              
              <div className="media-info">
                {mediaType === 'photos' && selectedMedia.caption && (
                  <div className="info-row">
                    <span className="info-label">Descripción:</span>
                    <span className="info-value">{selectedMedia.caption}</span>
                  </div>
                )}
                
                {mediaType === 'documents' && (
                  <>
                    {selectedMedia.title && (
                      <div className="info-row">
                        <span className="info-label">Título:</span>
                        <span className="info-value">{selectedMedia.title}</span>
                      </div>
                    )}
                    
                    {selectedMedia.type && (
                      <div className="info-row">
                        <span className="info-label">Tipo:</span>
                        <span className="info-value">{selectedMedia.type}</span>
                      </div>
                    )}
                  </>
                )}
                
                {selectedMedia.date && (
                  <div className="info-row">
                    <span className="info-label">Fecha:</span>
                    <span className="info-value">{formatDate(selectedMedia.date)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="media-detail-actions">
              <button 
                className="delete-button"
                onClick={() => handleDeleteMedia(selectedMedia._id)}
                disabled={deleting}
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;