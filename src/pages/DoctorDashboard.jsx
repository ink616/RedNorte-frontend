import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listarTodasConsultas, actualizarConsultaAdmin, notificarCambioEstado, registrarAuditoria } from '../service/api';

const ESTADOS = ['PENDIENTE', 'AGENDADA', 'ATENDIDA', 'CANCELADA'];
// Estados que requieren asignar fecha y hora de atencion
const REQUIERE_FECHA = ['AGENDADA', 'REASIGNADA'];

export default function DoctorDashboard() {
  const { usuario } = useAuth();
  const [consultas, setConsultas]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [filtro, setFiltro]                 = useState('TODAS');
  const [consultaActiva, setConsultaActiva] = useState(null);
  const [nuevoEstado, setNuevoEstado]       = useState('');
  const [fechaCita, setFechaCita]           = useState('');
  const [notas, setNotas]                   = useState('');
  const [guardando, setGuardando]           = useState(false);
  const [error, setError]                   = useState('');
  const [exito, setExito]                   = useState('');

  const p         = usuario?.persona;
  const nombre    = p ? `Dr. ${p.apellido1} ${p.apellido2 || ''}`.trim() : 'Doctor';
  const iniciales = p ? (p.apellido1?.[0] || '') + (p.apellido2?.[0] || '') : 'DR';

  const cargar = () => {
    setLoading(true);
    listarTodasConsultas()
      .then(d => setConsultas(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };
  useEffect(() => { cargar(); }, []);

  const filtradas = filtro === 'TODAS' ? consultas : consultas.filter(c => c.estado === filtro);

  const stats = {
    total:      consultas.length,
    pendientes: consultas.filter(c => c.estado === 'PENDIENTE').length,
    agendadas:  consultas.filter(c => c.estado === 'AGENDADA').length,
    atendidas:  consultas.filter(c => c.estado === 'ATENDIDA').length,
  };

  const abrirModal = (c) => {
    setConsultaActiva(c);
    setNuevoEstado(c.estado);
    setFechaCita(c.fechaCita ? c.fechaCita.slice(0, 16) : '');
    setNotas(c.notasAdmin || '');
    setError('');
  };

  const actualizar = async () => {
    if (!nuevoEstado) return;
    // Si el nuevo estado requiere fecha y no hay una, avisar
    if (REQUIERE_FECHA.includes(nuevoEstado) && !fechaCita) {
      setError('Para agendar debes seleccionar la fecha y hora de atencion.');
      return;
    }
    setGuardando(true); setError('');
    try {
      await actualizarConsultaAdmin(consultaActiva.id, {
        estado: nuevoEstado,
        fechaCita: fechaCita ? fechaCita + ':00' : null,
        notasAdmin: notas,
      });
      await notificarCambioEstado(
        consultaActiva.usuarioId,
        consultaActiva.id,
        consultaActiva.estado,
        nuevoEstado
      ).catch(() => {});
      registrarAuditoria({
        accion: 'ACTUALIZAR', modulo: 'CONSULTAS',
        usuarioId: usuario?.id ? String(usuario.id) : 'DOCTOR',
        usuarioRol: 'DOCTOR', recursoId: String(consultaActiva.id),
        descripcion: `Doctor actualizo consulta #${consultaActiva.id} a ${nuevoEstado}`,
        resultado: 'EXITOSO',
      }).catch(() => {});
      setExito('Estado actualizado correctamente.');
      setConsultaActiva(null);
      cargar();
      setTimeout(() => setExito(''), 3000);
    } catch {
      setError('No se pudo guardar. Intenta nuevamente.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="page">

      {/* Header doctor */}
      <div className="doctor-header">
        <div className="doctor-avatar">{iniciales}</div>
        <div className="doctor-header-info">
          <div className="doctor-header-nombre">{nombre}</div>
          <div className="doctor-header-mail">{usuario?.mail}</div>
          <span className="doctor-header-badge">Médico — RedNorte Clínica Digital</span>
        </div>
        <div className="doctor-header-total">
          <div className="doctor-header-total-num">{stats.total}</div>
          <div className="doctor-header-total-label">Consultas totales</div>
          <Link to="/doctor/agenda" className="doctor-header-agenda-link">Ver mi agenda →</Link>
        </div>
      </div>

      {exito && <div className="alert alert-success">{exito}</div>}

      {/* Stats */}
      <div className="doctor-stats-grid">
        <div className="doctor-stat-card">
          <span className="doctor-stat-icon">⏳</span>
          <div className="doctor-stat-num doctor-stat-pendiente">{stats.pendientes}</div>
          <div className="doctor-stat-label">Pendientes</div>
        </div>
        <div className="doctor-stat-card">
          <span className="doctor-stat-icon">📅</span>
          <div className="doctor-stat-num doctor-stat-agendada">{stats.agendadas}</div>
          <div className="doctor-stat-label">Agendadas</div>
        </div>
        <div className="doctor-stat-card">
          <span className="doctor-stat-icon">✅</span>
          <div className="doctor-stat-num doctor-stat-atendida">{stats.atendidas}</div>
          <div className="doctor-stat-label">Atendidas</div>
        </div>
        <div className="doctor-stat-card">
          <span className="doctor-stat-icon">📋</span>
          <div className="doctor-stat-num doctor-stat-total">{stats.total}</div>
          <div className="doctor-stat-label">Total</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="doctor-filtros">
        {['TODAS', ...ESTADOS].map(e => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            className={`doctor-filtro-btn${filtro === e ? ' activo' : ''}`}
          >
            {e}
          </button>
        ))}
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="spinner">Cargando consultas...</div>
      ) : (
        <div className="card doctor-tabla-wrap">
          <table className="tabla">
            <thead>
              <tr>
                <th>N°</th><th>Paciente</th><th>Especialidad</th>
                <th>Síntomas</th><th>Estado</th><th>Fecha cita</th><th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr><td colSpan={7} className="doctor-tabla-vacia">Sin consultas.</td></tr>
              ) : (
                filtradas.map(c => (
                  <tr key={c.id}>
                    <td><strong>#{c.id}</strong></td>
                    <td>{c.nombrePaciente || '—'}</td>
                    <td className="doctor-td-especialidad">{c.especialidad}</td>
                    <td className="doctor-td-sintomas">
                      {c.sintomas?.slice(0, 60)}{c.sintomas?.length > 60 ? '...' : ''}
                    </td>
                    <td>
                      <span className={`badge-estado badge-estado-${c.estado?.toLowerCase()}`}>
                        {c.estado}
                      </span>
                    </td>
                    <td className="doctor-td-fecha">
                      {c.fechaCita
                        ? new Date(c.fechaCita).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                        : <span className="doctor-fecha-sin-asignar">Sin asignar</span>}
                    </td>
                    <td>
                      <button
                        className="btn-outline-teal btn-sm"
                        onClick={() => abrirModal(c)}
                      >
                        Actualizar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {consultaActiva && (
        <div className="modal-overlay" onClick={() => setConsultaActiva(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3 className="modal-titulo">Actualizar consulta #{consultaActiva.id}</h3>
            <p className="modal-subtitulo">
              {consultaActiva.nombrePaciente} — {consultaActiva.especialidad}
            </p>

            <div className="modal-sintomas">
              <div className="modal-sintomas-label">Síntomas del paciente</div>
              <div className="modal-sintomas-texto">{consultaActiva.sintomas}</div>
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <div className="form-group">
              <label>Nuevo estado</label>
              <select
                className="form-control"
                value={nuevoEstado}
                onChange={e => setNuevoEstado(e.target.value)}
              >
                {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            {/* El campo de fecha/hora aparece solo cuando se agenda */}
            {REQUIERE_FECHA.includes(nuevoEstado) && (
              <div className="form-group">
                <label>📅 Fecha y hora de atención <span className="campo-requerido">*</span></label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={fechaCita}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={e => setFechaCita(e.target.value)}
                />
                <p className="form-hint">Selecciona el día y la hora en que atenderás al paciente.</p>
              </div>
            )}

            <div className="form-group">
              <label>Notas médicas</label>
              <textarea
                className="form-control"
                value={notas}
                onChange={e => setNotas(e.target.value)}
                placeholder="Observaciones, indicaciones, próximos pasos..."
                rows={4}
              />
            </div>

            <div className="modal-btns">
              <button onClick={actualizar} disabled={guardando} className="btn-primary">
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button onClick={() => setConsultaActiva(null)} className="btn-outline-teal">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
