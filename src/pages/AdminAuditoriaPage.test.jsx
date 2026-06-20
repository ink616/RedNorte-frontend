import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminAuditoriaPage from './AdminAuditoriaPage';

jest.mock('../service/api', () => ({
  listarAuditoria: jest.fn(),
}));

import { listarAuditoria } from '../service/api';

const registroEjemplo = {
  id: 1, accion: 'LOGIN', modulo: 'USUARIOS', usuarioId: 'USR010', usuarioRol: 'PACIENTE',
  descripcion: 'Inicio de sesión exitoso', resultado: 'EXITOSO', fechaHora: '2026-06-20T10:00:00',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AdminAuditoriaPage', () => {
  test('muestra el spinner mientras carga', () => {
    listarAuditoria.mockReturnValue(new Promise(() => {}));
    render(<AdminAuditoriaPage />);
    expect(screen.getByText('Cargando registros...')).toBeInTheDocument();
  });

  test('renderiza los registros de auditoria tras cargar', async () => {
    listarAuditoria.mockResolvedValue([registroEjemplo]);
    render(<AdminAuditoriaPage />);
    await waitFor(() => expect(screen.getByText('Inicio de sesión exitoso')).toBeInTheDocument());
    expect(screen.getAllByText('LOGIN').length).toBeGreaterThan(0);
  });

  test('muestra el mensaje de sin registros cuando la lista esta vacia', async () => {
    listarAuditoria.mockResolvedValue([]);
    render(<AdminAuditoriaPage />);
    await waitFor(() => expect(screen.getByText('Sin registros de auditoria.')).toBeInTheDocument());
  });

  test('filtra por modulo', async () => {
    listarAuditoria.mockResolvedValue([
      registroEjemplo,
      { ...registroEjemplo, id: 2, modulo: 'CONSULTAS', accion: 'CREAR', descripcion: 'Consulta creada' },
    ]);
    render(<AdminAuditoriaPage />);
    await waitFor(() => expect(screen.getByText('Inicio de sesión exitoso')).toBeInTheDocument());

    fireEvent.change(screen.getByDisplayValue('Todos los modulos'), { target: { value: 'CONSULTAS' } });

    expect(screen.queryByText('Inicio de sesión exitoso')).not.toBeInTheDocument();
    expect(screen.getByText('Consulta creada')).toBeInTheDocument();
  });

  test('filtra por accion', async () => {
    listarAuditoria.mockResolvedValue([
      registroEjemplo,
      { ...registroEjemplo, id: 2, accion: 'ELIMINAR', descripcion: 'Registro eliminado' },
    ]);
    render(<AdminAuditoriaPage />);
    await waitFor(() => expect(screen.getByText('Inicio de sesión exitoso')).toBeInTheDocument());

    fireEvent.change(screen.getByDisplayValue('Todas las acciones'), { target: { value: 'ELIMINAR' } });

    expect(screen.queryByText('Inicio de sesión exitoso')).not.toBeInTheDocument();
    expect(screen.getByText('Registro eliminado')).toBeInTheDocument();
  });

  test('el boton Limpiar resetea los filtros', async () => {
    listarAuditoria.mockResolvedValue([
      registroEjemplo,
      { ...registroEjemplo, id: 2, modulo: 'CONSULTAS', descripcion: 'Otra accion' },
    ]);
    render(<AdminAuditoriaPage />);
    await waitFor(() => expect(screen.getByText('Inicio de sesión exitoso')).toBeInTheDocument());

    fireEvent.change(screen.getByDisplayValue('Todos los modulos'), { target: { value: 'CONSULTAS' } });
    fireEvent.click(screen.getByText('Limpiar'));

    expect(screen.getByText('Inicio de sesión exitoso')).toBeInTheDocument();
    expect(screen.getByText('Otra accion')).toBeInTheDocument();
  });
});
