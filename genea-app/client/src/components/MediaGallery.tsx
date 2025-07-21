import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ZoomIn as ZoomInIcon,
  Description as DocumentIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import axios from 'axios';

interface MediaItem {
  _id: string;
  url: string;
  caption?: string;
  title?: string;
  type?: string;
  date?: string;
}

interface MediaGalleryProps {
  personId: string;
  mediaType: 'photos' | 'documents';
  items: MediaItem[];
  onDelete: (itemId: string) => void;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ personId, mediaType, items, onDelete }) => {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Abrir diálogo para ver el elemento en detalle
  const handleOpenDialog = (item: MediaItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  // Cerrar diálogo
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedItem(null);
  };

  // Eliminar un elemento
  const handleDelete = async (itemId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await axios.delete(`/api/media/${personId}/${mediaType}/${itemId}`);
      
      onDelete(itemId);
    } catch (err: any) {
      console.error(`Error al eliminar ${mediaType === 'photos' ? 'foto' : 'documento'}:`, err);
      setError(err.response?.data?.message || `Error al eliminar ${mediaType === 'photos' ? 'la foto' : 'el documento'}.`);
    } finally {
      setLoading(false);
    }
  };

  // Descargar un documento
  const handleDownload = (item: MediaItem) => {
    const link = document.createElement('a');
    link.href = item.url;
    link.download = item.title || `documento-${item._id}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Formatear fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          {mediaType === 'photos' 
            ? 'No hay fotos disponibles' 
            : 'No hay documentos disponibles'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      
      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {mediaType === 'photos' || item.url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <CardMedia
                  component="img"
                  height="160"
                  image={item.url}
                  alt={item.caption || item.title || 'Imagen'}
                  sx={{ objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => handleOpenDialog(item)}
                />
              ) : (
                <Box
                  sx={{
                    height: 160,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f5f5f5',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleOpenDialog(item)}
                >
                  <DocumentIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                </Box>
              )}
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" component="div" gutterBottom noWrap>
                  {mediaType === 'photos' ? (item.caption || 'Sin descripción') : (item.title || 'Sin título')}
                </Typography>
                
                {mediaType === 'documents' && item.type && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Tipo: {item.type}
                  </Typography>
                )}
                
                {item.date && (
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(item.date)}
                  </Typography>
                )}
              </CardContent>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                <Tooltip title="Ver detalle">
                  <IconButton onClick={() => handleOpenDialog(item)}>
                    <ZoomInIcon />
                  </IconButton>
                </Tooltip>
                
                {mediaType === 'documents' && (
                  <Tooltip title="Descargar">
                    <IconButton onClick={() => handleDownload(item)}>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                )}
                
                <Tooltip title="Eliminar">
                  <IconButton color="error" onClick={() => handleDelete(item._id)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Diálogo para ver el elemento en detalle */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedItem && (
          <>
            <DialogContent>
              {mediaType === 'photos' || selectedItem.url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <Box
                  component="img"
                  src={selectedItem.url}
                  alt={selectedItem.caption || selectedItem.title || 'Imagen'}
                  sx={{
                    width: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <Box sx={{ height: '70vh', width: '100%' }}>
                  <iframe
                    src={selectedItem.url}
                    title={selectedItem.title || 'Documento'}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                  />
                </Box>
              )}
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {mediaType === 'photos' ? (selectedItem.caption || 'Sin descripción') : (selectedItem.title || 'Sin título')}
                </Typography>
                
                {mediaType === 'documents' && selectedItem.type && (
                  <Typography variant="body1" gutterBottom>
                    Tipo: {selectedItem.type}
                  </Typography>
                )}
                
                {selectedItem.date && (
                  <Typography variant="body2" color="text.secondary">
                    Fecha: {formatDate(selectedItem.date)}
                  </Typography>
                )}
              </Box>
            </DialogContent>
            
            <DialogActions>
              {mediaType === 'documents' && (
                <Button onClick={() => handleDownload(selectedItem)} startIcon={<DownloadIcon />}>
                  Descargar
                </Button>
              )}
              
              <Button onClick={handleCloseDialog}>
                Cerrar
              </Button>
              
              <Button 
                color="error" 
                startIcon={<DeleteIcon />}
                onClick={() => {
                  handleDelete(selectedItem._id);
                  handleCloseDialog();
                }}
              >
                Eliminar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MediaGallery;