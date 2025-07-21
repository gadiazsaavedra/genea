import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Avatar,
  Divider,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Photo as PhotoIcon,
  Description as DocumentIcon,
  Note as NoteIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import MediaUploader from '../components/MediaUploader';
import MediaGallery from '../components/MediaGallery';

interface Person {
  _id: string;
  fullName: string;
  birthDate?: string;
  deathDate?: string;
  birthPlace?: {
    city?: string;
    country?: string;
  };
  currentResidence?: {
    city?: string;
    country?: string;
  };
  contactInfo?: {
    phoneNumbers?: { type: string; label: string }[];
    email?: string;
    address?: string;
  };
  profilePhoto?: string;
  photos?: {
    _id: string;
    url: string;
    caption?: string;
    date?: string;
  }[];
  documents?: {
    _id: string;
    url: string;
    title?: string;
    type?: string;
    date?: string;
  }[];
  ethnicity?: string;
  maritalStatus?: string;
  occupation?: string;
  interests?: string[];
  notes?: { content: string; date: string }[];
  isAlive: boolean;
  customFields?: { fieldName: string; fieldValue: any }[];
  parents?: {
    _id: string;
    fullName: string;
    profilePhoto?: string;
  }[];
  children?: {
    _id: string;
    fullName: string;
    profilePhoto?: string;
  }[];
  siblings?: {
    _id: string;
    fullName: string;
    profilePhoto?: string;
  }[];
  spouses?: {
    person: {
      _id: string;
      fullName: string;
      profilePhoto?: string;
    };
    marriageDate?: string;
    divorceDate?: string;
    isCurrentSpouse: boolean;
  }[];
}

const PersonDetail: React.FC = () => {
  const { personId } = useParams<{ personId: string }>();
  const navigate = useNavigate();
  
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Cargar datos de la persona
  useEffect(() => {
    const fetchPersonData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/persons/${personId}`);
        setPerson(response.data.data);
      } catch (err: any) {
        console.error('Error al cargar los datos de la persona:', err);
        setError(err.response?.data?.message || 'Error al cargar los datos. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPersonData();
  }, [personId]);
  
  // Manejar cambio de pestaña
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Navegar a la página de edición
  const handleEdit = () => {
    navigate(`/person/edit/${personId}`);
  };
  
  // Eliminar persona
  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta persona? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await axios.delete(`/api/persons/${personId}`);
      navigate('/dashboard?tab=persons');
    } catch (err: any) {
      console.error('Error al eliminar la persona:', err);
      setError(err.response?.data?.message || 'Error al eliminar la persona. Por favor, intenta de nuevo.');
    }
  };
  
  // Navegar a la página de detalle de otra persona
  const handlePersonClick = (id: string) => {
    navigate(`/person/${id}`);
  };
  
  // Actualizar foto de perfil
  const handleProfilePhotoUpdate = (files: any[]) => {
    if (files.length > 0) {
      setPerson(prev => prev ? { ...prev, profilePhoto: files[0].fileUrl } : null);
    }
  };
  
  // Actualizar fotos
  const handlePhotosUpdate = (files: any[]) => {
    if (files.length > 0) {
      setPerson(prev => prev ? { 
        ...prev, 
        photos: [...(prev.photos || []), ...files] 
      } : null);
    }
  };
  
  // Actualizar documentos
  const handleDocumentsUpdate = (files: any[]) => {
    if (files.length > 0) {
      setPerson(prev => prev ? { 
        ...prev, 
        documents: [...(prev.documents || []), ...files] 
      } : null);
    }
  };
  
  // Eliminar foto
  const handleDeletePhoto = (photoId: string) => {
    setPerson(prev => prev ? {
      ...prev,
      photos: prev.photos?.filter(photo => photo._id !== photoId)
    } : null);
  };
  
  // Eliminar documento
  const handleDeleteDocument = (documentId: string) => {
    setPerson(prev => prev ? {
      ...prev,
      documents: prev.documents?.filter(doc => doc._id !== documentId)
    } : null);
  };
  
  // Formatear fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'PPP', { locale: es });
  };
  
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (error || !person) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'No se pudo cargar la información de la persona.'}
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        {/* Encabezado con foto de perfil y acciones */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={person.profilePhoto}
            alt={person.fullName}
            sx={{ width: 100, height: 100, mr: 3 }}
          >
            {!person.profilePhoto && <PersonIcon sx={{ fontSize: 60 }} />}
          </Avatar>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {person.fullName}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {person.birthDate && formatDate(person.birthDate)}
              {person.deathDate && ` - ${formatDate(person.deathDate)}`}
              {person.isAlive && ' (Vivo/a)'}
            </Typography>
          </Box>
          
          <Box>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{ mr: 1 }}
            >
              Editar
            </Button>
            <IconButton color="error" onClick={handleDelete}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Pestañas */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Información" />
          <Tab label="Relaciones" />
          <Tab label="Fotos" />
          <Tab label="Documentos" />
          <Tab label="Notas" />
        </Tabs>
        
        {/* Pestaña de Información */}
        <Box hidden={tabValue !== 0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Información Personal
              </Typography>
              
              <List>
                {person.birthDate && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <EventIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Fecha de Nacimiento"
                      secondary={formatDate(person.birthDate)}
                    />
                  </ListItem>
                )}
                
                {person.deathDate && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <EventIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Fecha de Fallecimiento"
                      secondary={formatDate(person.deathDate)}
                    />
                  </ListItem>
                )}
                
                {(person.birthPlace?.city || person.birthPlace?.country) && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <LocationIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Lugar de Nacimiento"
                      secondary={`${person.birthPlace.city || ''} ${person.birthPlace.country ? (person.birthPlace.city ? ', ' : '') + person.birthPlace.country : ''}`}
                    />
                  </ListItem>
                )}
                
                {(person.currentResidence?.city || person.currentResidence?.country) && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <LocationIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Residencia Actual"
                      secondary={`${person.currentResidence.city || ''} ${person.currentResidence.country ? (person.currentResidence.city ? ', ' : '') + person.currentResidence.country : ''}`}
                    />
                  </ListItem>
                )}
                
                {person.occupation && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <WorkIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Profesión u Ocupación"
                      secondary={person.occupation}
                    />
                  </ListItem>
                )}
                
                {person.ethnicity && (
                  <ListItem>
                    <ListItemText
                      primary="Origen Étnico/Cultural"
                      secondary={person.ethnicity}
                    />
                  </ListItem>
                )}
                
                {person.maritalStatus && (
                  <ListItem>
                    <ListItemText
                      primary="Estado Civil"
                      secondary={person.maritalStatus.charAt(0).toUpperCase() + person.maritalStatus.slice(1)}
                    />
                  </ListItem>
                )}
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Información de Contacto
              </Typography>
              
              <List>
                {person.contactInfo?.phoneNumbers && person.contactInfo.phoneNumbers.length > 0 && (
                  person.contactInfo.phoneNumbers.map((phone, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar>
                          <PhoneIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={phone.label}
                        secondary={phone.type}
                      />
                    </ListItem>
                  ))
                )}
                
                {person.contactInfo?.email && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <EmailIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Correo Electrónico"
                      secondary={person.contactInfo.email}
                    />
                  </ListItem>
                )}
                
                {person.contactInfo?.address && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <HomeIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Dirección"
                      secondary={person.contactInfo.address}
                    />
                  </ListItem>
                )}
              </List>
              
              {person.interests && person.interests.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Intereses y Aficiones
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {person.interests.map((interest, index) => (
                      <Chip key={index} label={interest} />
                    ))}
                  </Box>
                </>
              )}
              
              {person.customFields && person.customFields.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Campos Personalizados
                  </Typography>
                  <List>
                    {person.customFields.map((field, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={field.fieldName}
                          secondary={field.fieldValue}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Grid>
          </Grid>
        </Box>
        
        {/* Pestaña de Relaciones */}
        <Box hidden={tabValue !== 1}>
          <Grid container spacing={3}>
            {person.parents && person.parents.length > 0 && (
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Padres
                </Typography>
                <List>
                  {person.parents.map((parent) => (
                    <ListItem 
                      key={parent._id} 
                      button 
                      onClick={() => handlePersonClick(parent._id)}
                    >
                      <ListItemAvatar>
                        <Avatar src={parent.profilePhoto}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={parent.fullName} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
            
            {person.siblings && person.siblings.length > 0 && (
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Hermanos
                </Typography>
                <List>
                  {person.siblings.map((sibling) => (
                    <ListItem 
                      key={sibling._id} 
                      button 
                      onClick={() => handlePersonClick(sibling._id)}
                    >
                      <ListItemAvatar>
                        <Avatar src={sibling.profilePhoto}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={sibling.fullName} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
            
            {person.spouses && person.spouses.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Cónyuges
                </Typography>
                <List>
                  {person.spouses.map((spouse) => (
                    <ListItem 
                      key={spouse.person._id} 
                      button 
                      onClick={() => handlePersonClick(spouse.person._id)}
                    >
                      <ListItemAvatar>
                        <Avatar src={spouse.person.profilePhoto}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={spouse.person.fullName} 
                        secondary={
                          <>
                            {spouse.isCurrentSpouse ? 'Cónyuge actual' : 'Ex-cónyuge'}
                            {spouse.marriageDate && ` • Matrimonio: ${formatDate(spouse.marriageDate)}`}
                            {spouse.divorceDate && ` • Divorcio: ${formatDate(spouse.divorceDate)}`}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
            
            {person.children && person.children.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Hijos
                </Typography>
                <List>
                  {person.children.map((child) => (
                    <ListItem 
                      key={child._id} 
                      button 
                      onClick={() => handlePersonClick(child._id)}
                    >
                      <ListItemAvatar>
                        <Avatar src={child.profilePhoto}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={child.fullName} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
            
            {(!person.parents || person.parents.length === 0) &&
             (!person.siblings || person.siblings.length === 0) &&
             (!person.spouses || person.spouses.length === 0) &&
             (!person.children || person.children.length === 0) && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No hay relaciones familiares registradas
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={handleEdit}
                    sx={{ mt: 2 }}
                  >
                    Agregar relaciones
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
        
        {/* Pestaña de Fotos */}
        <Box hidden={tabValue !== 2}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Foto de Perfil
            </Typography>
            {person.profilePhoto ? (
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  component="img"
                  src={person.profilePhoto}
                  alt={person.fullName}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 300,
                    borderRadius: 2
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body1" color="text.secondary">
                  No hay foto de perfil
                </Typography>
              </Box>
            )}
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Actualizar foto de perfil
              </Typography>
              <MediaUploader
                personId={person._id}
                mediaType="profilePhoto"
                onUploadSuccess={handleProfilePhotoUpdate}
              />
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box>
            <Typography variant="h6" gutterBottom>
              Galería de Fotos
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Subir nuevas fotos
              </Typography>
              <MediaUploader
                personId={person._id}
                mediaType="photos"
                onUploadSuccess={handlePhotosUpdate}
              />
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <MediaGallery
                personId={person._id}
                mediaType="photos"
                items={person.photos || []}
                onDelete={handleDeletePhoto}
              />
            </Box>
          </Box>
        </Box>
        
        {/* Pestaña de Documentos */}
        <Box hidden={tabValue !== 3}>
          <Typography variant="h6" gutterBottom>
            Documentos
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Subir nuevos documentos
            </Typography>
            <MediaUploader
              personId={person._id}
              mediaType="documents"
              onUploadSuccess={handleDocumentsUpdate}
            />
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <MediaGallery
              personId={person._id}
              mediaType="documents"
              items={person.documents || []}
              onDelete={handleDeleteDocument}
            />
          </Box>
        </Box>
        
        {/* Pestaña de Notas */}
        <Box hidden={tabValue !== 4}>
          <Typography variant="h6" gutterBottom>
            Notas y Anécdotas
          </Typography>
          
          {person.notes && person.notes.length > 0 ? (
            person.notes.map((note, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: '#f9f9f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  <NoteIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(note.date)}
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {note.content}
                </Typography>
              </Paper>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No hay notas registradas
              </Typography>
              <Button
                variant="outlined"
                onClick={handleEdit}
                sx={{ mt: 2 }}
              >
                Agregar notas
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default PersonDetail;