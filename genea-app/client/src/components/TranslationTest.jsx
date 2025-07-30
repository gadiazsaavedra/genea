import React from 'react';
import { useTranslation } from 'react-i18next';

const TranslationTest = () => {
  const { t, i18n } = useTranslation();
  
  return (
    <div style={{ position: 'fixed', top: 10, right: 10, background: 'white', padding: '10px', border: '1px solid #ccc', zIndex: 9999 }}>
      <div>Idioma actual: {i18n.language}</div>
      <div>dashboard.welcome: {t('dashboard.welcome')}</div>
      <div>nav.people: {t('nav.people')}</div>
      <button onClick={() => i18n.changeLanguage('pt')}>PT</button>
      <button onClick={() => i18n.changeLanguage('es')}>ES</button>
    </div>
  );
};

export default TranslationTest;