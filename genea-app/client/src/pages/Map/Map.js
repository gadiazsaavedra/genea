import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../../config/supabase.config';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/persons`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (response.ok) {
        const result = await response.json();
        console.log('=== MAP DEBUG ===');
        console.log('API Response:', result);
        const peopleData = Array.isArray(result.data) ? result.data : [];
        console.log('People data:', peopleData);
        console.log('People with places:', peopleData.filter(p => p.birth_place || p.death_place));
        setPeople(peopleData);
        await processLocations(peopleData);
      } else {
        console.error('API Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const processLocations = async (peopleData) => {
    const locationMap = new window.Map();

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

    const locationsArray = Array.from(locationMap.values());
    console.log('Processed locations:', locationsArray);
    locationsArray.forEach(loc => {
      console.log(`${loc.name}: lat=${loc.coordinates.lat}, lng=${loc.coordinates.lng}`);
    });
    setLocations(locationsArray);
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
          <MapContainer 
            center={[20, 0]} 
            zoom={2} 
            style={{ height: '600px', width: '100%', borderRadius: '8px' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {locations.map((location, index) => {
              if (location.coordinates.lat === 0 && location.coordinates.lng === 0) return null;
              
              return (
                <Marker 
                  key={index}
                  position={[location.coordinates.lat, location.coordinates.lng]}
                  eventHandlers={{
                    click: () => setSelectedLocation(location)
                  }}
                >
                  <Popup>
                    <div>
                      <h4>{location.name}</h4>
                      <p>👶 Nacimientos: {location.births}</p>
                      <p>⚰️ Defunciones: {location.deaths}</p>
                      <p>👥 Total: {location.people.length} personas</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
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