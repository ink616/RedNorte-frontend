import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

function Sonda() {
  const { dark, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="modo">{dark ? 'oscuro' : 'claro'}</span>
      <button onClick={toggleTheme}>cambiar</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('ThemeContext', () => {
  test('inicia en modo claro por defecto', () => {
    render(<ThemeProvider><Sonda /></ThemeProvider>);
    expect(screen.getByTestId('modo').textContent).toBe('claro');
  });

  test('toggleTheme cambia a modo oscuro', () => {
    render(<ThemeProvider><Sonda /></ThemeProvider>);
    fireEvent.click(screen.getByText('cambiar'));
    expect(screen.getByTestId('modo').textContent).toBe('oscuro');
  });

  test('persiste la preferencia en localStorage', () => {
    render(<ThemeProvider><Sonda /></ThemeProvider>);
    fireEvent.click(screen.getByText('cambiar'));
    expect(localStorage.getItem('rednorte_theme')).toBe('dark');
  });

  test('aplica el atributo data-theme al documento', () => {
    render(<ThemeProvider><Sonda /></ThemeProvider>);
    fireEvent.click(screen.getByText('cambiar'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  test('lee la preferencia oscura guardada en localStorage', () => {
    localStorage.setItem('rednorte_theme', 'dark');
    render(<ThemeProvider><Sonda /></ThemeProvider>);
    expect(screen.getByTestId('modo').textContent).toBe('oscuro');
  });
});
