import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { agendaPorDoctor, cancelarBloque } from '../service/api';

const ESTADO_STYLE = {
  DISPONIBLE:  { bg:'var(--success-light)', color:'var(--success-dark)' },
  RESERVADO:   { bg:'var(--primary-light)', color:'var(--primary-dark)' },
  COMPLETADO:  { bg:'var(--purple-light)',  color:'var(--purple)' },
  CANCELADO:   { bg:'var(--danger-light)',  color:'var(--danger-dark)' },
  BLOQUEADO:   { bg:'var(--bg-soft)',       color:'var(--text-soft)' },
};

export default function DoctorAgendaPage() {
  const { usuario } = useAuth();
  const [bloques, setBloques] = useState([]);
  const [loading, setLoading] = useState(true);

  const doctorId = usuario?.id;

  const cargar = () => {
    if (!doctorId) return;
    setLoading(true);
    agendaPorDoctor(doctorId).then(d => setBloques(Array.isArray(d)?d:[])).finally(()=>setLoading(false));
  };
  useEffect(() => { cargar(); }, [doctorId]); // eslint-disable-line react-hooks/exhaustive-deps

  const porFecha = bloques.reduce((acc, b) => { (acc[b.fecha] = acc[b.fecha] || []).push(b); return acc; }, {});

  const stats = {
    total: bloques.length,
    disponibles: bloques.filter(b=>b.estado==='DISPONIBLE').length,
    reservados: bloques.filter(b=>b.estado==='RESERVADO').length,
  };

  const cancelar = async (id) => {
    if (!window.confirm('Cancelar este bloque?')) return;
    await cancelarBloque(id); cargar();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mi agenda</h1>
          <p className="page-subtitle">Tus bloques horarios asignados</p>
        </div>
      </div>

      <div className="grid-3 stagger" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ '--accent-color':'var(--primary)' }}>
          <div className="stat-icon" style={{ background:'var(--primary-light)' }}>CAL</div>
          <div><div className="stat-num" style={{ color:'var(--primary)' }}>{stats.total}</div><div className="stat-label">Bloques totales</div></div>
        </div>
        <div className="stat-card" style={{ '--accent-color':'var(--success)' }}>
          <div className="stat-icon" style={{ background:'var(--success-light)' }}>OK</div>
          <div><div className="stat-num" style={{ color:'var(--success)' }}>{stats.disponibles}</div><div className="stat-label">Disponibles</div></div>
        </div>
        <div className="stat-card" style={{ '--accent-color':'var(--primary-dark)' }}>
          <div className="stat-icon" style={{ background:'var(--primary-light)' }}>RES</div>
          <div><div className="stat-num" style={{ color:'var(--primary-dark)' }}>{stats.reservados}</div><div className="stat-label">Reservados</div></div>
        </div>
      </div>

      {loading ? <div className="spinner">Cargando agenda...</div> : (
        <div style={{ display:'flex', flexDirection:'column', gap:18 }} className="stagger">
          {Object.entries(porFecha).sort(([a],[b])=>a.localeCompare(b)).map(([fecha, bqs]) => (
            <div key={fecha} className="card card-pad-0">
              <div className="card-header">
                <span>{new Date(fecha+'T12:00').toLocaleDateString('es-CL',{weekday:'long',month:'long',day:'numeric'})}</span>
                <span style={{ fontSize:13, color:'var(--text-muted)', fontWeight:400 }}>{bqs.length} bloques</span>
              </div>
              <div style={{ padding:16, display:'flex', gap:8, flexWrap:'wrap' }}>
                {bqs.sort((a,b)=>a.horaInicio.localeCompare(b.horaInicio)).map(b => {
                  const s = ESTADO_STYLE[b.estado] || ESTADO_STYLE.DISPONIBLE;
                  return (
                    <div key={b.id} style={{ background:s.bg, borderRadius:10, padding:'10px 14px', minWidth:120, position:'relative' }}>
                      <div style={{ fontSize:14, fontWeight:700, color:s.color }}>{b.horaInicio?.slice(0,5)} - {b.horaFin?.slice(0,5)}</div>
                      <div style={{ fontSize:11, color:s.color, marginTop:3 }}>{b.estado}</div>
                      {b.pacienteId && <div style={{ fontSize:10, color:s.color, opacity:0.8, marginTop:1 }}>Paciente: {b.pacienteId}</div>}
                      {b.estado === 'DISPONIBLE' && (
                        <button onClick={()=>cancelar(b.id)} title="Bloquear" style={{ position:'absolute', top:5, right:6, background:'none', border:'none', fontSize:11, cursor:'pointer', opacity:0.5, color:s.color }}>X</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {Object.keys(porFecha).length === 0 && (
            <div className="empty-state"><span className="icon">CAL</span><h3>Sin bloques asignados</h3><p>El administrador aun no ha generado horarios para ti.</p></div>
          )}
        </div>
      )}
    </div>
  );
}
