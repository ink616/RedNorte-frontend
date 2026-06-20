import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import EditarConsultaPage from './EditarConsultaPage';

jest.mock('../service/api', () => ({
  obtenerConsulta: jest.fn(),
  editarConsultaPaciente: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import { obtenerConsulta, editarConsultaPaciente } from '../service/api';

const consultaEjemplo = {
  id: 5, especialidad: 'cardiologia', sintomas: 'Dolor de pecho', estado: 'PENDIENTE',
};

const renderPagina = () => render(
  <MemoryRouter initialEntries={['/editar-consulta/5']}>
    <Routes>
      <Route path="/editar-consulta/:id" element={<EditarConsultaPage />} />
    </Routes>
  </MemoryRouter>
);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('EditarConsultaPage', () => {
  test('muestra el spinner mientras carga', () => {
    obtenerConsulta.mockReturnValue(new Promise(() => {}));
    renderPagina();
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  test('pide la consulta con el id de la URL', async () => {
    obtenerConsulta.mockResolvedValue(consultaEjemplo);
    renderPagina();
    await waitFor(() => expect(obtenerConsulta).toHaveBeenCalledWith('5'));
  });

  test('precarga el formulario con los sintomas existentes', async () => {
    obtenerConsulta.mockResolvedValue(consultaEjemplo);
    renderPagina();
    await waitFor(() => expect(screen.getByDisplayValue('Dolor de pecho')).toBeInTheDocument());
  });

  test('muestra la especialidad y el estado de la consulta', async () => {
    obtenerConsulta.mockResolvedValue(consultaEjemplo);
    renderPagina();
    await waitFor(() => expect(screen.getByText(/cardiologia/)).toBeInTheDocument());
    expect(screen.getByText(/PENDIENTE/)).toBeInTheDocument();
  });

  test('muestra error si la consulta no se pudo cargar', async () => {
    obtenerConsulta.mockRejectedValue(new Error('404'));
    renderPagina();
    await waitFor(() => expect(screen.getByText('No se pudo cargar la consulta.')).toBeInTheDocument());
  });

  test('guarda los cambios exitosamente', async () => {
    obtenerConsulta.mockResolvedValue(consultaEjemplo);
    editarConsultaPaciente.mockResolvedValue({});
    renderPagina();
    await waitFor(() => expect(screen.getByDisplayValue('Dolor de pecho')).toBeInTheDocument());

    fireEvent.change(screen.getByDisplayValue('Dolor de pecho'), { target: { value: 'Dolor de pecho intenso' } });
    fireEvent.click(screen.getByText('💾 Guardar cambios'));

    await waitFor(() => expect(editarConsultaPaciente).toHaveBeenCalledWith('5', { sintomas: 'Dolor de pecho intenso' }));
    await waitFor(() => expect(screen.getByText(/actualizada correctamente/)).toBeInTheDocument());
  });

  test('muestra error si el guardado falla', async () => {
    obtenerConsulta.mockResolvedValue(consultaEjemplo);
    editarConsultaPaciente.mockRejectedValue(new Error('500'));
    renderPagina();
    await waitFor(() => expect(screen.getByDisplayValue('Dolor de pecho')).toBeInTheDocument());

    fireEvent.click(screen.getByText('💾 Guardar cambios'));

    await waitFor(() => expect(screen.getByText('Error al guardar los cambios.')).toBeInTheDocument());
  });

  test('el boton Volver navega a mis-consultas', async () => {
    obtenerConsulta.mockResolvedValue(consultaEjemplo);
    renderPagina();
    await waitFor(() => expect(screen.getByDisplayValue('Dolor de pecho')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Volver'));

    expect(mockNavigate).toHaveBeenCalledWith('/mis-consultas');
  });
});
