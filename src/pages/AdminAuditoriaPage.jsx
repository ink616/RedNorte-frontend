import React, { useEffect, useState } from 'react';
import { listarAuditoria } from '../service/api';

const ACCION_BADGE = {
  LOGIN:'badge-green', LOGOUT:'badge-gray', CREAR:'badge-blue', LEER:'badge-gray',
  ACTUALIZAR:'badge-amber', ELIMINAR:'badge-red', RESERVAR:'badge-blue',
  CANCELAR:'badge-red', REASIGNAR:'badge-purple', COMPLETAR:'badge-green',
};
const RES_BADGE = { EXITOSO:'badge-green', FALLIDO:'badge-red', RECHAZADO:'badge-amber' };

export default function AdminAuditoriaPage() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fModulo, setFModulo] = useState('');
  const [fAccion, setFAccion] = useState('');

  useEffect(() => {
    listarAuditoria().then(d => setRegistros(Array.isArray(d)?d:[])).finally(()=>setLoading(false));
  }, []);

  const modulos = [...new Set(registros.map(r=>r.modulo))];
  const acciones = [...new Set(registros.map(r=>r.accion))];

  const filtrados = registros.filter(r => {
    if (fModulo && r.modulo !== fModulo) return false;
    if (fAccion && r.accion !== fAccion) return false;
    return true;
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Auditoria del sistema</h1>
          <p className="page-subtitle">Trazabilidad de acciones - {registros.length} registros recientes</p>
        </div>
      </div>

      <div className="filter-bar">
        <select className="form-control" style={{ maxWidth:200 }} value={fModulo} onChange={e=>setFModulo(e.target.value)}>
          <option value="">Todos los modulos</option>
          {modulos.map(m=><option key={m} value={m}>{m}</option>)}
        </select>
        <select className="form-control" style={{ maxWidth:200 }} value={fAccion} onChange={e=>setFAccion(e.target.value)}>
          <option value="">Todas las acciones</option>
          {acciones.map(a=><option key={a} value={a}>{a}</option>)}
        </select>
        <button className="btn btn-ghost btn-sm" onClick={()=>{setFModulo('');setFAccion('');}}>Limpiar</button>
        <span style={{ fontSize:13, color:'var(--text-muted)', alignSelf:'center' }}>{filtrados.length} resultados</span>
      </div>

      {loading ? <div className="spinner">Cargando registros...</div> : (
        <div className="card card-pad-0">
          <div className="table-wrap">
            <table className="tabla">
              <thead><tr><th>ID</th><th>Accion</th><th>Modulo</th><th>Usuario</th><th>Descripcion</th><th>Resultado</th><th>Fecha y hora</th></tr></thead>
              <tbody>
                {filtrados.map(r => (
                  <tr key={r.id}>
                    <td className="tabla-id">#{r.id}</td>
                    <td><span className={`badge ${ACCION_BADGE[r.accion]||'badge-gray'}`}>{r.accion}</span></td>
                    <td style={{ fontSize:12.5, fontWeight:600 }}>{r.modulo}</td>
                    <td style={{ fontSize:13 }}>{r.usuarioId}{r.usuarioRol && <span style={{ color:'var(--text-muted)' }}> ({r.usuarioRol})</span>}</td>
                    <td style={{ fontSize:13, color:'var(--text-soft)', maxWidth:280 }}>{r.descripcion}</td>
                    <td><span className={`badge ${RES_BADGE[r.resultado]||'badge-gray'}`}>{r.resultado}</span></td>
                    <td style={{ fontSize:12.5, color:'var(--text-muted)', whiteSpace:'nowrap' }}>{r.fechaHora ? new Date(r.fechaHora).toLocaleString('es-CL') : '-'}</td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>Sin registros de auditoria.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
