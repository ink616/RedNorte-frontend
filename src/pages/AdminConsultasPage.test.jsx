import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminConsultasPage from './AdminConsultasPage';

jest.mock('../service/api', () => ({
  listarTodasConsultas: jest.fn(),
  actualizarConsultaAdmin: jest.fn(),
  eliminarConsulta: jest.fn(),
  registrarAuditoria: jest.fn(),
}));

import {
  listarTodasConsultas, actualizarConsultaAdmin, eliminarConsulta, registrarAuditoria,
} from '../service/api';

const consultaEjemplo = {
  id: 1, usuarioId: 'USR010', nombrePaciente: 'Juan Perez',
  especialidad: 'cardiologia', sintomas: 'Dolor de pecho', estado: 'PENDIENTE',
};

beforeEach(() => {
  jest.clearAllMocks();
  registrarAuditoria.mockResolvedValue({});
  window.confirm = jest.fn(() => true);
});

describe('AdminConsultasPage', () => {
  test('muestra el spinner mientras carga', () => {
    listarTodasConsultas.mockReturnValue(new Promise(() => {}));
    render(<AdminConsultasPage />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  test('renderiza la lista de consultas tras cargar', async () => {
    listarTodasConsultas.mockResolvedValue([consultaEjemplo]);
    render(<AdminConsultasPage />);
    await waitFor(() => expect(screen.getByText('Juan Perez')).toBeInTheDocument());
    expect(screen.getByText('cardiologia')).toBeInTheDocument();
  });

  test('muestra el mensaje de "sin resultados" cuando la lista esta vacia', async () => {
    listarTodasConsultas.mockResolvedValue([]);
    render(<AdminConsultasPage />);
    await waitFor(() => expect(screen.getByText(/No hay consultas con esos filtros/)).toBeInTheDocument());
  });

  test('filtra por estado', async () => {
    listarTodasConsultas.mockResolvedValue([
      consultaEjemplo,
      { ...consultaEjemplo, id: 2, nombrePaciente: 'Ana Soto', estado: 'ATENDIDA' },
    ]);
    render(<AdminConsultasPage />);
    await waitFor(() => expect(screen.getByText('Juan Perez')).toBeInTheDocument());

    fireEvent.change(screen.getByDisplayValue('Todos'), { target: { value: 'ATENDIDA' } });

    expect(screen.queryByText('Juan Perez')).not.toBeInTheDocument();
    expect(screen.getByText('Ana Soto')).toBeInTheDocument();
  });

  test('filtra por texto de especialidad', async () => {
    listarTodasConsultas.mockResolvedValue([
      consultaEjemplo,
      { ...consultaEjemplo, id: 2, nombrePaciente: 'Ana Soto', especialidad: 'pediatria' },
    ]);
    render(<AdminConsultasPage />);
    await waitFor(() => expect(screen.getByText('Juan Perez')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('Buscar...'), { target: { value: 'pediatria' } });

    expect(screen.queryByText('Juan Perez')).not.toBeInTheDocument();
    expect(screen.getByText('Ana Soto')).toBeInTheDocument();
  });

  test('abre el editor inline al hacer click en editar', async () => {
    listarTodasConsultas.mockResolvedValue([consultaEjemplo]);
    render(<AdminConsultasPage />);
    await waitFor(() => expect(screen.getByText('Juan Perez')).toBeInTheDocument());

    fireEvent.click(screen.getByText('✏️'));

    expect(screen.getByText('Editando consulta #1')).toBeInTheDocument();
  });

  test('exige fecha de cita al pasar a estado AGENDADA', async () => {
    listarTodasConsultas.mockResolvedValue([consultaEjemplo]);
    render(<AdminConsultasPage />);
    await waitFor(() => expect(screen.getByText('Juan Perez')).toBeInTheDocument());

    fireEvent.click(screen.getByText('✏️'));
    fireEvent.change(screen.getByDisplayValue('PENDIENTE'), { target: { value: 'AGENDADA' } });
    fireEvent.click(screen.getByText('💾 Guardar'));

    await waitFor(() => expect(screen.getByText(/debes asignar la fecha y hora/)).toBeInTheDocument());
    expect(actualizarConsultaAdmin).not.toHaveBeenCalled();
  });

  test('guarda exitosamente cuando el estado no requiere fecha', async () => {
    listarTodasConsultas.mockResolvedValue([consultaEjemplo]);
    actualizarConsultaAdmin.mockResolvedValue({});
    render(<AdminConsultasPage />);
    await waitFor(() => expect(screen.getByText('Juan Perez')).toBeInTheDocument());

    fireEvent.click(screen.getByText('✏️'));
    fireEvent.click(screen.getByText('💾 Guardar'));

    await waitFor(() => expect(actualizarConsultaAdmin).toHaveBeenCalledWith(1, expect.objectContaining({ estado: 'PENDIENTE' })));
    await waitFor(() => expect(screen.getByText(/Consulta actualizada/)).toBeInTheDocument());
  });

  test('pide confirmacion antes de eliminar y llama al servicio', async () => {
    listarTodasConsultas.mockResolvedValue([consultaEjemplo]);
    eliminarConsulta.mockResolvedValue({});
    render(<AdminConsultasPage />);
    await waitFor(() => expect(screen.getByText('Juan Perez')).toBeInTheDocument());

    fireEvent.click(screen.getByText('🗑️'));

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => expect(eliminarConsulta).toHaveBeenCalledWith(1));
  });

  test('no elimina si el usuario cancela la confirmacion', async () => {
    window.confirm = jest.fn(() => false);
    listarTodasConsultas.mockResolvedValue([consultaEjemplo]);
    render(<AdminConsultasPage />);
    await waitFor(() => expect(screen.getByText('Juan Perez')).toBeInTheDocument());

    fireEvent.click(screen.getByText('🗑️'));

    expect(eliminarConsulta).not.toHaveBeenCalled();
  });
});
