import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  FormControlLabel,
  Switch,
  Divider
} from '@mui/material';
import axios from 'axios';
import FamilyTreeVisualization from '../components/FamilyTreeVisualization';

interface TreeNode {
  id: string;
  name: string;
  birthYear?: number;
  deathYear?: number;
  profilePhoto?: string;
  isAlive: boolean;
  children?: TreeNode[];
  spouses?: {
    id: string;
    name: string;
    birthYear?: number;
    deathYear?: number;
    profilePhoto?: string;
    isAlive: boolean;
  }[];
}

interface Family {
  _id: string;
  name: string;
  description?: string;
  founders: {
    _id: string;
    fullName: string;
  }[];
}

const FamilyTree: React.FC = () => {
  const { familyId } = useParams<{ familyId: string }>();
  const navigate = useNavigate();
  
  const [family, setFamily] = useState<Family | null>(null);
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    showOnlyLiving: false,
    showOnlyDirect: false,
    generationLimit: 0
  });
  
  // Cargar datos de la familia
  useEffect(() => {
    const fetchFamilyData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/families/${familyId}`);
        setFamily(response.data.data);
      } catch (err: any) {
        console.error('Error al cargar los datos de la familia:', err);
        setError(err.response?.data?.message || 'Error al cargar los datos de la familia.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFamilyData();
  }, [familyId]);
  
  // Cargar datos del árbol genealógico
  useEffect(() => {
    const fetchTreeData = async () => {
      if (!family || !family.founders || family.founders.length === 0) return;
      
      try {
        setLoading(true);
        
        // Obtener el fundador principal (el primero)
        const founderId = family.founders[0]._id;
        
        // Obtener datos del árbol a partir del fundador
        const response = await axios.get(`/api/persons/${founderId}/tree`, {
          params: {
            generations: 10, // Número máximo de generaciones a mostrar
            includeSpouses: true
          }
        });
        
        // Transformar los datos para el componente de visualización
        const transformData = (person: any): TreeNode => {
          return {
            id: person._id,
            name: person.fullName,
            birthYear: person.birthDate ? new Date(person.birthDate).getFullYear() : undefined,
            deathYear: person.deathDate ? new Date(person.deathDate).getFullYear() : undefined,
            profilePhoto: person.profilePhoto,
            isAlive: person.isAlive,
            children: person.children ? person.children.map(transformData) : undefined,
            spouses: person.spouses ? person.spouses.map((s: any) => ({
              id: s.person._id,
              name: s.person.fullName,
              birthYear: s.person.birthDate ? new Date(s.person.birthDate).getFullYear() : undefined,
              deathYear: s.person.deathDate ? new Date(s.person.deathDate).getFullYear() : undefined,
              profilePhoto: s.person.profilePhoto,
              isAlive: s.person.isAlive
            })) : undefined
          };
        };
        
        setTreeData(transformData(response.data.data));
        setError(null);
      } catch (err: any) {
        console.error('Error al cargar los datos del árbol genealógico:', err);
        setError(err.response?.data?.message || 'Error al cargar los datos del árbol genealógico.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTreeData();
  }, [family]);
  
  // Manejar clic en una persona
  const handlePersonClick = (personId: string) => {
    navigate(`/person/${personId}`);
  };
  
  // Manejar cambio de filtros
  const handleFilterChange = (filterName: string, value: boolean | number) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };
  
  if (loading && !family) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (error && !family) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error}
        </Alert>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button variant="contained" onClick={() => navigate('/dashboard')}>
            Volver al Dashboard
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Encabezado */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {family?.name || 'Árbol Genealógico'}
        </Typography>
        
        {family?.description && (
          <Typography variant="body1" paragraph>
            {family.description}
          </Typography>
        )}
        
        {family?.founders && family.founders.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            Fundadores: {family.founders.map(f => f.fullName).join(', ')}
          </Typography>
        )}
      </Paper>
      
      {/* Filtros */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={filters.showOnlyLiving}
                onChange={(e) => handleFilterChange('showOnlyLiving', e.target.checked)}
              />
            }
            label="Mostrar solo personas vivas"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={filters.showOnlyDirect}
                onChange={(e) => handleFilterChange('showOnlyDirect', e.target.checked)}
              />
            }
            label="Mostrar solo línea directa"
          />
        </Box>
      </Paper>
      
      {/* Visualización del árbol */}
      <Box sx={{ height: '70vh', minHeight: 600 }}>
        <FamilyTreeVisualization
          data={treeData}
          loading={loading}
          error={error}
          onPersonClick={handlePersonClick}
          filters={filters}
        />
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      {/* Acciones */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="outlined" onClick={() => navigate(`/family/${familyId}`)}>
          Ver detalles de la familia
        </Button>
        
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Volver al Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default FamilyTree;