import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';

jest.mock('../service/api', () => ({
  obtenerResumenEstadisticas: jest.fn(),
  listarTodasConsultas: jest.fn(),
}));

import { obtenerResumenEstadisticas, listarTodasConsultas } from '../service/api';

const statsEjemplo = {
  totalConsultas: 42, totalUsuarios: 15, totalBloquesAgenda: 120, totalEstablecimientos: 5,
  consultasPorEstado: { PENDIENTE: 10, ATENDIDA: 32 },
};

const consultaReciente = {
  id: 1, nombrePaciente: 'Juan Perez', especialidad: 'cardiologia',
  estado: 'PENDIENTE', fechaCreacion: '2026-06-19T10:00:00',
};

const renderPagina = () => render(<MemoryRouter><AdminDashboard /></MemoryRouter>);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AdminDashboard', () => {
  test('muestra el spinner mientras carga', () => {
    obtenerResumenEstadisticas.mockReturnValue(new Promise(() => {}));
    listarTodasConsultas.mockResolvedValue([]);
    renderPagina();
    expect(screen.getByText('Cargando estadísticas...')).toBeInTheDocument();
  });

  test('muestra las tarjetas de estadisticas con los totales', async () => {
    obtenerResumenEstadisticas.mockResolvedValue(statsEjemplo);
    listarTodasConsultas.mockResolvedValue([]);
    renderPagina();
    await waitFor(() => expect(screen.getAllByText('42').length).toBeGreaterThan(0));
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Pendientes')).toBeInTheDocument();
  });

  test('muestra la distribucion de consultas por estado con porcentajes', async () => {
    obtenerResumenEstadisticas.mockResolvedValue(statsEjemplo);
    listarTodasConsultas.mockResolvedValue([]);
    renderPagina();
    await waitFor(() => expect(screen.getByText('Distribución de consultas por estado')).toBeInTheDocument());
    // 10 pendientes de 42 totales en consultasPorEstado (10+32=42) -> 24%
    expect(screen.getByText('24%')).toBeInTheDocument();
  });

  test('muestra los accesos rapidos a las secciones de admin', async () => {
    obtenerResumenEstadisticas.mockResolvedValue(statsEjemplo);
    listarTodasConsultas.mockResolvedValue([]);
    renderPagina();
    await waitFor(() => expect(screen.getByText('Usuarios')).toBeInTheDocument());
    expect(screen.getAllByText('Establecimientos').length).toBeGreaterThan(0);
    expect(screen.getByText('Auditoría')).toBeInTheDocument();
  });

  test('muestra las ultimas 6 consultas mas recientes', async () => {
    obtenerResumenEstadisticas.mockResolvedValue(statsEjemplo);
    listarTodasConsultas.mockResolvedValue([consultaReciente]);
    renderPagina();
    await waitFor(() => expect(screen.getByText('Juan Perez')).toBeInTheDocument());
    expect(screen.getByText('cardiologia')).toBeInTheDocument();
  });

  test('muestra "Sin consultas aún" cuando no hay consultas recientes', async () => {
    obtenerResumenEstadisticas.mockResolvedValue(statsEjemplo);
    listarTodasConsultas.mockResolvedValue([]);
    renderPagina();
    await waitFor(() => expect(screen.getByText('Sin consultas aún.')).toBeInTheDocument());
  });

  test('si las peticiones fallan, no rompe la pagina', async () => {
    obtenerResumenEstadisticas.mockRejectedValue(new Error('500'));
    listarTodasConsultas.mockRejectedValue(new Error('500'));
    renderPagina();
    await waitFor(() => expect(screen.getByText('Panel de control')).toBeInTheDocument());
  });
});
