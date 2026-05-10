import React, { useEffect, useState } from 'react';
import { listarUsuarios, listarRoles, registrarUsuario } from '../service/api';

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles,    setRoles]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [mostrar,  setMostrar]  = useState(false);
  const [form, setForm] = useState({ id:'', mail:'', pass:'', estado:'ACTIVO', rolId:'', apellido1:'', apellido2:'', rut:'' });
  const [creando, setCreando]   = useState(false);
  const [error,   setError]     = useState('');
  const [exito,   setExito]     = useState('');

  const cargar = () => {
    setLoading(true);
    Promise.all([listarUsuarios(), listarRoles()])
      .then(([u,r]) => { setUsuarios(u); setRoles(r); })
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
        persona: form.apellido1 ? { id: 'PER-'+form.id, rut: form.rut, apellido1: form.apellido1, apellido2: form.apellido2, sexo: 'M', fechaNacimiento: '2000-01-01' } : null,
      });
      setExito('✅ Usuario creado correctamente.'); setMostrar(false);
      setForm({ id:'', mail:'', pass:'', estado:'ACTIVO', rolId:'', apellido1:'', apellido2:'', rut:'' });
      cargar();
    } catch { setError('Error al crear. El ID o correo ya puede estar en uso.');
    } finally { setCreando(false); }
  };

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 className="page-title" style={{ margin: 0 }}>👥 Gestión de usuarios</h2>
        <button className="btn btn-primary" onClick={() => setMostrar(!mostrar)}>
          {mostrar ? 'Cancelar' : '+ Nuevo usuario'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {exito && <div className="alert alert-success">{exito}</div>}

      {mostrar && (
        <div className="card" style={{ marginBottom: 24 }}>
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

      {loading ? <div className="spinner">Cargando usuarios...</div> : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="tabla">
            <thead><tr><th>ID</th><th>Correo</th><th>Nombre</th><th>Rol</th><th>Estado</th><th>Registro</th></tr></thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{u.id}</td>
                  <td>{u.mail}</td>
                  <td>{u.persona ? `${u.persona.apellido1} ${u.persona.apellido2 || ''}` : '—'}</td>
                  <td>
                    {u.rol && <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>{u.rol.tag}</span>}
                  </td>
                  <td>
                    <span style={{ background: u.estado === 'ACTIVO' ? 'var(--success-light)' : 'var(--danger-light)', color: u.estado === 'ACTIVO' ? '#065F46' : '#991B1B', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                      {u.estado}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString('es-CL') : '—'}
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && <tr><td colSpan={6} style={{ textAlign:'center', padding: 32, color:'var(--text-muted)' }}>Sin usuarios.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
