import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase.config';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setNotifications(result.data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${process.env.REACT_APP_API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div>Cargando notificaciones...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔔 Notificaciones</h1>
      
      {notifications.length === 0 ? (
        <p>No hay notificaciones</p>
      ) : (
        <div>
          {notifications.map(notif => (
            <div 
              key={notif.id} 
              style={{ 
                padding: '15px', 
                border: '1px solid #eee', 
                borderRadius: '8px', 
                marginBottom: '10px',
                backgroundColor: notif.is_read ? '#f9f9f9' : '#fff3cd'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <div><strong>{notif.title}</strong></div>
                  <div style={{ margin: '5px 0' }}>{notif.message}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {new Date(notif.created_at).toLocaleString()}
                  </div>
                </div>
                {!notif.is_read && (
                  <button 
                    onClick={() => markAsRead(notif.id)}
                    style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
                  >
                    Marcar leído
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;