import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminAgendaPage from './AdminAgendaPage';

jest.mock('../service/api', () => ({
  listarAgenda: jest.fn(),
  generarBloques: jest.fn(),
  cancelarBloque: jest.fn(),
  listarEstablecimientos: jest.fn(),
}));

import {
  listarAgenda, generarBloques, cancelarBloque, listarEstablecimientos,
} from '../service/api';

const bloqueEjemplo = {
  id: 501, doctorId: 'USR002', establecimientoId: 'EST-001',
  fecha: '2026-06-22', horaInicio: '08:00:00', horaFin: '08:30:00', estado: 'DISPONIBLE',
};

beforeEach(() => {
  jest.clearAllMocks();
  listarEstablecimientos.mockResolvedValue([{ id: 'EST-001', nombre: 'Hospital Regional del Norte' }]);
  window.confirm = jest.fn(() => true);
});

describe('AdminAgendaPage', () => {
  test('muestra el spinner mientras carga', () => {
    listarAgenda.mockReturnValue(new Promise(() => {}));
    render(<AdminAgendaPage />);
    expect(screen.getByText('Cargando agenda...')).toBeInTheDocument();
  });

  test('agrupa y muestra los bloques por fecha', async () => {
    listarAgenda.mockResolvedValue([bloqueEjemplo]);
    render(<AdminAgendaPage />);
    await waitFor(() => expect(screen.getByText('08:00 - 08:30')).toBeInTheDocument());
    expect(screen.getByText('DISPONIBLE')).toBeInTheDocument();
  });

  test('muestra el estado vacio cuando no hay bloques', async () => {
    listarAgenda.mockResolvedValue([]);
    render(<AdminAgendaPage />);
    await waitFor(() => expect(screen.getByText('Sin bloques de agenda')).toBeInTheDocument());
  });

  test('filtra los bloques por doctor', async () => {
    listarAgenda.mockResolvedValue([
      bloqueEjemplo,
      { ...bloqueEjemplo, id: 502, doctorId: 'USR003', horaInicio: '09:00:00', horaFin: '09:30:00' },
    ]);
    render(<AdminAgendaPage />);
    await waitFor(() => expect(screen.getByText('08:00 - 08:30')).toBeInTheDocument());

    fireEvent.click(screen.getAllByText('Dra. Carolina Rojas')[0]);

    expect(screen.queryByText('08:00 - 08:30')).not.toBeInTheDocument();
    expect(screen.getByText('09:00 - 09:30')).toBeInTheDocument();
  });

  test('abre el modal de generar horario', async () => {
    listarAgenda.mockResolvedValue([]);
    render(<AdminAgendaPage />);
    await waitFor(() => screen.getByText('Sin bloques de agenda'));

    fireEvent.click(screen.getByText('+ Generar horario'));

    expect(screen.getByText('Generar horario')).toBeInTheDocument();
  });

  test('el boton generar esta deshabilitado sin establecimiento ni fecha', async () => {
    listarAgenda.mockResolvedValue([]);
    render(<AdminAgendaPage />);
    await waitFor(() => screen.getByText('Sin bloques de agenda'));
    fireEvent.click(screen.getByText('+ Generar horario'));

    expect(screen.getByText('Generar 18 bloques')).toBeDisabled();
  });

  test('genera bloques con datos validos', async () => {
    listarAgenda.mockResolvedValue([]);
    generarBloques.mockResolvedValue([]);
    render(<AdminAgendaPage />);
    await waitFor(() => screen.getByText('Sin bloques de agenda'));
    fireEvent.click(screen.getByText('+ Generar horario'));

    fireEvent.change(screen.getByDisplayValue('Seleccionar...'), { target: { value: 'EST-001' } });
    fireEvent.change(document.querySelector('input[type="date"]'), { target: { value: '2026-06-25' } });
    fireEvent.click(screen.getByText('Generar 18 bloques'));

    await waitFor(() => expect(generarBloques).toHaveBeenCalledWith('USR002', 'EST-001', '2026-06-25'));
  });

  test('cancela un bloque disponible tras confirmar', async () => {
    listarAgenda.mockResolvedValue([bloqueEjemplo]);
    cancelarBloque.mockResolvedValue({});
    render(<AdminAgendaPage />);
    await waitFor(() => expect(screen.getByText('08:00 - 08:30')).toBeInTheDocument());

    fireEvent.click(screen.getByTitle('Cancelar'));

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => expect(cancelarBloque).toHaveBeenCalledWith(501));
  });
});
