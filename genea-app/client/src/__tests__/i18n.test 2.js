import i18n from '../i18n';

describe('i18n Configuration', () => {
  test('should have Spanish and Portuguese resources', () => {
    const resources = i18n.options.resources;
    
    expect(resources).toHaveProperty('es');
    expect(resources).toHaveProperty('pt');
  });

  test('should have Spanish as fallback language', () => {
    expect(i18n.options.fallbackLng).toBe('es');
  });

  test('should translate navigation keys correctly', () => {
    i18n.changeLanguage('es');
    expect(i18n.t('nav.dashboard')).toBe('Panel');
    expect(i18n.t('nav.families')).toBe('Familias');
    
    i18n.changeLanguage('pt');
    expect(i18n.t('nav.dashboard')).toBe('Painel');
    expect(i18n.t('nav.families')).toBe('Famílias');
  });

  test('should translate auth keys correctly', () => {
    i18n.changeLanguage('es');
    expect(i18n.t('auth.login')).toBe('Iniciar Sesión');
    
    i18n.changeLanguage('pt');
    expect(i18n.t('auth.login')).toBe('Entrar');
  });
});