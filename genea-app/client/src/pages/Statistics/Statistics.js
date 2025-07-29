import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase.config';
import './Statistics.css';

const Statistics = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/persons`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        const peopleData = Array.isArray(result.data) ? result.data : [];
        setPeople(peopleData);
        calculateStatistics(peopleData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (peopleData) => {
    const stats = {
      total: peopleData.length,
      alive: peopleData.filter(p => !p.death_date).length,
      deceased: peopleData.filter(p => p.death_date).length,
      withCauseOfDeath: peopleData.filter(p => p.cause_of_death).length,
      
      // Causas de muerte
      causesOfDeath: {},
      
      // Lugares más comunes
      birthPlaces: {},
      deathPlaces: {},
      
      // Apellidos
      surnames: {},
      
      // Décadas de nacimiento
      birthDecades: {},
      
      // Longevidad
      longevity: []
    };

    peopleData.forEach(person => {
      // Causas de muerte
      if (person.cause_of_death) {
        const cause = person.cause_of_death.toLowerCase();
        stats.causesOfDeath[cause] = (stats.causesOfDeath[cause] || 0) + 1;
      }

      // Lugares de nacimiento
      if (person.birth_place) {
        stats.birthPlaces[person.birth_place] = (stats.birthPlaces[person.birth_place] || 0) + 1;
      }

      // Lugares de fallecimiento
      if (person.death_place) {
        stats.deathPlaces[person.death_place] = (stats.deathPlaces[person.death_place] || 0) + 1;
      }

      // Apellidos
      if (person.last_name) {
        stats.surnames[person.last_name] = (stats.surnames[person.last_name] || 0) + 1;
      }

      // Décadas de nacimiento
      if (person.birth_date) {
        const year = new Date(person.birth_date).getFullYear();
        const decade = Math.floor(year / 10) * 10;
        stats.birthDecades[decade] = (stats.birthDecades[decade] || 0) + 1;
      }

      // Longevidad
      if (person.birth_date && person.death_date) {
        const birthYear = new Date(person.birth_date).getFullYear();
        const deathYear = new Date(person.death_date).getFullYear();
        const age = deathYear - birthYear;
        stats.longevity.push({
          name: `${person.first_name} ${person.last_name}`,
          age: age,
          birth: birthYear,
          death: deathYear
        });
      }
    });

    // Ordenar longevidad
    stats.longevity.sort((a, b) => b.age - a.age);

    setStats(stats);
  };

  const getTopEntries = (obj, limit = 5) => {
    return Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  };

  if (loading) return <div className="loading">Cargando estadísticas...</div>;

  return (
    <div className="statistics-container">
      <h1>📊 Estadísticas Familiares</h1>
      <p className="subtitle">Preservando la historia familiar para futuras generaciones</p>

      <div className="stats-grid">
        {/* Resumen General */}
        <div className="stat-card">
          <h3>👥 Resumen General</h3>
          <div className="stat-item">
            <span className="stat-label">Total de personas:</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Personas vivas:</span>
            <span className="stat-value">{stats.alive}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Personas fallecidas:</span>
            <span className="stat-value">{stats.deceased}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Con causa de muerte registrada:</span>
            <span className="stat-value">{stats.withCauseOfDeath}</span>
          </div>
        </div>

        {/* Causas de Muerte */}
        {Object.keys(stats.causesOfDeath).length > 0 && (
          <div className="stat-card">
            <h3>⚰️ Causas de Muerte</h3>
            {getTopEntries(stats.causesOfDeath).map(([cause, count]) => (
              <div key={cause} className="stat-item">
                <span className="stat-label">{cause}:</span>
                <span className="stat-value">{count} persona{count > 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        )}

        {/* Apellidos más comunes */}
        <div className="stat-card">
          <h3>👨‍👩‍👧‍👦 Apellidos más Comunes</h3>
          {getTopEntries(stats.surnames).map(([surname, count]) => (
            <div key={surname} className="stat-item">
              <span className="stat-label">{surname}:</span>
              <span className="stat-value">{count} persona{count > 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>

        {/* Lugares de Nacimiento */}
        {Object.keys(stats.birthPlaces).length > 0 && (
          <div className="stat-card">
            <h3>🏠 Lugares de Nacimiento</h3>
            {getTopEntries(stats.birthPlaces).map(([place, count]) => (
              <div key={place} className="stat-item">
                <span className="stat-label">{place}:</span>
                <span className="stat-value">{count} persona{count > 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        )}

        {/* Longevidad */}
        {stats.longevity.length > 0 && (
          <div className="stat-card">
            <h3>🕰️ Longevidad</h3>
            {stats.longevity.slice(0, 5).map((person, index) => (
              <div key={index} className="stat-item">
                <span className="stat-label">{person.name}:</span>
                <span className="stat-value">{person.age} años ({person.birth}-{person.death})</span>
              </div>
            ))}
          </div>
        )}

        {/* Décadas de Nacimiento */}
        {Object.keys(stats.birthDecades).length > 0 && (
          <div className="stat-card">
            <h3>📅 Décadas de Nacimiento</h3>
            {getTopEntries(stats.birthDecades).map(([decade, count]) => (
              <div key={decade} className="stat-item">
                <span className="stat-label">{decade}s:</span>
                <span className="stat-value">{count} persona{count > 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Personas con Causa de Muerte Detallada */}
      {stats.withCauseOfDeath > 0 && (
        <div className="detailed-section">
          <h2>📋 Registro Detallado de Fallecimientos</h2>
          <div className="deaths-table">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Fecha de Nacimiento</th>
                  <th>Fecha de Fallecimiento</th>
                  <th>Edad</th>
                  <th>Causa de Muerte</th>
                  <th>Lugar de Fallecimiento</th>
                </tr>
              </thead>
              <tbody>
                {people
                  .filter(p => p.cause_of_death)
                  .sort((a, b) => new Date(b.death_date || 0) - new Date(a.death_date || 0))
                  .map((person, index) => {
                    const age = person.birth_date && person.death_date 
                      ? new Date(person.death_date).getFullYear() - new Date(person.birth_date).getFullYear()
                      : 'N/A';
                    
                    return (
                      <tr key={index}>
                        <td>{person.first_name} {person.last_name}</td>
                        <td>{person.birth_date ? new Date(person.birth_date).toLocaleDateString() : 'N/A'}</td>
                        <td>{person.death_date ? new Date(person.death_date).toLocaleDateString() : 'N/A'}</td>
                        <td>{age}</td>
                        <td>{person.cause_of_death}</td>
                        <td>{person.death_place || 'N/A'}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;