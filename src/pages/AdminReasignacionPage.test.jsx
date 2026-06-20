import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminReasignacionPage from './AdminReasignacionPage';

jest.mock('../service/api', () => ({
  listarTodasConsultas: jest.fn(),
  actualizarConsultaAdmin: jest.fn(),
  cancelarYReasignar: jest.fn(),
}));

import { listarTodasConsultas, actualizarConsultaAdmin, cancelarYReasignar } from '../service/api';

const agendada = {
  id: 1, nombrePaciente: 'Juan Perez', especialidad: 'cardiologia',
  estado: 'AGENDADA', bloquesAgendaId: 55, fechaCita: '2026-06-25T10:00:00',
};
const pendiente = {
  id: 2, nombrePaciente: 'Ana Soto', especialidad: 'pediatria',
  estado: 'PENDIENTE', sintomas: 'Fiebre', fechaCreacion: '2026-06-18T08:00:00',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AdminReasignacionPage', () => {
  test('muestra el spinner mientras carga', () => {
    listarTodasConsultas.mockReturnValue(new Promise(() => {}));
    render(<AdminReasignacionPage />);
    expect(screen.getAllByText('Cargando...').length).toBeGreaterThan(0);
  });

  test('separa las consultas agendadas de las pendientes', async () => {
    listarTodasConsultas.mockResolvedValue([agendada, pendiente]);
    render(<AdminReasignacionPage />);
    await waitFor(() => expect(screen.getByText('Juan Perez')).toBeInTheDocument());
    expect(screen.getByText('Ana Soto')).toBeInTheDocument();
    expect(screen.getByText('⏳ Consultas pendientes de asignación (1)')).toBeInTheDocument();
  });

  test('muestra mensaje vacio cuando no hay citas agendadas para reasignar', async () => {
    listarTodasConsultas.mockResolvedValue([pendiente]);
    render(<AdminReasignacionPage />);
    await waitFor(() => expect(screen.getByText('No hay citas agendadas para reasignar en este momento.')).toBeInTheDocument());
  });

  test('muestra mensaje vacio cuando no hay consultas pendientes', async () => {
    listarTodasConsultas.mockResolvedValue([agendada]);
    render(<AdminReasignacionPage />);
    await waitFor(() => expect(screen.getByText('No hay consultas pendientes.')).toBeInTheDocument());
  });

  test('cancela y reasigna una cita exitosamente', async () => {
    listarTodasConsultas.mockResolvedValue([agendada]);
    actualizarConsultaAdmin.mockResolvedValue({});
    cancelarYReasignar.mockResolvedValue({});
    render(<AdminReasignacionPage />);
    await waitFor(() => expect(screen.getByText('Juan Perez')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('Motivo de cancelación...'), { target: { value: 'Paciente no asistirá' } });
    fireEvent.click(screen.getByText('🔄 Cancelar y reasignar'));

    await waitFor(() => expect(actualizarConsultaAdmin).toHaveBeenCalledWith(1, expect.objectContaining({
      estado: 'CANCELADA',
      notasAdmin: 'Cancelada: Paciente no asistirá',
    })));
    await waitFor(() => expect(cancelarYReasignar).toHaveBeenCalledWith(55, 'Paciente no asistirá'));
    await waitFor(() => expect(screen.getByText(/cancelada y reasignada exitosamente/)).toBeInTheDocument());
  });

  test('usa un motivo por defecto si no se escribe ninguno', async () => {
    listarTodasConsultas.mockResolvedValue([agendada]);
    actualizarConsultaAdmin.mockResolvedValue({});
    cancelarYReasignar.mockResolvedValue({});
    render(<AdminReasignacionPage />);
    await waitFor(() => expect(screen.getByText('Juan Perez')).toBeInTheDocument());

    fireEvent.click(screen.getByText('🔄 Cancelar y reasignar'));

    await waitFor(() => expect(cancelarYReasignar).toHaveBeenCalledWith(55, 'Cancelación administrativa'));
  });

  test('muestra un mensaje de error si la reasignacion falla', async () => {
    listarTodasConsultas.mockResolvedValue([agendada]);
    actualizarConsultaAdmin.mockRejectedValue(new Error('No hay pacientes pendientes'));
    render(<AdminReasignacionPage />);
    await waitFor(() => expect(screen.getByText('Juan Perez')).toBeInTheDocument());

    fireEvent.click(screen.getByText('🔄 Cancelar y reasignar'));

    await waitFor(() => expect(screen.getByText(/No hay pacientes pendientes/)).toBeInTheDocument());
  });
});
