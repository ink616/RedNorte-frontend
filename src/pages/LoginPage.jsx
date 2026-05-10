import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../service/api';

export default function LoginPage() {
  const [mail, setMail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const u = await login(mail, pass);
      if (!u) throw new Error();
      iniciarSesion(u);
      navigate(u?.rol?.tag === 'ADMIN' ? '/admin/dashboard' : '/mis-consultas');
    } catch {
      setError('Correo o contraseña incorrectos.');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>🏥 RedNorte</h1>
        <p className="sub">Ingresa a tu cuenta para continuar</p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input type="email" className="form-control" value={mail}
              onChange={e => setMail(e.target.value)} placeholder="usuario@correo.cl" required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" className="form-control" value={pass}
              onChange={e => setPass(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8, padding: '13px', fontSize: 15 }}>
            {loading ? 'Ingresando...' : 'Ingresar →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" style={{ color: 'var(--primary)', fontWeight: 600 }}>Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}
