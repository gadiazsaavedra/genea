import React, { useState, useEffect } from 'react';
import './RelationshipForm.css';

const RelationshipForm = ({ persons, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    person1Id: '',
    person2Id: '',
    relationType: 'parent'
  });

  const [filteredPersons, setFilteredPersons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (searchTerm) {
      const filtered = persons.filter(person => 
        person.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPersons(filtered);
    } else {
      setFilteredPersons(persons);
    }
  }, [searchTerm, persons]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const relationTypes = [
    { value: 'parent', label: 'Padre/Madre de' },
    { value: 'child', label: 'Hijo/Hija de' },
    { value: 'spouse', label: 'Cónyuge de' },
    { value: 'sibling', label: 'Hermano/Hermana de' }
  ];

  return (
    <form className="relationship-form" onSubmit={handleSubmit}>
      <h2>Añadir Relación Familiar</h2>
      
      <div className="form-group">
        <label htmlFor="person1Id">Primera Persona</label>
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar persona..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            id="person1Id"
            name="person1Id"
            value={formData.person1Id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar persona</option>
            {filteredPersons.map(person => (
              <option key={person._id} value={person._id}>
                {person.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="relationType">Tipo de Relación</label>
        <select
          id="relationType"
          name="relationType"
          value={formData.relationType}
          onChange={handleChange}
          required
        >
          {relationTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="person2Id">Segunda Persona</label>
        <select
          id="person2Id"
          name="person2Id"
          value={formData.person2Id}
          onChange={handleChange}
          required
        >
          <option value="">Seleccionar persona</option>
          {persons
            .filter(person => person._id !== formData.person1Id)
            .map(person => (
              <option key={person._id} value={person._id}>
                {person.fullName}
              </option>
            ))}
        </select>
      </div>
      
      {formData.relationType === 'spouse' && (
        <div className="form-group">
          <label htmlFor="marriageDate">Fecha de Matrimonio</label>
          <input
            type="date"
            id="marriageDate"
            name="marriageDate"
            onChange={handleChange}
          />
        </div>
      )}
      
      <div className="form-actions">
        <button type="button" className="cancel-button" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="submit-button">
          Añadir Relación
        </button>
      </div>
    </form>
  );
};

export default RelationshipForm;