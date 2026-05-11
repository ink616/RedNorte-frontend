import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { listarUsuarios, listarRoles, registrarUsuario, obtenerFicha, listarConsultasPorUsuario } from '../service/api';

const Badge = ({ color, texto }) => {
  const bg = color==='red'?'#FCEBEB':color==='amber'?'#FAEEDA':color==='blue'?'#E6F1FB':color==='teal'?'#E1F5EE':'#F3F4F6';
  const cl = color==='red'?'#A32D2D':color==='amber'?'#854F0B':color==='blue'?'#185FA5':color==='teal'?'#0F6E56':'#6B7280';
  return <span style={{ background:bg, color:cl, borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:500, display:'inline-block', margin:'2px' }}>{texto}</span>;
};

const TagList = ({ str, color }) => str
  ? str.split(',').map(s=>s.trim()).filter(Boolean).map(s=><Badge key={s} color={color} texto={s}/>)
  : <span style={{fontSize:13,color:'#9CA3AF'}}>—</span>;

const Cuadro = ({ icon, titulo, children }) => (
  <div style={{ background:'#F9FAFB', border:'1px solid #E5E7EB', borderRadius:10, padding:'14px 16px' }}>
    <div style={{ fontSize:11, fontWeight:700, color:'#6B7280', marginBottom:10, display:'flex', alignItems:'center', gap:6, textTransform:'uppercase', letterSpacing:'0.5px' }}>
      <span>{icon}</span>{titulo}
    </div>
    {children}
  </div>
);

const Fila = ({ label, valor }) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px solid #E5E7EB', fontSize:13 }}>
    <span style={{ color:'#6B7280' }}>{label}</span>
    <span style={{ fontWeight:600, color:'#111827' }}>{valor || '—'}</span>
  </div>
);

function ModalUsuario({ usuario, onClose }) {
  const [tab, setTab] = useState('ficha');
  const [ficha, setFicha] = useState(null);
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
    ? `${usuario.persona.apellido1||''} ${usuario.persona.apellido2||''}`.trim()
    : usuario.mail.split('@')[0];

  const iniciales = usuario.persona
    ? (usuario.persona.apellido1?.[0]||'')+(usuario.persona.apellido2?.[0]||'')
    : usuario.mail[0].toUpperCase();

  const imc = ficha?.estatura && ficha?.peso
    ? (ficha.peso/((ficha.estatura/100)**2)).toFixed(1) : null;
  const imcColor = imc ? (imc<18.5?'#F59E0B':imc<25?'#10B981':imc<30?'#F59E0B':'#EF4444') : '#6B7280';
  const imcLabel = imc ? (imc<18.5?'Bajo peso':imc<25?'Normal':imc<30?'Sobrepeso':'Obesidad') : 'IMC';

  const estadoConsulta = { PENDIENTE:['amber','⏳'], AGENDADA:['blue','📅'], ATENDIDA:['teal','✅'], CANCELADA:['red','❌'], REASIGNADA:['blue','🔄'] };

  const modal = (
    <div style={{
      position:'fixed', top:0, left:0, right:0, bottom:0,
      background:'rgba(0,0,0,0.75)',
      zIndex:99999,
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:20,
    }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{
        background:'#FFFFFF',
        borderRadius:16,
        width:'100%', maxWidth:640, maxHeight:'88vh',
        display:'flex', flexDirection:'column',
        boxShadow:'0 25px 80px rgba(0,0,0,0.5)',
        overflow:'hidden',
      }}>

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,#1e40af,#0f766e)', padding:'1.5rem', color:'white', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, flexShrink:0 }}>{iniciales}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:18, marginBottom:3 }}>{nombre}</div>
              <div style={{ fontSize:12, opacity:0.8 }}>{usuario.id} · {usuario.mail}</div>
            </div>
            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
              <span style={{ background:'rgba(255,255,255,0.2)', padding:'3px 12px', borderRadius:20, fontSize:12 }}>{usuario.rol?.tag||'—'}</span>
              <span style={{ background:usuario.estado==='ACTIVO'?'rgba(16,185,129,0.4)':'rgba(239,68,68,0.4)', padding:'3px 12px', borderRadius:20, fontSize:12 }}>{usuario.estado}</span>
              <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.15)', cursor:'pointer', color:'white', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:'1px solid #E5E7EB', padding:'0 1.5rem', background:'#FFFFFF', flexShrink:0 }}>
          {[['ficha','🩺 Ficha médica'],['consultas',`📋 Consultas (${consultas.length})`]].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{ padding:'10px 16px', border:'none', background:'none', cursor:'pointer', fontSize:13, fontWeight:tab===k?700:400, color:tab===k?'#2563EB':'#6B7280', borderBottom:tab===k?'2px solid #2563EB':'2px solid transparent', marginBottom:-1 }}>{l}</button>
          ))}
        </div>

        {/* Cuerpo */}
        <div style={{ overflowY:'auto', padding:'1.25rem 1.5rem', flex:1, background:'#F3F4F6' }}>
          {loading ? (
            <div style={{ textAlign:'center', padding:40, color:'#6B7280' }}>Cargando datos...</div>
          ) : tab==='ficha' ? (
            ficha ? (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                  {[
                    { label:'Estatura', valor:ficha.estatura?`${ficha.estatura} cm`:'—', color:'#2563EB' },
                    { label:'Peso', valor:ficha.peso?`${ficha.peso} kg`:'—', color:'#0D9488' },
                    { label:'IMC', valor:imc||'—', color:imcColor },
                    { label:imcLabel, valor:ficha.grupoSanguineo||'—', color:'#7C3AED' },
                  ].map(s=>(
                    <div key={s.label} style={{ background:'#FFFFFF', border:'1px solid #E5E7EB', borderRadius:10, padding:'12px', textAlign:'center' }}>
                      <div style={{ fontSize:20, fontWeight:700, color:s.color, marginBottom:2 }}>{s.valor}</div>
                      <div style={{ fontSize:11, color:'#6B7280' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <Cuadro icon="❤️" titulo="Signos vitales">
                    <Fila label="Presión arterial" valor={ficha.presionArterial} />
                    <Fila label="Frec. cardíaca" valor={ficha.frecuenciaCardiaca} />
                    <Fila label="Glucosa" valor={ficha.glucosa} />
                  </Cuadro>
                  <Cuadro icon="📞" titulo="Contacto">
                    <Fila label="Teléfono" valor={ficha.telefono} />
                    <Fila label="Dirección" valor={ficha.direccion} />
                    <Fila label="Tabaco" valor={ficha.habitoTabaco} />
                    <Fila label="Alcohol" valor={ficha.habitoAlcohol} />
                  </Cuadro>
                </div>

                <Cuadro icon="⚠️" titulo="Alertas médicas">
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:11, color:'#6B7280', marginBottom:5 }}>Alergias</div>
                    <TagList str={ficha.alergias} color="red" />
                  </div>
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:11, color:'#6B7280', marginBottom:5 }}>Condiciones crónicas</div>
                    <TagList str={ficha.condicionesCronicas} color="amber" />
                  </div>
                  <div>
                    <div style={{ fontSize:11, color:'#6B7280', marginBottom:5 }}>Medicamentos actuales</div>
                    <TagList str={ficha.medicamentosActuales} color="blue" />
                  </div>
                </Cuadro>

                {(ficha.cirugiasPrevias||ficha.antecedentesFamiliares) && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    {ficha.cirugiasPrevias && <Cuadro icon="🏥" titulo="Cirugías previas"><p style={{ fontSize:13, color:'#374151', lineHeight:1.5 }}>{ficha.cirugiasPrevias}</p></Cuadro>}
                    {ficha.antecedentesFamiliares && <Cuadro icon="👨‍👩‍👧" titulo="Antecedentes familiares"><p style={{ fontSize:13, color:'#374151', lineHeight:1.5 }}>{ficha.antecedentesFamiliares}</p></Cuadro>}
                  </div>
                )}

                {ficha.emergenciaNombre && (
                  <Cuadro icon="🆘" titulo="Contacto de emergencia">
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginTop:4 }}>
                      <div><div style={{ fontSize:11, color:'#6B7280', marginBottom:3 }}>Nombre</div><div style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{ficha.emergenciaNombre}</div></div>
                      <div><div style={{ fontSize:11, color:'#6B7280', marginBottom:3 }}>Teléfono</div><div style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{ficha.emergenciaTelefono||'—'}</div></div>
                      <div><div style={{ fontSize:11, color:'#6B7280', marginBottom:3 }}>Relación</div><div style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{ficha.emergenciaRelacion||'—'}</div></div>
                    </div>
                  </Cuadro>
                )}
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:48, background:'#FFFFFF', borderRadius:12 }}>
                <div style={{ fontSize:48, marginBottom:12 }}>📋</div>
                <div style={{ fontWeight:600, color:'#111827', marginBottom:6 }}>Sin ficha médica</div>
                <div style={{ color:'#6B7280', fontSize:13 }}>Este paciente aún no ha completado su perfil médico.</div>
              </div>
            )
          ) : (
            consultas.length>0 ? (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {consultas.map(c=>{
                  const [color,icon] = estadoConsulta[c.estado]||['gray','•'];
                  return (
                    <div key={c.id} style={{ background:'#FFFFFF', border:'1px solid #E5E7EB', borderRadius:10, padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:14, marginBottom:4, textTransform:'capitalize', color:'#111827' }}>#{c.id} — {c.especialidad}</div>
                        <div style={{ fontSize:12, color:'#6B7280' }}>{c.sintomas?.slice(0,70)}{c.sintomas?.length>70?'...':''}</div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0, marginLeft:16 }}>
                        <Badge color={color} texto={`${icon} ${c.estado}`} />
                        <div style={{ fontSize:11, color:'#9CA3AF', marginTop:4 }}>{c.fechaCreacion?new Date(c.fechaCreacion).toLocaleDateString('es-CL'):'—'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:48, color:'#6B7280', background:'#FFFFFF', borderRadius:12 }}>Sin consultas registradas.</div>
            )
          )}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles,    setRoles]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [mostrar,  setMostrar]  = useState(false);
  const [usuarioModal, setUsuarioModal] = useState(null);
  const [form, setForm] = useState({ id:'', mail:'', pass:'', estado:'ACTIVO', rolId:'', apellido1:'', apellido2:'', rut:'' });
  const [creando, setCreando] = useState(false);
  const [error,   setError]   = useState('');
  const [exito,   setExito]   = useState('');
  const [buscar,  setBuscar]  = useState('');

  const cargar = () => {
    setLoading(true);
    Promise.all([listarUsuarios(), listarRoles()])
      .then(([u,r]) => { setUsuarios(Array.isArray(u)?u:[]); setRoles(Array.isArray(r)?r:[]); })
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
        persona: form.apellido1?{ id:'PER-'+form.id, rut:form.rut, apellido1:form.apellido1, apellido2:form.apellido2, sexo:'M', fechaNacimiento:'2000-01-01' }:null,
      });
      setExito('Usuario creado correctamente.'); setMostrar(false);
      setForm({ id:'', mail:'', pass:'', estado:'ACTIVO', rolId:'', apellido1:'', apellido2:'', rut:'' });
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
      {usuarioModal && <ModalUsuario usuario={usuarioModal} onClose={()=>setUsuarioModal(null)} />}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h2 className="page-title" style={{ margin:0 }}>👥 Gestión de usuarios</h2>
        <button className="btn btn-primary" onClick={()=>setMostrar(!mostrar)}>{mostrar?'Cancelar':'+ Nuevo usuario'}</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {exito && <div className="alert alert-success">✅ {exito}</div>}

      {mostrar && (
        <div className="card" style={{ marginBottom:24 }}>
          <h3 style={{ marginBottom:20, fontSize:16 }}>Crear nuevo usuario</h3>
          <form onSubmit={handleCrear}>
            <div className="grid-2">
              <div className="form-group"><label>ID único</label><input className="form-control" value={form.id} onChange={set('id')} placeholder="Ej: USR010" required/></div>
              <div className="form-group"><label>Correo</label><input type="email" className="form-control" value={form.mail} onChange={set('mail')} required/></div>
              <div className="form-group"><label>Contraseña</label><input type="password" className="form-control" value={form.pass} onChange={set('pass')} required/></div>
              <div className="form-group"><label>Rol</label>
                <select className="form-control" value={form.rolId} onChange={set('rolId')} required>
                  <option value="">Selecciona...</option>
                  {roles.map(r=><option key={r.id} value={r.id}>{r.nombre} ({r.tag})</option>)}
                </select>
              </div>
              <div className="form-group"><label>Primer apellido</label><input className="form-control" value={form.apellido1} onChange={set('apellido1')}/></div>
              <div className="form-group"><label>Segundo apellido</label><input className="form-control" value={form.apellido2} onChange={set('apellido2')}/></div>
              <div className="form-group"><label>RUT</label><input className="form-control" value={form.rut} onChange={set('rut')} placeholder="12345678-9"/></div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={creando}>{creando?'Creando...':'Crear usuario'}</button>
          </form>
        </div>
      )}

      <div style={{ marginBottom:16 }}>
        <input className="form-control" value={buscar} onChange={e=>setBuscar(e.target.value)} placeholder="🔍 Buscar por nombre, correo o ID..." style={{ maxWidth:400 }}/>
      </div>

      {loading ? <div className="spinner">Cargando usuarios...</div> : (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <table className="tabla">
            <thead><tr><th>ID</th><th>Correo</th><th>Nombre</th><th>Rol</th><th>Estado</th><th>Registro</th><th></th></tr></thead>
            <tbody>
              {filtrados.map(u=>(
                <tr key={u.id} onClick={()=>setUsuarioModal(u)} style={{ cursor:'pointer' }}>
                  <td style={{ fontFamily:'monospace', fontSize:12 }}>{u.id}</td>
                  <td style={{ color:'#2563EB' }}>{u.mail}</td>
                  <td>{u.persona?`${u.persona.apellido1||''} ${u.persona.apellido2||''}`.trim():'—'}</td>
                  <td>{u.rol&&<Badge color="blue" texto={u.rol.tag}/>}</td>
                  <td><Badge color={u.estado==='ACTIVO'?'teal':'red'} texto={u.estado}/></td>
                  <td style={{ fontSize:13, color:'var(--color-text-secondary)' }}>{u.fechaRegistro?new Date(u.fechaRegistro).toLocaleDateString('es-CL'):'—'}</td>
                  <td style={{ textAlign:'center' }}><span style={{ fontSize:16, opacity:0.5 }}>👁️</span></td>
                </tr>
              ))}
              {filtrados.length===0&&<tr><td colSpan={7} style={{ textAlign:'center', padding:32, color:'var(--color-text-secondary)' }}>Sin resultados.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
