import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { AccountTree, Map, PhoneAndroid } from '@mui/icons-material';
import TreeVisualization from '../components/FamilyTree/TreeVisualization';
import FamilyMap from '../components/Maps/FamilyMap';
import MobileTreeView from '../components/Mobile/MobileTreeView';

const EnhancedTreeView = () => {
  const [viewMode, setViewMode] = useState('tree');
  const [familyData, setFamilyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    loadFamilyData();
  }, []);

  const loadFamilyData = async () => {
    try {
      // Simular carga de datos - reemplazar con API real
      const mockData = [
        {
          id: '1',
          first_name: 'Juan',
          last_name: 'García',
          gender: 'male',
          birth_date: '1950-05-15',
          birth_place: 'Buenos Aires',
          death_date: null,
          biography: 'Fundador de la familia García en Argentina.',
          generation: 'Abuelos'
        },
        {
          id: '2',
          first_name: 'María',
          last_name: 'López',
          gender: 'female',
          birth_date: '1955-08-22',
          birth_place: 'Córdoba',
          death_date: null,
          biography: 'Maestra jubilada, madre de tres hijos.',
          generation: 'Abuelos'
        },
        {
          id: '3',
          first_name: 'Carlos',
          last_name: 'García',
          gender: 'male',
          birth_date: '1980-03-10',
          birth_place: 'Buenos Aires',
          death_date: null,
          biography: 'Ingeniero en sistemas, hijo de Juan y María.',
          generation: 'Padres'
        },
        {
          id: '4',
          first_name: 'Ana',
          last_name: 'Martínez',
          gender: 'female',
          birth_date: '1985-11-05',
          birth_place: 'Rosario',
          death_date: null,
          biography: 'Doctora, esposa de Carlos.',
          generation: 'Padres'
        },
        {
          id: '5',
          first_name: 'Sofía',
          last_name: 'García',
          gender: 'female',
          birth_date: '2010-07-18',
          birth_place: 'Buenos Aires',
          death_date: null,
          biography: 'Estudiante de primaria, hija de Carlos y Ana.',
          generation: 'Hijos'
        }
      ];

      setFamilyData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading family data:', error);
      setLoading(false);
    }
  };

  const handlePersonClick = (person) => {
    console.log('Person clicked:', person);
    // Implementar navegación a detalle de persona
  };

  const handleAddPerson = () => {
    console.log('Add person clicked');
    // Implementar navegación a formulario de agregar persona
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Cargando árbol familiar...</Typography>
        </Box>
      </Container>
    );
  }

  // Vista móvil
  if (isMobile) {
    return (
      <MobileTreeView 
        familyData={familyData}
        onPersonClick={handlePersonClick}
        onAddPerson={handleAddPerson}
      />
    );
  }

  // Vista desktop
  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            🌳 Árbol Familiar Avanzado
          </Typography>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="large"
          >
            <ToggleButton value="tree">
              <AccountTree sx={{ mr: 1 }} />
              Árbol
            </ToggleButton>
            <ToggleButton value="map">
              <Map sx={{ mr: 1 }} />
              Mapa
            </ToggleButton>
            <ToggleButton value="mobile">
              <PhoneAndroid sx={{ mr: 1 }} />
              Vista Móvil
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {viewMode === 'tree' && (
          <TreeVisualization 
            familyData={familyData}
            onPersonClick={handlePersonClick}
          />
        )}

        {viewMode === 'map' && (
          <FamilyMap familyData={familyData} />
        )}

        {viewMode === 'mobile' && (
          <Box sx={{ border: '2px solid #ddd', borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: '#f5f5f5', p: 1, textAlign: 'center' }}>
              <Typography variant="caption">Vista previa móvil</Typography>
            </Box>
            <Box sx={{ maxWidth: 400, mx: 'auto' }}>
              <MobileTreeView 
                familyData={familyData}
                onPersonClick={handlePersonClick}
                onAddPerson={handleAddPerson}
              />
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default EnhancedTreeView;