/**
 * ⚠️  ARCHIVO ZOMBIE — Este archivo es una versión antigua reemplazada por AdminUsuariosPage.jsx
 *     Se recomienda ELIMINAR este archivo.
 */
import React, { useState, useEffect } from 'react';
import { listarUsuarios, listarRoles, crearUsuario } from '../service/api';

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles]       = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ id: '', mail: '', pass: '', estado: 'ACTIVO', rolId: '' });
  const [creando, setCreando]   = useState(false);
  const [error, setError]       = useState('');
  const [exito, setExito]       = useState('');

  const cargar = () => {
    setCargando(true);
    Promise.all([listarUsuarios(), listarRoles()])
      .then(([u, r]) => { setUsuarios(u); setRoles(r); })
      .finally(() => setCargando(false));
  };
  useEffect(() => { cargar(); }, []);

  const handleCrear = async (e) => {
    e.preventDefault();
    setError(''); setExito(''); setCreando(true);
    try {
      const rolSeleccionado = roles.find(r => r.id === form.rolId);
      await crearUsuario({ id: form.id, mail: form.mail, pass: form.pass, estado: form.estado, rol: rolSeleccionado || null, persona: null, fechaRegistro: new Date().toISOString() });
      setExito('Usuario creado correctamente.');
      setMostrarForm(false);
      setForm({ id: '', mail: '', pass: '', estado: 'ACTIVO', rolId: '' });
      cargar();
    } catch { setError('Error al crear el usuario. Verifica que el ID y correo no estén en uso.');
    } finally { setCreando(false); }
  };

  return (
    <div className="page">
      <div className="flex-between mb-24">
        <h2 className="page-title" style={{ margin: 0 }}>Gestión de usuarios</h2>
        <button onClick={() => setMostrarForm(!mostrarForm)} className="btn btn-primary">
          {mostrarForm ? 'Cancelar' : '+ Nuevo usuario'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {exito && <div className="alert alert-success">{exito}</div>}

      {mostrarForm && (
        <div className="card card-mb">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Crear nuevo usuario</h3>
          <form onSubmit={handleCrear}>
            <div className="grid-2">
              {[
                { label: 'ID de usuario',        key: 'id',   type: 'text',     ph: 'Ej: USR005' },
                { label: 'Correo electrónico',    key: 'mail', type: 'email',    ph: 'usuario@correo.cl' },
                { label: 'Contraseña temporal',   key: 'pass', type: 'password', ph: '••••••••' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label>{f.label}</label>
                  <input type={f.type} placeholder={f.ph} value={form[f.key]} required
                    className="form-control"
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}
              <div className="form-group">
                <label>Rol</label>
                <select value={form.rolId} required className="form-control"
                  onChange={e => setForm({ ...form, rolId: e.target.value })}>
                  <option value="">Selecciona un rol...</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.nombre} ({r.tag})</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={creando} style={{ marginTop: 20 }}>
              {creando ? 'Creando...' : 'Crear usuario'}
            </button>
          </form>
        </div>
      )}

      <div className="card card-flush">
        {cargando ? <div className="spinner">Cargando usuarios...</div> : (
          <table className="tabla">
            <thead>
              <tr>
                {['ID', 'Correo', 'Rol', 'Estado', 'Fecha registro'].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td className="td-mono">{u.id}</td>
                  <td>{u.mail}</td>
                  <td>
                    {u.rol
                      ? <span className="badge-blue">{u.rol.tag}</span>
                      : '—'}
                  </td>
                  <td>
                    <span className={u.estado === 'ACTIVO' ? 'badge-teal' : 'badge-red'}>
                      {u.estado}
                    </span>
                  </td>
                  <td className="td-muted">
                    {u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString('es-CL') : '—'}
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr><td colSpan={5} className="td-empty">No hay usuarios registrados.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UsuariosPage;
