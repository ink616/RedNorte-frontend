import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AgendarCitaModal from './AgendarCitaModal';
import { AuthProvider } from '../context/AuthContext';

jest.mock('../service/api', () => ({
  listarBloquesDisponibles: jest.fn(),
  reservarBloque: jest.fn(),
  crearConsulta: jest.fn(),
  listarEstablecimientos: jest.fn(),
  enviarConfirmacionCita: jest.fn(),
}));

import {
  listarBloquesDisponibles, reservarBloque, crearConsulta, listarEstablecimientos, enviarConfirmacionCita,
} from '../service/api';

const usuarioMock = {
  id: 'USR010', mail: 'juan.perez@correo.cl', rol: { tag: 'PACIENTE' }, token: 'jwt.token',
  persona: { apellido1: 'Perez', apellido2: 'Castro' },
};

const bloqueDisponible = {
  id: 501, doctorId: 'USR002', establecimientoId: 'EST-001',
  horaInicio: '08:00:00', horaFin: '08:30:00', estado: 'DISPONIBLE',
};

const renderModal = (props = {}) => render(
  <MemoryRouter>
    <AuthProvider>
      <AgendarCitaModal onCerrar={jest.fn()} {...props} />
    </AuthProvider>
  </MemoryRouter>
);

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  localStorage.setItem('rednorte_usuario', JSON.stringify(usuarioMock));
  listarEstablecimientos.mockResolvedValue([{ id: 'EST-001', nombre: 'Hospital Regional del Norte' }]);
  enviarConfirmacionCita.mockResolvedValue({});
});

describe('AgendarCitaModal', () => {
  test('muestra el flujo de agendamiento (AgendarFlujo) dentro del modal', () => {
    renderModal();
    expect(screen.getByText('¿Qué día te queda mejor?')).toBeInTheDocument();
  });

  test('el boton X llama a onCerrar', () => {
    const onCerrar = jest.fn();
    renderModal({ onCerrar });

    fireEvent.click(screen.getByLabelText('Cerrar'));

    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  test('hacer click en el overlay (fuera de la tarjeta) llama a onCerrar', () => {
    const onCerrar = jest.fn();
    renderModal({ onCerrar });

    fireEvent.click(document.querySelector('.cb-modal-overlay'));

    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  test('hacer click dentro de la tarjeta no llama a onCerrar', () => {
    const onCerrar = jest.fn();
    renderModal({ onCerrar });

    fireEvent.click(screen.getByText('¿Qué día te queda mejor?'));

    expect(onCerrar).not.toHaveBeenCalled();
  });

  test('el boton "Cancelar" del paso 3 cierra el modal (onCancelar = onCerrar)', async () => {
    const onCerrar = jest.fn();
    listarBloquesDisponibles.mockResolvedValue([bloqueDisponible]);
    renderModal({ onCerrar });

    fireEvent.click(document.querySelectorAll('.ag-fecha-chip')[0]);
    await waitFor(() => screen.getByText('08:00'));
    fireEvent.click(screen.getByText('08:00'));
    await waitFor(() => screen.getByText('Confirma tu cita'));

    fireEvent.click(screen.getByText('Cancelar'));

    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});

describe('AgendarCitaModal — integracion con SaludBot', () => {
  test('al agendar con exito, dispara onExito con los datos de la cita sin cerrar el modal', async () => {
    const onExito = jest.fn();
    const onCerrar = jest.fn();
    listarBloquesDisponibles.mockResolvedValue([bloqueDisponible]);
    crearConsulta.mockResolvedValue({ id: 999 });
    reservarBloque.mockResolvedValue({});
    renderModal({ onExito, onCerrar });

    fireEvent.click(document.querySelectorAll('.ag-fecha-chip')[0]);
    await waitFor(() => screen.getByText('08:00'));
    fireEvent.click(screen.getByText('08:00'));
    await waitFor(() => screen.getByText('Confirma tu cita'));

    fireEvent.change(screen.getByPlaceholderText(/Describe detalladamente/), { target: { value: 'Control general' } });
    fireEvent.click(screen.getByText('✅ Confirmar cita'));

    await waitFor(() => expect(onExito).toHaveBeenCalledWith(expect.objectContaining({
      hora: '08:00',
      especialidad: 'Cardiología',
      doctor: 'Dr. Andrés Vega',
    })));
    // El modal permanece abierto: el paciente decide cuando cerrarlo.
    expect(onCerrar).not.toHaveBeenCalled();
    expect(screen.getByText('¡Cita agendada con éxito!')).toBeInTheDocument();
  });

  test('"Ver mis consultas" usa onVerConsultas en vez de navegar directamente', async () => {
    const onVerConsultas = jest.fn();
    listarBloquesDisponibles.mockResolvedValue([bloqueDisponible]);
    crearConsulta.mockResolvedValue({ id: 999 });
    reservarBloque.mockResolvedValue({});
    renderModal({ onVerConsultas });

    fireEvent.click(document.querySelectorAll('.ag-fecha-chip')[0]);
    await waitFor(() => screen.getByText('08:00'));
    fireEvent.click(screen.getByText('08:00'));
    await waitFor(() => screen.getByText('Confirma tu cita'));
    fireEvent.change(screen.getByPlaceholderText(/Describe detalladamente/), { target: { value: 'Control general' } });
    fireEvent.click(screen.getByText('✅ Confirmar cita'));
    await waitFor(() => screen.getByText('¡Cita agendada con éxito!'));

    fireEvent.click(screen.getByText('Ver mis consultas'));

    expect(onVerConsultas).toHaveBeenCalledTimes(1);
  });
});
