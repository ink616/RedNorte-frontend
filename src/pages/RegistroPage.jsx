import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrarUsuario, listarRoles } from '../service/api';

export default function RegistroPage() {
  const [form, setForm] = useState({ id: '', mail: '', pass: '', confirmar: '', apellido1: '', apellido2: '', rut: '', fechaNacimiento: '', sexo: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.pass !== form.confirmar) { setError('Las contraseñas no coinciden.'); return; }
    if (form.pass.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    setLoading(true);
    try {
      // Generar ID automático basado en el RUT
      const id = 'USR-' + form.rut.replace(/\D/g, '').slice(0, 8);
      await registrarUsuario({
        id,
        mail: form.mail,
        pass: form.pass,
        estado: 'ACTIVO',
        fechaRegistro: new Date().toISOString(),
        rol: { id: 'ROL002', tag: 'PACIENTE', nombre: 'Paciente' },
        persona: {
          id: 'PER-' + id,
          rut: form.rut,
          apellido1: form.apellido1,
          apellido2: form.apellido2,
          fechaNacimiento: form.fechaNacimiento,
          sexo: form.sexo,
        }
      });
      navigate('/login');
    } catch {
      setError('Error al registrarse. El correo o RUT ya puede estar en uso.');
    } finally { setLoading(false); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="login-page" style={{ alignItems: 'flex-start', paddingTop: 40 }}>
      <div className="login-card" style={{ maxWidth: 520 }}>
        <h1 style={{ fontSize: 26 }}>🏥 Crear cuenta</h1>
        <p className="sub">Completa tus datos para registrarte como paciente</p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label>Primer apellido</label>
              <input className="form-control" value={form.apellido1} onChange={set('apellido1')} placeholder="García" required />
            </div>
            <div className="form-group">
              <label>Segundo apellido</label>
              <input className="form-control" value={form.apellido2} onChange={set('apellido2')} placeholder="López" required />
            </div>
            <div className="form-group">
              <label>RUT</label>
              <input className="form-control" value={form.rut} onChange={set('rut')} placeholder="12345678-9" required />
            </div>
            <div className="form-group">
              <label>Fecha de nacimiento</label>
              <input type="date" className="form-control" value={form.fechaNacimiento} onChange={set('fechaNacimiento')} required />
            </div>
            <div className="form-group">
              <label>Sexo</label>
              <select className="form-control" value={form.sexo} onChange={set('sexo')} required>
                <option value="">Selecciona...</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Correo electrónico</label>
            <input type="email" className="form-control" value={form.mail} onChange={set('mail')} placeholder="tu@correo.cl" required />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" className="form-control" value={form.pass} onChange={set('pass')} placeholder="Mínimo 6 caracteres" required />
            </div>
            <div className="form-group">
              <label>Confirmar contraseña</label>
              <input type="password" className="form-control" value={form.confirmar} onChange={set('confirmar')} placeholder="Repite la contraseña" required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ padding: '13px', fontSize: 15 }}>
            {loading ? 'Registrando...' : 'Crear cuenta →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
