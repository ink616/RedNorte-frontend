import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrarUsuario } from '../service/api';

// Validar RUT chileno
function validarRut(rut) {
  if (!rut) return false;
  const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '');
  if (rutLimpio.length < 2) return false;
  const cuerpo = rutLimpio.slice(0, -1);
  const dv     = rutLimpio.slice(-1).toUpperCase();
  let suma = 0, multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplo;
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
  const dv     = limpio.slice(-1);
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${cuerpoFormateado}-${dv}`;
}

const PASOS = ['Cuenta', 'Datos personales', 'Confirmación'];

export default function RegistroPage() {
  const navigate = useNavigate();
  const [paso, setPaso]               = useState(0);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);

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

  const fuerza      = fortaleza(form.pass);
  const fuerzaLabel = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'][fuerza];
  const fuerzaColor = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'][fuerza];

  const validarPaso0 = () => {
    if (!form.mail || !form.mail.includes('@')) return 'Ingresa un correo válido.';
    if (form.pass.length < 8)   return 'La contraseña debe tener al menos 8 caracteres.';
    if (fuerza < 2)             return 'La contraseña es demasiado débil. Agrega números o mayúsculas.';
    if (form.pass !== form.confirmPass) return 'Las contraseñas no coinciden.';
    return null;
  };

  const validarPaso1 = () => {
    if (!form.apellido1.trim()) return 'Ingresa tu primer apellido.';
    if (!form.rut.trim())       return 'Ingresa tu RUT.';
    if (!validarRut(form.rut))  return 'El RUT ingresado no es válido.';
    if (!form.fechaNacimiento)  return 'Ingresa tu fecha de nacimiento.';
    if (!form.sexo)             return 'Selecciona tu sexo.';
    return null;
  };

  const handleSiguiente = () => {
    setError('');
    const err = paso === 0 ? validarPaso0() : validarPaso1();
    if (err) { setError(err); return; }
    setPaso(paso + 1);
  };

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
      setPaso(3);
    } catch {
      setError('Error al registrar. El correo ya puede estar en uso.');
    } finally { setLoading(false); }
  };

  // Clase del input según validez
  const inputCls = (valid) =>
    `registro-input${valid === false ? ' error' : valid === true ? ' ok' : ''}`;

  if (paso === 3) return (
    <div className="registro-exito-wrap">
      <div className="registro-exito-card">
        <div className="registro-exito-icon">🎉</div>
        <h2 className="registro-exito-titulo">¡Cuenta creada!</h2>
        <p className="registro-exito-desc">
          Tu cuenta en RedNorte fue creada exitosamente. Ya puedes iniciar sesión y solicitar tu primera consulta médica.
        </p>
        <Link to="/login" className="btn btn-primary">Iniciar sesión →</Link>
      </div>
    </div>
  );

  return (
    <div className="registro-wrap">
      <div className="registro-container">

        {/* Logo */}
        <div className="registro-logo-wrap">
          <img src="/logo.png" alt="RedNorte" className="registro-logo" />
          <h1 className="registro-titulo">Crear cuenta en RedNorte</h1>
          <p className="registro-subtitulo">Accede a atención médica especializada de forma gratuita</p>
        </div>

        {/* Indicador de pasos */}
        <div className="registro-pasos">
          {PASOS.map((p, i) => (
            <React.Fragment key={p}>
              <div className="registro-paso-item">
                <div className={`registro-paso-num ${i < paso ? 'completado' : i === paso ? 'activo' : ''}`}>
                  {i < paso ? '✓' : i + 1}
                </div>
                <div className={`registro-paso-label ${i === paso ? 'activo' : ''}`}>{p}</div>
              </div>
              {i < PASOS.length - 1 && (
                <div className={`registro-paso-linea ${i < paso ? 'completada' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="registro-card">

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          {/* PASO 0: Cuenta */}
          {paso === 0 && (
            <div className="registro-form-group-list">
              <h3 className="registro-step-title">Datos de acceso</h3>

              <div className="form-group">
                <label className="registro-label">CORREO ELECTRÓNICO</label>
                <input
                  className={inputCls(form.mail ? form.mail.includes('@') : undefined)}
                  value={form.mail} onChange={set('mail')}
                  placeholder="tu@correo.cl" type="email"
                />
              </div>

              <div className="form-group">
                <label className="registro-label">CONTRASEÑA</label>
                <div className="registro-pass-wrap">
                  <input
                    className={inputCls(form.pass ? fuerza >= 2 : undefined)}
                    value={form.pass} onChange={set('pass')}
                    placeholder="Mínimo 8 caracteres"
                    type={mostrarPass ? 'text' : 'password'}
                  />
                  <button type="button" onClick={() => setMostrarPass(!mostrarPass)} className="registro-pass-toggle">
                    {mostrarPass ? '🙈' : '👁️'}
                  </button>
                </div>
                {form.pass && (
                  <div className="registro-fortaleza">
                    <div className="registro-fortaleza-bar">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="registro-fortaleza-seg" style={{ background: i <= fuerza ? fuerzaColor : 'var(--color-border-tertiary)' }} />
                      ))}
                    </div>
                    <div className="registro-fortaleza-label" style={{ color: fuerzaColor }}>
                      Contraseña {fuerzaLabel}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="registro-label">CONFIRMAR CONTRASEÑA</label>
                <input
                  className={inputCls(form.confirmPass ? form.confirmPass === form.pass : undefined)}
                  value={form.confirmPass} onChange={set('confirmPass')}
                  placeholder="Repite tu contraseña"
                  type={mostrarPass ? 'text' : 'password'}
                />
                {form.confirmPass && form.confirmPass !== form.pass && (
                  <div className="registro-hint error">Las contraseñas no coinciden</div>
                )}
                {form.confirmPass && form.confirmPass === form.pass && (
                  <div className="registro-hint ok">✓ Las contraseñas coinciden</div>
                )}
              </div>
            </div>
          )}

          {/* PASO 1: Datos personales */}
          {paso === 1 && (
            <div className="registro-form-group-list">
              <h3 className="registro-step-title">Datos personales</h3>

              <div className="registro-grid-2">
                <div className="form-group">
                  <label className="registro-label">PRIMER APELLIDO *</label>
                  <input className={inputCls(form.apellido1 ? true : undefined)} value={form.apellido1} onChange={set('apellido1')} placeholder="González" />
                </div>
                <div className="form-group">
                  <label className="registro-label">SEGUNDO APELLIDO</label>
                  <input className="registro-input" value={form.apellido2} onChange={set('apellido2')} placeholder="Muñoz" />
                </div>
              </div>

              <div className="form-group">
                <label className="registro-label">RUT *</label>
                <input
                  className={inputCls(form.rut ? validarRut(form.rut) : undefined)}
                  value={form.rut}
                  onChange={e => setForm({ ...form, rut: formatearRut(e.target.value) })}
                  placeholder="12.345.678-9"
                />
                {form.rut && !validarRut(form.rut) && <div className="registro-hint error">RUT inválido</div>}
                {form.rut && validarRut(form.rut)  && <div className="registro-hint ok">✓ RUT válido</div>}
              </div>

              <div className="registro-grid-2">
                <div className="form-group">
                  <label className="registro-label">FECHA DE NACIMIENTO *</label>
                  <input type="date" className={inputCls(form.fechaNacimiento ? true : undefined)} value={form.fechaNacimiento} onChange={set('fechaNacimiento')}
                    max={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group">
                  <label className="registro-label">SEXO *</label>
                  <select className={inputCls(form.sexo ? true : undefined)} value={form.sexo} onChange={set('sexo')}>
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
            <div>
              <h3 className="registro-step-title">Confirma tus datos</h3>
              {[
                ['Correo',             form.mail],
                ['Contraseña',         '••••••••'],
                ['Apellido',           `${form.apellido1} ${form.apellido2}`.trim()],
                ['RUT',                form.rut],
                ['Fecha de nacimiento', form.fechaNacimiento],
                ['Sexo',              form.sexo === 'M' ? 'Masculino' : form.sexo === 'F' ? 'Femenino' : 'Prefiero no decir'],
              ].map(([k, v]) => (
                <div key={k} className="registro-confirm-row">
                  <span className="td-muted">{k}</span>
                  <span className="registro-confirm-val">{v}</span>
                </div>
              ))}
              <div className="alert alert-info" style={{ marginTop: 16 }}>
                🔒 Tus datos están protegidos y solo serán usados para tu atención médica.
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="form-actions" style={{ marginTop: 24 }}>
            {paso > 0 && (
              <button onClick={() => { setPaso(paso - 1); setError(''); }} className="btn btn-ghost">
                ← Volver
              </button>
            )}
            <button
              onClick={paso < 2 ? handleSiguiente : handleRegistrar}
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: 2 }}
            >
              {loading ? 'Creando cuenta...' : paso < 2 ? 'Siguiente →' : '🎉 Crear cuenta'}
            </button>
          </div>

          <div className="registro-login-hint">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="link-blue">Iniciar sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
