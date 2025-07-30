import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Typography,
  Alert,
  IconButton,
  Chip
} from '@mui/material';
import { Close, Email, WhatsApp, Share } from '@mui/icons-material';

const InvitationForm = ({ open, onClose, familyId, familyName, onInvitationSent }) => {
  const [formData, setFormData] = useState({
    invitedEmail: '',
    invitedPhone: '',
    role: 'member',
    invitationMethod: 'email'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [invitationResult, setInvitationResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          familyId,
          ...formData
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Invitación creada correctamente');
        setInvitationResult(data.data);
        if (onInvitationSent) onInvitationSent(data.data);
      } else {
        setError(data.message || 'Error al crear invitación');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppSend = () => {
    if (invitationResult?.whatsappUrl) {
      window.open(invitationResult.whatsappUrl, '_blank');
    }
  };

  const copyInviteLink = () => {
    if (invitationResult?.inviteUrl) {
      navigator.clipboard.writeText(invitationResult.inviteUrl);
      setSuccess('Enlace copiado al portapapeles');
    }
  };

  const resetForm = () => {
    setFormData({
      invitedEmail: '',
      invitedPhone: '',
      role: 'member',
      invitationMethod: 'email'
    });
    setError('');
    setSuccess('');
    setInvitationResult(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Invitar a {familyName}
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {!invitationResult ? (
          <form onSubmit={handleSubmit}>
            <Box mb={3}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">Método de invitación</FormLabel>
                <RadioGroup
                  name="invitationMethod"
                  value={formData.invitationMethod}
                  onChange={handleChange}
                  row
                >
                  <FormControlLabel value="email" control={<Radio />} label="Email" />
                  <FormControlLabel value="whatsapp" control={<Radio />} label="WhatsApp" />
                  <FormControlLabel value="both" control={<Radio />} label="Ambos" />
                </RadioGroup>
              </FormControl>
            </Box>

            {(formData.invitationMethod === 'email' || formData.invitationMethod === 'both') && (
              <TextField
                fullWidth
                label="Email"
                name="invitedEmail"
                type="email"
                value={formData.invitedEmail}
                onChange={handleChange}
                margin="normal"
                required={formData.invitationMethod !== 'whatsapp'}
              />
            )}

            {(formData.invitationMethod === 'whatsapp' || formData.invitationMethod === 'both') && (
              <TextField
                fullWidth
                label="Número de WhatsApp"
                name="invitedPhone"
                value={formData.invitedPhone}
                onChange={handleChange}
                margin="normal"
                placeholder="+54 11 1234-5678"
                required={formData.invitationMethod !== 'email'}
                helperText="Incluir código de país (ej: +54 para Argentina)"
              />
            )}

            <FormControl fullWidth margin="normal">
              <FormLabel>Rol en la familia</FormLabel>
              <RadioGroup
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <FormControlLabel value="member" control={<Radio />} label="Miembro" />
                <FormControlLabel value="editor" control={<Radio />} label="Editor" />
                <FormControlLabel value="admin" control={<Radio />} label="Administrador" />
              </RadioGroup>
            </FormControl>

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          </form>
        ) : (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              ¡Invitación creada exitosamente!
            </Alert>

            <Typography variant="h6" gutterBottom>
              Opciones para enviar:
            </Typography>

            {invitationResult.invitedEmail && (
              <Box mb={2}>
                <Chip 
                  icon={<Email />} 
                  label="Email enviado automáticamente" 
                  color="success" 
                  variant="outlined" 
                />
              </Box>
            )}

            {invitationResult.whatsappUrl && (
              <Box mb={2}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<WhatsApp />}
                  onClick={handleWhatsAppSend}
                  fullWidth
                >
                  Enviar por WhatsApp
                </Button>
              </Box>
            )}

            <Box mb={2}>
              <Button
                variant="outlined"
                startIcon={<Share />}
                onClick={copyInviteLink}
                fullWidth
              >
                Copiar enlace de invitación
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary">
              El enlace expira en 7 días
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {!invitationResult ? (
          <>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? 'Creando...' : 'Crear Invitación'}
            </Button>
          </>
        ) : (
          <Button onClick={handleClose} variant="contained">
            Cerrar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default InvitationForm;