import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  IconButton,
  Fab,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add,
  ExpandMore,
  ExpandLess,
  Male,
  Female,
  Phone,
  Email
} from '@mui/icons-material';

const MobileTreeView = ({ familyData, onPersonClick, onAddPerson }) => {
  const [expandedPerson, setExpandedPerson] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!isMobile) return null;

  const handlePersonExpand = (personId) => {
    setExpandedPerson(expandedPerson === personId ? null : personId);
  };

  const getPersonAge = (birthDate, deathDate) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const end = deathDate ? new Date(deathDate) : new Date();
    return Math.floor((end - birth) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const PersonCard = ({ person }) => (
    <Card 
      sx={{ 
        mb: 2, 
        border: person.gender === 'male' ? '2px solid #2196f3' : '2px solid #e91e63',
        borderRadius: 2
      }}
    >
      <CardContent sx={{ pb: '16px !important' }}>
        <Box display="flex" alignItems="center" mb={1}>
          <Avatar
            sx={{
              bgcolor: person.gender === 'male' ? '#2196f3' : '#e91e63',
              mr: 2,
              width: 50,
              height: 50
            }}
          >
            {person.gender === 'male' ? <Male /> : <Female />}
          </Avatar>
          
          <Box flex={1}>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
              {person.first_name} {person.last_name}
            </Typography>
            
            <Box display="flex" gap={1} mt={1}>
              {person.birth_date && (
                <Chip 
                  label={`${getPersonAge(person.birth_date, person.death_date)} años`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {person.death_date && (
                <Chip 
                  label="Fallecido"
                  size="small"
                  color="error"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>

          <IconButton 
            onClick={() => handlePersonExpand(person.id)}
            size="small"
          >
            {expandedPerson === person.id ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        {expandedPerson === person.id && (
          <Box mt={2} pt={2} borderTop="1px solid #eee">
            {person.birth_date && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                📅 Nacimiento: {new Date(person.birth_date).toLocaleDateString()}
              </Typography>
            )}
            
            {person.birth_place && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                📍 Lugar: {person.birth_place}
              </Typography>
            )}
            
            {person.biography && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                📝 {person.biography.substring(0, 100)}...
              </Typography>
            )}

            <Box display="flex" gap={1} mt={2}>
              <IconButton 
                size="small" 
                color="primary"
                onClick={() => onPersonClick && onPersonClick(person)}
              >
                <Email />
              </IconButton>
              <IconButton size="small" color="primary">
                <Phone />
              </IconButton>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const groupedData = familyData.reduce((acc, person) => {
    const generation = person.generation || 'Sin generación';
    if (!acc[generation]) acc[generation] = [];
    acc[generation].push(person);
    return acc;
  }, {});

  return (
    <Box sx={{ pb: 10 }}> {/* Espacio para navegación inferior */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
          🌳 Árbol Familiar
        </Typography>

        {Object.keys(groupedData).map(generation => (
          <Box key={generation} mb={3}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
                color: 'primary.main',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                pb: 1
              }}
            >
              {generation}
            </Typography>
            
            {groupedData[generation].map(person => (
              <PersonCard key={person.id} person={person} />
            ))}
          </Box>
        ))}

        {familyData.length === 0 && (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center"
            minHeight="300px"
            textAlign="center"
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hay personas en el árbol
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Comienza agregando la primera persona de tu familia
            </Typography>
          </Box>
        )}
      </Box>

      {/* Botón flotante para agregar persona */}
      <Fab
        color="primary"
        aria-label="add person"
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 1000
        }}
        onClick={() => setDrawerOpen(true)}
      >
        <Add />
      </Fab>

      {/* Drawer para opciones rápidas */}
      <SwipeableDrawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
        sx={{
          '& .MuiDrawer-paper': {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '50vh'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom textAlign="center">
            Acciones Rápidas
          </Typography>
          
          <List>
            <ListItem button onClick={() => {
              onAddPerson && onAddPerson();
              setDrawerOpen(false);
            }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Add />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary="Agregar Persona"
                secondary="Añadir nueva persona al árbol"
              />
            </ListItem>
          </List>
        </Box>
      </SwipeableDrawer>
    </Box>
  );
};

export default MobileTreeView;