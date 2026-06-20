import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminEstablecimientosPage from './AdminEstablecimientosPage';

jest.mock('../service/api', () => ({
  listarEstablecimientos: jest.fn(),
  crearEstablecimiento: jest.fn(),
  actualizarEstablecimiento: jest.fn(),
  eliminarEstablecimiento: jest.fn(),
}));

import {
  listarEstablecimientos, crearEstablecimiento, actualizarEstablecimiento, eliminarEstablecimiento,
} from '../service/api';

const establecimientoEjemplo = {
  id: 'EST-001', nombre: 'Hospital Regional del Norte', tipo: 'HOSPITAL',
  direccion: 'Av. Arturo Prat 1234', comuna: 'Iquique', region: 'Tarapacá',
  telefono: '+56572123456', email: 'contacto@hospital.cl', capacidadDiaria: 50, estado: 'ACTIVO',
};

beforeEach(() => {
  jest.clearAllMocks();
  window.confirm = jest.fn(() => true);
});

describe('AdminEstablecimientosPage', () => {
  test('muestra el spinner mientras carga', () => {
    listarEstablecimientos.mockReturnValue(new Promise(() => {}));
    render(<AdminEstablecimientosPage />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  test('renderiza la lista de establecimientos tras cargar', async () => {
    listarEstablecimientos.mockResolvedValue([establecimientoEjemplo]);
    render(<AdminEstablecimientosPage />);
    await waitFor(() => expect(screen.getByText('Hospital Regional del Norte')).toBeInTheDocument());
    expect(screen.getByText(/Iquique/)).toBeInTheDocument();
  });

  test('muestra el estado vacio cuando no hay establecimientos', async () => {
    listarEstablecimientos.mockResolvedValue([]);
    render(<AdminEstablecimientosPage />);
    await waitFor(() => expect(screen.getByText('Sin establecimientos')).toBeInTheDocument());
  });

  test('abre el modal de nuevo establecimiento', async () => {
    listarEstablecimientos.mockResolvedValue([]);
    render(<AdminEstablecimientosPage />);
    await waitFor(() => screen.getByText('Sin establecimientos'));

    fireEvent.click(screen.getByText('+ Nuevo establecimiento'));

    expect(screen.getByText('Nuevo establecimiento')).toBeInTheDocument();
  });

  test('exige los campos obligatorios antes de guardar', async () => {
    listarEstablecimientos.mockResolvedValue([]);
    render(<AdminEstablecimientosPage />);
    await waitFor(() => screen.getByText('Sin establecimientos'));
    fireEvent.click(screen.getByText('+ Nuevo establecimiento'));

    fireEvent.click(screen.getByText('Crear establecimiento'));

    await waitFor(() => expect(screen.getByText(/Completa los campos obligatorios/)).toBeInTheDocument());
    expect(crearEstablecimiento).not.toHaveBeenCalled();
  });

  test('crea un establecimiento con datos validos', async () => {
    listarEstablecimientos.mockResolvedValue([]);
    crearEstablecimiento.mockResolvedValue({});
    render(<AdminEstablecimientosPage />);
    await waitFor(() => screen.getByText('Sin establecimientos'));
    fireEvent.click(screen.getByText('+ Nuevo establecimiento'));

    fireEvent.change(screen.getByPlaceholderText('Hospital Regional del Norte'), { target: { value: 'CESFAM Central' } });
    fireEvent.change(screen.getByPlaceholderText('Av. Arturo Prat 1234'), { target: { value: 'Calle Falsa 123' } });
    const comunaRegion = screen.getAllByRole('textbox').filter(el => !el.placeholder);
    fireEvent.change(comunaRegion[0], { target: { value: 'Antofagasta' } });
    fireEvent.change(comunaRegion[1], { target: { value: 'Antofagasta' } });

    fireEvent.click(screen.getByText('Crear establecimiento'));

    await waitFor(() => expect(crearEstablecimiento).toHaveBeenCalledWith(expect.objectContaining({
      nombre: 'CESFAM Central',
      comuna: 'Antofagasta',
      region: 'Antofagasta',
    })));
  });

  test('abre el modal de edicion con los datos precargados', async () => {
    listarEstablecimientos.mockResolvedValue([establecimientoEjemplo]);
    render(<AdminEstablecimientosPage />);
    await waitFor(() => screen.getByText('Hospital Regional del Norte'));

    fireEvent.click(screen.getByText('✏️ Editar'));

    expect(screen.getByText('Editar establecimiento')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Hospital Regional del Norte')).toBeInTheDocument();
  });

  test('actualiza un establecimiento existente', async () => {
    listarEstablecimientos.mockResolvedValue([establecimientoEjemplo]);
    actualizarEstablecimiento.mockResolvedValue({});
    render(<AdminEstablecimientosPage />);
    await waitFor(() => screen.getByText('Hospital Regional del Norte'));
    fireEvent.click(screen.getByText('✏️ Editar'));

    fireEvent.click(screen.getByText('Guardar cambios'));

    await waitFor(() => expect(actualizarEstablecimiento).toHaveBeenCalledWith('EST-001', expect.any(Object)));
  });

  test('pide confirmacion y elimina el establecimiento', async () => {
    listarEstablecimientos.mockResolvedValue([establecimientoEjemplo]);
    eliminarEstablecimiento.mockResolvedValue({});
    render(<AdminEstablecimientosPage />);
    await waitFor(() => screen.getByText('Hospital Regional del Norte'));

    fireEvent.click(screen.getByText('🗑️'));

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => expect(eliminarEstablecimiento).toHaveBeenCalledWith('EST-001'));
  });

  test('cierra el modal al hacer click en Cancelar', async () => {
    listarEstablecimientos.mockResolvedValue([]);
    render(<AdminEstablecimientosPage />);
    await waitFor(() => screen.getByText('Sin establecimientos'));
    fireEvent.click(screen.getByText('+ Nuevo establecimiento'));

    fireEvent.click(screen.getByText('Cancelar'));

    expect(screen.queryByText('Nuevo establecimiento')).not.toBeInTheDocument();
  });
});
