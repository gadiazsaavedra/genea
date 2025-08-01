import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  FamilyRestroom,
  Person,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import DeveloperInfo from '../components/DeveloperInfo';
import TranslationTest from '../components/TranslationTest';

// Interfaces
interface Family {
  _id: string;
  name: string;
  description: string;
  founders: {
    _id: string;
    fullName: string;
    profilePhoto?: string;
  }[];
  createdAt: string;
}

interface Person {
  _id: string;
  fullName: string;
  birthDate?: string;
  deathDate?: string;
  profilePhoto?: string;
  isAlive: boolean;
}

// Componente principal
const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  console.log('Dashboard render - current language:', i18n.language);
  console.log('Dashboard render - t(dashboard.welcome):', t('dashboard.welcome'));
  
  // Estado para las pestañas
  const [tabValue, setTabValue] = useState(searchParams.get('tab') === 'persons' ? 1 : 0);
  
  // Estado para los datos
  const [families, setFamilies] = useState<Family[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState({
    families: true,
    persons: true
  });
  const [error, setError] = useState({
    families: null as string | null,
    persons: null as string | null
  });

  // Cargar datos de familias
  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        setLoading(prev => ({ ...prev, families: true }));
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/families`, {
          headers: {
            'Authorization': `Bearer ${currentUser?.access_token}`
          }
        });
        setFamilies(response.data.data || []);
        setError(prev => ({ ...prev, families: null }));
      } catch (err: any) {
        console.error('Error al cargar familias:', err);
        setFamilies([]);
        setError(prev => ({ 
          ...prev, 
          families: null
        }));
      } finally {
        setLoading(prev => ({ ...prev, families: false }));
      }
    };

    if (currentUser) {
      fetchFamilies();
    } else {
      setLoading(prev => ({ ...prev, families: false }));
    }
  }, [currentUser]);

  // Cargar datos de personas
  useEffect(() => {
    const fetchPersons = async () => {
      try {
        setLoading(prev => ({ ...prev, persons: true }));
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/persons`, {
          headers: {
            'Authorization': `Bearer ${currentUser?.access_token}`
          }
        });
        setPersons(response.data.data || []);
        setError(prev => ({ ...prev, persons: null }));
      } catch (err: any) {
        console.error('Error al cargar personas:', err);
        setPersons([]);
        setError(prev => ({ 
          ...prev, 
          persons: null
        }));
      } finally {
        setLoading(prev => ({ ...prev, persons: false }));
      }
    };

    if (currentUser) {
      fetchPersons();
    } else {
      setLoading(prev => ({ ...prev, persons: false }));
    }
  }, [currentUser]);

  // Manejar cambio de pestaña
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSearchParams(newValue === 1 ? { tab: 'persons' } : {});
  };

  // Navegar a la página de creación de familia
  const handleCreateFamily = () => {
    navigate('/families');
  };

  // Navegar a la página de creación de persona
  const handleCreatePerson = () => {
    navigate('/person/new');
  };

  // Navegar al árbol genealógico de una familia
  const handleViewFamilyTree = (familyId: string) => {
    navigate(`/family-tree/${familyId}`);
  };

  // Navegar a la página de detalle de una familia
  const handleViewFamily = (familyId: string) => {
    navigate(`/family/${familyId}`);
  };

  // Navegar a la página de edición de una familia
  const handleEditFamily = (familyId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/family/edit/${familyId}`);
  };

  // Navegar a la página de detalle de una persona
  const handleViewPerson = (personId: string) => {
    navigate(`/person/${personId}`);
  };

  // Navegar a la página de edición de una persona
  const handleEditPerson = (personId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/person/edit/${personId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <TranslationTest />
      {/* Encabezado */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('dashboard.welcome')}, {currentUser?.user_metadata?.displayName || currentUser?.email?.split('@')[0] || 'Usuario'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona tus árboles genealógicos y familiares desde este panel.
        </Typography>
      </Box>

      {/* Pestañas */}
      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab 
            icon={<FamilyRestroom />} 
            label={t('dashboard.myFamilies')} 
            iconPosition="start"
          />
          <Tab 
            icon={<Person />} 
            label={t('nav.people')} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Contenido de la pestaña Familias */}
      <Box sx={{ display: tabValue === 0 ? 'block' : 'none' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            {t('dashboard.myFamilies')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateFamily}
          >
            {t('dashboard.newFamily')}
          </Button>
        </Box>

        {error.families && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error.families}
          </Alert>
        )}

        {loading.families ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : families.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.noFamilies')}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {t('dashboard.createFirstFamily')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateFamily}
            >
              {t('dashboard.createFamily')}
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {families.map((family) => (
              <Grid item xs={12} sm={6} md={4} key={family._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => handleViewFamily(family._id)}
                >
                  <CardMedia
                    component="div"
                    sx={{
                      height: 140,
                      bgcolor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FamilyRestroom sx={{ fontSize: 60, color: 'white' }} />
                  </CardMedia>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography gutterBottom variant="h6" component="h3">
                        {family.name}
                      </Typography>
                      <Tooltip title={t('family.editFamily')}>
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleEditFamily(family._id, e)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {family.description || t('family.noDescription')}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {t('family.founders')}: {family.founders.length > 0 
                        ? family.founders.map(f => f.fullName).join(', ') 
                        : t('family.notDefined')}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewFamilyTree(family._id);
                      }}
                    >
                      {t('dashboard.viewTree')}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Contenido de la pestaña Personas */}
      <Box sx={{ display: tabValue === 1 ? 'block' : 'none' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Personas
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreatePerson}
          >
            Nueva Persona
          </Button>
        </Box>

        {error.persons && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error.persons}
          </Alert>
        )}

        {loading.persons ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : persons.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom>
              No hay personas registradas
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Agrega personas a tu árbol genealógico para comenzar.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreatePerson}
            >
              Agregar Persona
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {persons.map((person) => (
              <Grid item xs={12} sm={6} md={3} key={person._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => handleViewPerson(person._id)}
                >
                  <Box sx={{ 
                    height: 120, 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    bgcolor: 'background.default',
                    position: 'relative'
                  }}>
                    {person.profilePhoto ? (
                      <CardMedia
                        component="img"
                        image={person.profilePhoto}
                        alt={person.fullName}
                        sx={{ 
                          height: '100%', 
                          objectFit: 'cover' 
                        }}
                      />
                    ) : (
                      <Person sx={{ fontSize: 60, color: 'text.secondary' }} />
                    )}
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8, 
                      bgcolor: 'rgba(255,255,255,0.8)',
                      borderRadius: '50%'
                    }}>
                      <Tooltip title="Editar persona">
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleEditPerson(person._id, e)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <CardContent>
                    <Typography gutterBottom variant="subtitle1" component="h3">
                      {person.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {person.birthDate ? new Date(person.birthDate).getFullYear() : '?'} 
                      {person.deathDate ? ` - ${new Date(person.deathDate).getFullYear()}` : person.isAlive ? '' : ' - ?'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Información del desarrollador solo en Dashboard */}
      <Box sx={{ mt: 6, mb: 4 }}>
        <DeveloperInfo variant="footer" />
      </Box>
    </Container>
  );
};

export default Dashboard;