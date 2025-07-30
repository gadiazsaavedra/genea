import React, { useState } from 'react';

const InvitationModal = ({ isOpen, onClose, familyName }) => {
  const [inviteData, setInviteData] = useState({
    email: '',
    phone: '',
    message: '',
    method: 'email'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (inviteData.method === 'email' && inviteData.email) {
      // Simular envío por email
      alert(`Invitación enviada por email a: ${inviteData.email}\n\nMensaje: "Te invito a unirte a ${familyName} en Genea para colaborar en nuestro árbol genealógico."`);
    } else if (inviteData.method === 'whatsapp' && inviteData.phone) {
      // Simular envío por WhatsApp
      const message = `Te invito a unirte a ${familyName} en Genea para colaborar en nuestro árbol genealógico. Regístrate en: https://geneal.netlify.app`;
      const whatsappUrl = `https://wa.me/${inviteData.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
    
    onClose();
    setInviteData({ email: '', phone: '', message: '', method: 'email' });
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2>Invitar a {familyName}</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Método de invitación:
            </label>
            <select 
              value={inviteData.method}
              onChange={(e) => setInviteData({...inviteData, method: e.target.value})}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="email">📧 Email</option>
              <option value="whatsapp">📱 WhatsApp</option>
            </select>
          </div>

          {inviteData.method === 'email' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Email del familiar:
              </label>
              <input
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                placeholder="familiar@email.com"
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          )}

          {inviteData.method === 'whatsapp' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Teléfono del familiar:
              </label>
              <input
                type="tel"
                value={inviteData.phone}
                onChange={(e) => setInviteData({...inviteData, phone: e.target.value})}
                placeholder="+54 11 1234-5678"
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Mensaje personalizado (opcional):
            </label>
            <textarea
              value={inviteData.message}
              onChange={(e) => setInviteData({...inviteData, message: e.target.value})}
              placeholder="Hola! Te invito a colaborar en nuestro árbol genealógico..."
              rows="3"
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '10px 20px', border: '1px solid #ddd', backgroundColor: 'white', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{ padding: '10px 20px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Enviar Invitación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvitationModal;