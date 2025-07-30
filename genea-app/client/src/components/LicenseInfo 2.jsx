import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  TextField,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import axios from 'axios';

const LicenseInfo = ({ open, onClose, familyName }) => {
  const [licenseInfo, setLicenseInfo] = useState(null);
  const [requestForm, setRequestForm] = useState({
    familyName: familyName || '',
    contactEmail: '',
    message: ''
  });
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchLicenseInfo();
    }
  }, [open]);

  const fetchLicenseInfo = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/license/info`);
      setLicenseInfo(response.data.data);
    } catch (error) {
      console.error('Error fetching license info:', error);
    }
  };

  const handleRequestLicense = async () => {
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/license/request`, requestForm);
      alert('Solicitud enviada correctamente. Te contactaremos pronto.');
      setShowRequestForm(false);
      onClose();
    } catch (error) {
      alert('Error al enviar solicitud');
    }
    setLoading(false);
  };

  if (!licenseInfo) return null;

  const isFreeFamily = licenseInfo.freeFamilies.some(freeName => 
    familyName?.toLowerCase().includes(freeName)
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Información de Licencia - Genea
      </DialogTitle>
      <DialogContent>
        {isFreeFamily ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            ¡Felicitaciones! La familia {familyName} tiene acceso gratuito permanente a Genea.
          </Alert>
        ) : (
          <Alert severity="info" sx={{ mb: 2 }}>
            Se requiere licencia para usar Genea con esta familia.
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Planes Disponibles
          </Typography>
          
          {Object.entries(licenseInfo.pricing).map(([planName, plan]) => (
            <Card key={planName} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6" textTransform="capitalize">
                    {planName}
                  </Typography>
                  <Chip 
                    label={plan.price} 
                    color={planName === 'free' ? 'success' : planName === 'trial' ? 'warning' : 'primary'}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Duración: {plan.duration}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Características:
                </Typography>
                <ul>
                  {plan.features.map((feature, index) => (
                    <li key={index}>
                      <Typography variant="body2">{feature}</Typography>
                    </li>
                  ))}
                </ul>
                {plan.note && (
                  <Typography variant="body2" color="primary" fontStyle="italic">
                    {plan.note}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Contacto para Licencias
          </Typography>
          <Typography variant="body2">
            <strong>Desarrollador:</strong> {licenseInfo.contact.developer}
          </Typography>
          <Typography variant="body2">
            <strong>Email:</strong> {licenseInfo.contact.email}
          </Typography>
          <Typography variant="body2">
            <strong>Teléfono:</strong> {licenseInfo.contact.phone}
          </Typography>
        </Box>

        {!isFreeFamily && !showRequestForm && (
          <Button 
            variant="contained" 
            onClick={() => setShowRequestForm(true)}
            fullWidth
          >
            Solicitar Licencia
          </Button>
        )}

        {showRequestForm && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Solicitar Licencia
            </Typography>
            <TextField
              fullWidth
              label="Nombre de la Familia"
              value={requestForm.familyName}
              onChange={(e) => setRequestForm({...requestForm, familyName: e.target.value})}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email de Contacto"
              type="email"
              value={requestForm.contactEmail}
              onChange={(e) => setRequestForm({...requestForm, contactEmail: e.target.value})}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Mensaje (opcional)"
              multiline
              rows={3}
              value={requestForm.message}
              onChange={(e) => setRequestForm({...requestForm, message: e.target.value})}
              margin="normal"
            />
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button 
                variant="contained" 
                onClick={handleRequestLicense}
                disabled={loading || !requestForm.familyName || !requestForm.contactEmail}
              >
                Enviar Solicitud
              </Button>
              <Button onClick={() => setShowRequestForm(false)}>
                Cancelar
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LicenseInfo;