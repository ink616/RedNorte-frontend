import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { enviarMensajeChatbot, obtenerHistorialChatbot, borrarHistorialChatbot } from '../service/api';
import ChatbotAccionModal from './ChatbotAccionModal';
import RecuperarPasswordModal from './RecuperarPasswordModal';
import AgendarCitaModal from './AgendarCitaModal';

/* ── Utilidades ─────────────────────────────────────────────── */

// Generador de id simple, sin depender de crypto.randomUUID(): esa API
// requiere un contexto seguro (HTTPS) y no existe en jsdom (entorno de
// test), asi que un generador propio es mas portable para este uso
// (un identificador de sesion anonima, no necesita ser criptografico).
function generarIdAnonimo() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function obtenerOCrearConversacionAnonima() {
  let id = localStorage.getItem('rednorte_chatbot_anon_id');
  if (!id) {
    id = 'anon-' + generarIdAnonimo();
    localStorage.setItem('rednorte_chatbot_anon_id', id);
  }
  return id;
}

function avatarPara(emocion) {
  const valido = ['acogedor', 'concentrado', 'celebracion', 'confundido', 'empatico', 'alerta', 'despedida', 'neutral'];
  const clave = (emocion || 'neutral').toLowerCase();
  const archivo = valido.includes(clave) ? clave : 'neutral';
  return `/img/saludbot/${archivo}.png`;
}

function formatHora(fecha) {
  return new Date(fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

const SUGERENCIAS_INICIALES = [
  'Quiero agendar una cita',
  '¿Qué especialidades tienen?',
  'Olvidé mi contraseña',
];

// Si la respuesta tarda mas que esto, el avatar muestra "concentrado"
// en vez del indicador de escritura generico (el backend no notifica
// un estado intermedio: es una heuristica simple del lado del cliente).
const UMBRAL_CONCENTRADO_MS = 1500;
// Tiempo sin que el usuario escriba para mostrar el estado "paciente".
const UMBRAL_INACTIVIDAD_MS = 35000;

export default function ChatbotWidget() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [abierto, setAbierto] = useState(false);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mostrarConcentrado, setMostrarConcentrado] = useState(false);
  const [inactivo, setInactivo] = useState(false);
  const [emocionActual, setEmocionActual] = useState('acogedor');
  const [hayMensajeNuevo, setHayMensajeNuevo] = useState(false);
  const [modalAccion, setModalAccion] = useState(null); // null | 'REGISTRO' | 'LOGIN' | 'RECUPERAR' | 'AGENDAR'
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);
  const [borrando, setBorrando] = useState(false);

  const scrollRef = useRef(null);
  const timerConcentradoRef = useRef(null);
  const timerInactividadRef = useRef(null);

  const identificadorConversacion = usuario?.id || obtenerOCrearConversacionAnonima();

  /* ── Carga del historial al abrir por primera vez ──────────── */
  useEffect(() => {
    if (!abierto || mensajes.length > 0) return;
    obtenerHistorialChatbot(identificadorConversacion)
      .then(historial => {
        if (Array.isArray(historial) && historial.length > 0) {
          setMensajes(historial.map(h => ({
            rol: h.rol, contenido: h.contenido, fechaHora: h.fechaHora,
          })));
        }
      })
      .catch(() => { /* si falla, simplemente arranca una conversacion nueva */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  /* ── Scroll automatico al fondo ─────────────────────────────── */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes, enviando]);

  /* ── Timer de inactividad ("Paciente") ──────────────────────── */
  const reiniciarTimerInactividad = useCallback(() => {
    setInactivo(false);
    if (timerInactividadRef.current) clearTimeout(timerInactividadRef.current);
    if (abierto) {
      timerInactividadRef.current = setTimeout(() => setInactivo(true), UMBRAL_INACTIVIDAD_MS);
    }
  }, [abierto]);

  useEffect(() => {
    reiniciarTimerInactividad();
    return () => { if (timerInactividadRef.current) clearTimeout(timerInactividadRef.current); };
  }, [reiniciarTimerInactividad, mensajes]);

  /* ── Envio de mensaje ────────────────────────────────────────── */
  const enviar = async (textoForzado) => {
    const contenido = (textoForzado ?? texto).trim();
    if (!contenido || enviando) return;

    reiniciarTimerInactividad();
    setHayMensajeNuevo(false);

    const mensajeUsuario = { rol: 'user', contenido, fechaHora: new Date().toISOString() };
    setMensajes(prev => [...prev, mensajeUsuario]);
    setTexto('');
    setEnviando(true);

    timerConcentradoRef.current = setTimeout(() => setMostrarConcentrado(true), UMBRAL_CONCENTRADO_MS);

    try {
      const dto = {
        mensaje: contenido,
        identificadorConversacion,
        usuarioId: usuario?.id || null,
        nombrePaciente: usuario?.persona
          ? `${usuario.persona.apellido1 || ''} ${usuario.persona.apellido2 || ''}`.trim()
          : null,
      };
      const respuesta = await enviarMensajeChatbot(dto);

      setEmocionActual((respuesta.emocion || 'neutral').toLowerCase());
      setMensajes(prev => [...prev, {
        rol: 'assistant',
        contenido: respuesta.respuesta,
        fechaHora: new Date().toISOString(),
        accionRealizada: respuesta.accionRealizada,
        datosAccion: respuesta.datosAccion,
      }]);
      if (!abierto) setHayMensajeNuevo(true);

      // El modal se abre solo, sin esperar a que el paciente toque un
      // boton: es la forma mas directa de cumplir lo que pidio SaludBot,
      // manteniendolo dentro del contexto del chat en vez de navegar a
      // otra pagina y perder la conversacion.
      if (respuesta.accionRealizada === 'REDIRIGIR_REGISTRO') {
        setModalAccion('REGISTRO');
      } else if (respuesta.accionRealizada === 'REDIRIGIR_LOGIN') {
        setModalAccion('LOGIN');
      } else if (respuesta.accionRealizada === 'REDIRIGIR_RECUPERAR') {
        setModalAccion('RECUPERAR');
      } else if (respuesta.accionRealizada === 'REDIRIGIR_AGENDAR') {
        setModalAccion('AGENDAR');
      }
    } catch {
      setMensajes(prev => [...prev, {
        rol: 'assistant',
        contenido: 'No pude conectarme en este momento. Si necesitas agendar una hora, puedes hacerlo directamente desde "Agendar Cita".',
        fechaHora: new Date().toISOString(),
      }]);
      setEmocionActual('confundido');
    } finally {
      clearTimeout(timerConcentradoRef.current);
      setMostrarConcentrado(false);
      setEnviando(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  const irARegistro = () => setModalAccion('REGISTRO');
  const irALogin = () => setModalAccion('LOGIN');
  const irARecuperar = () => setModalAccion('RECUPERAR');
  const irAAgendar = () => setModalAccion('AGENDAR');
  const irAMisConsultas = () => { navigate('/mis-consultas'); setAbierto(false); };
  const irAMisConsultasDesdeModal = () => { setModalAccion(null); irAMisConsultas(); };

  /* ── Borrar el historial de la conversacion actual ───────────── */
  const handleBorrarHistorial = async () => {
    setBorrando(true);
    try {
      await borrarHistorialChatbot(identificadorConversacion);
    } catch {
      // Si la llamada falla (ej. backend caido), igual se limpia la
      // vista local: el usuario ve una conversacion nueva, que es el
      // resultado que espera al pedir "borrar el chat".
    } finally {
      setMensajes([]);
      setEmocionActual('acogedor');
      setConfirmarBorrado(false);
      setBorrando(false);
    }
  };

  /* ── Maneja el cierre exitoso de los modales (registro/login/recuperar) ── */
  const manejarExitoModal = useCallback(({ tipo }) => {
    setModalAccion(null);
    const mensajesPorTipo = {
      REGISTRO: '✅ ¡Tu cuenta fue creada con éxito! Ya puedes seguir contándome qué necesitas, por ejemplo, agendar tu cita.',
      LOGIN: '✅ ¡Sesión iniciada correctamente! Sigamos donde quedamos.',
      RECUPERAR: '🔐 ¡Tu contraseña fue actualizada con éxito! Ya puedes iniciar sesión con tu nueva contraseña.',
    };
    setMensajes(prev => [...prev, {
      rol: 'assistant',
      contenido: mensajesPorTipo[tipo] || 'Listo, seguimos.',
      fechaHora: new Date().toISOString(),
    }]);
    setEmocionActual('celebracion');
    // Tras recuperar la contraseña, el flujo natural es pedirle que
    // inicie sesion con la nueva clave (no se loguea automaticamente).
    if (tipo === 'RECUPERAR') {
      setTimeout(() => setModalAccion('LOGIN'), 900);
    }
  }, []);

  /**
   * A diferencia de manejarExitoModal, esta NO cierra el modal: lo abrio
   * AgendarCitaModal apenas la cita quedo reservada con exito, mientras
   * AgendarFlujo sigue mostrando su propia pantalla de confirmacion
   * (con "Agendar otra" / "Ver mis consultas"). Aqui solo se anuncia la
   * cita en la conversacion para que, cuando el paciente vuelva al chat,
   * la encuentre ya confirmada ahi tambien.
   */
  const manejarExitoAgendar = useCallback((datos) => {
    const detalle = datos?.fecha && datos?.hora
      ? `para el ${datos.fecha} a las ${datos.hora}`
      : '';
    const conDoctor = datos?.doctor ? ` con ${datos.doctor}` : '';
    setMensajes(prev => [...prev, {
      rol: 'assistant',
      contenido: `✅ ¡Tu cita${conDoctor} quedó agendada ${detalle}!`.replace(/\s+/g, ' ').trim(),
      fechaHora: new Date().toISOString(),
    }]);
    setEmocionActual('celebracion');
  }, []);

  const avatarMostrado = enviando
    ? (mostrarConcentrado ? 'concentrado' : emocionActual)
    : (inactivo ? 'neutral' : emocionActual);

  /* ── Tarjeta de accion especial ─────────────────────────────── */
  const renderAccion = (msg) => {
    if (!msg.accionRealizada) return null;
    if (msg.accionRealizada === 'CITA_AGENDADA') {
      const d = msg.datosAccion || {};
      return (
        <div className="cb-accion-card">
          <div className="cb-accion-titulo">✅ Cita agendada</div>
          <div className="cb-accion-detalle">
            {d.fecha && d.hora ? `Confirmada para el ${d.fecha} a las ${d.hora}.` : 'Tu hora quedó reservada.'}
          </div>
          <button className="cb-accion-btn" onClick={irAMisConsultas}>Ver mis consultas</button>
        </div>
      );
    }
    if (msg.accionRealizada === 'REDIRIGIR_REGISTRO') {
      return (
        <div className="cb-accion-card cb-accion-card--info">
          <div className="cb-accion-titulo">📝 Necesitas una cuenta</div>
          <div className="cb-accion-detalle">Crear una cuenta toma menos de 2 minutos.</div>
          <button className="cb-accion-btn" onClick={irARegistro}>Crear cuenta</button>
        </div>
      );
    }
    if (msg.accionRealizada === 'REDIRIGIR_LOGIN') {
      return (
        <div className="cb-accion-card cb-accion-card--info">
          <div className="cb-accion-titulo">🔑 Inicia sesión</div>
          <div className="cb-accion-detalle">Te llevamos a la página de inicio de sesión.</div>
          <button className="cb-accion-btn" onClick={irALogin}>Iniciar sesión</button>
        </div>
      );
    }
    if (msg.accionRealizada === 'REDIRIGIR_RECUPERAR') {
      return (
        <div className="cb-accion-card cb-accion-card--info">
          <div className="cb-accion-titulo">🔐 Recuperar contraseña</div>
          <div className="cb-accion-detalle">Te enviaremos un código de verificación a tu correo.</div>
          <button className="cb-accion-btn" onClick={irARecuperar}>Recuperar contraseña</button>
        </div>
      );
    }
    if (msg.accionRealizada === 'REDIRIGIR_AGENDAR') {
      return (
        <div className="cb-accion-card cb-accion-card--info">
          <div className="cb-accion-titulo">📅 Agenda tu cita</div>
          <div className="cb-accion-detalle">Elige fecha, horario y describe tus síntomas, todo en un solo paso.</div>
          <button className="cb-accion-btn" onClick={irAAgendar}>Agendar cita</button>
        </div>
      );
    }
    return null;
  };

  const contenidoVentana = (
    <div className={`cb-ventana ${pantallaCompleta ? 'cb-pantallacompleta' : ''}`}>
      <div className="cb-header">
        <div className="cb-header-avatar">
          <img src={avatarPara(avatarMostrado)} alt="SaludBot" />
        </div>
        <div className="cb-header-info">
          <div className="cb-header-nombre">SaludBot</div>
          <div className="cb-header-estado">
            <span className="cb-header-dot" />
            <span className="cb-header-estado-texto">En línea</span>
          </div>
        </div>
        <div className="cb-header-btns">
          <button className="cb-header-btn" onClick={() => setConfirmarBorrado(true)}
            title="Borrar conversación" aria-label="Borrar conversación" disabled={mensajes.length === 0}>
            🗑️
          </button>
          <button className="cb-header-btn" onClick={() => setPantallaCompleta(p => !p)}
            title={pantallaCompleta ? 'Minimizar' : 'Pantalla completa'} aria-label="Pantalla completa">
            {pantallaCompleta ? '⤡' : '⤢'}
          </button>
          <button className="cb-header-btn" onClick={() => { setAbierto(false); setPantallaCompleta(false); }}
            title="Cerrar" aria-label="Cerrar chat">✕</button>
        </div>
      </div>

      {confirmarBorrado && (
        <div className="cb-confirmar-borrado">
          <span className="cb-confirmar-borrado-texto">¿Borrar toda la conversación? No se puede deshacer.</span>
          <div className="cb-confirmar-borrado-btns">
            <button className="cb-confirmar-borrado-cancelar" onClick={() => setConfirmarBorrado(false)} disabled={borrando}>
              Cancelar
            </button>
            <button className="cb-confirmar-borrado-aceptar" onClick={handleBorrarHistorial} disabled={borrando}>
              {borrando ? 'Borrando...' : 'Sí, borrar'}
            </button>
          </div>
        </div>
      )}

      <div className="cb-mensajes" ref={scrollRef}>
        {mensajes.length === 0 && !enviando && (
          <div className="cb-bienvenida">
            <div className="cb-bienvenida-avatar">
              <img src={avatarPara('acogedor')} alt="SaludBot" />
            </div>
            <div className="cb-bienvenida-titulo">¡Hola! Soy SaludBot 👋</div>
            <div className="cb-bienvenida-texto">
              Puedo ayudarte a agendar una cita médica o resolver dudas sobre RedNorte.
            </div>
          </div>
        )}

        {mensajes.map((msg, i) => (
          <React.Fragment key={i}>
            <div className={`cb-fila ${msg.rol === 'user' ? 'cb-fila-usuario' : 'cb-fila-bot'}`}>
              {msg.rol !== 'user' && (
                <div className="cb-burbuja-avatar">
                  <img src={avatarPara(i === mensajes.length - 1 ? avatarMostrado : 'neutral')} alt="" />
                </div>
              )}
              <div>
                <div className={`cb-burbuja ${msg.rol === 'user' ? 'cb-burbuja-usuario' : 'cb-burbuja-bot'}`}>
                  {msg.contenido}
                </div>
                <div className="cb-burbuja-hora" style={{ textAlign: msg.rol === 'user' ? 'right' : 'left' }}>
                  {formatHora(msg.fechaHora)}
                </div>
              </div>
            </div>
            {msg.rol !== 'user' && renderAccion(msg)}
          </React.Fragment>
        ))}

        {enviando && (
          <div className="cb-fila cb-fila-bot">
            <div className="cb-burbuja-avatar">
              <img src={avatarPara(mostrarConcentrado ? 'concentrado' : 'neutral')} alt="" />
            </div>
            <div className="cb-escribiendo"><span /><span /><span /></div>
          </div>
        )}
      </div>

      {mensajes.length === 0 && (
        <div className="cb-sugerencias">
          {SUGERENCIAS_INICIALES.map(s => (
            <button key={s} className="cb-sugerencia-chip" onClick={() => enviar(s)}>{s}</button>
          ))}
        </div>
      )}

      <div className="cb-pie">
        <textarea
          className="cb-input"
          placeholder="Escribe tu mensaje..."
          value={texto}
          onChange={e => { setTexto(e.target.value); reiniciarTimerInactividad(); }}
          onKeyDown={onKeyDown}
          rows={1}
          disabled={enviando}
        />
        <button className="cb-enviar-btn" onClick={() => enviar()} disabled={!texto.trim() || enviando} aria-label="Enviar mensaje">
          ➤
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="cb-fab"
        onClick={() => { setAbierto(a => !a); setHayMensajeNuevo(false); }}
        aria-label="Abrir chat con SaludBot"
      >
        <span className="cb-fab-pulso" />
        <img src={avatarPara(abierto ? avatarMostrado : 'acogedor')} alt="" />
        {hayMensajeNuevo && !abierto && <span className="cb-fab-badge">1</span>}
      </button>

      {abierto && (
        pantallaCompleta
          ? <div className="cb-overlay-pantallacompleta">{contenidoVentana}</div>
          : contenidoVentana
      )}

      {modalAccion === 'RECUPERAR' ? (
        <RecuperarPasswordModal
          onCerrar={() => setModalAccion(null)}
          onExito={manejarExitoModal}
        />
      ) : modalAccion === 'AGENDAR' ? (
        <AgendarCitaModal
          onCerrar={() => setModalAccion(null)}
          onExito={manejarExitoAgendar}
          onVerConsultas={irAMisConsultasDesdeModal}
        />
      ) : modalAccion && (
        <ChatbotAccionModal
          tipo={modalAccion}
          onCerrar={() => setModalAccion(null)}
          onExito={manejarExitoModal}
        />
      )}
    </>
  );
}
