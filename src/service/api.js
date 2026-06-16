import axios from 'axios';

// ─── URLs desde variables de entorno ─────────────────
const MS_USUARIOS     = process.env.REACT_APP_MS_USUARIOS;
const MS_CONSULTAS    = process.env.REACT_APP_MS_CONSULTAS;
const MS_REASIGNACION = process.env.REACT_APP_MS_REASIGNACION;
const MS_FICHA        = process.env.REACT_APP_MS_FICHA;

// ─── Interceptor JWT ──────────────────────────────────
// Agrega el token automáticamente a TODAS las peticiones
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('rednorte_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el backend responde 401, limpiar sesión y redirigir al login
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

// ─── AUTH ─────────────────────────────────────────────
export const login = async (correo, contrasena) => {
  const res = await axios.post(`${MS_USUARIOS}/auth/login`, { correo, contrasena });
  const { token, ...usuario } = res.data;
  if (token) {
    localStorage.setItem('rednorte_token', token);
  }
  return usuario;
};

// ─── USUARIOS ─────────────────────────────────────────
export const registrarUsuario = (datos) =>
  axios.post(`${MS_USUARIOS}/usuarios/registrar`, datos).then(r => r.data);

export const listarUsuarios = () =>
  axios.get(`${MS_USUARIOS}/usuarios`).then(r => r.data);

export const crearUsuario = (datos) =>
  axios.post(`${MS_USUARIOS}/usuarios`, datos).then(r => r.data);

export const actualizarUsuario = (id, datos) =>
  axios.put(`${MS_USUARIOS}/usuarios/${id}`, datos).then(r => r.data);

export const eliminarUsuario = (id) =>
  axios.delete(`${MS_USUARIOS}/usuarios/${id}`).then(r => r.data);

export const listarRoles = () =>
  axios.get(`${MS_USUARIOS}/roles`).then(r => r.data);

export const crearRol = (datos) =>
  axios.post(`${MS_USUARIOS}/roles`, datos).then(r => r.data);

// ─── CONSULTAS ────────────────────────────────────────
export const crearConsulta = (datos) =>
  axios.post(`${MS_CONSULTAS}/consultas`, datos).then(r => r.data);

export const listarTodasConsultas = () =>
  axios.get(`${MS_CONSULTAS}/consultas`).then(r => r.data);

export const listarConsultasPorUsuario = (usuarioId) =>
  axios.get(`${MS_CONSULTAS}/consultas/usuario/${usuarioId}`).then(r => r.data);

export const obtenerConsulta = (id) =>
  axios.get(`${MS_CONSULTAS}/consultas/${id}`).then(r => r.data);

export const editarConsultaPaciente = (id, datos) =>
  axios.put(`${MS_CONSULTAS}/consultas/${id}`, datos).then(r => r.data);

export const actualizarConsultaAdmin = (id, datos) =>
  axios.put(`${MS_CONSULTAS}/consultas/admin/${id}`, datos).then(r => r.data);

export const eliminarConsulta = (id) =>
  axios.delete(`${MS_CONSULTAS}/consultas/${id}`).then(r => r.data);

// ─── FICHA MÉDICA ─────────────────────────────────────
export const obtenerFicha = (usuarioId) =>
  axios.get(`${MS_FICHA}/fichas/${usuarioId}`).then(r => r.data);

export const guardarFicha = (datos) =>
  axios.post(`${MS_FICHA}/fichas`, datos).then(r => r.data);

// ─── REASIGNACIÓN / BLOQUES ───────────────────────────
export const cancelarYReasignar = (datos) =>
  axios.post(`${MS_REASIGNACION}/reasignacion/cancelar`, datos).then(r => r.data);

export const listarBloques = () =>
  axios.get(`${MS_REASIGNACION}/api/bloques`).then(r => r.data);

export const listarBloquesPorEspecialidad = (especialidadId) =>
  axios.get(`${MS_REASIGNACION}/api/bloques/especialidad/${especialidadId}`).then(r => r.data);

export const reservarBloque = (id, pacienteId, consultaId) =>
  axios.put(`${MS_AGENDA}/agenda/${id}/reservar`, { pacienteId, consultaId }).then(r => r.data);

export const crearBloque = (bloque) =>
  axios.post(`${MS_REASIGNACION}/api/bloques`, bloque).then(r => r.data);
// ─── AGENDA MÉDICA (ms-agenda-medica puerto 8094) ─
const MS_AGENDA = process.env.REACT_APP_MS_AGENDA;

export const listarBloquesDisponibles = (fecha) =>
  axios.get(`${MS_AGENDA}/agenda/disponibles/${fecha}`).then(r => r.data);

export const listarBloquesPorDoctor = (doctorId) =>
  axios.get(`${MS_AGENDA}/agenda/doctor/${doctorId}`).then(r => r.data);

export const listarCitasPaciente = (pacienteId) =>
  axios.get(`${MS_AGENDA}/agenda/paciente/${pacienteId}`).then(r => r.data);

export const cancelarBloque = (id) =>
  axios.put(`${MS_AGENDA}/agenda/${id}/cancelar`).then(r => r.data);

export const generarBloques = (doctorId, establecimientoId, fecha) =>
  axios.post(`${MS_AGENDA}/agenda/generar`, { doctorId, establecimientoId, fecha }).then(r => r.data);
const MS_NOTIF = process.env.REACT_APP_MS_NOTIFICACIONES;

// ─── NOTIFICACIONES ───────────────────────────────
export const contarNoLeidas = (usuarioId) =>
  axios.get(`${MS_NOTIF}/notificaciones/usuario/${usuarioId}/contador`).then(r => r.data);

export const listarNoLeidas = (usuarioId) =>
  axios.get(`${MS_NOTIF}/notificaciones/usuario/${usuarioId}/no-leidas`).then(r => r.data);

export const listarNotificaciones = (usuarioId) =>
  axios.get(`${MS_NOTIF}/notificaciones/usuario/${usuarioId}`).then(r => r.data);

export const marcarLeida = (id) =>
  axios.put(`${MS_NOTIF}/notificaciones/${id}/leer`).then(r => r.data);

export const marcarTodasLeidas = (usuarioId) =>
  axios.put(`${MS_NOTIF}/notificaciones/usuario/${usuarioId}/leer-todas`).then(r => r.data);

export const notificarCambioEstado = (usuarioId, consultaId, estadoAnterior, estadoNuevo) =>
  axios.post(`${MS_NOTIF}/notificaciones/cambio-estado`, {
    usuarioId, consultaId, estadoAnterior, estadoNuevo
  }).then(r => r.data);
  