import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DeveloperInfo from '../../components/DeveloperInfo';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Settings as SettingsIcon, 
  Security, 
  Notifications, 
  Delete,
  Warning
} from '@mui/icons-material';

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    familyInvitations: true,
    treeUpdates: false,
    darkMode: false,
    language: 'es'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSettingChange = (name) => (event) => {
    setSettings(prev => ({
      ...prev,
      [name]: event.target.checked
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      setTimeout(() => {
        setSuccess('Contraseña actualizada correctamente');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Error al cambiar la contraseña');
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      setError('Error al eliminar la cuenta');
    }
    setDeleteDialogOpen(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <SettingsIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" gutterBottom>
            Configuración
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Personaliza tu experiencia en Genea
          </Typography>
        </Box>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Notificaciones */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Notifications sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Notificaciones</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={handleSettingChange('emailNotifications')}
                  />
                }
                label="Notificaciones por email"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.familyInvitations}
                    onChange={handleSettingChange('familyInvitations')}
                  />
                }
                label="Invitaciones familiares"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.treeUpdates}
                    onChange={handleSettingChange('treeUpdates')}
                  />
                }
                label="Actualizaciones del árbol"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Seguridad */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Security sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Seguridad</Typography>
          </Box>
          
          <Typography variant="subtitle2" gutterBottom>
            Cambiar contraseña
          </Typography>
          
          <form onSubmit={handlePasswordSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="Contraseña actual"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="password"
                  label="Nueva contraseña"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="password"
                  label="Confirmar contraseña"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="outlined"
                  disabled={loading}
                  size="small"
                >
                  {loading ? 'Cambiando...' : 'Cambiar contraseña'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Información del desarrollador */}
      <DeveloperInfo variant="sidebar" />

      {/* Zona de peligro */}
      <Card sx={{ mb: 3, border: '1px solid', borderColor: 'error.main' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Warning sx={{ mr: 1, color: 'error.main' }} />
            <Typography variant="h6" color="error">
              Zona de peligro
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, ten cuidado.
          </Typography>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Eliminar cuenta
          </Button>
        </CardContent>
      </Card>

      {/* Dialog de confirmación */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>¿Eliminar cuenta?</DialogTitle>
        <DialogContent>
          <Typography>
            Esta acción no se puede deshacer. Se eliminarán permanentemente todos tus datos.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteAccount} color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Settings;