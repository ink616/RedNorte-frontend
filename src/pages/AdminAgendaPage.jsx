import React, { useEffect, useState } from 'react';
import { listarAgenda, generarBloques, cancelarBloque, listarEstablecimientos } from '../service/api';

const ESTADO_STYLE = {
  DISPONIBLE:  { bg:'var(--success-light)', color:'var(--success-dark)' },
  RESERVADO:   { bg:'var(--primary-light)', color:'var(--primary-dark)' },
  BLOQUEADO:   { bg:'var(--bg-soft)',       color:'var(--text-soft)' },
  COMPLETADO:  { bg:'var(--purple-light)',  color:'var(--purple)' },
  CANCELADO:   { bg:'var(--danger-light)',  color:'var(--danger-dark)' },
};

const DOCTORES = [
  { id:'USR002', nombre:'Dr. Andres Vega' },
  { id:'USR003', nombre:'Dra. Carolina Rojas' },
  { id:'USR004', nombre:'Dr. Felipe Morales' },
];

export default function AdminAgendaPage() {
  const [bloques, setBloques] = useState([]);
  const [establecimientos, setEstablecimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroDoc, setFiltroDoc] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ doctorId:'USR002', establecimientoId:'', fecha:'' });
  const [saving, setSaving] = useState(false);

  const cargar = () => {
    setLoading(true);
    Promise.all([listarAgenda(), listarEstablecimientos()])
      .then(([b, e]) => { setBloques(Array.isArray(b)?b:[]); setEstablecimientos(Array.isArray(e)?e:[]); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { cargar(); }, []);

  const visibles = filtroDoc ? bloques.filter(b => b.doctorId === filtroDoc) : bloques;
  const porFecha = visibles.reduce((acc, b) => { (acc[b.fecha] = acc[b.fecha] || []).push(b); return acc; }, {});

  const generar = async () => {
    if (!form.doctorId || !form.establecimientoId || !form.fecha) return;
    setSaving(true);
    try { await generarBloques(form.doctorId, form.establecimientoId, form.fecha); setModal(false); cargar(); }
    finally { setSaving(false); }
  };

  const cancelar = async (id) => {
    if (!window.confirm('Cancelar este bloque?')) return;
    await cancelarBloque(id); cargar();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Agenda medica</h1>
          <p className="page-subtitle">{bloques.length} bloques registrados en el sistema</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Generar horario</button>
      </div>

      <div className="filter-bar">
        <button className={`filter-chip ${!filtroDoc?'active':''}`} onClick={()=>setFiltroDoc('')}>Todos</button>
        {DOCTORES.map(d => (
          <button key={d.id} className={`filter-chip ${filtroDoc===d.id?'active':''}`} onClick={()=>setFiltroDoc(d.id)}>{d.nombre}</button>
        ))}
      </div>

      {loading ? <div className="spinner">Cargando agenda...</div> : (
        <div style={{ display:'flex', flexDirection:'column', gap:18 }} className="stagger">
          {Object.entries(porFecha).sort(([a],[b])=>a.localeCompare(b)).map(([fecha, bqs]) => (
            <div key={fecha} className="card card-pad-0">
              <div className="card-header">
                <span>{new Date(fecha+'T12:00').toLocaleDateString('es-CL',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</span>
                <span style={{ fontSize:13, color:'var(--text-muted)', fontWeight:400 }}>{bqs.length} bloques</span>
              </div>
              <div style={{ padding:16, display:'flex', gap:8, flexWrap:'wrap' }}>
                {bqs.sort((a,b)=>a.horaInicio.localeCompare(b.horaInicio)).map(b => {
                  const s = ESTADO_STYLE[b.estado] || ESTADO_STYLE.DISPONIBLE;
                  const doctor = DOCTORES.find(d=>d.id===b.doctorId);
                  return (
                    <div key={b.id} style={{ background:s.bg, borderRadius:10, padding:'8px 12px', minWidth:118, position:'relative' }}>
                      <div style={{ fontSize:13, fontWeight:700, color:s.color }}>{b.horaInicio?.slice(0,5)} - {b.horaFin?.slice(0,5)}</div>
                      <div style={{ fontSize:11, color:s.color, marginTop:2 }}>{b.estado}</div>
                      {b.pacienteId && <div style={{ fontSize:10, color:s.color, opacity:0.8, marginTop:1 }}>{b.pacienteId}</div>}
                      {doctor && <div style={{ fontSize:10, color:s.color, opacity:0.7 }}>{doctor.nombre}</div>}
                      {b.estado === 'DISPONIBLE' && (
                        <button onClick={()=>cancelar(b.id)} title="Cancelar" style={{ position:'absolute', top:4, right:4, background:'none', border:'none', fontSize:11, cursor:'pointer', opacity:0.5, color:s.color }}>X</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {Object.keys(porFecha).length === 0 && (
            <div className="empty-state"><span className="icon">CAL</span><h3>Sin bloques de agenda</h3><p>Genera horarios con el boton superior.</p></div>
          )}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h2>Generar horario</h2><button className="modal-close" onClick={()=>setModal(false)}>X</button></div>
            <div className="modal-body">
              <p style={{ margin:'0 0 16px', fontSize:13, color:'var(--text-muted)' }}>Genera 18 bloques de 30 min entre 08:00 y 17:00 para el doctor y fecha seleccionados.</p>
              <div className="form-group">
                <label>Doctor</label>
                <select className="form-control" value={form.doctorId} onChange={e=>setForm(p=>({...p,doctorId:e.target.value}))}>
                  {DOCTORES.map(d=><option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Establecimiento</label>
                <select className="form-control" value={form.establecimientoId} onChange={e=>setForm(p=>({...p,establecimientoId:e.target.value}))}>
                  <option value="">Seleccionar...</option>
                  {establecimientos.map(e=><option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Fecha</label>
                <input type="date" className="form-control" value={form.fecha} min={new Date().toISOString().split('T')[0]} onChange={e=>setForm(p=>({...p,fecha:e.target.value}))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={()=>setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" style={{ flex:2 }} onClick={generar} disabled={saving||!form.establecimientoId||!form.fecha}>{saving?'Generando...':'Generar 18 bloques'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
