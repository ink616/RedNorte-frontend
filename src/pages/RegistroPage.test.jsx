import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegistroPage from './RegistroPage';

jest.mock('../service/api', () => ({
  registrarUsuario: jest.fn(),
}));

import { registrarUsuario } from '../service/api';

const renderPagina = () => render(<MemoryRouter><RegistroPage /></MemoryRouter>);

const llenarPaso0Valido = () => {
  fireEvent.change(screen.getByPlaceholderText('tu@correo.cl'), { target: { value: 'nuevo@correo.cl' } });
  fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: 'Clave1234' } });
  fireEvent.change(screen.getByPlaceholderText('Repite tu contraseña'), { target: { value: 'Clave1234' } });
};

const llenarPaso1Valido = () => {
  fireEvent.change(screen.getByPlaceholderText('González'), { target: { value: 'Perez' } });
  fireEvent.change(screen.getByPlaceholderText('12.345.678-9'), { target: { value: '12345678-5' } });
  fireEvent.change(document.querySelector('input[type="date"]'), { target: { value: '1995-05-20' } });
  fireEvent.change(screen.getByDisplayValue('Selecciona...'), { target: { value: 'F' } });
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('RegistroPage', () => {
  test('arranca en el paso 0 mostrando los campos de acceso', () => {
    renderPagina();
    expect(screen.getByPlaceholderText('tu@correo.cl')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mínimo 8 caracteres')).toBeInTheDocument();
  });

  test('muestra el panel visual con los 3 pasos del proceso', () => {
    renderPagina();
    expect(screen.getByText('Datos de acceso')).toBeInTheDocument();
    expect(screen.getByText('Datos personales')).toBeInTheDocument();
    expect(screen.getByText('Confirmación')).toBeInTheDocument();
  });

  test('no avanza si el correo no tiene @', () => {
    renderPagina();
    fireEvent.change(screen.getByPlaceholderText('tu@correo.cl'), { target: { value: 'correo-invalido' } });
    fireEvent.click(screen.getByText('Siguiente →'));
    expect(screen.getByText(/correo válido/)).toBeInTheDocument();
  });

  test('no avanza si la contraseña es muy corta', () => {
    renderPagina();
    fireEvent.change(screen.getByPlaceholderText('tu@correo.cl'), { target: { value: 'a@b.cl' } });
    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: '123' } });
    fireEvent.click(screen.getByText('Siguiente →'));
    expect(screen.getByText(/al menos 8 caracteres/)).toBeInTheDocument();
  });

  test('no avanza si las contraseñas no coinciden', () => {
    renderPagina();
    fireEvent.change(screen.getByPlaceholderText('tu@correo.cl'), { target: { value: 'a@b.cl' } });
    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: 'Clave1234' } });
    fireEvent.change(screen.getByPlaceholderText('Repite tu contraseña'), { target: { value: 'Otra5678' } });
    fireEvent.click(screen.getByText('Siguiente →'));
    expect(document.querySelector('.rg-error-box').textContent).toMatch(/no coinciden/);
  });

  test('muestra la fortaleza de la contraseña a medida que se escribe', () => {
    renderPagina();
    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: 'Clave1234!' } });
    expect(screen.getByText('Contraseña Fuerte')).toBeInTheDocument();
  });

  test('muestra un check verde cuando las contraseñas coinciden', () => {
    renderPagina();
    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: 'Clave1234' } });
    fireEvent.change(screen.getByPlaceholderText('Repite tu contraseña'), { target: { value: 'Clave1234' } });
    expect(screen.getByText(/Las contraseñas coinciden/)).toBeInTheDocument();
  });

  test('el boton de mostrar/ocultar contraseña cambia el tipo de input', () => {
    renderPagina();
    const inputPass = screen.getByPlaceholderText('Mínimo 8 caracteres');
    expect(inputPass).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByText('👁️'));
    expect(inputPass).toHaveAttribute('type', 'text');
  });

  test('avanza al paso 1 con datos validos en el paso 0', () => {
    renderPagina();
    llenarPaso0Valido();
    fireEvent.click(screen.getByText('Siguiente →'));
    expect(screen.getByPlaceholderText('González')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('12.345.678-9')).toBeInTheDocument();
  });

  test('rechaza un RUT invalido en el paso 1', () => {
    renderPagina();
    llenarPaso0Valido();
    fireEvent.click(screen.getByText('Siguiente →'));

    fireEvent.change(screen.getByPlaceholderText('González'), { target: { value: 'Perez' } });
    fireEvent.change(screen.getByPlaceholderText('12.345.678-9'), { target: { value: '12345678-9' } });
    fireEvent.change(document.querySelector('input[type="date"]'), { target: { value: '1995-05-20' } });
    fireEvent.change(screen.getByDisplayValue('Selecciona...'), { target: { value: 'F' } });
    fireEvent.click(screen.getByText('Siguiente →'));

    expect(screen.getByText(/RUT ingresado no es válido/)).toBeInTheDocument();
  });

  test('formatea el RUT con puntos y guion mientras se escribe', () => {
    renderPagina();
    llenarPaso0Valido();
    fireEvent.click(screen.getByText('Siguiente →'));

    const inputRut = screen.getByPlaceholderText('12.345.678-9');
    fireEvent.change(inputRut, { target: { value: '123456785' } });

    expect(inputRut).toHaveValue('12.345.678-5');
  });

  test('muestra un check verde cuando el RUT es valido', () => {
    renderPagina();
    llenarPaso0Valido();
    fireEvent.click(screen.getByText('Siguiente →'));

    fireEvent.change(screen.getByPlaceholderText('12.345.678-9'), { target: { value: '123456785' } });

    expect(screen.getByText(/RUT válido/)).toBeInTheDocument();
  });

  test('avanza al paso 2 (confirmacion) con un RUT valido', () => {
    renderPagina();
    llenarPaso0Valido();
    fireEvent.click(screen.getByText('Siguiente →'));
    llenarPaso1Valido();
    fireEvent.click(screen.getByText('Siguiente →'));

    expect(screen.getByText('nuevo@correo.cl')).toBeInTheDocument();
    expect(screen.getByText(/datos están protegidos/)).toBeInTheDocument();
  });

  test('el boton "Volver" retrocede un paso', () => {
    renderPagina();
    llenarPaso0Valido();
    fireEvent.click(screen.getByText('Siguiente →'));
    expect(screen.getByPlaceholderText('González')).toBeInTheDocument();

    fireEvent.click(screen.getByText('← Volver'));
    expect(screen.getByPlaceholderText('tu@correo.cl')).toBeInTheDocument();
  });

  test('crea la cuenta exitosamente y muestra la pantalla de exito con confeti', async () => {
    registrarUsuario.mockResolvedValue({});
    renderPagina();
    llenarPaso0Valido();
    fireEvent.click(screen.getByText('Siguiente →'));
    llenarPaso1Valido();
    fireEvent.click(screen.getByText('Siguiente →'));

    fireEvent.click(screen.getByText('🎉 Crear cuenta'));

    await waitFor(() => expect(registrarUsuario).toHaveBeenCalledWith(expect.objectContaining({
      mail: 'nuevo@correo.cl',
      rol: expect.objectContaining({ tag: 'PACIENTE' }),
    })));
    await waitFor(() => expect(screen.getByText('¡Cuenta creada con éxito!')).toBeInTheDocument());
    expect(screen.getByText('Iniciar sesión →')).toBeInTheDocument();
  });

  test('si el registro falla, muestra un mensaje de error', async () => {
    registrarUsuario.mockRejectedValue(new Error('409'));
    renderPagina();
    llenarPaso0Valido();
    fireEvent.click(screen.getByText('Siguiente →'));
    llenarPaso1Valido();
    fireEvent.click(screen.getByText('Siguiente →'));

    fireEvent.click(screen.getByText('🎉 Crear cuenta'));

    await waitFor(() => expect(screen.getByText(/correo ya puede estar en uso/)).toBeInTheDocument());
  });
});
