import React, { useState } from 'react';
import './PersonForm.css';

const PersonForm = ({ person, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    fullName: person?.fullName || '',
    birthDate: person?.birthDate ? new Date(person.birthDate).toISOString().split('T')[0] : '',
    birthPlace: person?.birthPlace || '',
    isAlive: person?.isAlive !== undefined ? person.isAlive : true,
    deathDate: person?.deathDate ? new Date(person.deathDate).toISOString().split('T')[0] : '',
    deathPlace: person?.deathPlace || '',
    occupation: person?.occupation || '',
    bio: person?.bio || ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre es obligatorio';
    }
    
    if (!formData.isAlive && !formData.deathDate) {
      newErrors.deathDate = 'La fecha de fallecimiento es obligatoria si la persona no está viva';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form className="person-form" onSubmit={handleSubmit}>
      <h2>{person ? 'Editar Persona' : 'Añadir Persona'}</h2>
      
      <div className="form-group">
        <label htmlFor="fullName">Nombre completo *</label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className={errors.fullName ? 'error' : ''}
        />
        {errors.fullName && <span className="error-message">{errors.fullName}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="birthDate">Fecha de nacimiento</label>
        <input
          type="date"
          id="birthDate"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="birthPlace">Lugar de nacimiento</label>
        <input
          type="text"
          id="birthPlace"
          name="birthPlace"
          value={formData.birthPlace}
          onChange={handleChange}
        />
      </div>
      
      <div className="form-group checkbox">
        <input
          type="checkbox"
          id="isAlive"
          name="isAlive"
          checked={formData.isAlive}
          onChange={handleChange}
        />
        <label htmlFor="isAlive">Está vivo/a</label>
      </div>
      
      {!formData.isAlive && (
        <>
          <div className="form-group">
            <label htmlFor="deathDate">Fecha de fallecimiento</label>
            <input
              type="date"
              id="deathDate"
              name="deathDate"
              value={formData.deathDate}
              onChange={handleChange}
              className={errors.deathDate ? 'error' : ''}
            />
            {errors.deathDate && <span className="error-message">{errors.deathDate}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="deathPlace">Lugar de fallecimiento</label>
            <input
              type="text"
              id="deathPlace"
              name="deathPlace"
              value={formData.deathPlace}
              onChange={handleChange}
            />
          </div>
        </>
      )}
      
      <div className="form-group">
        <label htmlFor="occupation">Ocupación</label>
        <input
          type="text"
          id="occupation"
          name="occupation"
          value={formData.occupation}
          onChange={handleChange}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="bio">Biografía</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows="4"
        />
      </div>
      
      <div className="form-actions">
        <button type="button" className="cancel-button" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="submit-button">
          {person ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};

export default PersonForm;