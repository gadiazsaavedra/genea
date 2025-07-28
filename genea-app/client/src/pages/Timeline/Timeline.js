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
          <p>No hay eventos en el timeline</p>
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
                backgroundColor: '#007bff',
                border: '3px solid white',
                boxShadow: '0 0 0 2px #007bff'
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
                    <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>{event.title}</h3>
                    <p style={{ margin: '0 0 10px 0' }}>{event.description}</p>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      <span>👤 {event.person_name}</span>
                      {event.location && <span style={{ marginLeft: '15px' }}>📍 {event.location}</span>}
                    </div>
                  </div>
                  <div style={{ 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    padding: '5px 10px', 
                    borderRadius: '15px', 
                    fontSize: '12px' 
                  }}>
                    {event.date ? new Date(event.date).getFullYear() : 'Fecha desconocida'}
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