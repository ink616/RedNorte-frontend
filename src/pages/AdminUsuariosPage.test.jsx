import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminUsuariosPage from './AdminUsuariosPage';

jest.mock('../service/api', () => ({
  listarUsuarios: jest.fn(),
  listarRoles: jest.fn(),
  registrarUsuario: jest.fn(),
  obtenerFicha: jest.fn(),
  listarConsultasPorUsuario: jest.fn(),
}));

import {
  listarUsuarios, listarRoles, registrarUsuario, obtenerFicha, listarConsultasPorUsuario,
} from '../service/api';

const usuarioEjemplo = {
  id: 'USR010', mail: 'juan.perez@correo.cl', estado: 'ACTIVO',
  rol: { id: 'ROL002', tag: 'PACIENTE', nombre: 'Paciente' },
  persona: { apellido1: 'Perez', apellido2: 'Castro' },
  fechaRegistro: '2026-01-10T00:00:00',
};

const rolEjemplo = { id: 'ROL002', tag: 'PACIENTE', nombre: 'Paciente' };

beforeEach(() => {
  jest.clearAllMocks();
  listarRoles.mockResolvedValue([rolEjemplo]);
  obtenerFicha.mockResolvedValue(null);
  listarConsultasPorUsuario.mockResolvedValue([]);
});

describe('AdminUsuariosPage', () => {
  test('muestra el spinner mientras carga', () => {
    listarUsuarios.mockReturnValue(new Promise(() => {}));
    render(<AdminUsuariosPage />);
    expect(screen.getByText('Cargando usuarios...')).toBeInTheDocument();
  });

  test('renderiza la lista de usuarios tras cargar', async () => {
    listarUsuarios.mockResolvedValue([usuarioEjemplo]);
    render(<AdminUsuariosPage />);
    await waitFor(() => expect(screen.getByText('juan.perez@correo.cl')).toBeInTheDocument());
    expect(screen.getByText('Perez Castro')).toBeInTheDocument();
  });

  test('muestra "Sin resultados" cuando la lista esta vacia', async () => {
    listarUsuarios.mockResolvedValue([]);
    render(<AdminUsuariosPage />);
    await waitFor(() => expect(screen.getByText('Sin resultados.')).toBeInTheDocument());
  });

  test('filtra usuarios por busqueda de correo', async () => {
    listarUsuarios.mockResolvedValue([
      usuarioEjemplo,
      { ...usuarioEjemplo, id: 'USR011', mail: 'ana@correo.cl', persona: { apellido1: 'Soto' } },
    ]);
    render(<AdminUsuariosPage />);
    await waitFor(() => expect(screen.getByText('juan.perez@correo.cl')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText(/Buscar por nombre/), { target: { value: 'ana' } });

    expect(screen.queryByText('juan.perez@correo.cl')).not.toBeInTheDocument();
    expect(screen.getByText('ana@correo.cl')).toBeInTheDocument();
  });

  test('abre y cierra el formulario de nuevo usuario', async () => {
    listarUsuarios.mockResolvedValue([]);
    render(<AdminUsuariosPage />);
    await waitFor(() => screen.getByText('Sin resultados.'));

    fireEvent.click(screen.getByText('+ Nuevo usuario'));
    expect(screen.getByText('Crear nuevo usuario')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancelar'));
    expect(screen.queryByText('Crear nuevo usuario')).not.toBeInTheDocument();
  });

  test('crea un usuario nuevo con datos validos', async () => {
    listarUsuarios.mockResolvedValue([]);
    registrarUsuario.mockResolvedValue({});
    render(<AdminUsuariosPage />);
    await waitFor(() => screen.getByText('Sin resultados.'));
    fireEvent.click(screen.getByText('+ Nuevo usuario'));

    fireEvent.change(screen.getByPlaceholderText('Ej: USR010'), { target: { value: 'USR099' } });
    fireEvent.change(document.querySelector('input[type="email"]'), { target: { value: 'nuevo@correo.cl' } });
    fireEvent.change(document.querySelector('input[type="password"]'), { target: { value: 'clave1234' } });
    fireEvent.change(screen.getByDisplayValue('Selecciona...'), { target: { value: 'ROL002' } });

    fireEvent.click(screen.getByText('Crear usuario'));

    await waitFor(() => expect(registrarUsuario).toHaveBeenCalledWith(expect.objectContaining({
      id: 'USR099',
      mail: 'nuevo@correo.cl',
    })));
    await waitFor(() => expect(screen.getByText(/creado correctamente/)).toBeInTheDocument());
  });

  test('muestra error si la creacion de usuario falla', async () => {
    listarUsuarios.mockResolvedValue([]);
    registrarUsuario.mockRejectedValue(new Error('409'));
    render(<AdminUsuariosPage />);
    await waitFor(() => screen.getByText('Sin resultados.'));
    fireEvent.click(screen.getByText('+ Nuevo usuario'));

    fireEvent.change(screen.getByPlaceholderText('Ej: USR010'), { target: { value: 'USR099' } });
    fireEvent.change(document.querySelector('input[type="email"]'), { target: { value: 'a@b.cl' } });
    fireEvent.change(document.querySelector('input[type="password"]'), { target: { value: 'x' } });
    fireEvent.change(screen.getByDisplayValue('Selecciona...'), { target: { value: 'ROL002' } });

    fireEvent.click(screen.getByText('Crear usuario'));

    await waitFor(() => expect(screen.getByText(/ID o correo ya puede estar en uso/)).toBeInTheDocument());
  });

  test('al hacer click en una fila, abre el modal con la ficha del usuario', async () => {
    listarUsuarios.mockResolvedValue([usuarioEjemplo]);
    obtenerFicha.mockResolvedValue({ estatura: 175, peso: 70, grupoSanguineo: 'O+' });
    render(<AdminUsuariosPage />);
    await waitFor(() => expect(screen.getByText('juan.perez@correo.cl')).toBeInTheDocument());

    fireEvent.click(screen.getByText('juan.perez@correo.cl').closest('tr'));

    await waitFor(() => expect(obtenerFicha).toHaveBeenCalledWith('USR010'));
    await waitFor(() => expect(screen.getByText('USR010 · juan.perez@correo.cl')).toBeInTheDocument());
  });

  test('en el modal, cambia a la pestaña de consultas y las muestra', async () => {
    listarUsuarios.mockResolvedValue([usuarioEjemplo]);
    obtenerFicha.mockResolvedValue(null);
    listarConsultasPorUsuario.mockResolvedValue([
      { id: 9, especialidad: 'cardiologia', estado: 'PENDIENTE', sintomas: 'Dolor de pecho' },
    ]);
    render(<AdminUsuariosPage />);
    await waitFor(() => expect(screen.getByText('juan.perez@correo.cl')).toBeInTheDocument());
    fireEvent.click(screen.getByText('juan.perez@correo.cl').closest('tr'));
    await waitFor(() => expect(screen.getByText(/Consultas \(1\)/)).toBeInTheDocument());

    fireEvent.click(screen.getByText(/Consultas \(1\)/));

    expect(screen.getByText(/#9 — cardiologia/)).toBeInTheDocument();
  });

  test('el modal se cierra al hacer click en la X', async () => {
    listarUsuarios.mockResolvedValue([usuarioEjemplo]);
    render(<AdminUsuariosPage />);
    await waitFor(() => expect(screen.getByText('juan.perez@correo.cl')).toBeInTheDocument());
    fireEvent.click(screen.getByText('juan.perez@correo.cl').closest('tr'));
    await waitFor(() => screen.getByText('USR010 · juan.perez@correo.cl'));

    fireEvent.click(screen.getByText('✕'));

    expect(screen.queryByText('USR010 · juan.perez@correo.cl')).not.toBeInTheDocument();
  });
});
