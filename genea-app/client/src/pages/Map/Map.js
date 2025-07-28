import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase.config';

const Map = () => {
  const [people, setPeople] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/people`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (response.ok) {
        const result = await response.json();
        const peopleData = Array.isArray(result.data) ? result.data : [];
        setPeople(peopleData);
        await processLocations(peopleData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const processLocations = async (peopleData) => {
    const locationMap = new Map();

    for (const person of peopleData) {
      if (person.birth_place) {
        const key = person.birth_place;
        if (!locationMap.has(key)) {
          const coordinates = await getCoordinates(person.birth_place);
          locationMap.set(key, {
            name: person.birth_place,
            people: [],
            births: 0,
            deaths: 0,
            coordinates
          });
        }
        locationMap.get(key).people.push({
          ...person,
          eventType: 'birth',
          date: person.birth_date
        });
        locationMap.get(key).births++;
      }

      if (person.death_place) {
        const key = person.death_place;
        if (!locationMap.has(key)) {
          const coordinates = await getCoordinates(person.death_place);
          locationMap.set(key, {
            name: person.death_place,
            people: [],
            births: 0,
            deaths: 0,
            coordinates
          });
        }
        locationMap.get(key).people.push({
          ...person,
          eventType: 'death',
          date: person.death_date
        });
        locationMap.get(key).deaths++;
      }
    }

    setLocations(Array.from(locationMap.values()));
  };

  const getCoordinates = async (placeName) => {
    const cacheKey = `coords_${placeName}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const coords = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
        localStorage.setItem(cacheKey, JSON.stringify(coords));
        return coords;
      }
    } catch (error) {
      console.error('Error geocoding:', error);
    }
    
    return { lat: 0, lng: 0 };
  };

  const getMarkerSize = (location) => {
    const total = location.births + location.deaths;
    return Math.max(20, Math.min(50, total * 10));
  };

  if (loading) return <div>Cargando mapa...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🗺️ Mapa Familiar Interactivo</h1>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <div style={{
            width: '100%',
            height: '600px',
            backgroundColor: '#e8f4f8',
            position: 'relative',
            borderRadius: '8px',
            border: '2px solid #ddd',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              backgroundColor: 'white',
              padding: '10px',
              borderRadius: '5px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              zIndex: 1000
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Ubicaciones Familiares</h3>
              <div style={{ fontSize: '12px', color: '#666' }}>
                📍 {locations.length} ubicaciones encontradas
              </div>
            </div>

            {locations.map((location, index) => {
              if (location.coordinates.lat === 0 && location.coordinates.lng === 0) return null;
              
              const size = getMarkerSize(location);
              const x = ((location.coordinates.lng + 180) / 360) * 100;
              const y = ((90 - location.coordinates.lat) / 180) * 100;
              
              return (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    zIndex: 100
                  }}
                  onClick={() => setSelectedLocation(location)}
                >
                  <div style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: '50%',
                    backgroundColor: location.births > location.deaths ? '#4caf50' : '#f44336',
                    border: '3px solid white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    {location.births + location.deaths}
                  </div>
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'white',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '10px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    marginTop: '5px'
                  }}>
                    {location.name}
                  </div>
                </div>
              );
            })}

            <div style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              backgroundColor: 'white',
              padding: '10px',
              borderRadius: '5px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Leyenda</div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#4caf50', marginRight: '5px' }}></div>
                <span style={{ fontSize: '10px' }}>Más nacimientos</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f44336', marginRight: '5px' }}></div>
                <span style={{ fontSize: '10px' }}>Más defunciones</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ width: '300px' }}>
          {selectedLocation ? (
            <div style={{
              padding: '20px',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📍 {selectedLocation.name}</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '14px', marginBottom: '5px' }}>
                  👶 <strong>Nacimientos:</strong> {selectedLocation.births}
                </div>
                <div style={{ fontSize: '14px', marginBottom: '5px' }}>
                  ⚰️ <strong>Defunciones:</strong> {selectedLocation.deaths}
                </div>
                <div style={{ fontSize: '14px' }}>
                  👥 <strong>Total personas:</strong> {selectedLocation.people.length}
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Personas relacionadas:</h4>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {selectedLocation.people.map((person, index) => (
                    <div key={index} style={{
                      padding: '8px',
                      marginBottom: '5px',
                      backgroundColor: '#f9f9f9',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      <div style={{ fontWeight: 'bold' }}>
                        {person.first_name} {person.last_name}
                      </div>
                      <div style={{ color: '#666' }}>
                        {person.eventType === 'birth' ? '👶 Nacimiento' : '⚰️ Defunción'}
                        {person.date && ` - ${new Date(person.date).toLocaleDateString()}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '20px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #ddd',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#666' }}>Información del Mapa</h3>
              <p style={{ color: '#888', fontSize: '14px' }}>
                Haz clic en un marcador para ver detalles de las personas relacionadas con esa ubicación.
              </p>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '15px' }}>
                <strong>Estadísticas:</strong><br/>
                📍 {locations.length} ubicaciones<br/>
                👥 {people.length} personas<br/>
                👶 {locations.reduce((sum, loc) => sum + loc.births, 0)} nacimientos<br/>
                ⚰️ {locations.reduce((sum, loc) => sum + loc.deaths, 0)} defunciones
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Map;