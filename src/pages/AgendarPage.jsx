import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listarBloquesDisponibles, reservarBloque, crearConsulta } from '../service/api';

const PASOS = [
  { num: 1, label: 'Fecha' },
  { num: 2, label: 'Horario' },
  { num: 3, label: 'Confirmar' },
];

export default function AgendarPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [paso, setPaso]                       = useState(1);
  const [fecha, setFecha]                     = useState('');
  const [bloques, setBloques]                 = useState([]);
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState(null);
  const [sintomas, setSintomas]               = useState('');
  const [loading, setLoading]                 = useState(false);
  const [reservando, setReservando]           = useState(false);
  const [error, setError]                     = useState('');
  const [exito, setExito]                     = useState(false);

  const hoy = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!fecha) return;
    setLoading(true);
    setError('');
    setBloques([]);
    setBloqueSeleccionado(null);

    listarBloquesDisponibles(fecha)
      .then(data => setBloques(Array.isArray(data) ? data : []))
      .catch(() => setError('No se pudieron cargar los bloques disponibles.'))
      .finally(() => setLoading(false));
  }, [fecha]);

  const handleSeleccionarFecha = (e) => {
    setFecha(e.target.value);
    setPaso(2);
  };

  const handleSeleccionarBloque = (bloque) => {
    setBloqueSeleccionado(bloque);
    setPaso(3);
  };

  const handleConfirmar = async () => {
    if (!bloqueSeleccionado || !sintomas.trim()) {
      setError('Describe tus síntomas antes de confirmar.');
      return;
    }
    setReservando(true);
    setError('');
    try {
      const consulta = await crearConsulta({
        usuarioId: usuario.id,
        especialidad: bloqueSeleccionado.especialidad || 'General',
        sintomas,
        estado: 'AGENDADA',
      });

      await reservarBloque(
        bloqueSeleccionado.id,
        usuario.id,
        consulta?.id ?? null
      );

      setExito(true);
    } catch {
      setError('Error al confirmar la cita. El bloque puede haber sido tomado por otro usuario.');
    } finally {
      setReservando(false);
    }
  };

  const formatFecha = (fechaHora) => {
    if (!fechaHora) return { dia: '—', hora: '—' };
    const d = new Date(fechaHora);
    return {
      dia:  d.toLocaleDateString('es-CL', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
      hora: d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const formatFechaSimple = (fechaStr) => {
    if (!fechaStr) return '';
    const [y, m, d] = fechaStr.split('-');
    const meses = ['enero','febrero','marzo','abril','mayo','junio',
                   'julio','agosto','septiembre','octubre','noviembre','diciembre'];
    return `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}`;
  };

  // ── Pantalla de éxito ──────────────────────────────
  if (exito) {
    return (
      <div className="page agendar-exito">
        <div className="agendar-exito-icon">✅</div>
        <h2 className="page-title">¡Cita agendada con éxito!</h2>
        <p className="page-subtitle">Tu cita fue confirmada para:</p>
        <div className="card agendar-exito-card">
          <div className="agendar-exito-fecha">
            {formatFechaSimple(fecha)}
          </div>
          <div className="agendar-exito-hora">
            {formatFecha(bloqueSeleccionado?.horaInicio).hora} hrs
          </div>
          {bloqueSeleccionado?.doctorId && (
            <div className="agendar-exito-doctor">
              🩺 Dr. {bloqueSeleccionado.doctorId}
            </div>
          )}
          {bloqueSeleccionado?.especialidad && (
            <div className="agendar-exito-doctor">
              {bloqueSeleccionado.especialidad}
            </div>
          )}
        </div>
        <button className="btn-primary" onClick={() => navigate('/mis-consultas')}>
          Ver mis consultas
        </button>
      </div>
    );
  }

  // ── Vista principal ────────────────────────────────
  return (
    <div className="page agendar-page">
      <h2 className="page-title">📅 Agendar cita médica</h2>

      {/* Indicador de pasos */}
      <div className="agendar-pasos">
        {PASOS.map((p, i) => (
          <React.Fragment key={p.num}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className={`agendar-paso-num ${paso >= p.num ? 'activo' : ''}`}>
                {paso > p.num ? '✓' : p.num}
              </div>
              <span className={`agendar-paso-label ${paso === p.num ? 'activo' : ''}`}>
                {p.label}
              </span>
            </div>
            {i < PASOS.length - 1 && (
              <div className={`agendar-paso-linea ${paso > p.num ? 'completado' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* ── Paso 1: Elegir fecha ── */}
      {paso === 1 && (
        <div className="card">
          <h3 className="agendar-section-title">¿Qué día necesitas la cita?</h3>
          <div className="form-group">
            <label>Selecciona una fecha disponible</label>
            <input
              type="date"
              className="form-control"
              min={hoy}
              value={fecha}
              onChange={handleSeleccionarFecha}
            />
          </div>
          {fecha && (
            <p className="agendar-fecha-seleccionada">
              📅 {formatFechaSimple(fecha)}
            </p>
          )}
        </div>
      )}

      {/* ── Paso 2: Elegir bloque horario ── */}
      {paso === 2 && (
        <div className="card">
          <div className="agendar-section-header">
            <h3>
              Horarios disponibles — <span>{formatFechaSimple(fecha)}</span>
            </h3>
            <button
              className="agendar-btn-volver"
              onClick={() => { setPaso(1); setBloques([]); }}
            >
              ← Cambiar fecha
            </button>
          </div>

          {loading ? (
            <div className="spinner">Cargando bloques disponibles...</div>
          ) : bloques.length === 0 ? (
            <div className="agendar-sin-bloques">
              <div className="agendar-sin-icon">😔</div>
              <p>Sin horarios disponibles para este día.</p>
              <p>Prueba con otra fecha.</p>
              <button
                className="btn-primary"
                style={{ marginTop: 16 }}
                onClick={() => { setPaso(1); setBloques([]); }}
              >
                Elegir otra fecha
              </button>
            </div>
          ) : (
            <div className="agendar-bloques-grid">
              {bloques.map(bloque => {
                const { hora } = formatFecha(bloque.horaInicio);
                return (
                  <button
                    key={bloque.id}
                    className="agendar-bloque-btn"
                    onClick={() => handleSeleccionarBloque(bloque)}
                  >
                    <div className="agendar-bloque-disponible">✅ Disponible</div>
                    <div className="agendar-bloque-hora">{hora} hrs</div>
                    {bloque.especialidad && (
                      <div className="agendar-bloque-dia">{bloque.especialidad}</div>
                    )}
                    {bloque.doctorId && (
                      <div className="agendar-bloque-doctor">🩺 Dr. {bloque.doctorId}</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Paso 3: Confirmar ── */}
      {paso === 3 && bloqueSeleccionado && (
        <div className="card">
          <div className="agendar-section-header">
            <h3>Confirma tu cita</h3>
            <button
              className="agendar-btn-volver"
              onClick={() => { setPaso(2); setBloqueSeleccionado(null); setError(''); }}
            >
              ← Cambiar horario
            </button>
          </div>

          {/* Resumen */}
          <div className="agendar-resumen">
            <div className="agendar-resumen-label">Cita seleccionada</div>
            <div className="agendar-resumen-especialidad">
              {bloqueSeleccionado.especialidad || 'Consulta médica'}
            </div>
            <div className="agendar-resumen-hora">
              {formatFecha(bloqueSeleccionado.horaInicio).hora} hrs — {formatFechaSimple(fecha)}
            </div>
            {bloqueSeleccionado.doctorId && (
              <div className="agendar-resumen-doctor">
                🩺 Dr. {bloqueSeleccionado.doctorId}
              </div>
            )}
          </div>

          {/* Formulario */}
          <div className="form-group">
            <label>Describe tus síntomas</label>
            <textarea
              className="form-control"
              placeholder="Describe detalladamente lo que estás sintiendo..."
              value={sintomas}
              onChange={e => setSintomas(e.target.value)}
              rows={4}
            />
          </div>

          <div className="agendar-confirmar-btns">
            <button
              className="btn-primary"
              onClick={handleConfirmar}
              disabled={reservando || !sintomas.trim()}
            >
              {reservando ? 'Confirmando...' : '✅ Confirmar cita'}
            </button>
            <button
              className="btn-outline-teal"
              onClick={() => navigate('/mis-consultas')}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}