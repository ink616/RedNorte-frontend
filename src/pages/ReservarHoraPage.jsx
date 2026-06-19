import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { agendaDisponiblePorFecha, reservarBloque, listarEstablecimientos, registrarAuditoria } from '../service/api';

const DOCTORES = {
  USR002: 'Dr. Andrés Vega',
  USR003: 'Dra. Carolina Rojas',
  USR004: 'Dr. Felipe Morales',
};

export default function ReservarHoraPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [fecha, setFecha] = useState('');
  const [bloques, setBloques] = useState([]);
  const [establecimientos, setEstablecimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buscado, setBuscado] = useState(false);

  // Modal de confirmacion
  const [seleccionado, setSeleccionado] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [reservando, setReservando] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  // Modal de exito
  const [confirmada, setConfirmada] = useState(null);

  useEffect(() => {
    listarEstablecimientos().then(d => setEstablecimientos(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const nombreEst = (id) => establecimientos.find(e => e.id === id)?.nombre || id;
  const nombreDoc = (id) => DOCTORES[id] || id;

  const fechaLegible = (f) => {
    if (!f) return '';
    return new Date(f + 'T12:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const buscar = () => {
    if (!fecha) return;
    setLoading(true); setBuscado(true);
    agendaDisponiblePorFecha(fecha)
      .then(d => setBloques(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  const abrirConfirmacion = (bloque) => {
    setSeleccionado(bloque);
    setMotivo('');
    setErrorModal('');
  };

  const confirmarReserva = async () => {
    setReservando(true); setErrorModal('');
    try {
      await reservarBloque(seleccionado.id, String(usuario.id), '');
      registrarAuditoria({
        accion: 'RESERVAR', modulo: 'AGENDA', usuarioId: String(usuario.id),
        usuarioRol: 'PACIENTE', recursoId: String(seleccionado.id),
        descripcion: `Paciente reservó bloque ${seleccionado.horaInicio} con ${nombreDoc(seleccionado.doctorId)}${motivo ? ' - Motivo: ' + motivo : ''}`,
        resultado: 'EXITOSO',
      }).catch(() => {});
      setConfirmada({
        doctor: nombreDoc(seleccionado.doctorId),
        establecimiento: nombreEst(seleccionado.establecimientoId),
        hora: seleccionado.horaInicio?.slice(0, 5),
        fecha: fecha,
        motivo: motivo,
      });
      setSeleccionado(null);
      buscar();
    } catch {
      setErrorModal('No se pudo reservar esta hora. Puede que alguien la haya tomado. Intenta con otra.');
    } finally { setReservando(false); }
  };

  const porDoctor = bloques.reduce((acc, b) => { (acc[b.doctorId] = acc[b.doctorId] || []).push(b); return acc; }, {});

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <div>
          <h1 className="page-title">🗓️ Reservar hora médica</h1>
          <p className="page-subtitle">Elige una fecha, revisa los horarios y confirma tu cita</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 200 }}>
            <label>📅 Fecha de atención</label>
            <input type="date" className="form-control" value={fecha} min={new Date().toISOString().split('T')[0]} onChange={e => setFecha(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={buscar} disabled={!fecha}>Buscar horarios</button>
        </div>
        {buscado && !loading && (
          <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
            💡 Toca un horario disponible para ver los detalles y confirmar tu reserva.
          </p>
        )}
      </div>

      {loading ? <div className="spinner">Buscando disponibilidad...</div> : buscado && (
        Object.keys(porDoctor).length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }} className="stagger">
            {Object.entries(porDoctor).map(([docId, bqs]) => (
              <div key={docId} className="card card-pad-0">
                <div className="card-header">
                  <span>👨‍⚕️ {nombreDoc(docId)}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>📍 {nombreEst(bqs[0].establecimientoId)}</span>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                    {bqs.length} {bqs.length === 1 ? 'horario disponible' : 'horarios disponibles'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(82px, 1fr))', gap: 8 }}>
                    {bqs.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)).map(b => (
                      <button key={b.id} onClick={() => abrirConfirmacion(b)}
                        style={{
                          background: 'var(--success-light)', color: 'var(--success-dark)',
                          border: '1.5px solid transparent', borderRadius: 10,
                          padding: '12px 8px', fontSize: 14, fontWeight: 700,
                          cursor: 'pointer', transition: 'var(--transition)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--success)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--success-light)'; e.currentTarget.style.color = 'var(--success-dark)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                        <span>{b.horaInicio?.slice(0, 5)}</span>
                        <span style={{ fontSize: 9, fontWeight: 600, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reservar</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="icon">📅</span>
            <h3>Sin horarios disponibles</h3>
            <p>No hay horas libres para esa fecha. Prueba seleccionando otro día.</p>
          </div>
        )
      )}

      {/* â”€â”€â”€ MODAL DE CONFIRMACION â”€â”€â”€ */}
      {seleccionado && (
        <div className="modal-overlay" onClick={() => !reservando && setSeleccionado(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar tu hora</h2>
              <button className="modal-close" onClick={() => setSeleccionado(null)} disabled={reservando}>✕</button>
            </div>
            <div className="modal-body">
              {errorModal && <div className="alert alert-error">⚠️ {errorModal}</div>}

              <div style={{ background: 'var(--bg-soft)', borderRadius: 12, padding: '18px 20px', marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>👨‍⚕️ Doctor</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{nombreDoc(seleccionado.doctorId)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>📍 Lugar</span>
                  <span style={{ fontWeight: 600, fontSize: 14, textAlign: 'right' }}>{nombreEst(seleccionado.establecimientoId)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>📅 Fecha</span>
                  <span style={{ fontWeight: 600, fontSize: 14, textTransform: 'capitalize', textAlign: 'right' }}>{fechaLegible(fecha)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>⏰ Hora</span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--primary)' }}>{seleccionado.horaInicio?.slice(0, 5)} hrs</span>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Motivo de la consulta <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></label>
                <textarea className="form-control" value={motivo} onChange={e => setMotivo(e.target.value)}
                  placeholder="Ej: Control general, dolor de cabeza, revisión..." style={{ minHeight: 70 }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setSeleccionado(null)} disabled={reservando}>Cancelar</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={confirmarReserva} disabled={reservando}>
                {reservando ? 'Reservando...' : '✅ Confirmar reserva'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€â”€ MODAL DE EXITO â”€â”€â”€ */}
      {confirmada && (
        <div className="modal-overlay" onClick={() => setConfirmada(null)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-body" style={{ textAlign: 'center', padding: '36px 28px' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', background: 'var(--success-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: 36,
              }}>✅</div>
              <h2 style={{ fontSize: 21, fontWeight: 800, marginBottom: 8 }}>¡Hora reservada!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 22 }}>
                Tu cita quedó agendada correctamente. Te esperamos.
              </p>

              <div style={{ background: 'var(--bg-soft)', borderRadius: 12, padding: '16px 20px', textAlign: 'left', marginBottom: 22 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{confirmada.doctor}</div>
                <div style={{ fontSize: 13, color: 'var(--text-soft)', lineHeight: 1.7 }}>
                  📍 {confirmada.establecimiento}<br />
                  📅 <span style={{ textTransform: 'capitalize' }}>{fechaLegible(confirmada.fecha)}</span><br />
                  ⏰ {confirmada.hora} hrs
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmada(null)}>Reservar otra</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/mis-consultas')}>Ver mis citas</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
