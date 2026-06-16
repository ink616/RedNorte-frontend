import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Componente de prueba que consume el contexto
function Sonda() {
  const { usuario, iniciarSesion, cerrarSesion, esAdmin, esDoctor } = useAuth();
  return (
    <div>
      <span data-testid="mail">{usuario ? usuario.mail : 'sin-sesion'}</span>
      <span data-testid="esAdmin">{String(esAdmin)}</span>
      <span data-testid="esDoctor">{String(esDoctor)}</span>
      <button onClick={() => iniciarSesion({ mail: 'admin@rednorte.cl', rol: { tag: 'ADMIN' }, token: 'fake.jwt.token' })}>login-admin</button>
      <button onClick={() => iniciarSesion({ mail: 'dr@rednorte.cl', rol: { tag: 'DOCTOR' }, token: 'fake.jwt.token' })}>login-doctor</button>
      <button onClick={cerrarSesion}>logout</button>
    </div>
  );
}

const setup = () => render(<AuthProvider><Sonda /></AuthProvider>);

beforeEach(() => localStorage.clear());

describe('AuthContext', () => {
  test('inicia sin sesion', () => {
    setup();
    expect(screen.getByTestId('mail').textContent).toBe('sin-sesion');
    expect(screen.getByTestId('esAdmin').textContent).toBe('false');
  });

  test('iniciarSesion como ADMIN actualiza usuario y rol', () => {
    setup();
    act(() => screen.getByText('login-admin').click());
    expect(screen.getByTestId('mail').textContent).toBe('admin@rednorte.cl');
    expect(screen.getByTestId('esAdmin').textContent).toBe('true');
    expect(screen.getByTestId('esDoctor').textContent).toBe('false');
  });

  test('iniciarSesion como DOCTOR marca esDoctor', () => {
    setup();
    act(() => screen.getByText('login-doctor').click());
    expect(screen.getByTestId('esDoctor').textContent).toBe('true');
    expect(screen.getByTestId('esAdmin').textContent).toBe('false');
  });

  test('guarda la sesion en localStorage', () => {
    setup();
    act(() => screen.getByText('login-admin').click());
    const guardado = JSON.parse(localStorage.getItem('rednorte_usuario'));
    expect(guardado.mail).toBe('admin@rednorte.cl');
    expect(guardado.token).toBe('fake.jwt.token');
  });

  test('cerrarSesion limpia usuario y localStorage', () => {
    setup();
    act(() => screen.getByText('login-admin').click());
    act(() => screen.getByText('logout').click());
    expect(screen.getByTestId('mail').textContent).toBe('sin-sesion');
    expect(localStorage.getItem('rednorte_usuario')).toBeNull();
  });

  test('restaura la sesion desde localStorage al montar', () => {
    localStorage.setItem('rednorte_usuario', JSON.stringify({ mail: 'persistido@rednorte.cl', rol: { tag: 'PACIENTE' }, token: 't' }));
    setup();
    expect(screen.getByTestId('mail').textContent).toBe('persistido@rednorte.cl');
  });
});
