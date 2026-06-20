import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';
import { AuthProvider } from '../context/AuthContext';

const renderPagina = () => render(
  <MemoryRouter>
    <AuthProvider>
      <HomePage />
    </AuthProvider>
  </MemoryRouter>
);

beforeEach(() => {
  localStorage.clear();
});

describe('HomePage', () => {
  test('sin sesion, muestra el hero con CTA de registro e inicio de sesion', () => {
    renderPagina();
    expect(screen.getByText(/nuestra prioridad/)).toBeInTheDocument();
    expect(screen.getByText('Comenzar ahora →')).toBeInTheDocument();
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
  });

  test('sin sesion, muestra el CTA final para crear cuenta', () => {
    renderPagina();
    expect(screen.getByText('¿Listo para cuidar tu salud?')).toBeInTheDocument();
    expect(screen.getByText('Crear cuenta gratis')).toBeInTheDocument();
  });

  test('con sesion activa, muestra el acceso directo a mis consultas en vez del CTA de registro', () => {
    localStorage.setItem('rednorte_usuario', JSON.stringify({
      id: 'USR010', mail: 'juan@correo.cl', rol: { tag: 'PACIENTE' }, token: 'jwt',
    }));
    renderPagina();
    expect(screen.getByText('Ver mis consultas →')).toBeInTheDocument();
    expect(screen.queryByText('Comenzar ahora →')).not.toBeInTheDocument();
  });

  test('con sesion activa, no muestra el CTA final de crear cuenta', () => {
    localStorage.setItem('rednorte_usuario', JSON.stringify({
      id: 'USR010', mail: 'juan@correo.cl', rol: { tag: 'PACIENTE' }, token: 'jwt',
    }));
    renderPagina();
    expect(screen.queryByText('¿Listo para cuidar tu salud?')).not.toBeInTheDocument();
  });

  test('renderiza las 8 especialidades medicas', () => {
    renderPagina();
    expect(screen.getByText('Cardiología')).toBeInTheDocument();
    expect(screen.getByText('Neurología')).toBeInTheDocument();
    expect(screen.getByText('Odontología')).toBeInTheDocument();
    expect(screen.getByText('Dermatología')).toBeInTheDocument();
  });

  test('renderiza los 4 pasos del proceso', () => {
    renderPagina();
    expect(screen.getByText('Crea tu cuenta')).toBeInTheDocument();
    expect(screen.getByText('Completa tu ficha')).toBeInTheDocument();
    expect(screen.getByText('Solicita una consulta')).toBeInTheDocument();
    expect(screen.getByText('Recibe tu cita')).toBeInTheDocument();
  });

  test('renderiza las estadisticas del hero', () => {
    renderPagina();
    expect(screen.getByText('24/7')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('<5min')).toBeInTheDocument();
  });

  test('renderiza los beneficios destacados', () => {
    renderPagina();
    expect(screen.getByText('Sin costo para pacientes')).toBeInTheDocument();
    expect(screen.getByText('Datos protegidos')).toBeInTheDocument();
    expect(screen.getByText('Reasignación automática')).toBeInTheDocument();
  });
});
