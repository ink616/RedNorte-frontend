import axios from 'axios';

const GW = process.env.REACT_APP_API_GATEWAY || 'http://localhost:8090';

// ─── INTERCEPTOR 401 ─────────────────────────────────────────────────────────
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('rednorte_token');
      localStorage.removeItem('rednorte_usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const login = (mail, pass) =>
  axios.post(`${GW}/usuarios/login`, { mail, pass }).then(r => r.data);

// ─── USUARIOS ─────────────────────────────────────────────────────────────────
export const registrarUsuario = (datos) =>
  axios.post(`${GW}/usuarios`, datos).then(r => r.data);

export const listarUsuarios = () =>
  axios.get(`${GW}/usuarios`).then(r => r.data);

export const crearUsuario = (datos) =>
  axios.post(`${GW}/usuarios`, datos).then(r => r.data);

export const actualizarUsuario = (id, datos) =>
  axios.put(`${GW}/usuarios/${id}`, datos).then(r => r.data);

export const eliminarUsuario = (id) =>
  axios.delete(`${GW}/usuarios/${id}`).then(r => r.data);

export const listarRoles = () =>
  axios.get(`${GW}/roles`).then(r => r.data);

export const crearRol = (rol) =>
  axios.post(`${GW}/roles`, rol).then(r => r.data);

// ─── CONSULTAS ────────────────────────────────────────────────────────────────
export const crearConsulta = (dto) =>
  axios.post(`${GW}/consultas`, dto).then(r => r.data);

export const listarTodasConsultas = () =>
  axios.get(`${GW}/consultas`).then(r => r.data);

export const listarConsultasPorUsuario = (id) =>
  axios.get(`${GW}/consultas/usuario/${id}`).then(r => r.data);

export const obtenerConsulta = (id) =>
  axios.get(`${GW}/consultas/${id}`).then(r => r.data);

export const editarConsultaPaciente = (id, dto) =>
  axios.put(`${GW}/consultas/${id}/paciente`, dto).then(r => r.data);

export const actualizarConsultaAdmin = (id, dto) =>
  axios.put(`${GW}/consultas/${id}/admin`, dto).then(r => r.data);

export const eliminarConsulta = (id) =>
  axios.delete(`${GW}/consultas/${id}`);

// ─── REASIGNACIÓN ─────────────────────────────────────────────────────────────
export const cancelarYReasignar = (bloqueId, motivo) =>
  axios.post(`${GW}/api/reasignacion/cancelar-y-reasignar/${bloqueId}?motivo=${encodeURIComponent(motivo)}`).then(r => r.data);

export const soloCancelar = (bloqueId, motivo) =>
  axios.post(`${GW}/api/reasignacion/solo-cancelar/${bloqueId}?motivo=${encodeURIComponent(motivo)}`).then(r => r.data);

export const listarBloques = () =>
  axios.get(`${GW}/api/bloques`).then(r => r.data);

export const listarBloquesPorEspecialidad = (especialidadId) =>
  axios.get(`${GW}/api/bloques/especialidad/${especialidadId}`).then(r => r.data);

export const crearBloque = (bloque) =>
  axios.post(`${GW}/api/bloques`, bloque).then(r => r.data);

// ─── FICHA MÉDICA ─────────────────────────────────────────────────────────────
export const obtenerFicha = (usuarioId) =>
  axios.get(`${GW}/ficha/${usuarioId}`).then(r => r.data).catch(() => null);

export const guardarFicha = (usuarioId, datos) =>
  axios.put(`${GW}/ficha/${usuarioId}`, datos).then(r => r.data);

// ─── NOTIFICACIONES ───────────────────────────────────────────────────────────
export const listarNotificaciones = (usuarioId) =>
  axios.get(`${GW}/notificaciones/usuario/${usuarioId}`).then(r => r.data);

export const listarNoLeidas = (usuarioId) =>
  axios.get(`${GW}/notificaciones/usuario/${usuarioId}/no-leidas`).then(r => r.data);

export const contarNoLeidas = (usuarioId) =>
  axios.get(`${GW}/notificaciones/usuario/${usuarioId}/contador`).then(r => r.data);

export const marcarLeida = (notifId) =>
  axios.put(`${GW}/notificaciones/${notifId}/leer`).then(r => r.data);

export const marcarTodasLeidas = (usuarioId) =>
  axios.put(`${GW}/notificaciones/usuario/${usuarioId}/leer-todas`).then(r => r.data);

export const notificarCambioEstado = (usuarioId, consultaId, estadoAnterior, estadoNuevo) =>
  axios.post(`${GW}/notificaciones/cambio-estado`, {
    usuarioId, consultaId, estadoAnterior, estadoNuevo,
  }).then(r => r.data);

// ─── ESTABLECIMIENTOS ─────────────────────────────────────────────────────────
export const listarEstablecimientos = () =>
  axios.get(`${GW}/establecimientos`).then(r => r.data);

export const obtenerEstablecimiento = (id) =>
  axios.get(`${GW}/establecimientos/${id}`).then(r => r.data);

export const crearEstablecimiento = (dto) =>
  axios.post(`${GW}/establecimientos`, dto).then(r => r.data);

export const actualizarEstablecimiento = (id, dto) =>
  axios.put(`${GW}/establecimientos/${id}`, dto).then(r => r.data);

export const eliminarEstablecimiento = (id) =>
  axios.delete(`${GW}/establecimientos/${id}`);

// ─── AGENDA MÉDICA ────────────────────────────────────────────────────────────
export const listarAgenda = () =>
  axios.get(`${GW}/agenda`).then(r => r.data);

export const agendaPorDoctor = (doctorId) =>
  axios.get(`${GW}/agenda/doctor/${doctorId}`).then(r => r.data);

export const agendaDisponiblePorFecha = (fecha) =>
  axios.get(`${GW}/agenda/disponibles/${fecha}`).then(r => r.data);

export const agendaPorPaciente = (pacienteId) =>
  axios.get(`${GW}/agenda/paciente/${pacienteId}`).then(r => r.data);

export const generarBloques = (doctorId, establecimientoId, fecha) =>
  axios.post(`${GW}/agenda/generar`, { doctorId, establecimientoId, fecha }).then(r => r.data);

export const reservarBloque = (id, pacienteId, consultaId) =>
  axios.put(`${GW}/agenda/${id}/reservar`, { pacienteId, consultaId }).then(r => r.data);

export const cancelarBloque = (id) =>
  axios.put(`${GW}/agenda/${id}/cancelar`).then(r => r.data);

// ─── ESTADÍSTICAS ─────────────────────────────────────────────────────────────
export const obtenerResumenEstadisticas = () =>
  axios.get(`${GW}/estadisticas/resumen`).then(r => r.data);

export const estadisticasConsultas = () =>
  axios.get(`${GW}/estadisticas/consultas`).then(r => r.data);

export const estadisticasAgenda = () =>
  axios.get(`${GW}/estadisticas/agenda`).then(r => r.data);

// ─── AUDITORÍA ────────────────────────────────────────────────────────────────
export const registrarAuditoria = (dto) =>
  axios.post(`${GW}/auditoria`, dto).then(r => r.data);

export const listarAuditoria = () =>
  axios.get(`${GW}/auditoria`).then(r => r.data);

export const auditoriaPorUsuario = (usuarioId) =>
  axios.get(`${GW}/auditoria/usuario/${usuarioId}`).then(r => r.data);

// ─── CHATBOT (SaludBot) ───────────────────────────────────────────────────────
// El endpoint es publico (atiende tambien a visitantes sin cuenta), asi que
// no depende de que axios tenga el header Authorization configurado: si hay
// sesion, el JWT ya viaja por el interceptor global de AuthContext; si no,
// el backend simplemente trata la conversacion como anonima.
export const enviarMensajeChatbot = (dto) =>
  axios.post(`${GW}/chatbot/mensaje`, dto).then(r => r.data);

export const obtenerHistorialChatbot = (identificadorConversacion) =>
  axios.get(`${GW}/chatbot/historial/${identificadorConversacion}`).then(r => r.data);

export const borrarHistorialChatbot = (identificadorConversacion) =>
  axios.delete(`${GW}/chatbot/historial/${identificadorConversacion}`);

// ─── ALIASES DE COMPATIBILIDAD ───────────────────────────────────────────────
export const listarBloquesDisponibles = agendaDisponiblePorFecha;
export const listarBloquesPorDoctor   = agendaPorDoctor;
export const listarCitasPaciente      = agendaPorPaciente;
