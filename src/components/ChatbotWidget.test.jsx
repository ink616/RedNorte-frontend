import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ChatbotWidget from './ChatbotWidget';
import { AuthProvider } from '../context/AuthContext';

jest.mock('../service/api', () => ({
  enviarMensajeChatbot: jest.fn(),
  obtenerHistorialChatbot: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import { enviarMensajeChatbot, obtenerHistorialChatbot } from '../service/api';

const renderWidget = () => render(
  <MemoryRouter>
    <AuthProvider>
      <ChatbotWidget />
    </AuthProvider>
  </MemoryRouter>
);

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  obtenerHistorialChatbot.mockResolvedValue([]);
});

describe('ChatbotWidget', () => {
  test('muestra el boton flotante (FAB) cerrado por defecto', () => {
    renderWidget();
    expect(screen.getByLabelText('Abrir chat con SaludBot')).toBeInTheDocument();
    expect(screen.queryByText('SaludBot')).not.toBeInTheDocument();
  });

  test('al hacer click en el FAB, abre la ventana con el mensaje de bienvenida', async () => {
    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));

    expect(screen.getByText('SaludBot')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('¡Hola! Soy SaludBot 👋')).toBeInTheDocument());
  });

  test('muestra los chips de sugerencias iniciales', () => {
    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));
    expect(screen.getByText('Quiero agendar una cita')).toBeInTheDocument();
    expect(screen.getByText('¿Qué especialidades tienen?')).toBeInTheDocument();
  });

  test('al hacer click en un chip de sugerencia, envia ese mensaje', async () => {
    enviarMensajeChatbot.mockResolvedValue({ respuesta: 'Claro, ¿qué especialidad necesitas?', emocion: 'NEUTRAL' });
    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));

    fireEvent.click(screen.getByText('Quiero agendar una cita'));

    await waitFor(() => expect(enviarMensajeChatbot).toHaveBeenCalledWith(
      expect.objectContaining({ mensaje: 'Quiero agendar una cita' })
    ));
  });

  test('escribir y enviar un mensaje lo muestra en la conversacion junto a la respuesta del bot', async () => {
    enviarMensajeChatbot.mockResolvedValue({ respuesta: '¡Hola! ¿En qué puedo ayudarte?', emocion: 'ACOGEDOR' });
    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));

    fireEvent.change(screen.getByPlaceholderText('Escribe tu mensaje...'), { target: { value: 'Hola' } });
    fireEvent.click(screen.getByLabelText('Enviar mensaje'));

    expect(screen.getByText('Hola')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('¡Hola! ¿En qué puedo ayudarte?')).toBeInTheDocument());
  });

  test('para un visitante sin sesion, usuarioId viaja como null', async () => {
    enviarMensajeChatbot.mockResolvedValue({ respuesta: 'Hola', emocion: 'ACOGEDOR' });
    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));

    fireEvent.change(screen.getByPlaceholderText('Escribe tu mensaje...'), { target: { value: 'Hola' } });
    fireEvent.click(screen.getByLabelText('Enviar mensaje'));

    await waitFor(() => expect(enviarMensajeChatbot).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: null })
    ));
  });

  test('genera y reutiliza un identificador de conversacion anonimo en localStorage', async () => {
    enviarMensajeChatbot.mockResolvedValue({ respuesta: 'Hola', emocion: 'ACOGEDOR' });
    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));
    fireEvent.change(screen.getByPlaceholderText('Escribe tu mensaje...'), { target: { value: 'Hola' } });
    fireEvent.click(screen.getByLabelText('Enviar mensaje'));

    await waitFor(() => expect(enviarMensajeChatbot).toHaveBeenCalled());
    expect(localStorage.getItem('rednorte_chatbot_anon_id')).toMatch(/^anon-/);
  });

  test('cuando la cita se agenda con exito, muestra la tarjeta de confirmacion con boton', async () => {
    enviarMensajeChatbot.mockResolvedValue({
      respuesta: '¡Listo! Tu cita quedó agendada.',
      accionRealizada: 'CITA_AGENDADA',
      datosAccion: { fecha: '2026-06-22', hora: '08:00' },
      emocion: 'CELEBRACION',
    });
    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));
    fireEvent.change(screen.getByPlaceholderText('Escribe tu mensaje...'), { target: { value: 'Confirmo' } });
    fireEvent.click(screen.getByLabelText('Enviar mensaje'));

    await waitFor(() => expect(screen.getByText('✅ Cita agendada')).toBeInTheDocument());
    expect(screen.getByText('Ver mis consultas')).toBeInTheDocument();
  });

  test('cuando se requiere registro, muestra la tarjeta con boton de crear cuenta', async () => {
    enviarMensajeChatbot.mockResolvedValue({
      respuesta: 'Necesitas crear una cuenta primero.',
      accionRealizada: 'REDIRIGIR_REGISTRO',
      emocion: 'NEUTRAL',
    });
    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));
    fireEvent.change(screen.getByPlaceholderText('Escribe tu mensaje...'), { target: { value: 'Quiero agendar' } });
    fireEvent.click(screen.getByLabelText('Enviar mensaje'));

    await waitFor(() => expect(screen.getByText('📝 Necesitas una cuenta')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Crear cuenta'));
    expect(mockNavigate).toHaveBeenCalledWith('/registro');
  });

  test('si la peticion falla, muestra un mensaje de respaldo sin romper el widget', async () => {
    enviarMensajeChatbot.mockRejectedValue(new Error('Network error'));
    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));
    fireEvent.change(screen.getByPlaceholderText('Escribe tu mensaje...'), { target: { value: 'Hola' } });
    fireEvent.click(screen.getByLabelText('Enviar mensaje'));

    await waitFor(() => expect(screen.getByText(/No pude conectarme/)).toBeInTheDocument());
  });

  test('el boton de enviar esta deshabilitado si el campo de texto esta vacio', () => {
    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));
    expect(screen.getByLabelText('Enviar mensaje')).toBeDisabled();
  });

  test('el boton de pantalla completa cambia el modo de la ventana', () => {
    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));

    fireEvent.click(screen.getByLabelText('Pantalla completa'));

    expect(screen.getByLabelText('Cerrar chat')).toBeInTheDocument();
  });

  test('el boton de cerrar oculta la ventana del chat', () => {
    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));
    expect(screen.getByText('SaludBot')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Cerrar chat'));

    expect(screen.queryByText('SaludBot')).not.toBeInTheDocument();
  });

  test('carga el historial existente al abrir el chat por primera vez', async () => {
    obtenerHistorialChatbot.mockResolvedValue([
      { rol: 'user', contenido: 'Hola', fechaHora: '2026-06-20T10:00:00' },
      { rol: 'assistant', contenido: '¡Hola! ¿En qué te ayudo?', fechaHora: '2026-06-20T10:00:05' },
    ]);
    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));

    await waitFor(() => expect(screen.getByText('¡Hola! ¿En qué te ayudo?')).toBeInTheDocument());
  });
});
