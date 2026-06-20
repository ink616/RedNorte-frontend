import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AdminEstadisticasPage from './AdminEstadisticasPage';

jest.mock('../service/api', () => ({
  obtenerResumenEstadisticas: jest.fn(),
  estadisticasConsultas: jest.fn(),
  estadisticasAgenda: jest.fn(),
}));

import { obtenerResumenEstadisticas, estadisticasConsultas, estadisticasAgenda } from '../service/api';

const resumenEjemplo = {
  totalConsultas: 42, totalUsuarios: 15, totalBloquesAgenda: 120, totalEstablecimientos: 5,
  consultasPorEstado: { PENDIENTE: 10, ATENDIDA: 32 },
  bloquesPorEstado: { DISPONIBLE: 80, RESERVADO: 40 },
  establecimientosPorTipo: { HOSPITAL: 3, CESFAM: 2 },
};

beforeEach(() => {
  jest.clearAllMocks();
  estadisticasConsultas.mockResolvedValue({});
  estadisticasAgenda.mockResolvedValue({});
});

describe('AdminEstadisticasPage', () => {
  test('muestra el spinner mientras carga', () => {
    obtenerResumenEstadisticas.mockReturnValue(new Promise(() => {}));
    render(<AdminEstadisticasPage />);
    expect(screen.getByText('Cargando estadísticas...')).toBeInTheDocument();
  });

  test('muestra los totales del resumen tras cargar', async () => {
    obtenerResumenEstadisticas.mockResolvedValue(resumenEjemplo);
    render(<AdminEstadisticasPage />);
    await waitFor(() => expect(screen.getAllByText('42').length).toBeGreaterThan(0));
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('muestra un guion cuando un total no esta disponible', async () => {
    obtenerResumenEstadisticas.mockResolvedValue({});
    render(<AdminEstadisticasPage />);
    await waitFor(() => expect(screen.getAllByText('—').length).toBeGreaterThan(0));
  });

  test('renderiza el donut de consultas por estado con sus porcentajes', async () => {
    obtenerResumenEstadisticas.mockResolvedValue(resumenEjemplo);
    render(<AdminEstadisticasPage />);
    await waitFor(() => expect(screen.getByText('🍩 Consultas por estado')).toBeInTheDocument());
    expect(screen.getAllByText('PENDIENTE').length).toBeGreaterThan(0);
    expect(screen.getByText('(76%)')).toBeInTheDocument(); // 32/42 ≈ 76%
  });

  test('renderiza las barras de bloques de agenda por estado', async () => {
    obtenerResumenEstadisticas.mockResolvedValue(resumenEjemplo);
    render(<AdminEstadisticasPage />);
    await waitFor(() => expect(screen.getByText('📊 Bloques de agenda por estado')).toBeInTheDocument());
    expect(screen.getByText('DISPONIBLE')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
  });

  test('muestra "Sin datos disponibles" cuando una categoria viene vacia', async () => {
    obtenerResumenEstadisticas.mockResolvedValue({ ...resumenEjemplo, establecimientosPorTipo: {} });
    render(<AdminEstadisticasPage />);
    await waitFor(() => expect(screen.getByText('🏥 Establecimientos por tipo')).toBeInTheDocument());
    expect(screen.getByText('Sin datos disponibles.')).toBeInTheDocument();
  });

  test('si el resumen general falla, no rompe la pagina', async () => {
    obtenerResumenEstadisticas.mockRejectedValue(new Error('500'));
    render(<AdminEstadisticasPage />);
    await waitFor(() => expect(screen.getByText('📈 Estadísticas y reportes')).toBeInTheDocument());
  });
});
