import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ChatbotAccionModal from './ChatbotAccionModal';
import { AuthProvider } from '../context/AuthContext';

jest.mock('../service/api', () => ({
  login: jest.fn(),
  registrarUsuario: jest.fn(),
}));

import { login, registrarUsuario } from '../service/api';

const renderModal = (props = {}) => render(
  <AuthProvider>
    <ChatbotAccionModal tipo="REGISTRO" onCerrar={jest.fn()} onExito={jest.fn()} {...props} />
  </AuthProvider>
);

const llenarRegistroValido = () => {
  fireEvent.change(screen.getByPlaceholderText('tu@correo.cl'), { target: { value: 'nuevo@correo.cl' } });
  fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: 'Clave1234' } });
  fireEvent.change(screen.getByPlaceholderText('Repite tu contraseña'), { target: { value: 'Clave1234' } });
  fireEvent.change(screen.getByPlaceholderText('González'), { target: { value: 'Pérez' } });
  fireEvent.change(screen.getByPlaceholderText('12.345.678-9'), { target: { value: '12345678-5' } }); // RUT valido
  fireEvent.change(document.querySelector('input[type="date"]'), { target: { value: '1995-05-20' } });
  fireEvent.change(screen.getByDisplayValue('Selecciona...'), { target: { value: 'F' } });
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe('ChatbotAccionModal', () => {
  test('tipo REGISTRO muestra el formulario completo de creación de cuenta', () => {
    renderModal({ tipo: 'REGISTRO' });
    expect(screen.getByText('Crea tu cuenta gratis')).toBeInTheDocument();
    expect(screen.getByText('Primer apellido')).toBeInTheDocument();
    expect(screen.getByText('Fecha de nacimiento')).toBeInTheDocument();
    expect(screen.getByText('Sexo')).toBeInTheDocument();
  });

  test('tipo LOGIN muestra solo correo y contraseña, sin campos de registro', () => {
    renderModal({ tipo: 'LOGIN' });
    expect(screen.getByText('Inicia sesión')).toBeInTheDocument();
    expect(screen.queryByText('Primer apellido')).not.toBeInTheDocument();
    expect(screen.queryByText('Fecha de nacimiento')).not.toBeInTheDocument();
  });

  test('el boton de cerrar invoca onCerrar', () => {
    const onCerrar = jest.fn();
    renderModal({ tipo: 'REGISTRO', onCerrar });
    fireEvent.click(screen.getByLabelText('Cerrar'));
    expect(onCerrar).toHaveBeenCalled();
  });

  test('hacer click en el fondo del overlay invoca onCerrar', () => {
    const onCerrar = jest.fn();
    const { container } = renderModal({ tipo: 'REGISTRO', onCerrar });
    fireEvent.click(container.querySelector('.cb-modal-overlay'));
    expect(onCerrar).toHaveBeenCalled();
  });

  test('REGISTRO con contraseñas que no coinciden muestra error y no llama a registrarUsuario', async () => {
    renderModal({ tipo: 'REGISTRO' });
    fireEvent.change(screen.getByPlaceholderText('tu@correo.cl'), { target: { value: 'nuevo@correo.cl' } });
    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: 'Clave1234' } });
    fireEvent.change(screen.getByPlaceholderText('Repite tu contraseña'), { target: { value: 'OtraClave' } });

    fireEvent.click(screen.getByText('🎉 Crear cuenta'));

    await waitFor(() => expect(document.querySelector('.cb-modal-error').textContent).toMatch(/no coinciden/));
    expect(registrarUsuario).not.toHaveBeenCalled();
  });

  test('REGISTRO con RUT invalido muestra error y no llama a registrarUsuario', async () => {
    renderModal({ tipo: 'REGISTRO' });
    fireEvent.change(screen.getByPlaceholderText('tu@correo.cl'), { target: { value: 'nuevo@correo.cl' } });
    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: 'Clave1234' } });
    fireEvent.change(screen.getByPlaceholderText('Repite tu contraseña'), { target: { value: 'Clave1234' } });
    fireEvent.change(screen.getByPlaceholderText('González'), { target: { value: 'Pérez' } });
    fireEvent.change(screen.getByPlaceholderText('12.345.678-9'), { target: { value: '11111111-9' } }); // DV correcto es 1, no 9

    fireEvent.click(screen.getByText('🎉 Crear cuenta'));

    await waitFor(() => expect(screen.getByText(/RUT ingresado no es válido/)).toBeInTheDocument());
    expect(registrarUsuario).not.toHaveBeenCalled();
  });

  test('REGISTRO exitoso llama a onExito con tipo REGISTRO tras mostrar la pantalla de exito', async () => {
    registrarUsuario.mockResolvedValue({});
    const onExito = jest.fn();
    renderModal({ tipo: 'REGISTRO', onExito });

    llenarRegistroValido();
    fireEvent.click(screen.getByText('🎉 Crear cuenta'));

    await waitFor(() => expect(screen.getByText('¡Cuenta creada con éxito!')).toBeInTheDocument());
    expect(registrarUsuario).toHaveBeenCalledWith(expect.objectContaining({
      mail: 'nuevo@correo.cl',
      rol: expect.objectContaining({ tag: 'PACIENTE' }),
      persona: expect.objectContaining({ apellido1: 'Pérez', sexo: 'F' }),
    }));

    await waitFor(() => expect(onExito).toHaveBeenCalledWith({ tipo: 'REGISTRO' }), { timeout: 2000 });
  });

  test('REGISTRO con correo ya en uso muestra mensaje de error', async () => {
    registrarUsuario.mockRejectedValue(new Error('409'));
    renderModal({ tipo: 'REGISTRO' });

    llenarRegistroValido();
    fireEvent.click(screen.getByText('🎉 Crear cuenta'));

    await waitFor(() => expect(screen.getByText(/correo ya puede estar en uso/)).toBeInTheDocument());
  });

  test('muestra la fortaleza de la contraseña a medida que se escribe', () => {
    renderModal({ tipo: 'REGISTRO' });
    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: 'Clave1234!' } });
    expect(screen.getByText('Contraseña Fuerte')).toBeInTheDocument();
  });

  test('LOGIN exitoso llama a onExito con tipo LOGIN', async () => {
    login.mockResolvedValue({ id: 'USR010', mail: 'juan@correo.cl', rol: { tag: 'PACIENTE' } });
    const onExito = jest.fn();
    renderModal({ tipo: 'LOGIN', onExito });

    fireEvent.change(screen.getByPlaceholderText('tu@correo.cl'), { target: { value: 'juan@correo.cl' } });
    fireEvent.change(screen.getByPlaceholderText('Tu contraseña'), { target: { value: 'paciente123' } });

    fireEvent.click(screen.getByText('Iniciar sesión →'));

    await waitFor(() => expect(screen.getByText('¡Bienvenido de nuevo!')).toBeInTheDocument());
    await waitFor(() => expect(onExito).toHaveBeenCalledWith(
      expect.objectContaining({ tipo: 'LOGIN' })
    ), { timeout: 2000 });
  });

  test('LOGIN con credenciales incorrectas muestra mensaje de error', async () => {
    login.mockRejectedValue(new Error('401'));
    renderModal({ tipo: 'LOGIN' });

    fireEvent.change(screen.getByPlaceholderText('tu@correo.cl'), { target: { value: 'juan@correo.cl' } });
    fireEvent.change(screen.getByPlaceholderText('Tu contraseña'), { target: { value: 'incorrecta' } });

    fireEvent.click(screen.getByText('Iniciar sesión →'));

    await waitFor(() => expect(screen.getByText(/Correo o contraseña incorrectos/)).toBeInTheDocument());
  });

  test('LOGIN sin completar campos muestra error de validacion sin llamar a la API', async () => {
    renderModal({ tipo: 'LOGIN' });
    fireEvent.click(screen.getByText('Iniciar sesión →'));

    await waitFor(() => expect(screen.getByText(/Completa correo y contraseña/)).toBeInTheDocument());
    expect(login).not.toHaveBeenCalled();
  });

  test('el boton de mostrar/ocultar contraseña cambia el tipo de input', () => {
    renderModal({ tipo: 'LOGIN' });
    const inputPass = screen.getByPlaceholderText('Tu contraseña');
    expect(inputPass).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByText('👁️'));
    expect(inputPass).toHaveAttribute('type', 'text');
  });

  test('RUT se formatea automaticamente con puntos y guion mientras se escribe', () => {
    renderModal({ tipo: 'REGISTRO' });
    const inputRut = screen.getByPlaceholderText('12.345.678-9');
    fireEvent.change(inputRut, { target: { value: '123456785' } });
    expect(inputRut).toHaveValue('12.345.678-5');
  });
});
