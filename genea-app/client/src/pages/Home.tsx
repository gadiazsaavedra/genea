import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Paper,
  useTheme
} from '@mui/material';
import {
  FamilyRestroom,
  History,
  Share,
  Security
} from '@mui/icons-material';

const Home: React.FC = () => {
  const theme = useTheme();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                Descubre y preserva tu historia familiar
              </Typography>
              <Typography variant="h5" paragraph>
                Genea te ayuda a crear, gestionar y compartir tu árbol genealógico de forma sencilla e intuitiva.
              </Typography>
              <Stack direction="row" spacing={2} mt={4}>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'secondary.main',
                    '&:hover': {
                      bgcolor: 'secondary.dark',
                    },
                    px: 4,
                    py: 1.5
                  }}
                >
                  Comenzar gratis
                </Button>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  size="large"
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                    px: 4,
                    py: 1.5
                  }}
                >
                  Iniciar sesión
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/family-tree-illustration.svg"
                alt="Árbol genealógico"
                sx={{
                  width: '100%',
                  maxWidth: 500,
                  display: 'block',
                  mx: 'auto'
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Características principales
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <FamilyRestroom sx={{ fontSize: 60, color: 'primary.main' }} />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h3" align="center">
                  Árbol interactivo
                </Typography>
                <Typography>
                  Visualiza tu árbol genealógico de forma interactiva, con múltiples vistas y opciones de navegación.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <History sx={{ fontSize: 60, color: 'primary.main' }} />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h3" align="center">
                  Preserva recuerdos
                </Typography>
                <Typography>
                  Guarda fotos, documentos y anécdotas para preservar la historia de tu familia para futuras generaciones.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <Share sx={{ fontSize: 60, color: 'primary.main' }} />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h3" align="center">
                  Colaboración familiar
                </Typography>
                <Typography>
                  Invita a tus familiares a colaborar en la construcción del árbol genealógico compartido.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <Security sx={{ fontSize: 60, color: 'primary.main' }} />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h3" align="center">
                  Privacidad y seguridad
                </Typography>
                <Typography>
                  Control total sobre la privacidad de la información y quién puede acceder a los datos familiares.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Cómo funciona
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 'bold',
                    mb: 2
                  }}
                >
                  1
                </Typography>
                <Typography variant="h5" gutterBottom>
                  Crea tu cuenta
                </Typography>
                <Typography>
                  Regístrate gratis y comienza a construir tu árbol genealógico familiar.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 'bold',
                    mb: 2
                  }}
                >
                  2
                </Typography>
                <Typography variant="h5" gutterBottom>
                  Añade familiares
                </Typography>
                <Typography>
                  Agrega información sobre tus familiares, fotos, documentos y anécdotas.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 'bold',
                    mb: 2
                  }}
                >
                  3
                </Typography>
                <Typography variant="h5" gutterBottom>
                  Comparte y colabora
                </Typography>
                <Typography>
                  Invita a tus familiares a ver y contribuir al árbol genealógico compartido.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: 'secondary.main',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" gutterBottom>
            Comienza a preservar tu historia familiar hoy
          </Typography>
          <Typography variant="h6" paragraph sx={{ mb: 4 }}>
            Únete a miles de familias que ya están documentando y compartiendo su legado con Genea.
          </Typography>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'white',
              color: 'secondary.main',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)',
              },
              px: 4,
              py: 1.5
            }}
          >
            Crear cuenta gratuita
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: 'background.paper',
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                Genea
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tu historia familiar, preservada para siempre.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                Enlaces
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <RouterLink to="/about" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Acerca de nosotros
                </RouterLink>
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <RouterLink to="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Política de privacidad
                </RouterLink>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <RouterLink to="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Términos de servicio
                </RouterLink>
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                Contacto
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Email: <a href="mailto:gadiazsaavedra@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>gadiazsaavedra@gmail.com</a>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                WhatsApp: <a href="https://wa.me/5491149737619" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>+54 11 4973-7619</a>
              </Typography>
            </Grid>
          </Grid>
          <Box mt={5}>
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} Genea. Todos los derechos reservados.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;