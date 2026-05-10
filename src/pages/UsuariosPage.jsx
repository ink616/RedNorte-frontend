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

  const thStyle = { padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#f9fafb' };
  const tdStyle = { padding: '14px 16px', borderBottom: '1px solid #f3f4f6', fontSize: 14 };

  return (
    <div style={{ padding: '40px 5%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: '#1F2937', fontSize: 26, fontWeight: 700 }}>Gestión de usuarios</h2>
        <button onClick={() => setMostrarForm(!mostrarForm)} className="btn-primary">
          {mostrarForm ? 'Cancelar' : '+ Nuevo usuario'}
        </button>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}
      {exito && <div style={{ background: '#d1fae5', color: '#065f46', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{exito}</div>}

      {mostrarForm && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: '#1F2937' }}>Crear nuevo usuario</h3>
          <form onSubmit={handleCrear}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[{ label: 'ID de usuario', key: 'id', type: 'text', ph: 'Ej: USR005' },
                { label: 'Correo electrónico', key: 'mail', type: 'email', ph: 'usuario@correo.cl' },
                { label: 'Contraseña temporal', key: 'pass', type: 'password', ph: '••••••••' }].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#374151' }}>{f.label}</label>
                  <input type={f.type} placeholder={f.ph} value={form[f.key]} required
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    style={{ width: '100%', padding: 10, border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#374151' }}>Rol</label>
                <select value={form.rolId} required onChange={e => setForm({ ...form, rolId: e.target.value })}
                  style={{ width: '100%', padding: 10, border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }}>
                  <option value="">Selecciona un rol...</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.nombre} ({r.tag})</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={creando} style={{ marginTop: 20 }}>
              {creando ? 'Creando...' : 'Crear usuario'}
            </button>
          </form>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {cargando ? <p style={{ padding: 24, color: '#6b7280' }}>Cargando usuarios...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['ID','Correo','Rol','Estado','Fecha registro'].map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr></thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 13 }}>{u.id}</td>
                  <td style={tdStyle}>{u.mail}</td>
                  <td style={tdStyle}>
                    {u.rol ? <span style={{ background: '#dbeafe', color: '#1e40af', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>{u.rol.tag}</span> : '—'}
                  </td>
                  <td style={tdStyle}>
                    <span style={{ background: u.estado === 'ACTIVO' ? '#d1fae5' : '#fee2e2', color: u.estado === 'ACTIVO' ? '#065f46' : '#991b1b', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>
                      {u.estado}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontSize: 13, color: '#6b7280' }}>
                    {u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString('es-CL') : '—'}
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>No hay usuarios registrados.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UsuariosPage;
