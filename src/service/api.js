import axios from 'axios';

const MS_USUARIOS     = 'http://localhost:8080';
const MS_CONSULTAS    = 'http://localhost:8083';
const MS_REASIGNACION = 'http://localhost:8082';

// ─── USUARIOS ────────────────────────────────────────────────
export const login = (mail, pass) =>
  axios.post(`${MS_USUARIOS}/usuarios/login`, { mail, pass }, { responseType: 'text' }).then(r => r.data);

export const registrarUsuario = (datos) =>
  axios.post(`${MS_USUARIOS}/usuarios`, datos).then(r => r.data);

export const listarUsuarios = () =>
  axios.get(`${MS_USUARIOS}/usuarios`).then(r => r.data);

export const listarRoles = () =>
  axios.get(`${MS_USUARIOS}/roles`).then(r => r.data);

export const crearRol = (rol) =>
  axios.post(`${MS_USUARIOS}/roles`, rol).then(r => r.data);

// ─── CONSULTAS ────────────────────────────────────────────────
export const crearConsulta = (dto) =>
  axios.post(`${MS_CONSULTAS}/consultas`, dto).then(r => r.data);

export const listarTodasConsultas = () =>
  axios.get(`${MS_CONSULTAS}/consultas`).then(r => r.data);

export const listarConsultasPorUsuario = (id) =>
  axios.get(`${MS_CONSULTAS}/consultas/usuario/${id}`).then(r => r.data);

export const obtenerConsulta = (id) =>
  axios.get(`${MS_CONSULTAS}/consultas/${id}`).then(r => r.data);

export const editarConsultaPaciente = (id, dto) =>
  axios.put(`${MS_CONSULTAS}/consultas/${id}/paciente`, dto).then(r => r.data);

export const actualizarConsultaAdmin = (id, dto) =>
  axios.put(`${MS_CONSULTAS}/consultas/${id}/admin`, dto).then(r => r.data);

export const eliminarConsulta = (id) =>
  axios.delete(`${MS_CONSULTAS}/consultas/${id}`);

// ─── REASIGNACIÓN ─────────────────────────────────────────────
export const cancelarYReasignar = (bloqueId, motivo) =>
  axios.post(`${MS_REASIGNACION}/api/reasignacion/cancelar-y-reasignar/${bloqueId}?motivo=${encodeURIComponent(motivo)}`).then(r => r.data);
// ─── FICHA MÉDICA ─────────────────────────────────────────────
const MS_FICHA = 'http://localhost:8084';

export const obtenerFicha = (usuarioId) =>
  axios.get(`${MS_FICHA}/ficha/${usuarioId}`).then(r => r.data).catch(() => null);

export const guardarFicha = (usuarioId, datos) =>
  axios.put(`${MS_FICHA}/ficha/${usuarioId}`, datos).then(r => r.data);
