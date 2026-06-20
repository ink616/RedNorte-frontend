import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SobreNosotrosPage from './SobreNosotrosPage';
import { AuthProvider } from '../context/AuthContext';

// IntersectionObserver no existe en jsdom: se simula para que el
// scroll-reveal y el contador animado no rompan el render en tests.
beforeAll(() => {
  global.IntersectionObserver = class {
    observe() {}
    disconnect() {}
  };
});

const renderPagina = () => render(
  <MemoryRouter>
    <AuthProvider>
      <SobreNosotrosPage />
    </AuthProvider>
  </MemoryRouter>
);

beforeEach(() => {
  localStorage.clear();
});

describe('SobreNosotrosPage', () => {
  test('muestra el titulo principal del hero', () => {
    renderPagina();
    expect(screen.getByText(/Acortamos distancia/)).toBeInTheDocument();
  });

  test('muestra el mapa de cobertura con las 5 ciudades', () => {
    renderPagina();
    expect(screen.getByText('Arica')).toBeInTheDocument();
    expect(screen.getByText('Iquique')).toBeInTheDocument();
    expect(screen.getAllByText(/Antofagasta/).length).toBeGreaterThan(0);
    expect(screen.getByText('Copiapó')).toBeInTheDocument();
    expect(screen.getByText('La Serena')).toBeInTheDocument();
  });

  test('muestra la mision y la vision', () => {
    renderPagina();
    expect(screen.getByText('Nuestra misión')).toBeInTheDocument();
    expect(screen.getByText('Nuestra visión')).toBeInTheDocument();
  });

  test('muestra los cuatro valores institucionales', () => {
    renderPagina();
    expect(screen.getByText('Compromiso')).toBeInTheDocument();
    expect(screen.getByText('Excelencia')).toBeInTheDocument();
    expect(screen.getByText('Cercanía')).toBeInTheDocument();
    expect(screen.getByText('Confidencialidad')).toBeInTheDocument();
  });

  test('muestra la linea de tiempo con los hitos de la historia', () => {
    renderPagina();
    expect(screen.getByText('Nace la idea')).toBeInTheDocument();
    expect(screen.getByText('Primer lanzamiento')).toBeInTheDocument();
    expect(screen.getByText('Expansión regional')).toBeInTheDocument();
  });

  test('muestra el equipo medico con sus especialidades', () => {
    renderPagina();
    expect(screen.getByText(/Dr\. Alejandro Vega Soto/)).toBeInTheDocument();
    expect(screen.getByText('Cardiología')).toBeInTheDocument();
    expect(screen.getByText(/Dra\. Camila Rojas Fuentes/)).toBeInTheDocument();
  });

  test('muestra los horarios de atencion y el telefono de urgencias', () => {
    renderPagina();
    expect(screen.getByText(/Lunes a viernes/)).toBeInTheDocument();
    expect(screen.getByText('600 733 6673')).toBeInTheDocument();
  });

  test('sin sesion, muestra el CTA final para crear cuenta', () => {
    renderPagina();
    expect(screen.getByText('¿Listo para cuidar tu salud?')).toBeInTheDocument();
    expect(screen.getByText('Crear cuenta gratis')).toBeInTheDocument();
  });

  test('con sesion activa, no muestra el CTA final', () => {
    localStorage.setItem('rednorte_usuario', JSON.stringify({
      id: 'USR010', mail: 'juan@correo.cl', rol: { tag: 'PACIENTE' }, token: 'jwt',
    }));
    renderPagina();
    expect(screen.queryByText('¿Listo para cuidar tu salud?')).not.toBeInTheDocument();
  });
});
