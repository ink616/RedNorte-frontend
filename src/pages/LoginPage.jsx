import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../service/api';

export default function LoginPage() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]           = useState({ mail: '', pass: '' });
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [mostrarPass, setMostrarPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await login(form.mail, form.pass);
      iniciarSesion(data);
      const tag = data.match?.(/"tag":"([^"]+)"/)?.[1];
      if (tag === 'ADMIN') navigate('/admin/dashboard');
      else if (tag === 'DOCTOR') navigate('/doctor/dashboard');
      else navigate('/mis-consultas');
    } catch {
      setError('Correo o contraseña incorrectos. Intenta de nuevo.');
    } finally { setLoading(false); }
  };

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const CREDENCIALES = [
    { rol: 'Admin',    mail: 'admin@rednorte.cl',      pass: 'admin123',    color: '#EF4444' },
    { rol: 'Doctor',   mail: 'dr.vega@rednorte.cl',    pass: 'doctor123',   color: '#10B981' },
    { rol: 'Paciente', mail: 'juan.perez@correo.cl',   pass: 'paciente123', color: '#2563EB' },
  ];

  return (
    <div className="login-page">

      {/* Panel izquierdo */}
      <div className="login-left">
        <div className="login-deco-1" />
        <div className="login-deco-2" />
        <div className="login-deco-3" />

        <img src="/logo.png" alt="RedNorte" className="login-logo" />

        <h1 className="login-title">
          Red<span className="login-title-accent">Norte</span>
        </h1>
        <p className="login-tagline">Clínica Digital</p>

        <div className="login-features">
          {[
            { icon: '🩺', titulo: 'Atención médica especializada', desc: 'Accede a especialistas en múltiples áreas médicas.' },
            { icon: '📋', titulo: 'Gestiona tus consultas',        desc: 'Solicita, sigue y actualiza tus citas médicas.' },
            { icon: '🔒', titulo: 'Datos protegidos',              desc: 'Tu información médica es completamente privada.' },
          ].map(item => (
            <div key={item.titulo} className="login-feature">
              <span className="login-feature-icon">{item.icon}</span>
              <div>
                <div className="login-feature-title">{item.titulo}</div>
                <div className="login-feature-desc">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Cuentas de prueba */}
        <div className="login-test-wrap">
          <div className="login-test-label">Cuentas de prueba</div>
          {CREDENCIALES.map(c => (
            <div key={c.rol} className="login-test-item" onClick={() => setForm({ mail: c.mail, pass: c.pass })}>
              <div>
                {/* color dinámico del rol: se queda inline */}
                <span className="login-test-rol" style={{ background: c.color }}>{c.rol}</span>
                <span className="login-test-mail">{c.mail}</span>
              </div>
              <span className="login-test-click">click</span>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho */}
      <div className="login-right">
        <div className="login-form-wrap">

          <h2 className="login-form-title">Bienvenido de vuelta</h2>
          <p className="login-form-sub">Inicia sesión para acceder a tu cuenta médica</p>

          {error && (
            <div className="login-error-box">⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit} className="login-form">

            <div>
              <label className="login-field-label">Correo electrónico</label>
              <input
                type="email" value={form.mail} onChange={set('mail')} required
                placeholder="tu@correo.cl"
                className="login-input"
              />
            </div>

            <div>
              <label className="login-field-label">Contraseña</label>
              <div className="login-input-wrap">
                <input
                  type={mostrarPass ? 'text' : 'password'}
                  value={form.pass} onChange={set('pass')} required
                  placeholder="Tu contraseña"
                  className="login-input login-input-pr"
                />
                <button type="button" onClick={() => setMostrarPass(!mostrarPass)} className="login-show-pass">
                  {mostrarPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="login-btn">
              {loading ? 'Ingresando...' : 'Iniciar sesión →'}
            </button>
          </form>

          <div className="login-register-row">
            ¿No tienes cuenta?{' '}
            <Link to="/registro">Regístrate gratis</Link>
          </div>

          <div className="login-bottom-row">
            <Link to="/sobre-nosotros">Conoce más sobre RedNorte →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
