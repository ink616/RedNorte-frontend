import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import RecuperarPasswordModal from './RecuperarPasswordModal';

jest.mock('../service/api', () => ({
  solicitarCodigoRecuperacion: jest.fn(),
  validarCodigoRecuperacion: jest.fn(),
  cambiarPasswordConCodigo: jest.fn(),
}));

import {
  solicitarCodigoRecuperacion, validarCodigoRecuperacion, cambiarPasswordConCodigo,
} from '../service/api';

const renderModal = (props = {}) => render(
  <RecuperarPasswordModal onCerrar={jest.fn()} onExito={jest.fn()} {...props} />
);

const avanzarHastaPaso2 = async () => {
  fireEvent.change(screen.getByPlaceholderText('tu@correo.cl'), { target: { value: 'juan@correo.cl' } });
  fireEvent.click(screen.getByText('Enviar código →'));
  await waitFor(() => expect(screen.getByPlaceholderText('000000')).toBeInTheDocument());
};

const avanzarHastaPaso3 = async () => {
  await avanzarHastaPaso2();
  fireEvent.change(screen.getByPlaceholderText('000000'), { target: { value: '123456' } });
  fireEvent.click(screen.getByText('Verificar código →'));
  await waitFor(() => expect(screen.getByText('🔐 Cambiar contraseña')).toBeInTheDocument());
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('RecuperarPasswordModal', () => {
  test('arranca pidiendo el correo (paso 1)', () => {
    renderModal();
    expect(screen.getByPlaceholderText('tu@correo.cl')).toBeInTheDocument();
    expect(screen.getByText('Enviar código →')).toBeInTheDocument();
  });

  test('correo invalido muestra error sin llamar a la API', async () => {
    renderModal();
    fireEvent.change(screen.getByPlaceholderText('tu@correo.cl'), { target: { value: 'correo-sin-arroba' } });
    fireEvent.click(screen.getByText('Enviar código →'));

    await waitFor(() => expect(screen.getByText(/correo válido/)).toBeInTheDocument());
    expect(solicitarCodigoRecuperacion).not.toHaveBeenCalled();
  });

  test('correo valido avanza al paso 2 y llama a solicitarCodigoRecuperacion', async () => {
    solicitarCodigoRecuperacion.mockResolvedValue({});
    renderModal();

    await avanzarHastaPaso2();

    expect(solicitarCodigoRecuperacion).toHaveBeenCalledWith('juan@correo.cl');
    expect(screen.getByText(/juan@correo.cl/)).toBeInTheDocument();
  });

  test('codigo de menos de 6 digitos muestra error sin llamar a la API', async () => {
    solicitarCodigoRecuperacion.mockResolvedValue({});
    renderModal();
    await avanzarHastaPaso2();

    fireEvent.change(screen.getByPlaceholderText('000000'), { target: { value: '123' } });
    fireEvent.click(screen.getByText('Verificar código →'));

    await waitFor(() => expect(screen.getByText(/debe tener 6 dígitos/)).toBeInTheDocument());
    expect(validarCodigoRecuperacion).not.toHaveBeenCalled();
  });

  test('el campo de codigo solo acepta numeros', async () => {
    solicitarCodigoRecuperacion.mockResolvedValue({});
    renderModal();
    await avanzarHastaPaso2();

    fireEvent.change(screen.getByPlaceholderText('000000'), { target: { value: 'ab12cd34' } });

    expect(screen.getByPlaceholderText('000000')).toHaveValue('1234');
  });

  test('codigo invalido muestra error y no avanza al paso 3', async () => {
    solicitarCodigoRecuperacion.mockResolvedValue({});
    validarCodigoRecuperacion.mockRejectedValue(new Error('400'));
    renderModal();
    await avanzarHastaPaso2();

    fireEvent.change(screen.getByPlaceholderText('000000'), { target: { value: '999999' } });
    fireEvent.click(screen.getByText('Verificar código →'));

    await waitFor(() => expect(screen.getByText(/no es válido o ya expiró/)).toBeInTheDocument());
    expect(screen.queryByText('🔐 Cambiar contraseña')).not.toBeInTheDocument();
  });

  test('codigo valido avanza al paso 3 (nueva contraseña)', async () => {
    solicitarCodigoRecuperacion.mockResolvedValue({});
    validarCodigoRecuperacion.mockResolvedValue({});
    renderModal();

    await avanzarHastaPaso3();

    expect(validarCodigoRecuperacion).toHaveBeenCalledWith('juan@correo.cl', '123456');
  });

  test('boton de reenviar codigo vuelve a llamar a solicitarCodigoRecuperacion', async () => {
    solicitarCodigoRecuperacion.mockResolvedValue({});
    renderModal();
    await avanzarHastaPaso2();

    fireEvent.click(screen.getByText('¿No llegó? Reenviar código'));

    await waitFor(() => expect(solicitarCodigoRecuperacion).toHaveBeenCalledTimes(2));
  });

  test('muestra la fortaleza de la nueva contraseña a medida que se escribe', async () => {
    solicitarCodigoRecuperacion.mockResolvedValue({});
    validarCodigoRecuperacion.mockResolvedValue({});
    renderModal();
    await avanzarHastaPaso3();

    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: 'Clave1234!' } });

    expect(screen.getByText('Contraseña Fuerte')).toBeInTheDocument();
  });

  test('nueva contraseña corta muestra error sin llamar a la API', async () => {
    solicitarCodigoRecuperacion.mockResolvedValue({});
    validarCodigoRecuperacion.mockResolvedValue({});
    renderModal();
    await avanzarHastaPaso3();

    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: '123' } });
    fireEvent.click(screen.getByText('🔐 Cambiar contraseña'));

    await waitFor(() => expect(screen.getByText(/al menos 8 caracteres/)).toBeInTheDocument());
    expect(cambiarPasswordConCodigo).not.toHaveBeenCalled();
  });

  test('contraseñas que no coinciden muestran error', async () => {
    solicitarCodigoRecuperacion.mockResolvedValue({});
    validarCodigoRecuperacion.mockResolvedValue({});
    renderModal();
    await avanzarHastaPaso3();

    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: 'Clave1234' } });
    fireEvent.change(screen.getByPlaceholderText('Repite tu nueva contraseña'), { target: { value: 'OtraClave1' } });
    fireEvent.click(screen.getByText('🔐 Cambiar contraseña'));

    await waitFor(() => expect(document.querySelector('.cb-modal-error').textContent).toMatch(/no coinciden/));
    expect(cambiarPasswordConCodigo).not.toHaveBeenCalled();
  });

  test('flujo completo exitoso llama a onExito con tipo RECUPERAR', async () => {
    solicitarCodigoRecuperacion.mockResolvedValue({});
    validarCodigoRecuperacion.mockResolvedValue({});
    cambiarPasswordConCodigo.mockResolvedValue({});
    const onExito = jest.fn();
    renderModal({ onExito });
    await avanzarHastaPaso3();

    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: 'Clave1234' } });
    fireEvent.change(screen.getByPlaceholderText('Repite tu nueva contraseña'), { target: { value: 'Clave1234' } });
    fireEvent.click(screen.getByText('🔐 Cambiar contraseña'));

    await waitFor(() => expect(screen.getByText('¡Contraseña actualizada!')).toBeInTheDocument());
    expect(cambiarPasswordConCodigo).toHaveBeenCalledWith('juan@correo.cl', '123456', 'Clave1234');
    await waitFor(() => expect(onExito).toHaveBeenCalledWith({ tipo: 'RECUPERAR' }), { timeout: 2000 });
  });

  test('si el codigo expiro justo antes de cambiar la contraseña, muestra error', async () => {
    solicitarCodigoRecuperacion.mockResolvedValue({});
    validarCodigoRecuperacion.mockResolvedValue({});
    cambiarPasswordConCodigo.mockRejectedValue(new Error('400'));
    renderModal();
    await avanzarHastaPaso3();

    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: 'Clave1234' } });
    fireEvent.change(screen.getByPlaceholderText('Repite tu nueva contraseña'), { target: { value: 'Clave1234' } });
    fireEvent.click(screen.getByText('🔐 Cambiar contraseña'));

    await waitFor(() => expect(screen.getByText(/código ya expiró/)).toBeInTheDocument());
  });

  test('el boton de mostrar/ocultar contraseña funciona en el paso 3', async () => {
    solicitarCodigoRecuperacion.mockResolvedValue({});
    validarCodigoRecuperacion.mockResolvedValue({});
    renderModal();
    await avanzarHastaPaso3();

    const inputPass = screen.getByPlaceholderText('Mínimo 8 caracteres');
    expect(inputPass).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByText('👁️'));
    expect(inputPass).toHaveAttribute('type', 'text');
  });

  test('el boton de cerrar invoca onCerrar', () => {
    const onCerrar = jest.fn();
    renderModal({ onCerrar });
    fireEvent.click(screen.getByLabelText('Cerrar'));
    expect(onCerrar).toHaveBeenCalled();
  });

  test('hacer click en el fondo del overlay invoca onCerrar', () => {
    const onCerrar = jest.fn();
    const { container } = renderModal({ onCerrar });
    fireEvent.click(container.querySelector('.cb-modal-overlay'));
    expect(onCerrar).toHaveBeenCalled();
  });
});
