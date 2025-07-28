import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase.config';
import EventGallery from './EventGallery';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    event_type: 'reunion'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/events`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        setEvents(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(newEvent)
      });
      
      if (response.ok) {
        setNewEvent({ title: '', description: '', event_date: '', location: '', event_type: 'reunion' });
        setShowForm(false);
        fetchEvents();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const event = events.find(e => e.id === eventId);
    const eventName = event ? event.title : 'evento';
    
    // Doble confirmación con nombre
    const step1 = window.confirm(`¿Estás seguro de que deseas eliminar el evento: "${eventName}"?`);
    if (!step1) return;
    
    const userInput = window.prompt(
      `⚠️ CONFIRMACIÓN FINAL ⚠️\n\nPara eliminar "${eventName}" permanentemente, escribe exactamente:\nELIMINAR\n\n(Esta acción no se puede deshacer)`
    );
    
    if (userInput === 'ELIMINAR') {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${process.env.REACT_APP_API_URL}/events/${eventId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        });
        
        if (response.ok) {
          fetchEvents();
          alert('Evento eliminado correctamente');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el evento');
      }
    } else if (userInput !== null) {
      alert('Eliminación cancelada. Debe escribir exactamente "ELIMINAR"');
    }
  };

  const handlePhotoUpload = async (eventId, files) => {
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('photos', file));
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/events/${eventId}/photos`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
        body: formData
      });
      
      if (response.ok) {
        fetchEvents();
        alert('Fotos subidas correctamente');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div>Cargando eventos...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>🎉 Eventos Familiares</h1>
        <button 
          onClick={() => setShowForm(true)}
          style={{ padding: '10px 20px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          + Crear Evento
        </button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '500px' }}>
            <h2>Crear Nuevo Evento</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="Título del evento"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <textarea
                  placeholder="Descripción"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  rows={3}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="date"
                  value={newEvent.event_date}
                  onChange={(e) => setNewEvent({...newEvent, event_date: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="Ubicación"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <select
                  value={newEvent.event_type}
                  onChange={(e) => setNewEvent({...newEvent, event_type: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="reunion">Reunión Familiar</option>
                  <option value="boda">Boda</option>
                  <option value="cumpleanos">Cumpleaños</option>
                  <option value="aniversario">Aniversario</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px' }}>
                  Crear
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', backgroundColor: '#ccc', border: 'none', borderRadius: '4px' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {events.map(event => (
          <div key={event.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#1976d2' }}>{event.title}</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ 
                  backgroundColor: event.event_type === 'boda' ? '#e91e63' : event.event_type === 'cumpleanos' ? '#ff9800' : '#4caf50',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  {event.event_type}
                </span>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f44336',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '2px'
                  }}
                  title="Eliminar evento"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <p style={{ color: '#666', marginBottom: '10px' }}>{event.description}</p>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
              <div>📅 {new Date(event.event_date).toLocaleDateString()}</div>
              {event.location && <div>📍 {event.location}</div>}
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>📸 Fotos ({event.media ? event.media.length : 0})</span>
                {event.media && event.media.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowGallery(true);
                    }}
                    style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      backgroundColor: '#2196f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Ver todas
                  </button>
                )}
              </div>
              {event.media && event.media.length > 0 ? (
                <div 
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedEvent(event);
                    setShowGallery(true);
                  }}
                >
                  {event.media.slice(0, 6).map(photo => (
                    <img 
                      key={photo.id}
                      src={photo.file_url}
                      alt={photo.description}
                      style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  ))}
                  {event.media.length > 6 && (
                    <div style={{
                      width: '100%',
                      height: '60px',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      +{event.media.length - 5} más
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: '#999', fontSize: '12px' }}>No hay fotos</div>
              )}
            </div>
            
            <div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handlePhotoUpload(event.id, e.target.files)}
                style={{ display: 'none' }}
                id={`upload-${event.id}`}
              />
              <label 
                htmlFor={`upload-${event.id}`}
                style={{ 
                  display: 'inline-block',
                  padding: '8px 16px',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                📷 Subir Fotos
              </label>
            </div>
          </div>
        ))}
      </div>
      
      {events.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No hay eventos familiares. ¡Crea el primero!
        </div>
      )}
      
      {showGallery && selectedEvent && (
        <EventGallery 
          event={selectedEvent}
          onClose={() => {
            setShowGallery(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default Events;