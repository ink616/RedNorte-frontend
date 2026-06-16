import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { AuthProvider } from '../context/AuthContext';

jest.mock('../service/api', () => ({
  login: jest.fn(),
  registrarAuditoria: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import { login, registrarAuditoria } from '../service/api';

const renderLogin = () => render(
  <MemoryRouter>
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  </MemoryRouter>
);

const getPassInput = () => document.querySelector('input[type="password"]');
const getMailInput = () => screen.getByPlaceholderText(/correo\.cl/);

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  // registrarAuditoria siempre devuelve una promesa (se llama con .catch())
  registrarAuditoria.mockResolvedValue({});
});

describe('LoginPage', () => {
  test('renderiza el formulario de login', () => {
    renderLogin();
    expect(screen.getByText('Bienvenido de vuelta')).toBeInTheDocument();
    expect(getMailInput()).toBeInTheDocument();
  });

  test('muestra las cuentas de prueba', () => {
    renderLogin();
    expect(screen.getByText('admin@rednorte.cl')).toBeInTheDocument();
  });

  test('login exitoso de admin navega al dashboard', async () => {
    login.mockResolvedValue({ id: 'USR001', mail: 'admin@rednorte.cl', rol: { tag: 'ADMIN' }, token: 'jwt.token' });
    renderLogin();
    fireEvent.change(getMailInput(), { target: { value: 'admin@rednorte.cl' } });
    fireEvent.change(getPassInput(), { target: { value: 'admin123' } });
    fireEvent.click(screen.getByText(/Iniciar sesi/));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard'));
  });

  test('login de doctor navega al panel de doctor', async () => {
    login.mockResolvedValue({ id: 'USR002', mail: 'dr@rednorte.cl', rol: { tag: 'DOCTOR' }, token: 'jwt.token' });
    renderLogin();
    fireEvent.change(getMailInput(), { target: { value: 'dr@rednorte.cl' } });
    fireEvent.change(getPassInput(), { target: { value: 'doctor123' } });
    fireEvent.click(screen.getByText(/Iniciar sesi/));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/doctor/dashboard'));
  });

  test('credenciales incorrectas muestran error', async () => {
    login.mockRejectedValue(new Error('401'));
    renderLogin();
    fireEvent.change(getMailInput(), { target: { value: 'malo@correo.cl' } });
    fireEvent.change(getPassInput(), { target: { value: 'malo' } });
    fireEvent.click(screen.getByText(/Iniciar sesi/));
    await waitFor(() => expect(screen.getByText(/incorrectos/)).toBeInTheDocument());
  });
});
