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
        processLocations(peopleData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const processLocations = (peopleData) => {
    const locationMap = new Map();

    peopleData.forEach(person => {
      if (person.birth_place) {
        const key = person.birth_place;
        if (!locationMap.has(key)) {
          locationMap.set(key, {
            name: person.birth_place,
            people: [],
            births: 0,
            deaths: 0,
            coordinates: getCoordinates(person.birth_place)
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
          locationMap.set(key, {
            name: person.death_place,
            people: [],
            births: 0,
            deaths: 0,
            coordinates: getCoordinates(person.death_place)
          });
        }
        locationMap.get(key).people.push({
          ...person,
          eventType: 'death',
          date: person.death_date
        });
        locationMap.get(key).deaths++;
      }
    });

    setLocations(Array.from(locationMap.values()));
  };

  const getCoordinates = (placeName) => {
    const places = {
      'Buenos Aires': { lat: -34.6037, lng: -58.3816 },
      'Córdoba': { lat: -31.4201, lng: -64.1888 },
      'Rosario': { lat: -32.9442, lng: -60.6505 },
      'Mendoza': { lat: -32.8895, lng: -68.8458 },
      'La Plata': { lat: -34.9215, lng: -57.9545 },
      'Chaco': { lat: -27.4511, lng: -58.9867 },
      'Corrientes': { lat: -27.4692, lng: -58.8306 },
      'Brasil': { lat: -14.2350, lng: -51.9253 },
      'Madrid': { lat: 40.4168, lng: -3.7038 },
      'Barcelona': { lat: 41.3851, lng: 2.1734 },
      'Valencia': { lat: 39.4699, lng: -0.3763 },
      'Sevilla': { lat: 37.3891, lng: -5.9845 },
      'México': { lat: 19.4326, lng: -99.1332 },
      'Lima': { lat: -12.0464, lng: -77.0428 },
      'Santiago': { lat: -33.4489, lng: -70.6693 }
    };
    return places[placeName] || { lat: 0, lng: 0 };
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