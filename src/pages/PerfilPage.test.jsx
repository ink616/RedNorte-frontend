import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PerfilPage from './PerfilPage';
import { AuthProvider } from '../context/AuthContext';

jest.mock('../service/api', () => ({
  obtenerFicha: jest.fn(),
  guardarFicha: jest.fn(),
  listarConsultasPorUsuario: jest.fn(),
}));

import { obtenerFicha, guardarFicha, listarConsultasPorUsuario } from '../service/api';

const usuarioMock = {
  id: 'USR010', mail: 'juan.perez@correo.cl', rol: { tag: 'PACIENTE' }, token: 'jwt.token',
  persona: { apellido1: 'Perez', apellido2: 'Castro' },
};

const renderPagina = () => render(
  <MemoryRouter>
    <AuthProvider>
      <PerfilPage />
    </AuthProvider>
  </MemoryRouter>
);

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  localStorage.setItem('rednorte_usuario', JSON.stringify(usuarioMock));
  listarConsultasPorUsuario.mockResolvedValue([{ id: 1 }, { id: 2 }]);
});

describe('PerfilPage', () => {
  test('muestra el spinner mientras carga', () => {
    obtenerFicha.mockReturnValue(new Promise(() => {}));
    renderPagina();
    expect(screen.getByText('Cargando perfil...')).toBeInTheDocument();
  });

  test('muestra el nombre y correo del usuario tras cargar', async () => {
    obtenerFicha.mockResolvedValue(null);
    renderPagina();
    await waitFor(() => expect(screen.getByText('Perez Castro')).toBeInTheDocument());
    expect(screen.getByText('juan.perez@correo.cl')).toBeInTheDocument();
  });

  test('muestra el total de consultas del usuario', async () => {
    obtenerFicha.mockResolvedValue(null);
    renderPagina();
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());
  });

  test('calcula el IMC y su etiqueta cuando hay estatura y peso', async () => {
    obtenerFicha.mockResolvedValue({ estatura: 175, peso: 70 });
    renderPagina();
    await waitFor(() => expect(screen.getByText('22.9')).toBeInTheDocument());
    expect(screen.getByText('Normal ✅')).toBeInTheDocument();
  });

  test('sin estatura/peso, muestra guion en vez de IMC', async () => {
    obtenerFicha.mockResolvedValue(null);
    renderPagina();
    await waitFor(() => expect(screen.getByText('IMC')).toBeInTheDocument());
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  test('muestra las alergias y condiciones registradas como tags', async () => {
    obtenerFicha.mockResolvedValue({ alergias: 'Penicilina, Polen', condicionesCronicas: 'Asma' });
    renderPagina();
    await waitFor(() => expect(screen.getByText('Penicilina')).toBeInTheDocument());
    expect(screen.getByText('Polen')).toBeInTheDocument();
    expect(screen.getByText('Asma')).toBeInTheDocument();
  });

  test('sugiere completar el perfil cuando la completitud es baja', async () => {
    obtenerFicha.mockResolvedValue(null);
    renderPagina();
    await waitFor(() => expect(screen.getByText(/Completar tu información médica/)).toBeInTheDocument());
  });

  test('al hacer click en Editar, cambia a la vista de edicion', async () => {
    obtenerFicha.mockResolvedValue(null);
    renderPagina();
    await waitFor(() => expect(screen.getByText('Perez Castro')).toBeInTheDocument());

    fireEvent.click(screen.getAllByText('Editar')[0]);

    expect(screen.getByText('✏️ Editar información')).toBeInTheDocument();
  });

  test('permite escribir en el campo telefono dentro de la vista de edicion', async () => {
    obtenerFicha.mockResolvedValue(null);
    renderPagina();
    await waitFor(() => expect(screen.getByText('Perez Castro')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('Editar')[0]);

    const inputTelefono = screen.getByPlaceholderText('+56 9 1234 5678');
    fireEvent.change(inputTelefono, { target: { value: '+56912345678' } });

    expect(inputTelefono).toHaveValue('+56912345678');
  });

  test('el boton "No sé / No tengo este dato" rellena el campo con ese texto', async () => {
    obtenerFicha.mockResolvedValue(null);
    renderPagina();
    await waitFor(() => expect(screen.getByText('Perez Castro')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('Editar')[0]);

    const botonesNoSe = screen.getAllByText('No sé / No tengo este dato');
    fireEvent.click(botonesNoSe[0]); // corresponde al campo estatura

    expect(screen.getByPlaceholderText('170')).toHaveValue(null); // input number con texto no numerico queda vacio visualmente
  });

  test('guarda los cambios y vuelve a la vista de resumen', async () => {
    obtenerFicha.mockResolvedValue(null);
    guardarFicha.mockResolvedValue({});
    renderPagina();
    await waitFor(() => expect(screen.getByText('Perez Castro')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('Editar')[0]);

    fireEvent.click(screen.getByText('💾 Guardar cambios'));

    await waitFor(() => expect(guardarFicha).toHaveBeenCalledWith('USR010', expect.any(Object)));
    await waitFor(() => expect(screen.getByText(/Cambios guardados correctamente/)).toBeInTheDocument());
  });

  test('el boton Cancelar en modo edicion vuelve al resumen sin guardar', async () => {
    obtenerFicha.mockResolvedValue(null);
    renderPagina();
    await waitFor(() => expect(screen.getByText('Perez Castro')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('Editar')[0]);

    fireEvent.click(screen.getByText('Cancelar'));

    expect(guardarFicha).not.toHaveBeenCalled();
    expect(screen.queryByText('✏️ Editar información')).not.toBeInTheDocument();
  });

  test('el tooltip de ayuda se muestra y oculta al hacer click', async () => {
    obtenerFicha.mockResolvedValue(null);
    renderPagina();
    await waitFor(() => expect(screen.getByText('Perez Castro')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('Editar')[0]);

    const botonesAyuda = screen.getAllByText('?');
    fireEvent.click(botonesAyuda[0]);

    expect(screen.getByText(/Tu altura en centímetros/)).toBeInTheDocument();
  });
});
