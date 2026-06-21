import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { registrarUsuario } from '../service/api';

/* ── Validación de RUT chileno (misma lógica real, sin cambios) ─ */
function validarRut(rut) {
  if (!rut) return false;
  const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '');
  if (rutLimpio.length < 2) return false;
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toUpperCase();
  let suma = 0, multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }
  const dvEsperado = 11 - (suma % 11);
  const dvReal = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : String(dvEsperado);
  return dv === dvReal;
}

function formatearRut(rut) {
  const limpio = rut.replace(/\./g, '').replace(/-/g, '').replace(/[^0-9kK]/g, '');
  if (limpio.length <= 1) return limpio;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${cuerpoFormateado}-${dv}`;
}

const PASOS = [
  { titulo: 'Datos de acceso', desc: 'Tu correo y una contraseña segura.' },
  { titulo: 'Datos personales', desc: 'Para identificarte ante tus médicos.' },
  { titulo: 'Confirmación', desc: 'Revisa todo antes de crear tu cuenta.' },
];

const CONFETI = ['🎉', '🎊', '✨', '⭐', '💙'];

export default function RegistroPage() {
  const [paso, setPaso] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [exito, setExito] = useState(false);

  const [form, setForm] = useState({
    mail: '', pass: '', confirmPass: '',
    apellido1: '', apellido2: '', rut: '', sexo: '', fechaNacimiento: '',
  });

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const fortaleza = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const fuerza = fortaleza(form.pass);
  const fuerzaLabel = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'][fuerza];
  const fuerzaColor = ['', 'var(--danger)', 'var(--warning)', '#3B82F6', 'var(--success)'][fuerza];

  const validarPaso0 = () => {
    if (!form.mail || !form.mail.includes('@')) return 'Ingresa un correo válido.';
    if (form.pass.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (fuerza < 2) return 'La contraseña es demasiado débil. Agrega números o mayúsculas.';
    if (form.pass !== form.confirmPass) return 'Las contraseñas no coinciden.';
    return null;
  };

  const validarPaso1 = () => {
    if (!form.apellido1.trim()) return 'Ingresa tu primer apellido.';
    if (!form.rut.trim()) return 'Ingresa tu RUT.';
    if (!validarRut(form.rut)) return 'El RUT ingresado no es válido.';
    if (!form.fechaNacimiento) return 'Ingresa tu fecha de nacimiento.';
    if (!form.sexo) return 'Selecciona tu sexo.';
    return null;
  };

  const handleSiguiente = () => {
    setError('');
    const err = paso === 0 ? validarPaso0() : validarPaso1();
    if (err) { setError(err); return; }
    setPaso(p => p + 1);
  };

  const handleVolver = () => { setPaso(p => p - 1); setError(''); };

  const handleRegistrar = async () => {
    setLoading(true); setError('');
    try {
      await registrarUsuario({
        id: 'USR-' + Date.now(),
        mail: form.mail,
        pass: form.pass,
        estado: 'ACTIVO',
        fechaRegistro: new Date().toISOString(),
        rol: { id: 'ROL002', tag: 'PACIENTE', nombre: 'Paciente' },
        persona: {
          id: 'PER-' + Date.now(),
          apellido1: form.apellido1,
          apellido2: form.apellido2,
          rut: form.rut,
          sexo: form.sexo,
          fechaNacimiento: form.fechaNacimiento,
        },
      });
      setExito(true);
    } catch {
      setError('Error al registrar. El correo ya puede estar en uso.');
    } finally {
      setLoading(false);
    }
  };

  const claseInput = (valido) =>
    `rg-input${valido === false ? ' rg-input--invalido' : valido === true ? ' rg-input--valido' : ''}`;

  /* ── Pantalla de éxito ──────────────────────────────────────── */
  if (exito) {
    return (
      <div className="rg-exito-wrap">
        <div className="rg-exito-card">
          <div className="rg-confetti">
            {CONFETI.map((c, i) => (
              <span key={i} style={{ left: `${8 + i * 20}%`, animationDelay: `${i * 0.15}s` }}>{c}</span>
            ))}
          </div>
          <div className="rg-exito-icono-wrap">🎉</div>
          <h2 className="rg-exito-titulo">¡Cuenta creada con éxito!</h2>
          <p className="rg-exito-desc">
            Tu cuenta en RedNorte ya está lista. Inicia sesión para agendar tu primera
            consulta médica o conversar con SaludBot.
          </p>
          <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            Iniciar sesión →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rg-layout">

      {/* ── Panel visual ─────────────────────────────────────── */}
      <div className="rg-panel-visual">
        <div className="rg-blob-1" />
        <div className="rg-blob-2" />

        <img src="/logo.png" alt="RedNorte" className="rg-panel-logo" />
        <h1 className="rg-panel-titulo">Red<span>Norte</span></h1>
        <p className="rg-panel-sub">Clínica Digital</p>

        <div className="rg-panel-pasos">
          {PASOS.map((p, i) => (
            <div key={p.titulo} className={`rg-panel-paso ${i < paso ? 'completado' : i === paso ? 'activo' : ''}`}>
              <div className="rg-panel-paso-num">{i < paso ? '✓' : i + 1}</div>
              <div>
                <div className="rg-panel-paso-texto">{p.titulo}</div>
                <div className="rg-panel-paso-desc">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Panel de formulario ──────────────────────────────── */}
      <div className="rg-panel-form">
        <div className="rg-form-inner">

          <h2 className="rg-form-titulo">Crear cuenta en RedNorte</h2>
          <p className="rg-form-sub">Accede a atención médica especializada de forma gratuita</p>

          <div className="rg-stepper-mobile">
            {PASOS.map((_, i) => (
              <div key={i} className={`rg-stepper-mobile-seg ${i < paso ? 'completado' : i === paso ? 'activo' : ''}`} />
            ))}
          </div>

          {error && <div className="rg-error-box">⚠️ {error}</div>}

          {/* PASO 0: Cuenta */}
          {paso === 0 && (
            <div className="rg-paso-contenido">
              <div className="rg-campo">
                <label className="rg-campo-label">Correo electrónico</label>
                <div className="rg-input-wrap">
                  <input
                    className={claseInput(form.mail ? form.mail.includes('@') : undefined)}
                    value={form.mail} onChange={set('mail')}
                    placeholder="tu@correo.cl" type="email"
                  />
                  {form.mail && form.mail.includes('@') && <span className="rg-check-icono">✅</span>}
                </div>
              </div>

              <div className="rg-campo">
                <label className="rg-campo-label">Contraseña</label>
                <div className="rg-input-wrap">
                  <input
                    className={`${claseInput(form.pass ? fuerza >= 2 : undefined)} rg-input--pass`}
                    value={form.pass} onChange={set('pass')}
                    placeholder="Mínimo 8 caracteres"
                    type={mostrarPass ? 'text' : 'password'}
                  />
                  <button type="button" onClick={() => setMostrarPass(p => !p)} className="rg-pass-toggle">
                    {mostrarPass ? '🙈' : '👁️'}
                  </button>
                </div>
                {form.pass && (
                  <div className="rg-fortaleza">
                    <div className="rg-fortaleza-bar">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`rg-fortaleza-seg ${i <= fuerza ? 'activo' : ''}`}
                          style={{ background: i <= fuerza ? fuerzaColor : undefined }} />
                      ))}
                    </div>
                    <div className="rg-fortaleza-label" style={{ color: fuerzaColor }}>
                      Contraseña {fuerzaLabel}
                    </div>
                  </div>
                )}
              </div>

              <div className="rg-campo">
                <label className="rg-campo-label">Confirmar contraseña</label>
                <div className="rg-input-wrap">
                  <input
                    className={`${claseInput(form.confirmPass ? form.confirmPass === form.pass : undefined)} rg-input--pass`}
                    value={form.confirmPass} onChange={set('confirmPass')}
                    placeholder="Repite tu contraseña"
                    type={mostrarPass ? 'text' : 'password'}
                  />
                </div>
                {form.confirmPass && form.confirmPass !== form.pass && (
                  <div className="rg-hint rg-hint--error">✕ Las contraseñas no coinciden</div>
                )}
                {form.confirmPass && form.confirmPass === form.pass && (
                  <div className="rg-hint rg-hint--ok">✓ Las contraseñas coinciden</div>
                )}
              </div>
            </div>
          )}

          {/* PASO 1: Datos personales */}
          {paso === 1 && (
            <div className="rg-paso-contenido">
              <div className="rg-grid-2">
                <div className="rg-campo">
                  <label className="rg-campo-label">Primer apellido *</label>
                  <input className={claseInput(form.apellido1 ? true : undefined)} value={form.apellido1} onChange={set('apellido1')} placeholder="González" />
                </div>
                <div className="rg-campo">
                  <label className="rg-campo-label">Segundo apellido</label>
                  <input className="rg-input" value={form.apellido2} onChange={set('apellido2')} placeholder="Muñoz" />
                </div>
              </div>

              <div className="rg-campo">
                <label className="rg-campo-label">RUT *</label>
                <div className="rg-input-wrap">
                  <input
                    className={claseInput(form.rut ? validarRut(form.rut) : undefined)}
                    value={form.rut}
                    onChange={e => setForm({ ...form, rut: formatearRut(e.target.value) })}
                    placeholder="12.345.678-9"
                  />
                  {form.rut && validarRut(form.rut) && <span className="rg-check-icono">✅</span>}
                </div>
                {form.rut && !validarRut(form.rut) && <div className="rg-hint rg-hint--error">✕ RUT inválido</div>}
                {form.rut && validarRut(form.rut) && <div className="rg-hint rg-hint--ok">✓ RUT válido</div>}
              </div>

              <div className="rg-grid-2">
                <div className="rg-campo">
                  <label className="rg-campo-label">Fecha de nacimiento *</label>
                  <input type="date" className={claseInput(form.fechaNacimiento ? true : undefined)}
                    value={form.fechaNacimiento} onChange={set('fechaNacimiento')}
                    max={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="rg-campo">
                  <label className="rg-campo-label">Sexo *</label>
                  <select className={claseInput(form.sexo ? true : undefined)} value={form.sexo} onChange={set('sexo')}>
                    <option value="">Selecciona...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Prefiero no decir</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: Confirmación */}
          {paso === 2 && (
            <div className="rg-paso-contenido">
              {[
                ['Correo', form.mail],
                ['Contraseña', '••••••••'],
                ['Apellido', `${form.apellido1} ${form.apellido2}`.trim()],
                ['RUT', form.rut],
                ['Fecha de nacimiento', form.fechaNacimiento],
                ['Sexo', form.sexo === 'M' ? 'Masculino' : form.sexo === 'F' ? 'Femenino' : 'Prefiero no decir'],
              ].map(([k, v], i) => (
                <div key={k} className="rg-confirm-row" style={{ animationDelay: `${i * 0.05}s` }}>
                  <span className="rg-confirm-label">{k}</span>
                  <span className="rg-confirm-valor">{v}</span>
                </div>
              ))}
              <div className="rg-aviso-seguridad">
                🔒 <span>Tus datos están protegidos y solo serán usados para tu atención médica.</span>
              </div>
            </div>
          )}

          <div className="rg-botones">
            {paso > 0 && (
              <button onClick={handleVolver} className="rg-btn-volver">← Volver</button>
            )}
            <button
              onClick={paso < 2 ? handleSiguiente : handleRegistrar}
              disabled={loading}
              className="rg-btn-siguiente"
            >
              {loading ? 'Creando cuenta...' : paso < 2 ? 'Siguiente →' : '🎉 Crear cuenta'}
            </button>
          </div>

          <div className="rg-login-hint">
            ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
