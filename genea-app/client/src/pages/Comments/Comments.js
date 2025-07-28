import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase.config';

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/comments`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setComments(result.data || []);
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
          media_id: selectedMedia 
        })
      });
      
      if (response.ok) {
        setNewComment('');
        fetchComments();
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
        <h2>Agregar Comentario</h2>
        <div style={{ marginBottom: '15px' }}>
          <textarea
            placeholder="Escribe tu comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <button type="submit" style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px' 
        }}>
          💬 Comentar
        </button>
      </form>

      <div>
        <h2>Comentarios Recientes</h2>
        {comments.length === 0 ? (
          <p>No hay comentarios</p>
        ) : (
          <div>
            {comments.map(comment => (
              <div key={comment.id} style={{ 
                padding: '15px', 
                border: '1px solid #eee', 
                borderRadius: '8px', 
                marginBottom: '15px',
                backgroundColor: '#f9f9f9'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '10px' }}>{comment.content}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      <span>👤 {comment.author_name}</span>
                      <span style={{ marginLeft: '15px' }}>📅 {new Date(comment.created_at).toLocaleString()}</span>
                      {comment.media_title && (
                        <span style={{ marginLeft: '15px' }}>🖼️ {comment.media_title}</span>
                      )}
                    </div>
                  </div>
                </div>
                {comment.mentions && comment.mentions.length > 0 && (
                  <div style={{ marginTop: '10px', fontSize: '12px' }}>
                    <span style={{ color: '#007bff' }}>
                      Menciones: {comment.mentions.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comments;