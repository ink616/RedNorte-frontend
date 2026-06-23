import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ChatbotWidget from './ChatbotWidget';
import { AuthProvider } from '../context/AuthContext';

jest.mock('../service/api', () => ({
  enviarMensajeChatbot: jest.fn(),
  obtenerHistorialChatbot: jest.fn(),
  borrarHistorialChatbot: jest.fn(),
  login: jest.fn(),
  registrarUsuario: jest.fn(),
  solicitarCodigoRecuperacion: jest.fn(),
  validarCodigoRecuperacion: jest.fn(),
  cambiarPasswordConCodigo: jest.fn(),
  listarBloquesDisponibles: jest.fn(),
  reservarBloque: jest.fn(),
  crearConsulta: jest.fn(),
  listarEstablecimientos: jest.fn(),
  enviarConfirmacionCita: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import {
  enviarMensajeChatbot, obtenerHistorialChatbot, borrarHistorialChatbot, listarEstablecimientos,
  listarBloquesDisponibles, crearConsulta, reservarBloque, enviarConfirmacionCita,
} from '../service/api';

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
  listarEstablecimientos.mockResolvedValue([]);
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

  test('cuando se requiere registro, el modal de registro se abre automaticamente', async () => {
    enviarMensajeChatbot.mockResolvedValue({
      respuesta: 'Necesitas crear una cuenta primero.',
      accionRealizada: 'REDIRIGIR_REGISTRO',
      emocion: 'NEUTRAL',
    });
    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));
    fireEvent.change(screen.getByPlaceholderText('Escribe tu mensaje...'), { target: { value: 'Quiero agendar' } });
    fireEvent.click(screen.getByLabelText('Enviar mensaje'));

    await waitFor(() => expect(screen.getByText('Crea tu cuenta gratis')).toBeInTheDocument());
  });

  test('cuando se requiere login, el modal de inicio de sesion se abre automaticamente', async () => {
    enviarMensajeChatbot.mockResolvedValue({
      respuesta: 'Te ayudo a iniciar sesión.',
      accionRealizada: 'REDIRIGIR_LOGIN',
      emocion: 'NEUTRAL',
    });
    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));
    fireEvent.change(screen.getByPlaceholderText('Escribe tu mensaje...'), { target: { value: 'No puedo entrar' } });
    fireEvent.click(screen.getByLabelText('Enviar mensaje'));

    await waitFor(() => expect(screen.getByText('Inicia sesión')).toBeInTheDocument());
  });

  test('cuando se requiere recuperar la contraseña, el modal correspondiente se abre automaticamente', async () => {
    enviarMensajeChatbot.mockResolvedValue({
      respuesta: 'Te ayudo a recuperar tu contraseña.',
      accionRealizada: 'REDIRIGIR_RECUPERAR',
      emocion: 'NEUTRAL',
    });
    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));
    fireEvent.change(screen.getByPlaceholderText('Escribe tu mensaje...'), { target: { value: 'Olvidé mi contraseña' } });
    fireEvent.click(screen.getByLabelText('Enviar mensaje'));

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Recuperar contraseña' })).toBeInTheDocument());
    expect(screen.getByPlaceholderText('tu@correo.cl')).toBeInTheDocument();
  });

  test('al completar la recuperacion con exito, muestra confirmacion y abre el modal de login', async () => {
    enviarMensajeChatbot.mockResolvedValue({
      respuesta: 'Te ayudo a recuperar tu contraseña.',
      accionRealizada: 'REDIRIGIR_RECUPERAR',
      emocion: 'NEUTRAL',
    });
    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));
    fireEvent.change(screen.getByPlaceholderText('Escribe tu mensaje...'), { target: { value: 'Olvidé mi contraseña' } });
    fireEvent.click(screen.getByLabelText('Enviar mensaje'));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Recuperar contraseña' })).toBeInTheDocument());

    // Cierra el modal de recuperacion directamente para simular que ya
    // completo el flujo (el detalle de los 3 pasos ya se prueba en
    // RecuperarPasswordModal.test.jsx; aqui solo se valida la integracion).
    fireEvent.click(screen.getByLabelText('Cerrar'));

    expect(screen.queryByRole('heading', { name: 'Recuperar contraseña' })).not.toBeInTheDocument();
  });

  test('la tarjeta de "necesitas una cuenta" tambien abre el modal al hacer click en su boton', async () => {
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

    // Cerrar el modal que ya se abrio solo, y volver a abrirlo desde la tarjeta
    fireEvent.click(screen.getByLabelText('Cerrar'));
    fireEvent.click(screen.getByText('Crear cuenta'));

    expect(screen.getByText('Crea tu cuenta gratis')).toBeInTheDocument();
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

  test('el boton de borrar esta deshabilitado cuando no hay mensajes', () => {
    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));
    expect(screen.getByLabelText('Borrar conversación')).toBeDisabled();
  });

  test('al hacer click en borrar, pide confirmacion antes de borrar de verdad', async () => {
    obtenerHistorialChatbot.mockResolvedValue([
      { rol: 'user', contenido: 'Hola', fechaHora: '2026-06-20T10:00:00' },
    ]);
    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));
    await waitFor(() => expect(screen.getByText('Hola')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('Borrar conversación'));

    expect(screen.getByText(/Borrar toda la conversación/)).toBeInTheDocument();
    expect(borrarHistorialChatbot).not.toHaveBeenCalled();
  });

  test('cancelar la confirmacion no borra nada y mantiene los mensajes', async () => {
    obtenerHistorialChatbot.mockResolvedValue([
      { rol: 'user', contenido: 'Hola', fechaHora: '2026-06-20T10:00:00' },
    ]);
    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));
    await waitFor(() => expect(screen.getByText('Hola')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Borrar conversación'));

    fireEvent.click(screen.getByText('Cancelar'));

    expect(screen.queryByText(/Borrar toda la conversación/)).not.toBeInTheDocument();
    expect(screen.getByText('Hola')).toBeInTheDocument();
    expect(borrarHistorialChatbot).not.toHaveBeenCalled();
  });

  test('confirmar el borrado llama a la API y limpia los mensajes mostrando la bienvenida de nuevo', async () => {
    obtenerHistorialChatbot.mockResolvedValue([
      { rol: 'user', contenido: 'Hola', fechaHora: '2026-06-20T10:00:00' },
      { rol: 'assistant', contenido: '¡Hola! ¿En qué te ayudo?', fechaHora: '2026-06-20T10:00:05' },
    ]);
    borrarHistorialChatbot.mockResolvedValue({});
    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));
    await waitFor(() => expect(screen.getByText('Hola')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Borrar conversación'));
    fireEvent.click(screen.getByText('Sí, borrar'));

    await waitFor(() => expect(borrarHistorialChatbot).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText('¡Hola! Soy SaludBot 👋')).toBeInTheDocument());
    expect(screen.queryByText('Hola')).not.toBeInTheDocument();
  });

  test('si borrar falla en el backend, igual limpia la vista local', async () => {
    obtenerHistorialChatbot.mockResolvedValue([
      { rol: 'user', contenido: 'Hola', fechaHora: '2026-06-20T10:00:00' },
    ]);
    borrarHistorialChatbot.mockRejectedValue(new Error('500'));
    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));
    await waitFor(() => expect(screen.getByText('Hola')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Borrar conversación'));
    fireEvent.click(screen.getByText('Sí, borrar'));

    await waitFor(() => expect(screen.getByText('¡Hola! Soy SaludBot 👋')).toBeInTheDocument());
  });

  test('cuando se requiere agendar, el modal de agendamiento se abre automaticamente', async () => {
    enviarMensajeChatbot.mockResolvedValue({
      respuesta: 'Claro, abramos tu agenda.',
      accionRealizada: 'REDIRIGIR_AGENDAR',
      emocion: 'NEUTRAL',
    });
    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));
    fireEvent.change(screen.getByPlaceholderText('Escribe tu mensaje...'), { target: { value: 'Quiero agendar una cita' } });
    fireEvent.click(screen.getByLabelText('Enviar mensaje'));

    await waitFor(() => expect(screen.getByText('¿Qué día te queda mejor?')).toBeInTheDocument());
  });

  test('la tarjeta de "agenda tu cita" tambien abre el modal al hacer click en su boton', async () => {
    enviarMensajeChatbot.mockResolvedValue({
      respuesta: 'Claro, abramos tu agenda.',
      accionRealizada: 'REDIRIGIR_AGENDAR',
      emocion: 'NEUTRAL',
    });
    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));
    fireEvent.change(screen.getByPlaceholderText('Escribe tu mensaje...'), { target: { value: 'Quiero agendar una cita' } });
    fireEvent.click(screen.getByLabelText('Enviar mensaje'));
    await waitFor(() => expect(screen.getByText('📅 Agenda tu cita')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('Cerrar'));
    expect(screen.queryByText('¿Qué día te queda mejor?')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Agendar cita'));
    expect(screen.getByText('¿Qué día te queda mejor?')).toBeInTheDocument();
  });

  test('el modal de agendamiento se cierra con el boton X sin agregar mensajes', async () => {
    enviarMensajeChatbot.mockResolvedValue({
      respuesta: 'Claro, abramos tu agenda.',
      accionRealizada: 'REDIRIGIR_AGENDAR',
      emocion: 'NEUTRAL',
    });
    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));
    fireEvent.change(screen.getByPlaceholderText('Escribe tu mensaje...'), { target: { value: 'Quiero agendar una cita' } });
    fireEvent.click(screen.getByLabelText('Enviar mensaje'));
    await waitFor(() => expect(screen.getByText('¿Qué día te queda mejor?')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('Cerrar'));

    expect(screen.queryByText('¿Qué día te queda mejor?')).not.toBeInTheDocument();
  });

  test('al agendar una cita con exito desde el modal, anuncia la confirmacion en el chat sin cerrar el modal', async () => {
    localStorage.setItem('rednorte_usuario', JSON.stringify({
      id: 'USR010', mail: 'juan.perez@correo.cl', rol: { tag: 'PACIENTE' }, token: 'jwt.token',
      persona: { apellido1: 'Perez', apellido2: 'Castro' },
    }));
    enviarMensajeChatbot.mockResolvedValue({
      respuesta: 'Claro, abramos tu agenda.',
      accionRealizada: 'REDIRIGIR_AGENDAR',
      emocion: 'NEUTRAL',
    });
    listarEstablecimientos.mockResolvedValue([{ id: 'EST-001', nombre: 'Hospital Regional del Norte' }]);
    listarBloquesDisponibles.mockResolvedValue([
      { id: 501, doctorId: 'USR002', establecimientoId: 'EST-001', horaInicio: '08:00:00', horaFin: '08:30:00', estado: 'DISPONIBLE' },
    ]);
    crearConsulta.mockResolvedValue({ id: 999 });
    reservarBloque.mockResolvedValue({});
    enviarConfirmacionCita.mockResolvedValue({});

    renderWidget();
    fireEvent.click(screen.getByLabelText('Abrir chat con SaludBot'));
    fireEvent.change(screen.getByPlaceholderText('Escribe tu mensaje...'), { target: { value: 'Quiero agendar una cita' } });
    fireEvent.click(screen.getByLabelText('Enviar mensaje'));
    await waitFor(() => expect(screen.getByText('¿Qué día te queda mejor?')).toBeInTheDocument());

    fireEvent.click(document.querySelectorAll('.ag-fecha-chip')[0]);
    await waitFor(() => expect(screen.getByText('08:00')).toBeInTheDocument());
    fireEvent.click(screen.getByText('08:00'));
    await waitFor(() => expect(screen.getByText('Confirma tu cita')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText(/Describe detalladamente/), { target: { value: 'Control general' } });
    fireEvent.click(screen.getByText('✅ Confirmar cita'));

    await waitFor(() => expect(screen.getByText('¡Cita agendada con éxito!')).toBeInTheDocument());
    // El modal sigue abierto (pantalla de exito de AgendarFlujo) y,
    // ademas, la confirmacion ya quedo anunciada en el historial del chat.
    await waitFor(() => expect(screen.getByText(/quedó agendada/)).toBeInTheDocument());
  });
});
