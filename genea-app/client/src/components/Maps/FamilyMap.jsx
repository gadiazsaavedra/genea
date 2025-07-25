import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  ToggleButtonGroup, 
  ToggleButton,
  Card,
  CardContent,
  Avatar,
  Chip
} from '@mui/material';
import { Map, Timeline, LocationOn } from '@mui/icons-material';

const FamilyMap = ({ familyData }) => {
  const [mapType, setMapType] = useState('locations');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    processLocationData();
  }, [familyData]);

  const processLocationData = () => {
    const locationMap = new Map();
    
    familyData.forEach(person => {
      if (person.birth_place) {
        const key = person.birth_place;
        if (!locationMap.has(key)) {
          locationMap.set(key, {
            name: person.birth_place,
            type: 'birth',
            people: [],
            coordinates: getCoordinates(person.birth_place)
          });
        }
        locationMap.get(key).people.push({
          ...person,
          eventType: 'birth',
          date: person.birth_date
        });
      }

      if (person.death_place) {
        const key = person.death_place;
        if (!locationMap.has(key)) {
          locationMap.set(key, {
            name: person.death_place,
            type: 'death',
            people: [],
            coordinates: getCoordinates(person.death_place)
          });
        }
        locationMap.get(key).people.push({
          ...person,
          eventType: 'death',
          date: person.death_date
        });
      }
    });

    setLocations(Array.from(locationMap.values()));
  };

  const getCoordinates = (placeName) => {
    const commonPlaces = {
      'Buenos Aires': { lat: -34.6037, lng: -58.3816 },
      'Córdoba': { lat: -31.4201, lng: -64.1888 },
      'Rosario': { lat: -32.9442, lng: -60.6505 },
      'Mendoza': { lat: -32.8895, lng: -68.8458 },
      'La Plata': { lat: -34.9215, lng: -57.9545 }
    };
    return commonPlaces[placeName] || { lat: -34.6037, lng: -58.3816 };
  };

  const renderLocationMap = () => (
    <Box sx={{ height: '600px', position: 'relative' }}>
      <Box 
        sx={{ 
          width: '100%', 
          height: '100%', 
          backgroundColor: '#e3f2fd',
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            position: 'absolute', 
            top: 16, 
            left: 16, 
            zIndex: 1000,
            backgroundColor: 'white',
            padding: '8px 16px',
            borderRadius: 1,
            boxShadow: 1
          }}
        >
          Ubicaciones Familiares
        </Typography>

        {locations.map((location, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              left: `${50 + (index % 3) * 20}%`,
              top: `${30 + Math.floor(index / 3) * 15}%`,
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer'
            }}
            onClick={() => setSelectedPerson(location)}
          >
            <LocationOn 
              sx={{ 
                fontSize: 40, 
                color: location.type === 'birth' ? '#4caf50' : '#f44336',
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
              }} 
            />
            <Typography 
              variant="caption" 
              sx={{ 
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'white',
                padding: '2px 6px',
                borderRadius: 1,
                whiteSpace: 'nowrap',
                fontSize: '10px',
                boxShadow: 1
              }}
            >
              {location.name}
            </Typography>
          </Box>
        ))}

        <Box 
          sx={{ 
            position: 'absolute',
            bottom: 16,
            right: 16,
            backgroundColor: 'white',
            padding: 2,
            borderRadius: 1,
            boxShadow: 1
          }}
        >
          <Typography variant="subtitle2" gutterBottom>Leyenda</Typography>
          <Box display="flex" alignItems="center" mb={1}>
            <LocationOn sx={{ color: '#4caf50', mr: 1 }} />
            <Typography variant="caption">Nacimientos</Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <LocationOn sx={{ color: '#f44336', mr: 1 }} />
            <Typography variant="caption">Defunciones</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Mapa Familiar</Typography>
        
        <ToggleButtonGroup
          value={mapType}
          exclusive
          onChange={(e, newType) => newType && setMapType(newType)}
          size="small"
        >
          <ToggleButton value="locations">
            <Map sx={{ mr: 1 }} />
            Ubicaciones
          </ToggleButton>
          <ToggleButton value="migration">
            <Timeline sx={{ mr: 1 }} />
            Migración
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box display="flex" gap={2}>
        <Box flex={1}>
          {renderLocationMap()}
        </Box>

        <Box width="300px">
          {selectedPerson ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedPerson.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedPerson.people.length} persona(s) relacionada(s)
                </Typography>
                
                {selectedPerson.people.map((person, index) => (
                  <Box key={index} display="flex" alignItems="center" mb={1}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        mr: 1,
                        bgcolor: person.gender === 'male' ? '#2196f3' : '#e91e63'
                      }}
                    >
                      {person.first_name[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">
                        {person.first_name} {person.last_name}
                      </Typography>
                      <Chip 
                        label={person.eventType === 'birth' ? 'Nacimiento' : 'Defunción'}
                        size="small"
                        color={person.eventType === 'birth' ? 'success' : 'error'}
                      />
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Información del Mapa
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Haz clic en un marcador para ver detalles.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default FamilyMap;