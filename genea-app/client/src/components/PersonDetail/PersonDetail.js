import React from 'react';
import './PersonDetail.css';

const PersonDetail = ({ person, onClose }) => {
  if (!person) return null;

  return (
    <div className="person-detail">
      <div className="person-detail-header">
        <h2>{person.fullName}</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="person-detail-content">
        {person.profilePhoto && (
          <div className="person-photo">
            <img src={person.profilePhoto} alt={person.fullName} />
          </div>
        )}
        
        <div className="person-info">
          <div className="info-row">
            <span className="info-label">Fecha de nacimiento:</span>
            <span className="info-value">
              {person.birthDate ? new Date(person.birthDate).toLocaleDateString() : 'Desconocida'}
            </span>
          </div>
          
          {person.birthPlace && (
            <div className="info-row">
              <span className="info-label">Lugar de nacimiento:</span>
              <span className="info-value">{person.birthPlace}</span>
            </div>
          )}
          
          {!person.isAlive && person.deathDate && (
            <div className="info-row">
              <span className="info-label">Fecha de fallecimiento:</span>
              <span className="info-value">
                {new Date(person.deathDate).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {!person.isAlive && person.deathPlace && (
            <div className="info-row">
              <span className="info-label">Lugar de fallecimiento:</span>
              <span className="info-value">{person.deathPlace}</span>
            </div>
          )}
          
          {person.occupation && (
            <div className="info-row">
              <span className="info-label">Ocupación:</span>
              <span className="info-value">{person.occupation}</span>
            </div>
          )}
        </div>
      </div>
      
      {person.bio && (
        <div className="person-bio">
          <h3>Biografía</h3>
          <p>{person.bio}</p>
        </div>
      )}
      
      <div className="person-actions">
        <button className="action-button edit">Editar</button>
        <button className="action-button photos">Ver fotos</button>
        <button className="action-button documents">Ver documentos</button>
      </div>
    </div>
  );
};

export default PersonDetail;