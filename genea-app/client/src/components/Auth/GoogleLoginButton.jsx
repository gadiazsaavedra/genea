import React, { useState } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { Google } from '@mui/icons-material';
import authService from '../../services/authService';

const GoogleLoginButton = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await authService.loginWithGoogle();
      // Google OAuth redirige automáticamente, no necesitamos manejar success aquí
    } catch (error) {
      console.error('Error con Google login:', error);
      if (onError) {
        onError(error);
      }
      setLoading(false);
    }
  };

  return (
    <Button
      fullWidth
      variant="outlined"
      onClick={handleGoogleLogin}
      disabled={loading}
      sx={{
        py: 1.5,
        border: '2px solid #4285f4',
        color: '#4285f4',
        '&:hover': {
          backgroundColor: '#4285f4',
          color: 'white',
          border: '2px solid #4285f4'
        }
      }}
    >
      <Box display="flex" alignItems="center" gap={1}>
        <Google />
        <Typography variant="button">
          {loading ? 'Conectando...' : 'Continuar con Google'}
        </Typography>
      </Box>
    </Button>
  );
};

export default GoogleLoginButton;