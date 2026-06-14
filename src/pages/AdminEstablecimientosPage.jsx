import React, { useEffect, useState } from 'react';
import { listarEstablecimientos, crearEstablecimiento, actualizarEstablecimiento, eliminarEstablecimiento } from '../service/api';

const TIPOS   = ['HOSPITAL','CLINICA','CESFAM','CONSULTORIO','POSTA_RURAL'];
const ESTADOS = ['ACTIVO','INACTIVO','EN_MANTENCION'];

const TIPO_ICON  = { HOSPITAL:'🏥', CLINICA:'🏨', CESFAM:'🏛️', CONSULTORIO:'🩺', POSTA_RURAL:'🏕️' };
const TIPO_COLOR = { HOSPITAL:'#1D4ED8', CLINICA:'#0D9488', CESFAM:'#7C3AED', CONSULTORIO:'#D97706', POSTA_RURAL:'#059669' };
const EST_BADGE  = { ACTIVO:'badge-green', INACTIVO:'badge-red', EN_MANTENCION:'badge-amber' };

const FORM_VACIO = { nombre:'', tipo:'HOSPITAL', direccion:'', comuna:'', region:'', telefono:'', email:'', capacidadDiaria:30, estado:'ACTIVO' };

export default function AdminEstablecimientosPage() {
  const [lista,   setLista]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(FORM_VACIO);
  const [editId,  setEditId]  = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const cargar = () => {
    setLoading(true);
    listarEstablecimientos().then(d => setLista(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  };
  useEffect(() => { cargar(); }, []);

  const abrirNuevo  = () => { setForm(FORM_VACIO); setEditId(null); setError(''); setModal(true); };
  const abrirEditar = (e) => {
    setForm({ nombre:e.nombre, tipo:e.tipo, direccion:e.direccion, comuna:e.comuna, region:e.region,
              telefono:e.telefono||'', email:e.email||'', capacidadDiaria:e.capacidadDiaria||30, estado:e.estado });
    setEditId(e.id); setError(''); setModal(true);
  };

  const guardar = async () => {
    if (!form.nombre || !form.direccion || !form.comuna || !form.region) { setError('Completa los campos obligatorios.'); return; }
    setSaving(true); setError('');
    try {
      if (editId) await actualizarEstablecimiento(editId, form);
      else        await crearEstablecimiento(form);
      setModal(false); cargar();
    } catch { setError('Error al guardar. Intenta nuevamente.'); }
    finally { setSaving(false); }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este establecimiento?')) return;
    await eliminarEstablecimiento(id); cargar();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🏥 Establecimientos</h1>
          <p className="page-subtitle">Red de centros de salud · {lista.length} registrados</p>
        </div>
        <button className="btn btn-primary" onClick={abrirNuevo}>+ Nuevo establecimiento</button>
      </div>

      {loading ? <div className="spinner">Cargando...</div> : (
        <div className="grid-auto stagger">
          {lista.map(e => {
            const color = TIPO_COLOR[e.tipo] || 'var(--text-soft)';
            return (
              <div key={e.id} className="card card-pad-0 card-hover">
                <div style={{ background:color, padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                    <span style={{ fontSize:21 }}>{TIPO_ICON[e.tipo]}</span>
                    <span style={{ color:'white', fontWeight:700, fontSize:12.5, letterSpacing:'0.3px' }}>{e.tipo}</span>
                  </div>
                  <span className={`badge ${EST_BADGE[e.estado]}`}>{e.estado}</span>
                </div>
                <div style={{ padding:'16px 18px' }}>
                  <h3 style={{ margin:'0 0 10px', fontSize:15, fontWeight:700 }}>{e.nombre}</h3>
                  <div style={{ fontSize:13, color:'var(--text-soft)', lineHeight:1.85 }}>
                    <div>📍 {e.direccion}, {e.comuna}</div>
                    <div>🗺️ {e.region}</div>
                    {e.telefono && <div>📞 {e.telefono}</div>}
                    {e.email && <div>✉️ {e.email}</div>}
                    <div>🏃 Capacidad: <strong>{e.capacidadDiaria}</strong> pacientes/día</div>
                  </div>
                  <div style={{ display:'flex', gap:8, marginTop:14 }}>
                    <button className="btn btn-ghost btn-sm" style={{ flex:1 }} onClick={() => abrirEditar(e)}>✏️ Editar</button>
                    <button className="btn btn-soft-danger btn-sm" onClick={() => eliminar(e.id)}>🗑️</button>
                  </div>
                </div>
              </div>
            );
          })}
          {lista.length === 0 && (
            <div className="empty-state" style={{ gridColumn:'1/-1' }}>
              <span className="icon">🏥</span>
              <h3>Sin establecimientos</h3>
              <p>Agrega el primer centro de salud con el botón superior.</p>
            </div>
          )}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? 'Editar' : 'Nuevo'} establecimiento</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error">⚠️ {error}</div>}
              <div className="form-group">
                <label>Nombre *</label>
                <input className="form-control" value={form.nombre} onChange={e => setForm(p => ({...p, nombre:e.target.value}))} placeholder="Hospital Regional del Norte" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo *</label>
                  <select className="form-control" value={form.tipo} onChange={e => setForm(p => ({...p, tipo:e.target.value}))}>
                    {TIPOS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Capacidad diaria</label>
                  <input type="number" className="form-control" value={form.capacidadDiaria} onChange={e => setForm(p => ({...p, capacidadDiaria:e.target.value}))} />
                </div>
              </div>
              <div className="form-group">
                <label>Dirección *</label>
                <input className="form-control" value={form.direccion} onChange={e => setForm(p => ({...p, direccion:e.target.value}))} placeholder="Av. Arturo Prat 1234" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Comuna *</label>
                  <input className="form-control" value={form.comuna} onChange={e => setForm(p => ({...p, comuna:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label>Región *</label>
                  <input className="form-control" value={form.region} onChange={e => setForm(p => ({...p, region:e.target.value}))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input className="form-control" value={form.telefono} onChange={e => setForm(p => ({...p, telefono:e.target.value}))} placeholder="+56 57 2123456" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" className="form-control" value={form.email} onChange={e => setForm(p => ({...p, email:e.target.value}))} />
                </div>
              </div>
              {editId && (
                <div className="form-group">
                  <label>Estado</label>
                  <select className="form-control" value={form.estado} onChange={e => setForm(p => ({...p, estado:e.target.value}))}>
                    {ESTADOS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" style={{ flex:2 }} onClick={guardar} disabled={saving}>
                {saving ? 'Guardando...' : editId ? 'Guardar cambios' : 'Crear establecimiento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
