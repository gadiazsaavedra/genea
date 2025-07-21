import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Divider,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';

// Interfaces
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
  ethnicity?: string;
  maritalStatus?: string;
  occupation?: string;
  interests?: string[];
  notes?: { content: string; date: string }[];
  isAlive: boolean;
  customFields?: { fieldName: string; fieldValue: any }[];
}

interface RelationOption {
  _id: string;
  fullName: string;
}

// Validación del formulario
const validationSchema = yup.object({
  fullName: yup
    .string()
    .required('El nombre completo es obligatorio')
    .max(100, 'El nombre no puede exceder los 100 caracteres'),
  birthDate: yup
    .date()
    .nullable()
    .typeError('Fecha inválida'),
  deathDate: yup
    .date()
    .nullable()
    .typeError('Fecha inválida')
    .test('is-greater', 'La fecha de fallecimiento debe ser posterior a la de nacimiento', 
      function(value) {
        const { birthDate } = this.parent;
        if (!birthDate || !value) return true;
        return new Date(value) > new Date(birthDate);
      }),
  'birthPlace.city': yup
    .string()
    .max(100, 'La ciudad no puede exceder los 100 caracteres'),
  'birthPlace.country': yup
    .string()
    .max(100, 'El país no puede exceder los 100 caracteres'),
  'currentResidence.city': yup
    .string()
    .max(100, 'La ciudad no puede exceder los 100 caracteres'),
  'currentResidence.country': yup
    .string()
    .max(100, 'El país no puede exceder los 100 caracteres'),
  'contactInfo.email': yup
    .string()
    .email('Ingresa un correo electrónico válido')
    .max(100, 'El correo no puede exceder los 100 caracteres'),
  occupation: yup
    .string()
    .max(100, 'La ocupación no puede exceder los 100 caracteres'),
});

const PersonForm: React.FC = () => {
  const { personId } = useParams<{ personId: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(personId);
  
  // Estados
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [availableRelations, setAvailableRelations] = useState<RelationOption[]>([]);
  const [selectedParents, setSelectedParents] = useState<RelationOption[]>([]);
  const [selectedChildren, setSelectedChildren] = useState<RelationOption[]>([]);
  const [selectedSiblings, setSelectedSiblings] = useState<RelationOption[]>([]);
  const [selectedSpouses, setSelectedSpouses] = useState<{
    person: RelationOption;
    marriageDate?: Date;
    divorceDate?: Date;
    isCurrentSpouse: boolean;
  }[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<{ number: string; label: string }[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [notes, setNotes] = useState<{ content: string; date: Date }[]>([]);
  const [customFields, setCustomFields] = useState<{ fieldName: string; fieldValue: string }[]>([]);
  
  // Formik para manejar el formulario
  const formik = useFormik({
    initialValues: {
      fullName: '',
      birthDate: null as Date | null,
      deathDate: null as Date | null,
      isAlive: true,
      'birthPlace.city': '',
      'birthPlace.country': '',
      'currentResidence.city': '',
      'currentResidence.country': '',
      'contactInfo.email': '',
      'contactInfo.address': '',
      ethnicity: '',
      maritalStatus: '',
      occupation: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
        // Construir el objeto de persona
        const personData = {
          fullName: values.fullName,
          birthDate: values.birthDate,
          deathDate: values.deathDate,
          isAlive: values.isAlive,
          birthPlace: {
            city: values['birthPlace.city'],
            country: values['birthPlace.country']
          },
          currentResidence: {
            city: values['currentResidence.city'],
            country: values['currentResidence.country']
          },
          contactInfo: {
            phoneNumbers: phoneNumbers.map(p => ({ type: p.number, label: p.label })),
            email: values['contactInfo.email'],
            address: values['contactInfo.address']
          },
          ethnicity: values.ethnicity,
          maritalStatus: values.maritalStatus,
          occupation: values.occupation,
          interests: interests,
          notes: notes.map(n => ({ content: n.content, date: n.date })),
          customFields: customFields
        };
        
        let response;
        
        if (isEditMode) {
          // Actualizar persona existente
          response = await axios.put(`/api/persons/${personId}`, personData);
          
          // Actualizar relaciones
          await updateRelations(personId as string);
        } else {
          // Crear nueva persona
          response = await axios.post('/api/persons', personData);
          
          // Crear relaciones para la nueva persona
          if (response.data.data._id) {
            await updateRelations(response.data.data._id);
          }
        }
        
        // Navegar a la página de detalle de la persona
        navigate(`/person/${isEditMode ? personId : response.data.data._id}`);
      } catch (err: any) {
        console.error('Error al guardar la persona:', err);
        setError(err.response?.data?.message || 'Error al guardar los datos. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    },
  });
  
  // Función para actualizar relaciones
  const updateRelations = async (personId: string) => {
    try {
      // Actualizar padres
      for (const parent of selectedParents) {
        await axios.post('/api/persons/relation', {
          personId: personId,
          relatedPersonId: parent._id,
          relationType: 'parent'
        });
      }
      
      // Actualizar hijos
      for (const child of selectedChildren) {
        await axios.post('/api/persons/relation', {
          personId: personId,
          relatedPersonId: child._id,
          relationType: 'child'
        });
      }
      
      // Actualizar hermanos
      for (const sibling of selectedSiblings) {
        await axios.post('/api/persons/relation', {
          personId: personId,
          relatedPersonId: sibling._id,
          relationType: 'sibling'
        });
      }
      
      // Actualizar cónyuges
      for (const spouse of selectedSpouses) {
        await axios.post('/api/persons/relation', {
          personId: personId,
          relatedPersonId: spouse.person._id,
          relationType: 'spouse',
          marriageDate: spouse.marriageDate,
          divorceDate: spouse.divorceDate,
          isCurrentSpouse: spouse.isCurrentSpouse
        });
      }
    } catch (err) {
      console.error('Error al actualizar relaciones:', err);
      throw err;
    }
  };
  
  // Cargar datos de la persona si estamos en modo edición
  useEffect(() => {
    const fetchPersonData = async () => {
      if (!isEditMode) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`/api/persons/${personId}`);
        const person = response.data.data;
        
        // Actualizar el formulario con los datos de la persona
        formik.setValues({
          fullName: person.fullName || '',
          birthDate: person.birthDate ? new Date(person.birthDate) : null,
          deathDate: person.deathDate ? new Date(person.deathDate) : null,
          isAlive: person.isAlive !== undefined ? person.isAlive : true,
          'birthPlace.city': person.birthPlace?.city || '',
          'birthPlace.country': person.birthPlace?.country || '',
          'currentResidence.city': person.currentResidence?.city || '',
          'currentResidence.country': person.currentResidence?.country || '',
          'contactInfo.email': person.contactInfo?.email || '',
          'contactInfo.address': person.contactInfo?.address || '',
          ethnicity: person.ethnicity || '',
          maritalStatus: person.maritalStatus || '',
          occupation: person.occupation || '',
        });
        
        // Actualizar otros estados
        if (person.contactInfo?.phoneNumbers) {
          setPhoneNumbers(person.contactInfo.phoneNumbers.map((p: any) => ({
            number: p.type,
            label: p.label
          })));
        }
        
        if (person.interests) {
          setInterests(person.interests);
        }
        
        if (person.notes) {
          setNotes(person.notes.map((n: any) => ({
            content: n.content,
            date: new Date(n.date)
          })));
        }
        
        if (person.customFields) {
          setCustomFields(person.customFields);
        }
        
        // Cargar relaciones
        if (person.parents) {
          setSelectedParents(person.parents.map((p: any) => ({
            _id: p._id,
            fullName: p.fullName
          })));
        }
        
        if (person.children) {
          setSelectedChildren(person.children.map((c: any) => ({
            _id: c._id,
            fullName: c.fullName
          })));
        }
        
        if (person.siblings) {
          setSelectedSiblings(person.siblings.map((s: any) => ({
            _id: s._id,
            fullName: s.fullName
          })));
        }
        
        if (person.spouses) {
          setSelectedSpouses(person.spouses.map((s: any) => ({
            person: {
              _id: s.person._id,
              fullName: s.person.fullName
            },
            marriageDate: s.marriageDate ? new Date(s.marriageDate) : undefined,
            divorceDate: s.divorceDate ? new Date(s.divorceDate) : undefined,
            isCurrentSpouse: s.isCurrentSpouse || false
          })));
        }
      } catch (err: any) {
        console.error('Error al cargar los datos de la persona:', err);
        setError(err.response?.data?.message || 'Error al cargar los datos. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPersonData();
  }, [isEditMode, personId]);
  
  // Cargar personas disponibles para relaciones
  useEffect(() => {
    const fetchAvailablePersons = async () => {
      try {
        const response = await axios.get('/api/persons');
        // Filtrar la persona actual si estamos en modo edición
        const persons = isEditMode
          ? response.data.data.filter((p: any) => p._id !== personId)
          : response.data.data;
          
        setAvailableRelations(persons.map((p: any) => ({
          _id: p._id,
          fullName: p.fullName
        })));
      } catch (err) {
        console.error('Error al cargar personas disponibles:', err);
      }
    };
    
    fetchAvailablePersons();
  }, [isEditMode, personId]);
  
  // Manejar cambio de pestaña
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Funciones para manejar teléfonos
  const handleAddPhone = () => {
    setPhoneNumbers([...phoneNumbers, { number: '', label: 'Móvil' }]);
  };
  
  const handleRemovePhone = (index: number) => {
    const newPhones = [...phoneNumbers];
    newPhones.splice(index, 1);
    setPhoneNumbers(newPhones);
  };
  
  const handlePhoneChange = (index: number, field: 'number' | 'label', value: string) => {
    const newPhones = [...phoneNumbers];
    newPhones[index][field] = value;
    setPhoneNumbers(newPhones);
  };
  
  // Funciones para manejar intereses
  const handleAddInterest = (interest: string) => {
    if (interest && !interests.includes(interest)) {
      setInterests([...interests, interest]);
    }
  };
  
  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };
  
  // Funciones para manejar notas
  const handleAddNote = () => {
    setNotes([...notes, { content: '', date: new Date() }]);
  };
  
  const handleRemoveNote = (index: number) => {
    const newNotes = [...notes];
    newNotes.splice(index, 1);
    setNotes(newNotes);
  };
  
  const handleNoteChange = (index: number, field: 'content' | 'date', value: string | Date) => {
    const newNotes = [...notes];
    newNotes[index][field] = value;
    setNotes(newNotes);
  };
  
  // Funciones para manejar campos personalizados
  const handleAddCustomField = () => {
    setCustomFields([...customFields, { fieldName: '', fieldValue: '' }]);
  };
  
  const handleRemoveCustomField = (index: number) => {
    const newFields = [...customFields];
    newFields.splice(index, 1);
    setCustomFields(newFields);
  };
  
  const handleCustomFieldChange = (index: number, field: 'fieldName' | 'fieldValue', value: string) => {
    const newFields = [...customFields];
    newFields[index][field] = value;
    setCustomFields(newFields);
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {isEditMode ? 'Editar Persona' : 'Agregar Nueva Persona'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={formik.handleSubmit} noValidate>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Información Básica" />
            <Tab label="Contacto" />
            <Tab label="Relaciones" />
            <Tab label="Notas y Extras" />
          </Tabs>
          
          {/* Pestaña de Información Básica */}
          <Box hidden={tabValue !== 0}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="fullName"
                  name="fullName"
                  label="Nombre Completo"
                  value={formik.values.fullName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                  helperText={formik.touched.fullName && formik.errors.fullName}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <DatePicker
                    label="Fecha de Nacimiento"
                    value={formik.values.birthDate}
                    onChange={(date) => formik.setFieldValue('birthDate', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: formik.touched.birthDate && Boolean(formik.errors.birthDate),
                        helperText: formik.touched.birthDate && formik.errors.birthDate as string
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="isAlive-label">¿Está vivo?</InputLabel>
                  <Select
                    labelId="isAlive-label"
                    id="isAlive"
                    name="isAlive"
                    value={formik.values.isAlive}
                    onChange={(e) => {
                      formik.setFieldValue('isAlive', e.target.value);
                      if (e.target.value === true) {
                        formik.setFieldValue('deathDate', null);
                      }
                    }}
                    label="¿Está vivo?"
                  >
                    <MenuItem value={true}>Sí</MenuItem>
                    <MenuItem value={false}>No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {!formik.values.isAlive && (
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <DatePicker
                      label="Fecha de Fallecimiento"
                      value={formik.values.deathDate}
                      onChange={(date) => formik.setFieldValue('deathDate', date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: formik.touched.deathDate && Boolean(formik.errors.deathDate),
                          helperText: formik.touched.deathDate && formik.errors.deathDate as string
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Lugar de Nacimiento
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="birthPlace.city"
                  name="birthPlace.city"
                  label="Ciudad"
                  value={formik.values['birthPlace.city']}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched['birthPlace.city'] && Boolean(formik.errors['birthPlace.city'])}
                  helperText={formik.touched['birthPlace.city'] && formik.errors['birthPlace.city']}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="birthPlace.country"
                  name="birthPlace.country"
                  label="País"
                  value={formik.values['birthPlace.country']}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched['birthPlace.country'] && Boolean(formik.errors['birthPlace.country'])}
                  helperText={formik.touched['birthPlace.country'] && formik.errors['birthPlace.country']}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Residencia Actual
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="currentResidence.city"
                  name="currentResidence.city"
                  label="Ciudad"
                  value={formik.values['currentResidence.city']}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched['currentResidence.city'] && Boolean(formik.errors['currentResidence.city'])}
                  helperText={formik.touched['currentResidence.city'] && formik.errors['currentResidence.city']}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="currentResidence.country"
                  name="currentResidence.country"
                  label="País"
                  value={formik.values['currentResidence.country']}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched['currentResidence.country'] && Boolean(formik.errors['currentResidence.country'])}
                  helperText={formik.touched['currentResidence.country'] && formik.errors['currentResidence.country']}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="ethnicity"
                  name="ethnicity"
                  label="Origen Étnico/Cultural"
                  value={formik.values.ethnicity}
                  onChange={formik.handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="maritalStatus-label">Estado Civil</InputLabel>
                  <Select
                    labelId="maritalStatus-label"
                    id="maritalStatus"
                    name="maritalStatus"
                    value={formik.values.maritalStatus}
                    onChange={formik.handleChange}
                    label="Estado Civil"
                  >
                    <MenuItem value="soltero">Soltero/a</MenuItem>
                    <MenuItem value="casado">Casado/a</MenuItem>
                    <MenuItem value="divorciado">Divorciado/a</MenuItem>
                    <MenuItem value="viudo">Viudo/a</MenuItem>
                    <MenuItem value="otro">Otro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="occupation"
                  name="occupation"
                  label="Profesión u Ocupación"
                  value={formik.values.occupation}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.occupation && Boolean(formik.errors.occupation)}
                  helperText={formik.touched.occupation && formik.errors.occupation}
                />
              </Grid>
            </Grid>
          </Box>
          
          {/* Pestaña de Contacto */}
          <Box hidden={tabValue !== 1}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="contactInfo.email"
                  name="contactInfo.email"
                  label="Correo Electrónico"
                  value={formik.values['contactInfo.email']}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched['contactInfo.email'] && Boolean(formik.errors['contactInfo.email'])}
                  helperText={formik.touched['contactInfo.email'] && formik.errors['contactInfo.email']}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="contactInfo.address"
                  name="contactInfo.address"
                  label="Dirección Postal"
                  value={formik.values['contactInfo.address']}
                  onChange={formik.handleChange}
                  multiline
                  rows={2}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">
                    Números de Teléfono
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddPhone}
                    size="small"
                  >
                    Agregar Teléfono
                  </Button>
                </Box>
                
                {phoneNumbers.map((phone, index) => (
                  <Box key={index} sx={{ display: 'flex', mb: 2, gap: 2 }}>
                    <TextField
                      sx={{ flexGrow: 1 }}
                      label="Número"
                      value={phone.number}
                      onChange={(e) => handlePhoneChange(index, 'number', e.target.value)}
                    />
                    <FormControl sx={{ width: '30%' }}>
                      <InputLabel>Tipo</InputLabel>
                      <Select
                        value={phone.label}
                        onChange={(e) => handlePhoneChange(index, 'label', e.target.value)}
                        label="Tipo"
                      >
                        <MenuItem value="Móvil">Móvil</MenuItem>
                        <MenuItem value="Casa">Casa</MenuItem>
                        <MenuItem value="Trabajo">Trabajo</MenuItem>
                        <MenuItem value="Otro">Otro</MenuItem>
                      </Select>
                    </FormControl>
                    <IconButton 
                      color="error" 
                      onClick={() => handleRemovePhone(index)}
                      sx={{ alignSelf: 'center' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Grid>
            </Grid>
          </Box>
          
          {/* Pestaña de Relaciones */}
          <Box hidden={tabValue !== 2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Padres
                </Typography>
                <Autocomplete
                  multiple
                  id="parents"
                  options={availableRelations}
                  getOptionLabel={(option) => option.fullName}
                  value={selectedParents}
                  onChange={(event, newValue) => {
                    setSelectedParents(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Seleccionar padres"
                      placeholder="Buscar persona..."
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option.fullName}
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Hijos
                </Typography>
                <Autocomplete
                  multiple
                  id="children"
                  options={availableRelations}
                  getOptionLabel={(option) => option.fullName}
                  value={selectedChildren}
                  onChange={(event, newValue) => {
                    setSelectedChildren(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Seleccionar hijos"
                      placeholder="Buscar persona..."
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Hermanos
                </Typography>
                <Autocomplete
                  multiple
                  id="siblings"
                  options={availableRelations}
                  getOptionLabel={(option) => option.fullName}
                  value={selectedSiblings}
                  onChange={(event, newValue) => {
                    setSelectedSiblings(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Seleccionar hermanos"
                      placeholder="Buscar persona..."
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">
                    Cónyuges
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setSelectedSpouses([
                        ...selectedSpouses,
                        { person: { _id: '', fullName: '' }, isCurrentSpouse: true }
                      ]);
                    }}
                    size="small"
                  >
                    Agregar Cónyuge
                  </Button>
                </Box>
                
                {selectedSpouses.map((spouse, index) => (
                  <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Autocomplete
                          id={`spouse-${index}`}
                          options={availableRelations}
                          getOptionLabel={(option) => option.fullName}
                          value={spouse.person._id ? spouse.person : null}
                          onChange={(event, newValue) => {
                            const newSpouses = [...selectedSpouses];
                            newSpouses[index].person = newValue || { _id: '', fullName: '' };
                            setSelectedSpouses(newSpouses);
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="outlined"
                              label="Seleccionar cónyuge"
                              placeholder="Buscar persona..."
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                          <DatePicker
                            label="Fecha de Matrimonio"
                            value={spouse.marriageDate || null}
                            onChange={(date) => {
                              const newSpouses = [...selectedSpouses];
                              newSpouses[index].marriageDate = date || undefined;
                              setSelectedSpouses(newSpouses);
                            }}
                            slotProps={{
                              textField: { fullWidth: true }
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                          <DatePicker
                            label="Fecha de Divorcio"
                            value={spouse.divorceDate || null}
                            onChange={(date) => {
                              const newSpouses = [...selectedSpouses];
                              newSpouses[index].divorceDate = date || undefined;
                              if (date) {
                                newSpouses[index].isCurrentSpouse = false;
                              }
                              setSelectedSpouses(newSpouses);
                            }}
                            slotProps={{
                              textField: { fullWidth: true }
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <InputLabel>Estado</InputLabel>
                          <Select
                            value={spouse.isCurrentSpouse}
                            onChange={(e) => {
                              const newSpouses = [...selectedSpouses];
                              newSpouses[index].isCurrentSpouse = e.target.value as boolean;
                              if (e.target.value === true) {
                                newSpouses[index].divorceDate = undefined;
                              }
                              setSelectedSpouses(newSpouses);
                            }}
                            label="Estado"
                          >
                            <MenuItem value={true}>Cónyuge actual</MenuItem>
                            <MenuItem value={false}>Ex-cónyuge</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Button
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => {
                            const newSpouses = [...selectedSpouses];
                            newSpouses.splice(index, 1);
                            setSelectedSpouses(newSpouses);
                          }}
                        >
                          Eliminar
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Grid>
            </Grid>
          </Box>
          
          {/* Pestaña de Notas y Extras */}
          <Box hidden={tabValue !== 3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">
                    Intereses o Aficiones
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {interests.map((interest, index) => (
                    <Chip
                      key={index}
                      label={interest}
                      onDelete={() => handleRemoveInterest(interest)}
                    />
                  ))}
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    id="new-interest"
                    label="Nuevo interés"
                    size="small"
                    sx={{ flexGrow: 1 }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const target = e.target as HTMLInputElement;
                        handleAddInterest(target.value);
                        target.value = '';
                      }
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => {
                      const input = document.getElementById('new-interest') as HTMLInputElement;
                      handleAddInterest(input.value);
                      input.value = '';
                    }}
                  >
                    Agregar
                  </Button>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">
                    Notas y Anécdotas
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddNote}
                    size="small"
                  >
                    Agregar Nota
                  </Button>
                </Box>
                
                {notes.map((note, index) => (
                  <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Contenido"
                          value={note.content}
                          onChange={(e) => handleNoteChange(index, 'content', e.target.value)}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                          <DatePicker
                            label="Fecha"
                            value={note.date}
                            onChange={(date) => handleNoteChange(index, 'date', date || new Date())}
                            slotProps={{
                              textField: { fullWidth: true }
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Button
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleRemoveNote(index)}
                        >
                          Eliminar
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">
                    Campos Personalizados
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddCustomField}
                    size="small"
                  >
                    Agregar Campo
                  </Button>
                </Box>
                
                {customFields.map((field, index) => (
                  <Box key={index} sx={{ display: 'flex', mb: 2, gap: 2 }}>
                    <TextField
                      sx={{ width: '40%' }}
                      label="Nombre del campo"
                      value={field.fieldName}
                      onChange={(e) => handleCustomFieldChange(index, 'fieldName', e.target.value)}
                    />
                    <TextField
                      sx={{ flexGrow: 1 }}
                      label="Valor"
                      value={field.fieldValue}
                      onChange={(e) => handleCustomFieldChange(index, 'fieldValue', e.target.value)}
                    />
                    <IconButton 
                      color="error" 
                      onClick={() => handleRemoveCustomField(index)}
                      sx={{ alignSelf: 'center' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Grid>
            </Grid>
          </Box>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </Button>
            
            <Box>
              {tabValue > 0 && (
                <Button
                  sx={{ mr: 1 }}
                  onClick={() => setTabValue(tabValue - 1)}
                >
                  Anterior
                </Button>
              )}
              
              {tabValue < 3 ? (
                <Button
                  variant="contained"
                  onClick={() => setTabValue(tabValue + 1)}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Guardar'}
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default PersonForm;