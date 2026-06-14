import React, { useEffect, useState } from 'react';
import { listarAgenda, generarBloques, cancelarBloque, listarEstablecimientos } from '../service/api';

const ESTADO_STYLE = {
  DISPONIBLE:  { bg:'#D1FAE5', color:'#065F46' },
  RESERVADO:   { bg:'#DBEAFE', color:'#1E40AF' },
  BLOQUEADO:   { bg:'#F3F4F6', color:'#374151' },
  COMPLETADO:  { bg:'#EDE9FE', color:'#5B21B6' },
  CANCELADO:   { bg:'#FEE2E2', color:'#991B1B' },
};

const DOCTORES = [
  { id:'USR002', nombre:'Dr. Andrés Vega' },
  { id:'USR003', nombre:'Dra. Carolina Rojas' },
  { id:'USR004', nombre:'Dr. Felipe Morales' },
];

export default function AdminAgendaPage() {
  const [bloques,  setBloques]  = useState([]);
  const [establecimientos, setEstablecimientos] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filtroDoc,setFiltroDoc]= useState('');
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState({ doctorId:'USR002', establecimientoId:'', fecha:'' });
  const [saving,   setSaving]   = useState(false);

  const cargar = () => {
    setLoading(true);
    Promise.all([listarAgenda(), listarEstablecimientos()])
      .then(([b, e]) => { setBloques(Array.isArray(b)?b:[]); setEstablecimientos(Array.isArray(e)?e:[]); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const bloquesVisibles = filtroDoc ? bloques.filter(b => b.doctorId === filtroDoc) : bloques;

  const agrupadosPorFecha = bloquesVisibles.reduce((acc, b) => {
    if (!acc[b.fecha]) acc[b.fecha] = [];
    acc[b.fecha].push(b);
    return acc;
  }, {});

  const generarHorarios = async () => {
    if (!form.doctorId || !form.establecimientoId || !form.fecha) return;
    setSaving(true);
    try { await generarBloques(form.doctorId, form.establecimientoId, form.fecha); setModal(false); cargar(); }
    finally { setSaving(false); }
  };

  const cancelar = async (id) => {
    if (!window.confirm('¿Cancelar este bloque?')) return;
    await cancelarBloque(id); cargar();
  };

  return (
    <div style={{ padding:'32px 32px 48px', maxWidth:1200, margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, color:'var(--text)', margin:0 }}>Agenda médica</h1>
          <p style={{ color:'var(--text-muted)', marginTop:4, fontSize:14 }}>{bloques.length} bloques registrados en el sistema</p>
        </div>
        <button onClick={() => setModal(true)} style={{ background:'#2563EB', color:'white', border:'none', borderRadius:10, padding:'10px 20px', fontWeight:700, fontSize:14, cursor:'pointer' }}>
          + Generar horario
        </button>
      </div>

      {/* Filtro por doctor */}
      <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
        <button onClick={()=>setFiltroDoc('')} style={{ padding:'7px 16px', borderRadius:20, border:'1px solid var(--border)', background:!filtroDoc?'#2563EB':'var(--card)', color:!filtroDoc?'white':'var(--text)', fontWeight:600, fontSize:13, cursor:'pointer' }}>
          Todos
        </button>
        {DOCTORES.map(d => (
          <button key={d.id} onClick={()=>setFiltroDoc(d.id)} style={{ padding:'7px 16px', borderRadius:20, border:'1px solid var(--border)', background:filtroDoc===d.id?'#2563EB':'var(--card)', color:filtroDoc===d.id?'white':'var(--text)', fontWeight:600, fontSize:13, cursor:'pointer' }}>
            {d.nombre}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)' }}>Cargando agenda...</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {Object.entries(agrupadosPorFecha).sort(([a],[b])=>a.localeCompare(b)).map(([fecha, bqs]) => (
            <div key={fecha} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden', boxShadow:'var(--shadow)' }}>
              <div style={{ padding:'12px 20px', background:'var(--bg)', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontWeight:700, fontSize:15, color:'var(--text)' }}>
                  📅 {new Date(fecha+'T12:00').toLocaleDateString('es-CL',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
                </span>
                <span style={{ fontSize:13, color:'var(--text-muted)' }}>{bqs.length} bloques</span>
              </div>
              <div style={{ padding:16, display:'flex', gap:8, flexWrap:'wrap' }}>
                {bqs.sort((a,b)=>a.horaInicio.localeCompare(b.horaInicio)).map(b => {
                  const s = ESTADO_STYLE[b.estado] || ESTADO_STYLE.DISPONIBLE;
                  const doctor = DOCTORES.find(d=>d.id===b.doctorId);
                  return (
                    <div key={b.id} style={{ background:s.bg, border:`1px solid ${s.color}22`, borderRadius:10, padding:'8px 12px', minWidth:110, position:'relative' }}>
                      <div style={{ fontSize:13, fontWeight:700, color:s.color }}>{b.horaInicio?.slice(0,5)} – {b.horaFin?.slice(0,5)}</div>
                      <div style={{ fontSize:11, color:s.color, marginTop:2 }}>{b.estado}</div>
                      {b.pacienteId && <div style={{ fontSize:10, color:s.color, opacity:0.8, marginTop:1 }}>👤 {b.pacienteId}</div>}
                      {doctor && <div style={{ fontSize:10, color:s.color, opacity:0.7 }}>{doctor.nombre.split(' ')[0]} {doctor.nombre.split(' ')[1]}</div>}
                      {b.estado === 'DISPONIBLE' && (
                        <button onClick={()=>cancelar(b.id)} style={{ position:'absolute', top:4, right:4, background:'none', border:'none', fontSize:12, cursor:'pointer', opacity:0.5 }} title="Cancelar">✕</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {Object.keys(agrupadosPorFecha).length === 0 && (
            <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)', background:'var(--card)', borderRadius:14, border:'1px solid var(--border)' }}>
              No hay bloques de agenda. Genera horarios con el botón superior.
            </div>
          )}
        </div>
      )}

      {/* Modal generar horario */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'var(--card)', borderRadius:16, width:'100%', maxWidth:420 }}>
            <div style={{ padding:'18px 24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
              <h2 style={{ margin:0, fontSize:17, fontWeight:800, color:'var(--text)' }}>Generar horario</h2>
              <button onClick={()=>setModal(false)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'var(--text-muted)' }}>✕</button>
            </div>
            <div style={{ padding:24, display:'flex', flexDirection:'column', gap:14 }}>
              <p style={{ margin:0, fontSize:13, color:'var(--text-muted)' }}>Genera 18 bloques de 30 min entre 08:00 y 17:00 para el doctor y fecha seleccionados.</p>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Doctor</label>
                <select value={form.doctorId} onChange={e=>setForm(p=>({...p,doctorId:e.target.value}))}
                  style={{ width:'100%', padding:'9px 12px', border:'1px solid var(--border)', borderRadius:8, fontSize:14, background:'var(--bg)', color:'var(--text)' }}>
                  {DOCTORES.map(d=><option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Establecimiento</label>
                <select value={form.establecimientoId} onChange={e=>setForm(p=>({...p,establecimientoId:e.target.value}))}
                  style={{ width:'100%', padding:'9px 12px', border:'1px solid var(--border)', borderRadius:8, fontSize:14, background:'var(--bg)', color:'var(--text)' }}>
                  <option value="">Seleccionar...</option>
                  {establecimientos.map(e=><option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Fecha</label>
                <input type="date" value={form.fecha} onChange={e=>setForm(p=>({...p,fecha:e.target.value}))}
                  min={new Date().toISOString().split('T')[0]}
                  style={{ width:'100%', padding:'9px 12px', border:'1px solid var(--border)', borderRadius:8, fontSize:14, background:'var(--bg)', color:'var(--text)', boxSizing:'border-box' }}/>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={()=>setModal(false)} style={{ flex:1, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:8, padding:10, fontSize:14, fontWeight:600, color:'var(--text)', cursor:'pointer' }}>Cancelar</button>
                <button onClick={generarHorarios} disabled={saving||!form.establecimientoId||!form.fecha}
                  style={{ flex:2, background:'#2563EB', border:'none', borderRadius:8, padding:10, fontSize:14, fontWeight:700, color:'white', cursor:'pointer', opacity:(saving||!form.establecimientoId||!form.fecha)?0.6:1 }}>
                  {saving?'Generando...':'Generar 18 bloques'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
