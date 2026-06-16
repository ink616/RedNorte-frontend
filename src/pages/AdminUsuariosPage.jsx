import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { listarUsuarios, listarRoles, registrarUsuario, obtenerFicha, listarConsultasPorUsuario } from '../service/api';

/* ── Componentes locales ─────────────────────────────── */
const Badge = ({ color, texto }) => (
  <span className={`badge-${color} badge-red badge-amber badge-blue badge-teal badge-gray`.includes(`badge-${color}`) ? `badge-${color}` : 'badge-gray'}>
    {texto}
  </span>
);

const TagList = ({ str, color }) => str
  ? str.split(',').map(s => s.trim()).filter(Boolean).map(s => <Badge key={s} color={color} texto={s} />)
  : <span className="badge-empty">—</span>;

const Cuadro = ({ icon, titulo, children }) => (
  <div className="cuadro">
    <div className="cuadro-titulo"><span>{icon}</span>{titulo}</div>
    {children}
  </div>
);

const Fila = ({ label, valor }) => (
  <div className="fila">
    <span className="fila-label">{label}</span>
    <span className="fila-val">{valor || '—'}</span>
  </div>
);

/* ── Modal usuario ───────────────────────────────────── */
function ModalUsuario({ usuario, onClose }) {
  const [tab, setTab]         = useState('ficha');
  const [ficha, setFicha]     = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    Promise.all([
      obtenerFicha(usuario.id).catch(() => null),
      listarConsultasPorUsuario(usuario.id).catch(() => []),
    ]).then(([f, c]) => {
      setFicha(f);
      setConsultas(Array.isArray(c) ? c : []);
    }).finally(() => setLoading(false));
    return () => { document.body.style.overflow = ''; };
  }, [usuario.id]);

  const nombre = usuario.persona
    ? `${usuario.persona.apellido1 || ''} ${usuario.persona.apellido2 || ''}`.trim()
    : usuario.mail.split('@')[0];

  const iniciales = usuario.persona
    ? (usuario.persona.apellido1?.[0] || '') + (usuario.persona.apellido2?.[0] || '')
    : usuario.mail[0].toUpperCase();

  const imc = ficha?.estatura && ficha?.peso
    ? (ficha.peso / ((ficha.estatura / 100) ** 2)).toFixed(1) : null;
  const imcColor = imc ? (imc < 18.5 ? '#F59E0B' : imc < 25 ? '#10B981' : imc < 30 ? '#F59E0B' : '#EF4444') : '#6B7280';
  const imcLabel = imc ? (imc < 18.5 ? 'Bajo peso' : imc < 25 ? 'Normal' : imc < 30 ? 'Sobrepeso' : 'Obesidad') : 'IMC';

  const estadoConsulta = { PENDIENTE: ['amber', '⏳'], AGENDADA: ['blue', '📅'], ATENDIDA: ['teal', '✅'], CANCELADA: ['red', '❌'], REASIGNADA: ['blue', '🔄'] };

  const modal = (
    <div className="modal-admin-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-admin-card">

        {/* Header */}
        <div className="modal-admin-header">
          <div className="modal-admin-header-row">
            <div className="modal-admin-avatar">{iniciales}</div>
            <div className="modal-admin-info">
              <div className="modal-admin-nombre">{nombre}</div>
              <div className="modal-admin-sub">{usuario.id} · {usuario.mail}</div>
            </div>
            <div className="modal-admin-tags">
              <span className="modal-admin-tag">{usuario.rol?.tag || '—'}</span>
              <span className={usuario.estado === 'ACTIVO' ? 'modal-admin-tag-activo' : 'modal-admin-tag-inactivo'}>
                {usuario.estado}
              </span>
              <button onClick={onClose} className="modal-admin-close">✕</button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="modal-admin-tabs">
          {[['ficha', '🩺 Ficha médica'], ['consultas', `📋 Consultas (${consultas.length})`]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`modal-admin-tab ${tab === k ? 'activo' : 'inactivo'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Cuerpo */}
        <div className="modal-admin-body">
          {loading ? (
            <div className="modal-admin-loading">Cargando datos...</div>
          ) : tab === 'ficha' ? (
            ficha ? (
              <div className="modal-ficha-wrap">

                <div className="modal-ficha-stats">
                  {[
                    { label: 'Estatura', valor: ficha.estatura ? `${ficha.estatura} cm` : '—', color: '#2563EB' },
                    { label: 'Peso',     valor: ficha.peso     ? `${ficha.peso} kg`     : '—', color: '#0D9488' },
                    { label: 'IMC',      valor: imc || '—',                                    color: imcColor  },
                    { label: imcLabel,   valor: ficha.grupoSanguineo || '—',                    color: '#7C3AED' },
                  ].map(s => (
                    <div key={s.label} className="modal-ficha-stat">
                      <div className="modal-ficha-stat-num" style={{ color: s.color }}>{s.valor}</div>
                      <div className="modal-ficha-stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="modal-ficha-2col">
                  <Cuadro icon="❤️" titulo="Signos vitales">
                    <Fila label="Presión arterial" valor={ficha.presionArterial} />
                    <Fila label="Frec. cardíaca"   valor={ficha.frecuenciaCardiaca} />
                    <Fila label="Glucosa"           valor={ficha.glucosa} />
                  </Cuadro>
                  <Cuadro icon="📞" titulo="Contacto">
                    <Fila label="Teléfono"  valor={ficha.telefono} />
                    <Fila label="Dirección" valor={ficha.direccion} />
                    <Fila label="Tabaco"    valor={ficha.habitoTabaco} />
                    <Fila label="Alcohol"   valor={ficha.habitoAlcohol} />
                  </Cuadro>
                </div>

                <Cuadro icon="⚠️" titulo="Alertas médicas">
                  <div className="modal-alerta-seccion">
                    <div className="modal-alerta-titulo">Alergias</div>
                    <TagList str={ficha.alergias} color="red" />
                  </div>
                  <div className="modal-alerta-seccion">
                    <div className="modal-alerta-titulo">Condiciones crónicas</div>
                    <TagList str={ficha.condicionesCronicas} color="amber" />
                  </div>
                  <div>
                    <div className="modal-alerta-titulo">Medicamentos actuales</div>
                    <TagList str={ficha.medicamentosActuales} color="blue" />
                  </div>
                </Cuadro>

                {(ficha.cirugiasPrevias || ficha.antecedentesFamiliares) && (
                  <div className="modal-ficha-2col">
                    {ficha.cirugiasPrevias    && <Cuadro icon="🏥" titulo="Cirugías previas"><p className="modal-ficha-text">{ficha.cirugiasPrevias}</p></Cuadro>}
                    {ficha.antecedentesFamiliares && <Cuadro icon="👨‍👩‍👧" titulo="Antecedentes familiares"><p className="modal-ficha-text">{ficha.antecedentesFamiliares}</p></Cuadro>}
                  </div>
                )}

                {ficha.emergenciaNombre && (
                  <Cuadro icon="🆘" titulo="Contacto de emergencia">
                    <div className="modal-ficha-3col">
                      <div><div className="modal-emergencia-label">Nombre</div><div className="modal-emergencia-val">{ficha.emergenciaNombre}</div></div>
                      <div><div className="modal-emergencia-label">Teléfono</div><div className="modal-emergencia-val">{ficha.emergenciaTelefono || '—'}</div></div>
                      <div><div className="modal-emergencia-label">Relación</div><div className="modal-emergencia-val">{ficha.emergenciaRelacion || '—'}</div></div>
                    </div>
                  </Cuadro>
                )}
              </div>
            ) : (
              <div className="modal-empty">
                <div className="modal-empty-icon">📋</div>
                <div className="modal-empty-title">Sin ficha médica</div>
                <div className="modal-empty-desc">Este paciente aún no ha completado su perfil médico.</div>
              </div>
            )
          ) : (
            consultas.length > 0 ? (
              <div className="modal-consultas-lista">
                {consultas.map(c => {
                  const [color, icon] = estadoConsulta[c.estado] || ['gray', '•'];
                  return (
                    <div key={c.id} className="modal-consulta-row">
                      <div>
                        <div className="modal-consulta-id">#{c.id} — {c.especialidad}</div>
                        <div className="modal-consulta-sintomas">{c.sintomas?.slice(0, 70)}{c.sintomas?.length > 70 ? '...' : ''}</div>
                      </div>
                      <div className="modal-consulta-right">
                        <Badge color={color} texto={`${icon} ${c.estado}`} />
                        <div className="modal-consulta-fecha">{c.fechaCreacion ? new Date(c.fechaCreacion).toLocaleDateString('es-CL') : '—'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="modal-sin-consultas">Sin consultas registradas.</div>
            )
          )}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}

/* ── Página principal ────────────────────────────────── */
export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios]       = useState([]);
  const [roles,    setRoles]          = useState([]);
  const [loading,  setLoading]        = useState(true);
  const [mostrar,  setMostrar]        = useState(false);
  const [usuarioModal, setUsuarioModal] = useState(null);
  const [form, setForm]               = useState({ id: '', mail: '', pass: '', estado: 'ACTIVO', rolId: '', apellido1: '', apellido2: '', rut: '' });
  const [creando, setCreando]         = useState(false);
  const [error,   setError]           = useState('');
  const [exito,   setExito]           = useState('');
  const [buscar,  setBuscar]          = useState('');

  const cargar = () => {
    setLoading(true);
    Promise.all([listarUsuarios(), listarRoles()])
      .then(([u, r]) => { setUsuarios(Array.isArray(u) ? u : []); setRoles(Array.isArray(r) ? r : []); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { cargar(); }, []);

  const handleCrear = async (e) => {
    e.preventDefault(); setError(''); setExito(''); setCreando(true);
    try {
      const rol = roles.find(r => r.id === form.rolId);
      await registrarUsuario({
        id: form.id, mail: form.mail, pass: form.pass, estado: form.estado,
        fechaRegistro: new Date().toISOString(), rol,
        persona: form.apellido1 ? { id: 'PER-' + form.id, rut: form.rut, apellido1: form.apellido1, apellido2: form.apellido2, sexo: 'M', fechaNacimiento: '2000-01-01' } : null,
      });
      setExito('Usuario creado correctamente.'); setMostrar(false);
      setForm({ id: '', mail: '', pass: '', estado: 'ACTIVO', rolId: '', apellido1: '', apellido2: '', rut: '' });
      cargar();
    } catch { setError('Error al crear. El ID o correo ya puede estar en uso.');
    } finally { setCreando(false); }
  };

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const filtrados = usuarios.filter(u =>
    u.mail?.toLowerCase().includes(buscar.toLowerCase()) ||
    u.id?.toLowerCase().includes(buscar.toLowerCase()) ||
    u.persona?.apellido1?.toLowerCase().includes(buscar.toLowerCase())
  );

  return (
    <div className="page">
      {usuarioModal && <ModalUsuario usuario={usuarioModal} onClose={() => setUsuarioModal(null)} />}

      <div className="admin-usuarios-bar">
        <h2 className="page-title" style={{ margin: 0 }}>👥 Gestión de usuarios</h2>
        <button className="btn btn-primary" onClick={() => setMostrar(!mostrar)}>{mostrar ? 'Cancelar' : '+ Nuevo usuario'}</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {exito && <div className="alert alert-success">✅ {exito}</div>}

      {mostrar && (
        <div className="card mb-24">
          <h3 style={{ marginBottom: 20, fontSize: 16 }}>Crear nuevo usuario</h3>
          <form onSubmit={handleCrear}>
            <div className="grid-2">
              <div className="form-group"><label>ID único</label><input className="form-control" value={form.id} onChange={set('id')} placeholder="Ej: USR010" required /></div>
              <div className="form-group"><label>Correo</label><input type="email" className="form-control" value={form.mail} onChange={set('mail')} required /></div>
              <div className="form-group"><label>Contraseña</label><input type="password" className="form-control" value={form.pass} onChange={set('pass')} required /></div>
              <div className="form-group"><label>Rol</label>
                <select className="form-control" value={form.rolId} onChange={set('rolId')} required>
                  <option value="">Selecciona...</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.nombre} ({r.tag})</option>)}
                </select>
              </div>
              <div className="form-group"><label>Primer apellido</label><input className="form-control" value={form.apellido1} onChange={set('apellido1')} /></div>
              <div className="form-group"><label>Segundo apellido</label><input className="form-control" value={form.apellido2} onChange={set('apellido2')} /></div>
              <div className="form-group"><label>RUT</label><input className="form-control" value={form.rut} onChange={set('rut')} placeholder="12345678-9" /></div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={creando}>{creando ? 'Creando...' : 'Crear usuario'}</button>
          </form>
        </div>
      )}

      <div className="admin-usuarios-buscar">
        <input className="form-control" value={buscar} onChange={e => setBuscar(e.target.value)}
          placeholder="🔍 Buscar por nombre, correo o ID..." />
      </div>

      {loading ? <div className="spinner">Cargando usuarios...</div> : (
        <div className="card card-flush">
          <table className="tabla">
            <thead><tr><th>ID</th><th>Correo</th><th>Nombre</th><th>Rol</th><th>Estado</th><th>Registro</th><th></th></tr></thead>
            <tbody>
              {filtrados.map(u => (
                <tr key={u.id} className="tr-clickable" onClick={() => setUsuarioModal(u)}>
                  <td className="td-mono">{u.id}</td>
                  <td className="td-blue">{u.mail}</td>
                  <td>{u.persona ? `${u.persona.apellido1 || ''} ${u.persona.apellido2 || ''}`.trim() : '—'}</td>
                  <td>{u.rol && <Badge color="blue" texto={u.rol.tag} />}</td>
                  <td><Badge color={u.estado === 'ACTIVO' ? 'teal' : 'red'} texto={u.estado} /></td>
                  <td className="td-muted">{u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString('es-CL') : '—'}</td>
                  <td className="td-center"><span style={{ fontSize: 16, opacity: 0.5 }}>👁️</span></td>
                </tr>
              ))}
              {filtrados.length === 0 && <tr><td colSpan={7} className="td-empty">Sin resultados.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
