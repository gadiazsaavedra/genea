import React from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  Box,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const LanguageSelector = ({ variant = 'default' }) => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'es', name: 'Español', flag: '🇦🇷' },
    { code: 'pt', name: 'Português (BR)', flag: '🇧🇷' }
  ];

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  if (variant === 'compact') {
    return (
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <Select
          value={i18n.language}
          onChange={handleLanguageChange}
          displayEmpty
          sx={{
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }
          }}
        >
          {languages.map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>
              <Box display="flex" alignItems="center" gap={1}>
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Idioma / Language
      </Typography>
      <FormControl fullWidth>
        <Select
          value={i18n.language}
          onChange={handleLanguageChange}
          displayEmpty
        >
          {languages.map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>
              <Box display="flex" alignItems="center" gap={2}>
                <span style={{ fontSize: '1.5em' }}>{lang.flag}</span>
                <Box>
                  <Typography variant="body1">{lang.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {lang.code === 'es' ? 'Argentina' : 'Brasil'}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageSelector;