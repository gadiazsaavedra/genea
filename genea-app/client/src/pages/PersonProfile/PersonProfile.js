import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase.config';

const PersonProfile = () => {
  const { personId } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPersonData();
  }, [personId]);

  const loadPersonData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/persons/${personId}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });

      if (response.ok) {
        const result = await response.json();
        setPerson(result.data);
      }
    } catch (err) {
      console.error('Error loading person:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{padding: '20px'}}>Cargando perfil...</div>;
  if (!person) return <div style={{padding: '20px'}}>Persona no encontrada</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{marginBottom: '20px'}}>← Volver</button>
      
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '30px',
        backgroundColor: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: person.gender === 'male' ? '#2196f3' : '#e91e63',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '40px',
            marginRight: '30px',
            backgroundImage: person.photo_url ? `url(${person.photo_url})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            {!person.photo_url && (person.first_name?.charAt(0) || '?')}
          </div>
          
          <div>
            <h1 style={{margin: '0 0 10px 0'}}>
              {person.first_name} {person.last_name}
            </h1>
            {person.maiden_name && (
              <p style={{color: '#666', margin: '0 0 10px 0'}}>
                Apellido de soltera: {person.maiden_name}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          {person.gender && (
            <div>
              <strong>Género:</strong> {person.gender === 'male' ? 'Masculino' : person.gender === 'female' ? 'Femenino' : 'No especificado'}
            </div>
          )}
          
          {person.birth_date && (
            <div>
              <strong>Nacimiento:</strong> {new Date(person.birth_date).toLocaleDateString()}
            </div>
          )}
          
          {person.birth_place && (
            <div>
              <strong>Lugar de nacimiento:</strong> {person.birth_place}
            </div>
          )}
          
          {person.death_date && (
            <div>
              <strong>Fallecimiento:</strong> {new Date(person.death_date).toLocaleDateString()}
            </div>
          )}
          
          {person.death_place && (
            <div>
              <strong>Lugar de fallecimiento:</strong> {person.death_place}
            </div>
          )}
          
          {person.death_cause && (
            <div>
              <strong>Causa de fallecimiento:</strong> {person.death_cause}
            </div>
          )}
          
          {person.occupation && (
            <div>
              <strong>Ocupación:</strong> {person.occupation}
            </div>
          )}
          
          <div>
            <strong>Tipo:</strong> 
            {person.is_founder && ' 👑 Fundador'}
            {person.person_type === 'spouse' && ' 💍 Cónyuge'}
            {!person.is_founder && person.person_type !== 'spouse' && ' 👥 Descendiente'}
          </div>
          
          <div>
            <strong>Estado:</strong> {person.death_date ? '⚰️ Fallecido' : '✅ Vivo'}
          </div>
          
          {person.created_at && (
            <div>
              <strong>Agregado:</strong> {new Date(person.created_at).toLocaleDateString()}
            </div>
          )}
          
          {person.updated_at && (
            <div>
              <strong>Actualizado:</strong> {new Date(person.updated_at).toLocaleDateString()}
            </div>
          )}
        </div>

        {person.biography && (
          <div style={{marginBottom: '30px'}}>
            <h3>Biografía</h3>
            <p>{person.biography}</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => navigate(`/persons`)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ✏️ Editar datos
          </button>
          
          <button 
            onClick={() => navigate(`/persons/${personId}/media`)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📸 Ver fotos y documentos
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonProfile;