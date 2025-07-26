import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PersonModal from '../../components/PersonModal';
import TreeVisualization from '../../components/TreeVisualization';
import { supabase } from '../../config/supabase.config';

const TreeView = () => {
  const { familyId } = useParams();
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState([]);
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [isFounderMode, setIsFounderMode] = useState(false);
  const [viewType, setViewType] = useState('traditional');
  const [relationshipMode, setRelationshipMode] = useState(null); // 'child' or 'spouse'
  const [selectedParent, setSelectedParent] = useState(null);

  useEffect(() => {
    // Exponer funciones globalmente para los botones
    window.addChild = (parent) => {
      setSelectedParent(parent);
      setRelationshipMode('child');
      setIsFounderMode(false);
      setShowPersonModal(true);
    };
    
    window.addSpouse = (person) => {
      setSelectedParent(person);
      setRelationshipMode('spouse');
      setIsFounderMode(false);
      setShowPersonModal(true);
    };
    
    window.deletePerson = (person) => {
      if (window.confirm(`¿Estás seguro de eliminar a ${person.first_name} ${person.last_name || ''}?`)) {
        handleDeletePerson(person.id);
      }
    };
    
    const savedFamilies = JSON.parse(localStorage.getItem('families') || '[]');
    const currentFamily = savedFamilies.find(f => f._id === familyId);
    
    setTimeout(() => {
      setFamily(currentFamily || {
        id: familyId,
        name: 'Mi Familia',
        description: 'Tu árbol genealógico'
      });
      
      // Cargar personas de la familia desde Supabase
      loadPeopleFromSupabase();
      
      setLoading(false);
    }, 500);
  }, [familyId]);

  const handleDeletePerson = async (personId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        alert('No hay sesión activa');
        return;
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/persons/${personId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Actualizar lista local
        setPeople(people.filter(p => p.id !== personId));
        alert('Persona eliminada correctamente');
      } else {
        const result = await response.json();
        alert(`Error: ${result.message || 'No se pudo eliminar la persona'}`);
      }
    } catch (error) {
      console.error('Error deleting person:', error);
      alert('Error al eliminar persona');
    }
  };
  
  const createRelationship = async (childId, parentId, type) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) return;
      
      const relationshipData = {
        person1_id: type === 'child' ? parentId : childId,
        person2_id: type === 'child' ? childId : parentId,
        relationship_type: type === 'child' ? 'parent' : 'spouse'
      };
      
      console.log('Creating relationship:', relationshipData);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/relationships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(relationshipData)
      });
      
      if (!response.ok) {
        console.error('Error creating relationship:', await response.json());
      }
    } catch (error) {
      console.error('Error creating relationship:', error);
    }
  };
  
  const loadPeopleFromSupabase = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        setPeople([]);
        return;
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/persons?familyId=${familyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setPeople(result.data || []);
      } else {
        console.error('Error loading people:', response.status);
        setPeople([]);
      }
    } catch (error) {
      console.error('Error loading people:', error);
      setPeople([]);
    }
  };

  const handleAddPerson = async (person) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        alert('No hay sesión activa');
        return;
      }
      
      // Mapear datos del PersonModal al formato de la API
      const apiData = {
        familyId: familyId,
        firstName: person.firstName || '',
        lastName: person.lastName || null,
        gender: person.gender || null,
        birthDate: person.birthDate || null
      };
      
      console.log('=== ADDING PERSON ===');
      console.log('Original person data:', JSON.stringify(person, null, 2));
      console.log('Mapped API data:', JSON.stringify(apiData, null, 2));
      console.log('Family ID:', familyId);
      console.log('API URL:', `${process.env.REACT_APP_API_URL}/persons`);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/persons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      });
      
      const result = await response.json();
      
      console.log('=== API RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Result:', JSON.stringify(result, null, 2));
      
      if (!response.ok) {
        console.error('=== API ERROR ===');
        console.error('Status:', response.status);
        console.error('Result:', result);
        throw new Error(result.message || result.error || 'Error al crear persona');
      }
      
      // Crear relación si es necesario
      if (relationshipMode && selectedParent) {
        await createRelationship(result.data.id, selectedParent.id, relationshipMode);
      }
      
      // Actualizar lista local con la persona creada
      console.log('=== UPDATING LOCAL STATE ===');
      console.log('Current people:', people.length);
      console.log('Adding person:', result.data);
      
      const newPeople = [...people, result.data];
      setPeople(newPeople);
      setShowPersonModal(false);
      setRelationshipMode(null);
      setSelectedParent(null);
      
      console.log('Updated people count:', newPeople.length);
      const relationText = relationshipMode ? ` como ${relationshipMode === 'child' ? 'hijo' : 'cónyuge'} de ${selectedParent?.first_name}` : '';
      alert(`Persona agregada exitosamente${relationText}!`);
      
    } catch (error) {
      console.error('=== ERROR ADDING PERSON ===');
      console.error('Error:', error);
      alert(`Error al agregar persona: ${error.message}`);
    }
  };

  const openFounderModal = () => {
    setIsFounderMode(true);
    setShowPersonModal(true);
  };

  const openPersonModal = () => {
    setIsFounderMode(false);
    setShowPersonModal(true);
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Cargando árbol...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Árbol Genealógico - {family?.name}</h1>
      <p>{family?.description}</p>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setViewType('traditional')}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: viewType === 'traditional' ? '#1976d2' : 'white',
                color: viewType === 'traditional' ? 'white' : '#1976d2',
                border: '1px solid #1976d2',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🌳 Tradicional
            </button>
            <button 
              onClick={() => setViewType('timeline')}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: viewType === 'timeline' ? '#1976d2' : 'white',
                color: viewType === 'timeline' ? 'white' : '#1976d2',
                border: '1px solid #1976d2',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ⏰ Timeline
            </button>
            <button 
              onClick={() => setViewType('circular')}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: viewType === 'circular' ? '#1976d2' : 'white',
                color: viewType === 'circular' ? 'white' : '#1976d2',
                border: '1px solid #1976d2',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ⭕ Circular
            </button>
            <button 
              onClick={() => setViewType('fan')}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: viewType === 'fan' ? '#1976d2' : 'white',
                color: viewType === 'fan' ? 'white' : '#1976d2',
                border: '1px solid #1976d2',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🌟 Abanico
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={openFounderModal}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#1976d2', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              + Fundadores
            </button>
            <button 
              onClick={openPersonModal}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#4caf50', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              + Persona
            </button>
          </div>
        </div>
        
        <TreeVisualization people={people} viewType={viewType} />
      </div>

      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h4>Personas en el árbol: {people.length}</h4>
        <p style={{ margin: '8px 0', color: '#666' }}>
          Fundadores: {people.filter(p => p.isFounder).length} | 
          Otros miembros: {people.filter(p => !p.isFounder).length}
        </p>
        <p style={{ margin: '8px 0', fontSize: '14px', color: '#888' }}>
          🔍 Usa la rueda del ratón para hacer zoom y arrastra para navegar
        </p>
      </div>

      <div style={{ marginTop: '40px' }}>
        <Link 
          to="/families" 
          style={{ 
            padding: '10px 20px', 
            border: '1px solid #1976d2', 
            color: '#1976d2', 
            textDecoration: 'none', 
            borderRadius: '4px',
            marginRight: '12px'
          }}
        >
          Volver a Familias
        </Link>
        <Link 
          to={`/family/${familyId}/members`}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#1976d2', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '4px'
          }}
        >
          Ver Miembros
        </Link>
      </div>

      <PersonModal 
        isOpen={showPersonModal}
        onClose={() => setShowPersonModal(false)}
        onSave={handleAddPerson}
        isFounder={isFounderMode}
      />
    </div>
  );
};

export default TreeView;