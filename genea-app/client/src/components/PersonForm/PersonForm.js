import React, { useState } from 'react';
import './PersonForm.css';

const PersonForm = ({ person, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    fullName: person ? `${person.first_name || ''} ${person.last_name || ''}`.trim() : '',
    firstName: person?.first_name || '',
    lastName: person?.last_name || '',
    maidenName: person?.maiden_name || '',
    birthDate: person?.birth_date ? new Date(person.birth_date).toISOString().split('T')[0] : '',
    birthPlace: person?.birth_place || '',
    isAlive: person?.is_alive !== undefined ? person.is_alive : (person?.death_date ? false : true),
    deathDate: person?.death_date ? new Date(person.death_date).toISOString().split('T')[0] : '',
    deathPlace: person?.death_place || '',
    gender: person?.gender || '',
    occupation: person?.occupation || '',
    biography: person?.biography || '',
    photoUrl: person?.photo_url || ''
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
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es obligatorio';
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
        <label htmlFor="firstName">Nombre *</label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className={errors.firstName ? 'error' : ''}
        />
        {errors.firstName && <span className="error-message">{errors.firstName}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="lastName">Apellido</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="maidenName">Apellido de soltera</label>
        <input
          type="text"
          id="maidenName"
          name="maidenName"
          value={formData.maidenName}
          onChange={handleChange}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="gender">Género</label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
        >
          <option value="">Seleccionar...</option>
          <option value="male">Masculino</option>
          <option value="female">Femenino</option>
        </select>
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
        <label htmlFor="biography">Biografía</label>
        <textarea
          id="biography"
          name="biography"
          value={formData.biography}
          onChange={handleChange}
          rows="4"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="photoUrl">URL de foto</label>
        <input
          type="url"
          id="photoUrl"
          name="photoUrl"
          value={formData.photoUrl}
          onChange={handleChange}
          placeholder="https://ejemplo.com/foto.jpg"
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