import React, { useState } from 'react';

const EventGallery = ({ event, onClose }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
  };

  const closePhotoDetail = () => {
    setSelectedPhoto(null);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2>📸 {event.title} - Galería de Fotos</h2>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>
      
      <div style={{
        flex: 1,
        padding: '20px',
        backgroundColor: '#f5f5f5',
        overflow: 'auto'
      }}>
        {event.media && event.media.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            {event.media.map(photo => (
              <div 
                key={photo.id}
                onClick={() => handlePhotoClick(photo)}
                style={{
                  cursor: 'pointer',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s',
                  backgroundColor: 'white'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                <img 
                  src={photo.file_url}
                  alt={photo.description || 'Foto del evento'}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover'
                  }}
                />
                {photo.description && (
                  <div style={{
                    padding: '10px',
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    {photo.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666'
          }}>
            No hay fotos en este evento
          </div>
        )}
      </div>
      
      {selectedPhoto && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={closePhotoDetail}
        >
          <div style={{
            maxWidth: '90%',
            maxHeight: '90%',
            position: 'relative'
          }}>
            <img 
              src={selectedPhoto.file_url}
              alt={selectedPhoto.description}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
            <button 
              onClick={closePhotoDetail}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ✕
            </button>
            {selectedPhoto.description && (
              <div style={{
                position: 'absolute',
                bottom: '-40px',
                left: '0',
                right: '0',
                color: 'white',
                textAlign: 'center',
                fontSize: '16px'
              }}>
                {selectedPhoto.description}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventGallery;