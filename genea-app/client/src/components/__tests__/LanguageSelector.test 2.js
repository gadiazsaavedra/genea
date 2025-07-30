import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSelector from '../LanguageSelector';

// Mock i18n
const mockI18n = {
  language: 'es',
  changeLanguage: jest.fn()
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: mockI18n
  })
}));

describe('LanguageSelector', () => {
  beforeEach(() => {
    mockI18n.changeLanguage.mockClear();
  });

  test('renders language options', () => {
    render(<LanguageSelector />);
    
    expect(screen.getByText('Español')).toBeInTheDocument();
    expect(screen.getByText('Português (BR)')).toBeInTheDocument();
  });

  test('shows correct flags', () => {
    render(<LanguageSelector />);
    
    expect(screen.getByText('🇦🇷')).toBeInTheDocument();
    expect(screen.getByText('🇧🇷')).toBeInTheDocument();
  });

  test('changes language on selection', () => {
    render(<LanguageSelector />);
    
    const select = screen.getByRole('button');
    fireEvent.mouseDown(select);
    
    const portugueseOption = screen.getByText('Português (BR)');
    fireEvent.click(portugueseOption);
    
    expect(mockI18n.changeLanguage).toHaveBeenCalledWith('pt');
  });
});