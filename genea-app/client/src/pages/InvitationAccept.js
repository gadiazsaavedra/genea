import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase.config';

const InvitationAccept = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInvitation();
  }, [token]);

  const fetchInvitation = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/invitations/verify/${token}`);
      const result = await response.json();
      
      if (response.ok) {
        setInvitation(result.data);
      } else {
        setError(result.message || 'Invitación no válida');
      }
    } catch (err) {
      setError('Error al verificar invitación');
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('Debes iniciar sesión para aceptar la invitación');
        navigate('/login');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/invitations/accept/${token}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('¡Invitación aceptada! Ahora eres parte de la familia.');
        navigate('/');
      } else {
        setError(result.message || 'Error al aceptar invitación');
      }
    } catch (err) {
      setError('Error al aceptar invitación');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Verificando invitación...</div>;

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
        <h2>❌ Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} style={{ padding: '10px 20px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px' }}>
          Ir al inicio
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
      <h1>📧 Invitación Familiar</h1>
      
      {invitation && (
        <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h2>Has sido invitado a unirte como:</h2>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1976d2', margin: '10px 0' }}>
            {invitation.role === 'admin' ? '👑 Administrador' : 
             invitation.role === 'editor' ? '✏️ Editor' : '👀 Visualizador'}
          </div>
          <p>Email: {invitation.invited_email}</p>
          <p>Expira: {new Date(invitation.expires_at).toLocaleDateString()}</p>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          onClick={acceptInvitation}
          style={{ 
            padding: '15px 30px', 
            backgroundColor: '#4caf50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            fontSize: '16px'
          }}
        >
          ✅ Aceptar Invitación
        </button>
        <button 
          onClick={() => navigate('/')}
          style={{ 
            padding: '15px 30px', 
            backgroundColor: '#f44336', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            fontSize: '16px'
          }}
        >
          ❌ Rechazar
        </button>
      </div>
    </div>
  );
};

export default InvitationAccept;