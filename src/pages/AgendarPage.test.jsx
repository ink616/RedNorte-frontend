import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AgendarPage from './AgendarPage';
import { AuthProvider } from '../context/AuthContext';

jest.mock('../service/api', () => ({
  listarBloquesDisponibles: jest.fn(),
  reservarBloque: jest.fn(),
  crearConsulta: jest.fn(),
  listarEstablecimientos: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import {
  listarBloquesDisponibles, reservarBloque, crearConsulta, listarEstablecimientos,
} from '../service/api';

const usuarioMock = {
  id: 'USR010', mail: 'juan.perez@correo.cl', rol: { tag: 'PACIENTE' }, token: 'jwt.token',
  persona: { apellido1: 'Perez', apellido2: 'Castro' },
};

const bloqueDisponible = {
  id: 501, doctorId: 'USR002', establecimientoId: 'EST-001',
  horaInicio: '08:00:00', horaFin: '08:30:00', estado: 'DISPONIBLE',
};

const renderPagina = () => render(
  <MemoryRouter>
    <AuthProvider>
      <AgendarPage />
    </AuthProvider>
  </MemoryRouter>
);

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  localStorage.setItem('rednorte_usuario', JSON.stringify(usuarioMock));
  listarEstablecimientos.mockResolvedValue([{ id: 'EST-001', nombre: 'Hospital Regional del Norte' }]);
});

describe('AgendarPage', () => {
  test('arranca en el paso 1 mostrando los chips de fecha rapida', () => {
    renderPagina();
    expect(screen.getByText('¿Qué día te queda mejor?')).toBeInTheDocument();
  });

  test('al elegir una fecha rapida, avanza al paso 2 y pide los horarios', async () => {
    listarBloquesDisponibles.mockResolvedValue([bloqueDisponible]);
    renderPagina();

    const chips = document.querySelectorAll('.ag-fecha-chip');
    fireEvent.click(chips[0]);

    await waitFor(() => expect(listarBloquesDisponibles).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText(/Horarios disponibles/)).toBeInTheDocument());
  });

  test('muestra el estado vacio cuando no hay bloques disponibles', async () => {
    listarBloquesDisponibles.mockResolvedValue([]);
    renderPagina();

    fireEvent.click(document.querySelectorAll('.ag-fecha-chip')[0]);

    await waitFor(() => expect(screen.getByText(/No hay horarios disponibles/)).toBeInTheDocument());
  });

  test('seleccionar un bloque avanza al paso 3 con el resumen correcto', async () => {
    listarBloquesDisponibles.mockResolvedValue([bloqueDisponible]);
    renderPagina();

    fireEvent.click(document.querySelectorAll('.ag-fecha-chip')[0]);
    await waitFor(() => expect(screen.getByText('08:00')).toBeInTheDocument());

    fireEvent.click(screen.getByText('08:00'));

    await waitFor(() => expect(screen.getByText('Confirma tu cita')).toBeInTheDocument());
    expect(screen.getByText(/Dr\. Andrés Vega/)).toBeInTheDocument();
    expect(screen.getByText('Hospital Regional del Norte')).toBeInTheDocument();
  });

  test('no permite confirmar sin describir sintomas', async () => {
    listarBloquesDisponibles.mockResolvedValue([bloqueDisponible]);
    renderPagina();

    fireEvent.click(document.querySelectorAll('.ag-fecha-chip')[0]);
    await waitFor(() => screen.getByText('08:00'));
    fireEvent.click(screen.getByText('08:00'));

    await waitFor(() => screen.getByText('Confirma tu cita'));
    const btnConfirmar = screen.getByText('✅ Confirmar cita');
    expect(btnConfirmar).toBeDisabled();
  });

  test('un chip de sintoma sugerido rellena el textarea', async () => {
    listarBloquesDisponibles.mockResolvedValue([bloqueDisponible]);
    renderPagina();

    fireEvent.click(document.querySelectorAll('.ag-fecha-chip')[0]);
    await waitFor(() => screen.getByText('08:00'));
    fireEvent.click(screen.getByText('08:00'));
    await waitFor(() => screen.getByText('Confirma tu cita'));

    fireEvent.click(screen.getByText('Control general'));

    expect(screen.getByPlaceholderText(/Describe detalladamente/)).toHaveValue('Control general');
  });

  test('confirma la cita exitosamente: crea la consulta, reserva el bloque y muestra exito', async () => {
    listarBloquesDisponibles.mockResolvedValue([bloqueDisponible]);
    crearConsulta.mockResolvedValue({ id: 999 });
    reservarBloque.mockResolvedValue({});
    renderPagina();

    fireEvent.click(document.querySelectorAll('.ag-fecha-chip')[0]);
    await waitFor(() => screen.getByText('08:00'));
    fireEvent.click(screen.getByText('08:00'));
    await waitFor(() => screen.getByText('Confirma tu cita'));

    fireEvent.change(screen.getByPlaceholderText(/Describe detalladamente/), {
      target: { value: 'Dolor de cabeza fuerte desde ayer' },
    });
    fireEvent.click(screen.getByText('✅ Confirmar cita'));

    await waitFor(() => expect(crearConsulta).toHaveBeenCalledWith(expect.objectContaining({
      usuarioId: 'USR010',
      nombrePaciente: 'Perez Castro',
      especialidad: 'Cardiología',
      sintomas: 'Dolor de cabeza fuerte desde ayer',
      estado: 'AGENDADA',
    })));
    await waitFor(() => expect(reservarBloque).toHaveBeenCalledWith(501, 'USR010', 999));
    await waitFor(() => expect(screen.getByText('¡Cita agendada con éxito!')).toBeInTheDocument());
  });

  test('si falla crear la consulta, muestra error y no intenta reservar el bloque', async () => {
    listarBloquesDisponibles.mockResolvedValue([bloqueDisponible]);
    crearConsulta.mockRejectedValue(new Error('400'));
    renderPagina();

    fireEvent.click(document.querySelectorAll('.ag-fecha-chip')[0]);
    await waitFor(() => screen.getByText('08:00'));
    fireEvent.click(screen.getByText('08:00'));
    await waitFor(() => screen.getByText('Confirma tu cita'));

    fireEvent.change(screen.getByPlaceholderText(/Describe detalladamente/), { target: { value: 'Síntoma de prueba' } });
    fireEvent.click(screen.getByText('✅ Confirmar cita'));

    await waitFor(() => expect(screen.getByText(/No se pudo registrar tu consulta/)).toBeInTheDocument());
    expect(reservarBloque).not.toHaveBeenCalled();
  });

  test('si el bloque ya fue tomado al reservar, vuelve al paso 2 con error', async () => {
    listarBloquesDisponibles.mockResolvedValue([bloqueDisponible]);
    crearConsulta.mockResolvedValue({ id: 999 });
    reservarBloque.mockRejectedValue(new Error('409'));
    renderPagina();

    fireEvent.click(document.querySelectorAll('.ag-fecha-chip')[0]);
    await waitFor(() => screen.getByText('08:00'));
    fireEvent.click(screen.getByText('08:00'));
    await waitFor(() => screen.getByText('Confirma tu cita'));

    fireEvent.change(screen.getByPlaceholderText(/Describe detalladamente/), { target: { value: 'Síntoma de prueba' } });
    fireEvent.click(screen.getByText('✅ Confirmar cita'));

    await waitFor(() => expect(screen.getByText(/acaba de ser tomada por otro paciente/)).toBeInTheDocument());
    expect(screen.getByText(/Horarios disponibles/)).toBeInTheDocument();
  });

  test('el boton "Cambiar fecha" regresa al paso 1', async () => {
    listarBloquesDisponibles.mockResolvedValue([bloqueDisponible]);
    renderPagina();

    fireEvent.click(document.querySelectorAll('.ag-fecha-chip')[0]);
    await waitFor(() => screen.getByText(/Horarios disponibles/));

    fireEvent.click(screen.getByText('← Cambiar fecha'));

    expect(screen.getByText('¿Qué día te queda mejor?')).toBeInTheDocument();
  });
});
