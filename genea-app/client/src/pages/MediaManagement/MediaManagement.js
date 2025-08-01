import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase.config';
import MediaUpload from '../../components/MediaUpload/MediaUpload';
import MediaGallery from '../../components/MediaGallery/MediaGallery';
import personService from '../../services/personService';
import './MediaManagement.css';

const MediaManagement = () => {
  const { personId } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('photos');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState('photos');

  useEffect(() => {
    const fetchPerson = async () => {
      try {
        setLoading(true);
        
        // Intentar cargar datos reales desde la API
        try {
          const response = await personService.getPersonById(personId);
          
          if (response.success && response.data) {
            // Cargar fotos y documentos desde tabla media
            const { data: mediaData } = await supabase
              .from('media')
              .select('*')
              .eq('person_id', personId);
            
            const photos = mediaData?.filter(m => m.media_type === 'photo').map(m => ({
              _id: m.id,
              url: m.url,
              caption: m.caption,
              date: m.created_at
            })) || [];
            
            const documents = mediaData?.filter(m => m.media_type === 'document').map(m => ({
              _id: m.id,
              url: m.url,
              title: m.title,
              type: m.file_type,
              date: m.created_at
            })) || [];
            
            const personData = {
              ...response.data,
              fullName: response.data.fullName || `${response.data.first_name || ''} ${response.data.last_name || ''}`.trim() || 'Sin nombre',
              photos: photos,
              documents: documents
            };
            setPerson(personData);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.warn('Error al cargar datos de la API, usando datos de ejemplo:', apiError);
        }
        
        // Si falla la API, usar datos de ejemplo
        setTimeout(() => {
          const mockPerson = {
            _id: personId,
            fullName: 'Juan Pérez',
            first_name: 'Juan',
            last_name: 'Pérez',
            birthDate: '1950-05-15',
            birthPlace: 'Madrid, España',
            isAlive: true,
            profilePhoto: 'https://via.placeholder.com/150',
            photos: [
              {
                _id: 'photo1',
                url: 'https://via.placeholder.com/500x300?text=Foto+1',
                caption: 'Vacaciones en la playa',
                date: '2020-07-15'
              },
              {
                _id: 'photo2',
                url: 'https://via.placeholder.com/500x300?text=Foto+2',
                caption: 'Reunión familiar',
                date: '2019-12-25'
              },
              {
                _id: 'photo3',
                url: 'https://via.placeholder.com/500x300?text=Foto+3',
                caption: 'Graduación',
                date: '2015-06-30'
              }
            ],
            documents: [
              {
                _id: 'doc1',
                url: 'https://via.placeholder.com/100x100?text=PDF',
                title: 'Certificado de nacimiento',
                type: 'Certificado de nacimiento',
                date: '2010-01-10'
              },
              {
                _id: 'doc2',
                url: 'https://via.placeholder.com/100x100?text=DOC',
                title: 'Carta familiar',
                type: 'Carta',
                date: '1995-03-22'
              }
            ]
          };
          setPerson(mockPerson);
          setLoading(false);
        }, 800);
      } catch (err) {
        setError('Error al cargar los datos de la persona');
        setLoading(false);
        console.error('Error fetching person data:', err);
      }
    };

    fetchPerson();
  }, [personId]); // Recargar cuando cambie personId

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleOpenUpload = (type) => {
    setUploadType(type);
    setShowUploadModal(true);
  };

  const handleCloseUpload = () => {
    setShowUploadModal(false);
  };

  const handleUploadComplete = (response) => {
    // Actualizar el estado con los nuevos medios
    if (response && response.success) {
      setPerson(prevPerson => {
        if (uploadType === 'profilePhoto') {
          return {
            ...prevPerson,
            photo_url: response.data.fileUrl
          };
        } else if (uploadType === 'photos') {
          const newPhotos = response.data.uploadedPhotos.map((photo, index) => ({
            _id: photo._id || `photo_${Date.now()}_${index}`,
            url: photo.url,
            caption: photo.caption,
            date: photo.date
          }));
          return {
            ...prevPerson,
            photos: [...(prevPerson.photos || []), ...newPhotos]
          };
        } else if (uploadType === 'documents') {
          const newDocuments = response.data.uploadedDocuments.map((doc, index) => ({
            _id: doc._id || `doc_${Date.now()}_${index}`,
            url: doc.url,
            title: doc.title,
            type: doc.type,
            date: doc.date
          }));
          return {
            ...prevPerson,
            documents: [...(prevPerson.documents || []), ...newDocuments]
          };
        }
        return prevPerson;
      });
      
      setShowUploadModal(false);
    }
  };

  const handleMediaDelete = (mediaId) => {
    // Actualizar el estado eliminando el medio
    setPerson(prevPerson => {
      if (activeTab === 'photos') {
        return {
          ...prevPerson,
          photos: prevPerson.photos.filter(photo => photo._id !== mediaId)
        };
      } else if (activeTab === 'documents') {
        return {
          ...prevPerson,
          documents: prevPerson.documents.filter(doc => doc._id !== mediaId)
        };
      }
      return prevPerson;
    });
  };

  if (loading) {
    return <div className="loading-container">Cargando información...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="media-management-container">
      <div className="media-header">
        <div className="person-info">
          <div className="person-photo">
            {person.photo_url ? (
              <img src={person.photo_url} alt={person.fullName} />
            ) : (
              <div className="no-photo">
                {person.fullName ? person.fullName.charAt(0) : '?'}
              </div>
            )}
          </div>
          <div className="person-details">
            <h1>{person.fullName || 'Sin nombre'}</h1>
            <p>{person.birthDate ? new Date(person.birthDate).getFullYear() : ''} - {!person.isAlive && person.deathDate ? new Date(person.deathDate).getFullYear() : ''}</p>
          </div>
        </div>
        
        <div className="media-actions">
          <button 
            className="btn btn-outline"
            onClick={() => handleOpenUpload('profilePhoto')}
          >
            Cambiar foto de perfil
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/persons/${personId}/profile`)}
          >
            Ver perfil completo
          </button>
        </div>
      </div>
      
      <div className="media-tabs">
        <button 
          className={`tab-button ${activeTab === 'photos' ? 'active' : ''}`}
          onClick={() => handleTabChange('photos')}
        >
          Fotos ({person.photos ? person.photos.length : 0})
        </button>
        <button 
          className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => handleTabChange('documents')}
        >
          Documentos ({person.documents ? person.documents.length : 0})
        </button>
      </div>
      
      <div className="media-content">
        <div className="media-toolbar">
          <button 
            className="btn btn-primary"
            onClick={() => handleOpenUpload(activeTab)}
          >
            {activeTab === 'photos' ? 'Subir fotos' : 'Subir documentos'}
          </button>
        </div>
        
        <div className="media-gallery-container">
          <MediaGallery 
            person={person} 
            mediaType={activeTab}
            onMediaDelete={handleMediaDelete}
          />
        </div>
      </div>
      
      {showUploadModal && (
        <div className="upload-modal-overlay">
          <div className="upload-modal-content">
            <div className="upload-modal-header">
              <h3>
                {uploadType === 'profilePhoto' && 'Cambiar foto de perfil'}
                {uploadType === 'photos' && 'Subir fotos'}
                {uploadType === 'documents' && 'Subir documentos'}
              </h3>
              <button className="close-button" onClick={handleCloseUpload}>×</button>
            </div>
            <div className="upload-modal-body">
              <MediaUpload 
                personId={personId}
                type={uploadType}
                onUploadComplete={handleUploadComplete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaManagement;