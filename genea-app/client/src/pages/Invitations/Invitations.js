import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase.config';

const Invitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/invitations`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setInvitations(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      alert('Por favor ingresa un email válido');
      return;
    }
    
    if (!email.includes('@')) {
      alert('Por favor ingresa un email válido');
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ email: email.trim(), role })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setEmail('');
        fetchInvitations();
        alert('✅ Invitación enviada correctamente');
      } else {
        alert(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al enviar invitación');
    }
  };

  if (loading) return <div>Cargando invitaciones...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>📧 Invitaciones Familiares</h1>
      
      <form onSubmit={sendInvitation} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Enviar Invitación</h2>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="email"
            placeholder="Email del familiar"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '300px', padding: '8px', marginRight: '10px' }}
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '8px' }}>
            <option value="viewer">Visualizador</option>
            <option value="editor">Editor</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px' }}>
          Enviar Invitación
        </button>
      </form>

      <div>
        <h2>Invitaciones Enviadas</h2>
        {!Array.isArray(invitations) || invitations.length === 0 ? (
          <p>No hay invitaciones</p>
        ) : (
          <div>
            {invitations.map(inv => (
              <div key={inv.id} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '10px' }}>
                <div><strong>Email:</strong> {inv.invited_email}</div>
                <div><strong>Rol:</strong> {inv.role}</div>
                <div><strong>Estado:</strong> 
                  <span style={{
                    color: inv.status === 'accepted' ? '#4caf50' : inv.status === 'pending' ? '#ff9800' : '#f44336',
                    fontWeight: 'bold'
                  }}>
                    {inv.status === 'accepted' ? '✅ Aceptada' : 
                     inv.status === 'pending' ? '⏳ Pendiente' : '❌ Rechazada'}
                  </span>
                </div>
                <div><strong>Enviado:</strong> {new Date(inv.created_at).toLocaleDateString()}</div>
                <div><strong>Expira:</strong> {new Date(inv.expires_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Invitations;