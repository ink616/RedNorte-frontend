import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listarBloquesDisponibles, reservarBloque, crearConsulta, listarEstablecimientos } from '../service/api';

/* ── Catálogo de doctores (mismo que el resto del sistema) ──── */
const DOCTORES = {
  USR002: { nombre: 'Dr. Andrés Vega',     especialidad: 'Cardiología',      iniciales: 'AV', color: '#2563EB' },
  USR003: { nombre: 'Dra. Carolina Rojas', especialidad: 'Medicina General', iniciales: 'CR', color: '#0D9488' },
  USR004: { nombre: 'Dr. Felipe Morales',  especialidad: 'Traumatología',    iniciales: 'FM', color: '#7C3AED' },
};

const SINTOMAS_SUGERIDOS = [
  'Dolor de cabeza persistente', 'Control general', 'Dolor en el pecho',
  'Fiebre y malestar', 'Revisión de rutina', 'Dolor articular',
];

const PASOS = [
  { num: 1, label: 'Fecha' },
  { num: 2, label: 'Horario' },
  { num: 3, label: 'Confirmar' },
];

const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function isoLocal(d) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function proximosDias(n = 6) {
  const out = [];
  const hoy = new Date();
  let cursor = new Date(hoy);
  while (out.length < n) {
    out.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

function formatHora(horaStr) {
  if (!horaStr) return '--:--';
  return horaStr.slice(0, 5);
}

function formatFechaLarga(fechaStr) {
  if (!fechaStr) return '';
  const [y, m, d] = fechaStr.split('-').map(Number);
  const fecha = new Date(y, m - 1, d);
  const dia = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'][fecha.getDay()];
  return `${dia} ${d} de ${MESES[m - 1]} de ${y}`;
}

export default function AgendarPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [paso, setPaso] = useState(1);
  const [fecha, setFecha] = useState('');
  const [bloques, setBloques] = useState([]);
  const [establecimientos, setEstablecimientos] = useState([]);
  const [doctorFiltro, setDoctorFiltro] = useState(null);
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState(null);
  const [sintomas, setSintomas] = useState('');
  const [loading, setLoading] = useState(false);
  const [reservando, setReservando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [usarFechaCustom, setUsarFechaCustom] = useState(false);

  const hoy = isoLocal(new Date());
  const diasRapidos = useMemo(() => proximosDias(6), []);

  useEffect(() => {
    listarEstablecimientos().then(d => setEstablecimientos(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!fecha) return;
    setLoading(true);
    setError('');
    setBloques([]);
    setBloqueSeleccionado(null);
    setDoctorFiltro(null);

    listarBloquesDisponibles(fecha)
      .then(data => setBloques(Array.isArray(data) ? data : []))
      .catch(() => setError('No se pudieron cargar los horarios disponibles.'))
      .finally(() => setLoading(false));
  }, [fecha]);

  // Mientras el usuario mira la lista de horarios (paso 2), la refrescamos
  // en segundo plano para que un bloque recién tomado por otro paciente
  // deje de mostrarse como disponible sin que haya que recargar la página.
  useEffect(() => {
    if (paso !== 2 || !fecha) return;
    const intervalo = setInterval(() => {
      listarBloquesDisponibles(fecha)
        .then(data => setBloques(Array.isArray(data) ? data : []))
        .catch(() => {});
    }, 20000);
    return () => clearInterval(intervalo);
  }, [paso, fecha]);

  const nombreEst = (id) => establecimientos.find(e => e.id === id)?.nombre
    || establecimientos.find(e => e.est_id === id)?.est_nombre
    || id;

  const irAFecha = (f) => { setFecha(f); setPaso(2); };

  const handleSeleccionarBloque = (bloque) => {
    setBloqueSeleccionado(bloque);
    setPaso(3);
    setError('');
  };

  const handleConfirmar = async () => {
    if (!bloqueSeleccionado || !sintomas.trim()) {
      setError('Describe tus síntomas antes de confirmar.');
      return;
    }
    setReservando(true);
    setError('');

    const doc = DOCTORES[bloqueSeleccionado.doctorId];
    const p = usuario?.persona;
    const nombrePaciente = (p?.apellido1 || p?.apellido2)
      ? `${p?.apellido1 || ''} ${p?.apellido2 || ''}`.trim()
      : (usuario?.mail || 'Paciente');

    let consulta;
    try {
      consulta = await crearConsulta({
        usuarioId: usuario.id,
        nombrePaciente,
        especialidad: doc?.especialidad || 'General',
        sintomas,
        estado: 'AGENDADA',
      });
    } catch {
      setError('No se pudo registrar tu consulta. Revisa los datos e intenta de nuevo.');
      setReservando(false);
      return;
    }

    try {
      await reservarBloque(bloqueSeleccionado.id, String(usuario.id), consulta?.id ?? null);
      setExito(true);
    } catch {
      setBloques(prev => prev.filter(b => b.id !== bloqueSeleccionado.id));
      setError('Esta hora acaba de ser tomada por otro paciente. Elige otro horario.');
      setPaso(2);
      setBloqueSeleccionado(null);
    } finally {
      setReservando(false);
    }
  };

  const bloquesFiltrados = doctorFiltro
    ? bloques.filter(b => b.doctorId === doctorFiltro)
    : bloques;

  const doctoresConBloques = useMemo(() => {
    const ids = [...new Set(bloques.map(b => b.doctorId))];
    return ids.filter(id => DOCTORES[id]);
  }, [bloques]);

  /* ════════ Pantalla de éxito ════════ */
  if (exito) {
    const doc = DOCTORES[bloqueSeleccionado?.doctorId] || {};
    return (
      <div className="page page-narrow">
        <div className="ag-exito-wrap">
          <div style={{ position: 'relative' }}>
            <div className="ag-exito-icon-wrap">🎉</div>
            <div className="ag-confetti">
              {['🎊','✨','🎉','⭐','💙'].map((e, i) => (
                <span key={i} style={{ left: `${10 + i * 18}%`, animationDelay: `${i * 0.12}s` }}>{e}</span>
              ))}
            </div>
          </div>
          <h2 className="ag-exito-titulo">¡Cita agendada con éxito!</h2>
          <p className="ag-exito-sub">Recibirás una notificación antes de tu hora.</p>

          <div className="ag-exito-card">
            <div className="ag-exito-row">
              <div className="ag-exito-row-icon">📅</div>
              <div>
                <div className="ag-exito-row-label">Fecha</div>
                <div className="ag-exito-row-val" style={{ textTransform: 'capitalize' }}>{formatFechaLarga(fecha)}</div>
              </div>
            </div>
            <div className="ag-exito-row">
              <div className="ag-exito-row-icon">⏰</div>
              <div>
                <div className="ag-exito-row-label">Hora</div>
                <div className="ag-exito-row-val">{formatHora(bloqueSeleccionado?.horaInicio)} hrs</div>
              </div>
            </div>
            <div className="ag-exito-row">
              <div className="ag-exito-row-icon" style={{ background: doc.color ? `${doc.color}22` : undefined }}>🩺</div>
              <div>
                <div className="ag-exito-row-label">Especialista</div>
                <div className="ag-exito-row-val">{doc.nombre} · {doc.especialidad}</div>
              </div>
            </div>
            <div className="ag-exito-row">
              <div className="ag-exito-row-icon">📍</div>
              <div>
                <div className="ag-exito-row-label">Lugar</div>
                <div className="ag-exito-row-val">{nombreEst(bloqueSeleccionado?.establecimientoId)}</div>
              </div>
            </div>
          </div>

          <div className="ag-exito-btns">
            <button className="btn btn-ghost btn-lg" onClick={() => { setExito(false); setPaso(1); setFecha(''); setSintomas(''); }}>
              Agendar otra
            </button>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/mis-consultas')}>
              Ver mis consultas
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ════════ Vista principal ════════ */
  return (
    <div className="page page-narrow">
      <div className="ag-wrap" style={{ padding: 0 }}>

        <div className="ag-header">
          <div className="ag-header-icon">📅</div>
          <h1>Agendar cita médica</h1>
          <p>Elige fecha, horario y cuéntanos qué necesitas. Listo en menos de 2 minutos.</p>
        </div>

        {/* Stepper */}
        <div className="ag-stepper">
          {PASOS.map((p, i) => (
            <React.Fragment key={p.num}>
              <div className="ag-step">
                <div className={`ag-step-circle ${paso > p.num ? 'hecho' : paso === p.num ? 'activo' : ''}`}>
                  {paso > p.num ? '✓' : p.num}
                </div>
                <span className={`ag-step-label ${paso === p.num ? 'activo' : ''}`}>{p.label}</span>
              </div>
              {i < PASOS.length - 1 && <div className={`ag-step-line ${paso > p.num ? 'completado' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        {/* ── Paso 1: Fecha ── */}
        {paso === 1 && (
          <div className="ag-card">
            <h3 className="ag-fecha-title">¿Qué día te queda mejor?</h3>
            <p className="ag-fecha-sub">Elige uno de los próximos días o escoge una fecha específica.</p>

            <div className="ag-fecha-chips">
              {diasRapidos.map(d => {
                const iso = isoLocal(d);
                return (
                  <div key={iso} className={`ag-fecha-chip ${fecha === iso && !usarFechaCustom ? 'activo' : ''}`}
                    onClick={() => { setUsarFechaCustom(false); irAFecha(iso); }}>
                    <span className="ag-fecha-chip-dia">{DIAS_CORTOS[d.getDay()]}</span>
                    <span className="ag-fecha-chip-num">{d.getDate()}</span>
                    <span className="ag-fecha-chip-mes">{MESES[d.getMonth()].slice(0, 3)}</span>
                  </div>
                );
              })}
            </div>

            <div className="ag-fecha-divider">o elige otra fecha</div>

            <div className="ag-fecha-custom">
              <input
                type="date"
                min={hoy}
                value={usarFechaCustom ? fecha : ''}
                onChange={e => { setUsarFechaCustom(true); irAFecha(e.target.value); }}
              />
            </div>

            {fecha && (
              <div className="ag-fecha-seleccionada">
                📌 Buscando horarios para el <strong style={{ textTransform: 'capitalize' }}>{formatFechaLarga(fecha)}</strong>
              </div>
            )}
          </div>
        )}

        {/* ── Paso 2: Horario ── */}
        {paso === 2 && (
          <div className="ag-card">
            <div className="ag-paso2-head">
              <h3>Horarios disponibles — <span style={{ textTransform: 'capitalize' }}>{formatFechaLarga(fecha)}</span></h3>
              <button className="ag-volver-btn" onClick={() => { setPaso(1); setBloques([]); }}>← Cambiar fecha</button>
            </div>

            {loading ? (
              <div className="ag-skeleton-grid">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="ag-skeleton" style={{ animationDelay: `${i * 0.05}s` }} />)}
              </div>
            ) : bloques.length === 0 ? (
              <div className="ag-sin-bloques">
                <span className="ag-sin-bloques-icon">😔</span>
                <p>No hay horarios disponibles para este día.</p>
                <p>Prueba con otra fecha cercana.</p>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setPaso(1); setBloques([]); }}>
                  Elegir otra fecha
                </button>
              </div>
            ) : (
              <>
                {doctoresConBloques.length > 1 && (
                  <div className="ag-doctor-tabs">
                    <button className={`ag-doctor-tab ${!doctorFiltro ? 'activo' : ''}`} onClick={() => setDoctorFiltro(null)}>
                      Todos ({bloques.length})
                    </button>
                    {doctoresConBloques.map(id => {
                      const doc = DOCTORES[id];
                      const count = bloques.filter(b => b.doctorId === id).length;
                      return (
                        <button key={id} className={`ag-doctor-tab ${doctorFiltro === id ? 'activo' : ''}`}
                          style={{ '--doctor-color': doc.color }}
                          onClick={() => setDoctorFiltro(id)}>
                          <span className="ag-doctor-tab-avatar">{doc.iniciales}</span>
                          {doc.nombre.split(' ').slice(0, 2).join(' ')} ({count})
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="ag-bloques-grid">
                  {bloquesFiltrados
                    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
                    .map((bloque, i) => {
                      const doc = DOCTORES[bloque.doctorId];
                      return (
                        <button key={bloque.id} className="ag-bloque-btn" style={{ animationDelay: `${Math.min(i * 0.02, 0.4)}s` }}
                          onClick={() => handleSeleccionarBloque(bloque)} title={doc ? `${doc.nombre} · ${doc.especialidad}` : ''}>
                          <div className="ag-bloque-hora">{formatHora(bloque.horaInicio)}</div>
                          <div className="ag-bloque-tag">{doc ? doc.iniciales : 'Disp.'}</div>
                        </button>
                      );
                    })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Paso 3: Confirmar ── */}
        {paso === 3 && bloqueSeleccionado && (() => {
          const doc = DOCTORES[bloqueSeleccionado.doctorId] || {};
          return (
            <div className="ag-card">
              <div className="ag-paso2-head">
                <h3>Confirma tu cita</h3>
                <button className="ag-volver-btn" onClick={() => { setPaso(2); setBloqueSeleccionado(null); setError(''); }}>
                  ← Cambiar horario
                </button>
              </div>

              <div className="ag-resumen">
                <div className="ag-resumen-row">
                  <span className="ag-resumen-label">🩺 Especialista</span>
                  <span className="ag-resumen-valor">{doc.nombre} · {doc.especialidad}</span>
                </div>
                <div className="ag-resumen-row">
                  <span className="ag-resumen-label">📍 Lugar</span>
                  <span className="ag-resumen-valor">{nombreEst(bloqueSeleccionado.establecimientoId)}</span>
                </div>
                <div className="ag-resumen-row">
                  <span className="ag-resumen-label">📅 Fecha</span>
                  <span className="ag-resumen-valor" style={{ textTransform: 'capitalize' }}>{formatFechaLarga(fecha)}</span>
                </div>
                <div className="ag-resumen-row">
                  <span className="ag-resumen-label">⏰ Hora</span>
                  <span className="ag-resumen-hora">{formatHora(bloqueSeleccionado.horaInicio)} hrs</span>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Describe tus síntomas</label>
                <div className="ag-sintomas-tips">
                  {SINTOMAS_SUGERIDOS.map(s => (
                    <span key={s} className="ag-tip-chip" onClick={() => setSintomas(s)}>{s}</span>
                  ))}
                </div>
                <textarea
                  className="form-control"
                  placeholder="Describe detalladamente lo que estás sintiendo, desde cuándo y con qué intensidad..."
                  value={sintomas}
                  onChange={e => setSintomas(e.target.value.slice(0, 400))}
                  rows={4}
                />
                <div className="ag-char-count">{sintomas.length}/400</div>
              </div>

              <div className="ag-confirmar-btns">
                <button className="btn btn-ghost btn-lg" onClick={() => navigate('/mis-consultas')}>Cancelar</button>
                <button className="btn btn-primary btn-lg" onClick={handleConfirmar} disabled={reservando || !sintomas.trim()}>
                  {reservando ? 'Confirmando...' : '✅ Confirmar cita'}
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
