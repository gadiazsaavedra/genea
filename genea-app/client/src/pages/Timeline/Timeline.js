import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase.config';

const Timeline = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, []);

  const fetchTimeline = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/timeline`, {
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

  if (loading) return <div>Cargando timeline...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>📅 Timeline Familiar Avanzado</h1>
      
      <div style={{ position: 'relative', paddingLeft: '30px' }}>
        <div style={{ 
          position: 'absolute', 
          left: '15px', 
          top: '0', 
          bottom: '0', 
          width: '2px', 
          backgroundColor: '#007bff' 
        }}></div>
        
        {!Array.isArray(events) || events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ color: '#666', marginBottom: '15px' }}>Timeline vacío</h3>
            <p style={{ color: '#888', marginBottom: '20px' }}>No hay eventos o personas con fechas registradas.</p>
            <div style={{ fontSize: '14px', color: '#999' }}>
              <strong>Para ver el timeline:</strong><br/>
              • Agrega eventos en la sección Eventos<br/>
              • Registra fechas de nacimiento en Personas<br/>
              • Asegúrate de incluir fechas válidas
            </div>
          </div>
        ) : (
          events.map((event, index) => (
            <div key={index} style={{ position: 'relative', marginBottom: '30px' }}>
              <div style={{
                position: 'absolute',
                left: '-22px',
                top: '10px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: event.type === 'birth' ? '#28a745' : '#007bff',
                border: '3px solid white',
                boxShadow: `0 0 0 2px ${event.type === 'birth' ? '#28a745' : '#007bff'}`
              }}></div>
              
              <div style={{ 
                backgroundColor: 'white', 
                padding: '20px', 
                borderRadius: '8px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #eee'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ 
                      margin: '0 0 10px 0', 
                      color: event.type === 'birth' ? '#28a745' : '#007bff' 
                    }}>
                      {event.type === 'birth' ? '👶' : '🎉'} {event.title}
                    </h3>
                    <p style={{ margin: '0 0 10px 0' }}>{event.description}</p>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      <span>👤 {event.person_name}</span>
                      {event.location && <span style={{ marginLeft: '15px' }}>📍 {event.location}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      backgroundColor: event.type === 'birth' ? '#28a745' : '#007bff', 
                      color: 'white', 
                      padding: '5px 10px', 
                      borderRadius: '15px', 
                      fontSize: '12px',
                      marginBottom: '5px'
                    }}>
                      {event.date ? new Date(event.date).toLocaleDateString() : 'Fecha desconocida'}
                    </div>
                    <div style={{ 
                      backgroundColor: event.type === 'birth' ? '#d4edda' : '#e3f2fd', 
                      color: event.type === 'birth' ? '#155724' : '#1565c0',
                      padding: '3px 8px', 
                      borderRadius: '10px', 
                      fontSize: '10px' 
                    }}>
                      {event.type === 'birth' ? '👶 Nacimiento' : '🎉 Evento'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Timeline;