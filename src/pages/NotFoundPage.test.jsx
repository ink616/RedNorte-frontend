import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';
import { AuthProvider } from '../context/AuthContext';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderPagina = () => render(
  <MemoryRouter>
    <AuthProvider>
      <NotFoundPage />
    </AuthProvider>
  </MemoryRouter>
);

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe('NotFoundPage', () => {
  test('muestra el codigo 404 y el mensaje', () => {
    renderPagina();
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
  });

  test('sin sesion, el link de inicio apunta a /', () => {
    renderPagina();
    expect(screen.getByText('Ir al inicio')).toHaveAttribute('href', '/');
  });

  test('con sesion de paciente, el link de inicio apunta a /inicio', () => {
    localStorage.setItem('rednorte_usuario', JSON.stringify({
      id: 'USR010', mail: 'juan@correo.cl', rol: { tag: 'PACIENTE' }, token: 'jwt',
    }));
    renderPagina();
    expect(screen.getByText('Ir al inicio')).toHaveAttribute('href', '/inicio');
  });

  test('con sesion de admin, el link de inicio apunta a /admin/dashboard', () => {
    localStorage.setItem('rednorte_usuario', JSON.stringify({
      id: 'USR001', mail: 'admin@rednorte.cl', rol: { tag: 'ADMIN' }, token: 'jwt',
    }));
    renderPagina();
    expect(screen.getByText('Ir al inicio')).toHaveAttribute('href', '/admin/dashboard');
  });

  test('el boton Volver llama a navigate(-1)', () => {
    renderPagina();
    fireEvent.click(screen.getByText('← Volver'));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
