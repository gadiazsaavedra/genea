import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import InvitationModal from '../../components/InvitationModal';

const FamilyMembers = () => {
  const { familyId } = useParams();
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    // Obtener datos de la familia desde localStorage o API
    const savedFamilies = JSON.parse(localStorage.getItem('families') || '[]');
    const currentFamily = savedFamilies.find(f => f._id === familyId);
    
    setTimeout(() => {
      setFamily({
        id: familyId,
        name: currentFamily?.name || 'Mi Familia',
        description: currentFamily?.description || 'Tu familia genealógica'
      });
      
      setMembers([]);
      
      setLoading(false);
    }, 500);
  }, [familyId]);

  if (loading) {
    return <div>Cargando miembros...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Miembros de {family?.name}</h1>
      <p>{family?.description}</p>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>{members.length} miembros</h3>
        <button 
          onClick={() => setShowInviteModal(true)}
          style={{ padding: '10px 20px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          + Invitar Miembro
        </button>
      </div>

      {members.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', border: '2px dashed #ddd', borderRadius: '8px' }}>
          <h3>No hay miembros en esta familia</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>Invita a familiares para que se unan y colaboren en el árbol genealógico.</p>
          <button 
            onClick={() => setShowInviteModal(true)}
            style={{ padding: '10px 20px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Invitar Primer Miembro
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {members.map((member) => (
          <div key={member.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1976d2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginRight: '12px' }}>
                {member.name.charAt(0)}
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0' }}>{member.name}</h4>
                <span style={{ 
                  padding: '2px 8px', 
                  borderRadius: '12px', 
                  fontSize: '12px',
                  backgroundColor: member.role === 'admin' ? '#f44336' : member.role === 'editor' ? '#ff9800' : '#2196f3',
                  color: 'white'
                }}>
                  {member.role === 'admin' ? 'Administrador' : member.role === 'editor' ? 'Editor' : 'Visualizador'}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                📧 {member.email}
              </p>
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                Miembro desde: {new Date(member.joinDate).toLocaleDateString()}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ padding: '6px 12px', border: '1px solid #1976d2', color: '#1976d2', backgroundColor: 'white', borderRadius: '4px', fontSize: '12px' }}>
                Ver Perfil
              </button>
              {member.role !== 'admin' && (
                <button style={{ padding: '6px 12px', border: '1px solid #f44336', color: '#f44336', backgroundColor: 'white', borderRadius: '4px', fontSize: '12px' }}>
                  Remover
                </button>
              )}
            </div>
          </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '40px' }}>
        <Link to="/families" style={{ padding: '10px 20px', border: '1px solid #1976d2', color: '#1976d2', textDecoration: 'none', borderRadius: '4px' }}>
          Volver a Familias
        </Link>
      </div>

      <InvitationModal 
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        familyName={family?.name || 'esta familia'}
      />
    </div>
  );
};

export default FamilyMembers;