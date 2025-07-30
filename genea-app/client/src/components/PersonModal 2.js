import React, { useState } from 'react';

const PersonModal = ({ isOpen, onClose, onSave, isFounder = false }) => {
  const [personData, setPersonData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    birthPlace: '',
    deathDate: '',
    deathPlace: '',
    gender: 'male',
    isAlive: true,
    biography: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPerson = {
      id: Date.now().toString(),
      ...personData,
      fullName: `${personData.firstName} ${personData.lastName}`,
      isFounder
    };
    onSave(newPerson);
    onClose();
    setPersonData({
      firstName: '',
      lastName: '',
      birthDate: '',
      birthPlace: '',
      deathDate: '',
      deathPlace: '',
      gender: 'male',
      isAlive: true,
      biography: ''
    });
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
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2>{isFounder ? 'Agregar Fundador' : 'Agregar Persona'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Nombre *
              </label>
              <input
                type="text"
                value={personData.firstName}
                onChange={(e) => setPersonData({...personData, firstName: e.target.value})}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Apellido *
              </label>
              <input
                type="text"
                value={personData.lastName}
                onChange={(e) => setPersonData({...personData, lastName: e.target.value})}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Género
              </label>
              <select
                value={personData.gender}
                onChange={(e) => setPersonData({...personData, gender: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Estado
              </label>
              <select
                value={personData.isAlive}
                onChange={(e) => setPersonData({...personData, isAlive: e.target.value === 'true'})}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="true">Vivo</option>
                <option value="false">Fallecido</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Fecha de nacimiento
              </label>
              <input
                type="date"
                value={personData.birthDate}
                onChange={(e) => setPersonData({...personData, birthDate: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Lugar de nacimiento
              </label>
              <input
                type="text"
                value={personData.birthPlace}
                onChange={(e) => setPersonData({...personData, birthPlace: e.target.value})}
                placeholder="Ciudad, País"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>

          {!personData.isAlive && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Fecha de fallecimiento
                </label>
                <input
                  type="date"
                  value={personData.deathDate}
                  onChange={(e) => setPersonData({...personData, deathDate: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Lugar de fallecimiento
                </label>
                <input
                  type="text"
                  value={personData.deathPlace}
                  onChange={(e) => setPersonData({...personData, deathPlace: e.target.value})}
                  placeholder="Ciudad, País"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Biografía (opcional)
            </label>
            <textarea
              value={personData.biography}
              onChange={(e) => setPersonData({...personData, biography: e.target.value})}
              placeholder="Información adicional sobre esta persona..."
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
              Guardar Persona
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonModal;