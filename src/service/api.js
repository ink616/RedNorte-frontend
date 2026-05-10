import axios from 'axios';

const MS_USUARIOS    = 'http://localhost:8080';
const MS_CONSULTAS   = 'http://localhost:8083';
const MS_REASIGNACION = 'http://localhost:8082';

// ─── USUARIOS ────────────────────────────────────────────────
export const login = (mail, pass) =>
  axios.post(`${MS_USUARIOS}/usuarios/login`, { mail, pass }).then(r => r.data);

export const listarUsuarios = () =>
  axios.get(`${MS_USUARIOS}/usuarios`).then(r => r.data);

export const crearUsuario = (usuario) =>
  axios.post(`${MS_USUARIOS}/usuarios`, usuario);

export const listarRoles = () =>
  axios.get(`${MS_USUARIOS}/roles`).then(r => r.data);

// ─── CONSULTAS ───────────────────────────────────────────────
export const crearConsulta = (dto) =>
  axios.post(`${MS_CONSULTAS}/consultas`, dto).then(r => r.data);

export const listarTodasConsultas = () =>
  axios.get(`${MS_CONSULTAS}/consultas`).then(r => r.data);

export const listarConsultasPorUsuario = (usuarioId) =>
  axios.get(`${MS_CONSULTAS}/consultas/usuario/${usuarioId}`).then(r => r.data);

export const obtenerConsulta = (id) =>
  axios.get(`${MS_CONSULTAS}/consultas/${id}`).then(r => r.data);

export const editarConsultaPaciente = (id, dto) =>
  axios.put(`${MS_CONSULTAS}/consultas/${id}/paciente`, dto).then(r => r.data);

export const actualizarConsultaAdmin = (id, dto) =>
  axios.put(`${MS_CONSULTAS}/consultas/${id}/admin`, dto).then(r => r.data);

export const eliminarConsulta = (id) =>
  axios.delete(`${MS_CONSULTAS}/consultas/${id}`);

// ─── REASIGNACIÓN ────────────────────────────────────────────
export const listarBloques = () =>
  axios.get(`${MS_REASIGNACION}/api/reasignacion/bloques`).then(r => r.data);

export const cancelarYReasignar = (bloqueId, motivo) =>
  axios.post(`${MS_REASIGNACION}/api/reasignacion/cancelar-y-reasignar/${bloqueId}?motivo=${encodeURIComponent(motivo)}`).then(r => r.data);
