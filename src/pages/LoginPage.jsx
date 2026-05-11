import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../service/api';

export default function LoginPage() {
  const { iniciarSesion, esAdmin, esDoctor } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ mail: '', pass: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarPass, setMostrarPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await login(form.mail, form.pass);
      iniciarSesion(data);
      // Redirigir según rol extraído del texto
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
    { rol: 'Admin', mail: 'admin@rednorte.cl', pass: 'admin123', color: '#EF4444' },
    { rol: 'Doctor', mail: 'dr.vega@rednorte.cl', pass: 'doctor123', color: '#10B981' },
    { rol: 'Paciente', mail: 'juan.perez@correo.cl', pass: 'paciente123', color: '#2563EB' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>

      {/* Panel izquierdo — visual */}
      <div style={{
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 30%, #1e3a8a 70%, #0f766e 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '3rem', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decoración */}
        <div style={{ position:'absolute', top:-120, right:-120, width:350, height:350, borderRadius:'50%', background:'rgba(94,234,212,0.06)' }}/>
        <div style={{ position:'absolute', bottom:-80, left:-80, width:250, height:250, borderRadius:'50%', background:'rgba(37,99,235,0.08)' }}/>
        <div style={{ position:'absolute', top:'20%', left:'5%', width:2, height:100, background:'linear-gradient(to bottom, transparent, rgba(94,234,212,0.4), transparent)' }}/>

        <img src="/logo.png" alt="RedNorte" style={{ height: 130, marginBottom: 28, filter: 'drop-shadow(0 8px 32px rgba(94,234,212,0.3))' }} />

        <h1 style={{ color: 'white', fontSize: 34, fontWeight: 900, textAlign: 'center', marginBottom: 8, lineHeight: 1.1 }}>
          Red<span style={{ color: '#5eead4' }}>Norte</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 40 }}>
          Clínica Digital
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 320 }}>
          {[
            { icon: '🩺', titulo: 'Atención médica especializada', desc: 'Accede a especialistas en múltiples áreas médicas.' },
            { icon: '📋', titulo: 'Gestiona tus consultas', desc: 'Solicita, sigue y actualiza tus citas médicas.' },
            { icon: '🔒', titulo: 'Datos protegidos', desc: 'Tu información médica es completamente privada.' },
          ].map(item => (
            <div key={item.titulo} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ color: 'white', fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{item.titulo}</div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Credenciales de prueba */}
        <div style={{ marginTop: 40, width: '100%', maxWidth: 320 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
            Cuentas de prueba
          </div>
          {CREDENCIALES.map(c => (
            <div key={c.rol} onClick={() => setForm({ mail: c.mail, pass: c.pass })} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, padding: '8px 12px', marginBottom: 6, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >
              <div>
                <span style={{ background: c.color, color: 'white', borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700, marginRight: 8 }}>{c.rol}</span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{c.mail}</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>click</span>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div style={{
        background: 'var(--color-background-primary)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '3rem',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 6 }}>
            Bienvenido de vuelta
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 32 }}>
            Inicia sesión para acceder a tu cuenta médica
          </p>

          {error && (
            <div style={{ background: '#FCEBEB', color: '#A32D2D', borderRadius: 10, padding: '12px 16px', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Correo electrónico
              </label>
              <input
                type="email" value={form.mail} onChange={set('mail')} required
                placeholder="tu@correo.cl"
                style={{
                  width: '100%', padding: '12px 16px', fontSize: 15, boxSizing: 'border-box',
                  border: '1.5px solid var(--color-border-tertiary)', borderRadius: 10,
                  background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)',
                  outline: 'none', transition: 'border 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#2563EB'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border-tertiary)'}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Contraseña
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={mostrarPass ? 'text' : 'password'} value={form.pass} onChange={set('pass')} required
                  placeholder="Tu contraseña"
                  style={{
                    width: '100%', padding: '12px 48px 12px 16px', fontSize: 15, boxSizing: 'border-box',
                    border: '1.5px solid var(--color-border-tertiary)', borderRadius: 10,
                    background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)',
                    outline: 'none', transition: 'border 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#2563EB'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border-tertiary)'}
                />
                <button type="button" onClick={() => setMostrarPass(!mostrarPass)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 18,
                }}>{mostrarPass ? '🙈' : '👁️'}</button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: 10, border: 'none',
              background: loading ? '#93C5FD' : 'linear-gradient(135deg, #2563EB, #0D9488)',
              color: 'white', fontSize: 15, fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
              boxShadow: '0 4px 16px rgba(37,99,235,0.3)', transition: 'all 0.2s',
            }}>
              {loading ? 'Ingresando...' : 'Iniciar sesión →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--color-text-secondary)' }}>
            ¿No tienes cuenta?{' '}
            <Link to="/registro" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>
              Regístrate gratis
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: 32, paddingTop: 24, borderTop: '0.5px solid var(--color-border-tertiary)' }}>
            <Link to="/sobre-nosotros" style={{ color: 'var(--color-text-secondary)', fontSize: 13, textDecoration: 'none' }}>
              Conoce más sobre RedNorte →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
