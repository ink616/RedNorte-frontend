import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { agendaDisponiblePorFecha, reservarBloque, listarEstablecimientos, registrarAuditoria } from '../service/api';

const DOCTORES = {
  USR002: 'Dr. Andres Vega',
  USR003: 'Dra. Carolina Rojas',
  USR004: 'Dr. Felipe Morales',
};

export default function ReservarHoraPage() {
  const { usuario } = useAuth();
  const [fecha, setFecha] = useState('');
  const [bloques, setBloques] = useState([]);
  const [establecimientos, setEstablecimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buscado, setBuscado] = useState(false);
  const [reservando, setReservando] = useState(null);
  const [exito, setExito] = useState('');

  useEffect(() => {
    listarEstablecimientos().then(d => setEstablecimientos(Array.isArray(d)?d:[])).catch(()=>{});
  }, []);

  const nombreEst = (id) => establecimientos.find(e=>e.id===id)?.nombre || id;

  const buscar = () => {
    if (!fecha) return;
    setLoading(true); setBuscado(true); setExito('');
    agendaDisponiblePorFecha(fecha)
      .then(d => setBloques(Array.isArray(d)?d:[]))
      .finally(()=>setLoading(false));
  };

  const reservar = async (bloque) => {
    setReservando(bloque.id);
    try {
      await reservarBloque(bloque.id, String(usuario.id), '');
      registrarAuditoria({
        accion:'RESERVAR', modulo:'AGENDA', usuarioId:String(usuario.id),
        usuarioRol:'PACIENTE', recursoId:String(bloque.id),
        descripcion:`Paciente reservo bloque ${bloque.horaInicio} con ${DOCTORES[bloque.doctorId]||bloque.doctorId}`,
        resultado:'EXITOSO',
      }).catch(()=>{});
      setExito(`Hora reservada: ${fecha} a las ${bloque.horaInicio?.slice(0,5)} con ${DOCTORES[bloque.doctorId]||bloque.doctorId}.`);
      buscar();
    } catch {
      setExito('No se pudo reservar el bloque. Intenta con otro.');
    } finally { setReservando(null); }
  };

  const porDoctor = bloques.reduce((acc, b) => { (acc[b.doctorId] = acc[b.doctorId] || []).push(b); return acc; }, {});

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reservar hora medica</h1>
          <p className="page-subtitle">Elige una fecha y selecciona un horario disponible</p>
        </div>
      </div>

      {exito && <div className="alert alert-success">{exito}</div>}

      <div className="card" style={{ marginBottom:24 }}>
        <div style={{ display:'flex', gap:12, alignItems:'flex-end', flexWrap:'wrap' }}>
          <div className="form-group" style={{ margin:0, flex:1, minWidth:200 }}>
            <label>Fecha de atencion</label>
            <input type="date" className="form-control" value={fecha} min={new Date().toISOString().split('T')[0]} onChange={e=>setFecha(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={buscar} disabled={!fecha}>Buscar horarios</button>
        </div>
      </div>

      {loading ? <div className="spinner">Buscando disponibilidad...</div> : buscado && (
        Object.keys(porDoctor).length > 0 ? (
          <div style={{ display:'flex', flexDirection:'column', gap:18 }} className="stagger">
            {Object.entries(porDoctor).map(([docId, bqs]) => (
              <div key={docId} className="card card-pad-0">
                <div className="card-header">
                  <span>{DOCTORES[docId] || docId}</span>
                  <span style={{ fontSize:12, color:'var(--text-muted)', fontWeight:400 }}>{nombreEst(bqs[0].establecimientoId)}</span>
                </div>
                <div style={{ padding:16, display:'flex', gap:8, flexWrap:'wrap' }}>
                  {bqs.sort((a,b)=>a.horaInicio.localeCompare(b.horaInicio)).map(b => (
                    <button key={b.id} onClick={()=>reservar(b)} disabled={reservando===b.id}
                      style={{ background:'var(--success-light)', color:'var(--success-dark)', border:'1.5px solid transparent',
                               borderRadius:10, padding:'10px 16px', fontSize:14, fontWeight:700, cursor:'pointer', transition:'var(--transition)' }}
                      onMouseEnter={e=>{e.currentTarget.style.background='var(--success)';e.currentTarget.style.color='white';}}
                      onMouseLeave={e=>{e.currentTarget.style.background='var(--success-light)';e.currentTarget.style.color='var(--success-dark)';}}>
                      {reservando===b.id ? '...' : b.horaInicio?.slice(0,5)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state"><span className="icon">CAL</span><h3>Sin horarios disponibles</h3><p>No hay bloques libres para esa fecha. Prueba con otro dia.</p></div>
        )
      )}
    </div>
  );
}
