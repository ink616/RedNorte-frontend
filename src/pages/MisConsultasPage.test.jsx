import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MisConsultasPage from './MisConsultasPage';
import { AuthProvider } from '../context/AuthContext';

jest.mock('../service/api', () => ({
  listarConsultasPorUsuario: jest.fn(),
}));

import { listarConsultasPorUsuario } from '../service/api';

const usuarioMock = { id: 'USR010', mail: 'juan.perez@correo.cl', rol: { tag: 'PACIENTE' }, token: 'jwt.token' };

const renderPagina = () => render(
  <MemoryRouter>
    <AuthProvider>
      <MisConsultasPage />
    </AuthProvider>
  </MemoryRouter>
);

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  // AuthContext lee la sesion desde localStorage al inicializar el estado,
  // asi que sembramos un usuario logueado antes de renderizar la pagina.
  localStorage.setItem('rednorte_usuario', JSON.stringify(usuarioMock));
});

describe('MisConsultasPage', () => {
  test('muestra el spinner mientras carga', () => {
    listarConsultasPorUsuario.mockReturnValue(new Promise(() => {})); // nunca resuelve
    renderPagina();
    expect(screen.getByText(/Cargando tus consultas/)).toBeInTheDocument();
  });

  test('pide las consultas del usuario logueado', async () => {
    listarConsultasPorUsuario.mockResolvedValue([]);
    renderPagina();
    await waitFor(() => expect(listarConsultasPorUsuario).toHaveBeenCalledWith('USR010'));
  });

  test('muestra el estado vacio cuando no hay consultas', async () => {
    listarConsultasPorUsuario.mockResolvedValue([]);
    renderPagina();
    await waitFor(() => expect(screen.getByText(/No tienes consultas aún/)).toBeInTheDocument());
    // Hay dos botones "Agendar cita": uno en el header y otro en el empty-state.
    expect(screen.getAllByText('📅 Agendar cita').length).toBeGreaterThanOrEqual(1);
  });

  test('muestra un mensaje de error si la peticion falla', async () => {
    listarConsultasPorUsuario.mockRejectedValue(new Error('500'));
    renderPagina();
    await waitFor(() => expect(screen.getByText(/No se pudieron cargar/)).toBeInTheDocument());
  });

  test('renderiza la lista de consultas y las estadisticas', async () => {
    listarConsultasPorUsuario.mockResolvedValue([
      { id: 1, especialidad: 'cardiologia', sintomas: 'Dolor de pecho', estado: 'PENDIENTE' },
      { id: 2, especialidad: 'medicina general', sintomas: 'Control', estado: 'AGENDADA', fechaCita: '2026-06-25T10:00:00' },
      { id: 3, especialidad: 'neurologia', sintomas: 'Migraña', estado: 'ATENDIDA' },
    ]);
    renderPagina();

    await waitFor(() => expect(screen.getByText('cardiologia')).toBeInTheDocument());
    expect(screen.getByText('medicina general')).toBeInTheDocument();
    expect(screen.getByText('neurologia')).toBeInTheDocument();

    // Stats: total=3, pendientes=1, agendadas=1, atendidas=1
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('filtra las consultas por estado al hacer click en un chip', async () => {
    listarConsultasPorUsuario.mockResolvedValue([
      { id: 1, especialidad: 'cardiologia', sintomas: 'Dolor', estado: 'PENDIENTE' },
      { id: 2, especialidad: 'pediatria', sintomas: 'Fiebre', estado: 'ATENDIDA' },
    ]);
    renderPagina();
    await waitFor(() => expect(screen.getByText('cardiologia')).toBeInTheDocument());

    fireEvent.click(screen.getByText('ATENDIDA'));

    expect(screen.queryByText('cardiologia')).not.toBeInTheDocument();
    expect(screen.getByText('pediatria')).toBeInTheDocument();
  });

  test('trunca los sintomas largos con elipsis', async () => {
    const sintomaLargo = 'A'.repeat(80);
    listarConsultasPorUsuario.mockResolvedValue([
      { id: 1, especialidad: 'cardiologia', sintomas: sintomaLargo, estado: 'PENDIENTE' },
    ]);
    renderPagina();

    await waitFor(() => {
      const celda = screen.getByText((content) => content.startsWith('A') && content.endsWith('…'));
      expect(celda).toBeInTheDocument();
    });
  });

  test('muestra el link de editar solo para consultas PENDIENTE o AGENDADA', async () => {
    listarConsultasPorUsuario.mockResolvedValue([
      { id: 1, especialidad: 'cardiologia', sintomas: 'x', estado: 'PENDIENTE' },
      { id: 2, especialidad: 'pediatria', sintomas: 'y', estado: 'ATENDIDA' },
    ]);
    renderPagina();
    await waitFor(() => expect(screen.getAllByText('✏️ Editar')).toHaveLength(1));
  });
});
