import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase.config';

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    fetchEvents();
    fetchComments();
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
    }
  };

  const fetchComments = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/comments`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setComments(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ 
          content: newComment,
          media_id: selectedPhoto?.id 
        })
      });
      
      if (response.ok) {
        setNewComment('');
        setSelectedPhoto(null);
        fetchComments();
        
        // Crear notificación familiar
        try {
          await fetch(`${process.env.REACT_APP_API_URL}/notifications`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({
              type: 'comment_added',
              title: '💬 Nuevo comentario en foto',
              message: `Se agregó un comentario a una foto`,
              link: `/comments`,
              personName: selectedPhoto?.description || 'foto'
            })
          });
        } catch (notifError) {
          console.log('Error creating notification:', notifError);
        }
        
        alert('Comentario agregado correctamente');
      } else {
        alert('Error al agregar comentario');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div>Cargando comentarios...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>💬 Comentarios en Fotos</h1>
      
      <form onSubmit={addComment} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Agregar Comentario a Foto</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Seleccionar foto:</label>
          <select 
            value={selectedPhoto?.id || ''} 
            onChange={(e) => {
              const photoId = e.target.value;
              const photo = events.flatMap(event => event.media || []).find(p => p.id === photoId);
              setSelectedPhoto(photo);
            }}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px' }}
          >
            <option value="">-- Selecciona una foto --</option>
            {events.map(event => 
              event.media && event.media.length > 0 ? (
                <optgroup key={event.id} label={`📅 ${event.title}`}>
                  {event.media.map(photo => (
                    <option key={photo.id} value={photo.id}>
                      📸 {photo.description || `Foto ${photo.file_name}`}
                    </option>
                  ))}
                </optgroup>
              ) : null
            )}
          </select>
          
          {selectedPhoto && (
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '4px' }}>
              <img 
                src={selectedPhoto.file_url} 
                alt="Foto seleccionada" 
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
              />
              <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                {selectedPhoto.description || selectedPhoto.file_name}
              </div>
            </div>
          )}
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <textarea
            placeholder="Escribe tu comentario sobre esta foto..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            disabled={!selectedPhoto}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={!selectedPhoto || !newComment.trim()}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: (!selectedPhoto || !newComment.trim()) ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: (!selectedPhoto || !newComment.trim()) ? 'not-allowed' : 'pointer'
          }}
        >
          💬 Comentar Foto
        </button>
      </form>

      <div>
        <h2>Comentarios Recientes</h2>
        {!Array.isArray(comments) || comments.length === 0 ? (
          <p>No hay comentarios</p>
        ) : (
          <div>
            {comments.map(comment => {
              // Buscar la foto asociada al comentario
              const photo = events.flatMap(event => event.media || []).find(p => p.id === comment.media_id);
              const event = events.find(e => e.media && e.media.some(p => p.id === comment.media_id));
              
              return (
                <div key={comment.id} style={{ 
                  padding: '15px', 
                  border: '1px solid #eee', 
                  borderRadius: '8px', 
                  marginBottom: '15px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    {photo && (
                      <div style={{ flexShrink: 0 }}>
                        <img 
                          src={photo.file_url} 
                          alt="Foto comentada" 
                          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '10px', fontSize: '16px' }}>{comment.content}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        <span>👤 {comment.user_name || 'Usuario'}</span>
                        <span style={{ marginLeft: '15px' }}>📅 {new Date(comment.created_at).toLocaleString()}</span>
                        {event && (
                          <span style={{ marginLeft: '15px' }}>🎉 {event.title}</span>
                        )}
                        {photo && (
                          <span style={{ marginLeft: '15px' }}>📸 {photo.description || photo.file_name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          </div>
        )}
      </div>
    </div>
  );
};

export default Comments;