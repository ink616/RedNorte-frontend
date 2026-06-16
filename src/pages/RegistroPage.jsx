import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrarUsuario } from '../service/api';

function validarRut(rut) {
  if (!rut) return false;
  const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '');
  if (rutLimpio.length < 2) return false;
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toUpperCase();
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
  const dv = limpio.slice(-1);
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${cuerpoFormateado}-${dv}`;
}

const PASOS = ['Cuenta', 'Datos personales', 'Confirmación'];

export default function RegistroPage() {
  const navigate = useNavigate();
  const [paso, setPaso]           = useState(0);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
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

  const fuerza = fortaleza(form.pass);
  const fuerzaLabel = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'][fuerza];
  const fuerzaColor = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'][fuerza];

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
    setPaso(paso + 1);
  };

  const handleRegistrar = async () => {
    setLoading(true); setError('');
    try {
      const userId = 'USR-' + Date.now();
      await registrarUsuario({
        id: userId,
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

  /* Clase del input según validez */
  const inputCls = (valid) =>
    `registro-input${valid === false ? ' error' : valid === true ? ' ok' : ''}`;

  /* Pantalla de éxito */
  if (paso === 3) return (
    <div className="registro-exito">
      <div className="registro-exito-inner">
        <div className="registro-exito-icon">🎉</div>
        <h2 className="registro-exito-title">¡Cuenta creada!</h2>
        <p className="registro-exito-desc">
          Tu cuenta en RedNorte fue creada exitosamente. Ya puedes iniciar sesión y solicitar tu primera consulta médica.
        </p>
        <Link to="/login" className="registro-exito-btn">Iniciar sesión →</Link>
      </div>
    </div>
  );

  return (
    <div className="registro-page">
      <div className="registro-wrap">

        {/* Logo */}
        <div className="registro-logo-wrap">
          <img src="/logo.png" alt="RedNorte" className="registro-logo" />
          <h1 className="registro-title">Crear cuenta en RedNorte</h1>
          <p className="registro-subtitle">Accede a atención médica especializada de forma gratuita</p>
        </div>

        {/* Stepper */}
        <div className="registro-stepper">
          {PASOS.map((p, i) => (
            <React.Fragment key={p}>
              <div className="registro-step">
                <div className={`registro-step-circle ${i < paso ? 'done' : i === paso ? 'active' : 'pending'}`}>
                  {i < paso ? '✓' : i + 1}
                </div>
                <div className={`registro-step-label ${i === paso ? 'active' : 'inactive'}`}>{p}</div>
              </div>
              {i < PASOS.length - 1 && (
                <div className={`registro-step-line ${i < paso ? 'done' : 'pending'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="registro-card">

          {error && <div className="registro-error-box">⚠️ {error}</div>}

          {/* PASO 0: Cuenta */}
          {paso === 0 && (
            <div className="registro-step-body">
              <h3 className="registro-step-title">Datos de acceso</h3>

              <div>
                <label className="registro-label">CORREO ELECTRÓNICO</label>
                <input className={inputCls(form.mail ? form.mail.includes('@') : undefined)}
                  value={form.mail} onChange={set('mail')} placeholder="tu@correo.cl" type="email" />
              </div>

              <div>
                <label className="registro-label">CONTRASEÑA</label>
                <div className="registro-input-wrap">
                  <input className={`${inputCls(form.pass ? fuerza >= 2 : undefined)} registro-input-pr`}
                    value={form.pass} onChange={set('pass')} placeholder="Mínimo 8 caracteres"
                    type={mostrarPass ? 'text' : 'password'} />
                  <button type="button" onClick={() => setMostrarPass(!mostrarPass)} className="registro-show-pass">
                    {mostrarPass ? '🙈' : '👁️'}
                  </button>
                </div>
                {form.pass && (
                  <div className="registro-fortaleza">
                    <div className="registro-fuerza-bars">
                      {[1, 2, 3, 4].map(i => (
                        /* color dinámico de barras: se queda inline */
                        <div key={i} className="registro-fuerza-bar"
                          style={{ background: i <= fuerza ? fuerzaColor : 'var(--color-border-tertiary)' }} />
                      ))}
                    </div>
                    <div className="registro-fuerza-label" style={{ color: fuerzaColor }}>
                      Contraseña {fuerzaLabel}
                    </div>
                    <div className="registro-fuerza-hint">
                      {fuerza < 4 && '💡 Agrega ' + [
                        form.pass.length < 8      && '8+ caracteres',
                        !/[A-Z]/.test(form.pass)  && 'mayúsculas',
                        !/[0-9]/.test(form.pass)  && 'números',
                        !/[^A-Za-z0-9]/.test(form.pass) && 'símbolos',
                      ].filter(Boolean).join(', ')}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="registro-label">CONFIRMAR CONTRASEÑA</label>
                <input className={inputCls(form.confirmPass ? form.confirmPass === form.pass : undefined)}
                  value={form.confirmPass} onChange={set('confirmPass')} placeholder="Repite tu contraseña"
                  type={mostrarPass ? 'text' : 'password'} />
                {form.confirmPass && form.confirmPass !== form.pass && (
                  <div className="registro-val-err">Las contraseñas no coinciden</div>
                )}
                {form.confirmPass && form.confirmPass === form.pass && (
                  <div className="registro-val-ok">✓ Las contraseñas coinciden</div>
                )}
              </div>
            </div>
          )}

          {/* PASO 1: Datos personales */}
          {paso === 1 && (
            <div className="registro-step-body">
              <h3 className="registro-step-title">Datos personales</h3>

              <div className="registro-grid-2">
                <div>
                  <label className="registro-label">PRIMER APELLIDO *</label>
                  <input className={inputCls(form.apellido1 ? true : undefined)}
                    value={form.apellido1} onChange={set('apellido1')} placeholder="González" />
                </div>
                <div>
                  <label className="registro-label">SEGUNDO APELLIDO</label>
                  <input className="registro-input" value={form.apellido2} onChange={set('apellido2')} placeholder="Muñoz" />
                </div>
              </div>

              <div>
                <label className="registro-label">RUT *</label>
                <input className={inputCls(form.rut ? validarRut(form.rut) : undefined)}
                  value={form.rut}
                  onChange={e => setForm({ ...form, rut: formatearRut(e.target.value) })}
                  placeholder="12.345.678-9" />
                {form.rut && !validarRut(form.rut) && <div className="registro-val-err">RUT inválido</div>}
                {form.rut && validarRut(form.rut)  && <div className="registro-val-ok">✓ RUT válido</div>}
              </div>

              <div className="registro-grid-2">
                <div>
                  <label className="registro-label">FECHA DE NACIMIENTO *</label>
                  <input type="date" className={inputCls(form.fechaNacimiento ? true : undefined)}
                    value={form.fechaNacimiento} onChange={set('fechaNacimiento')}
                    max={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
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
                ['Correo', form.mail],
                ['Contraseña', '••••••••'],
                ['Apellido', `${form.apellido1} ${form.apellido2}`.trim()],
                ['RUT', form.rut],
                ['Fecha de nacimiento', form.fechaNacimiento],
                ['Sexo', form.sexo === 'M' ? 'Masculino' : form.sexo === 'F' ? 'Femenino' : 'Prefiero no decir'],
              ].map(([k, v]) => (
                <div key={k} className="registro-confirm-row">
                  <span className="registro-confirm-key">{k}</span>
                  <span className="registro-confirm-val">{v}</span>
                </div>
              ))}
              <div className="registro-info-box">
                🔒 Tus datos están protegidos y solo serán usados para tu atención médica.
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="registro-btns">
            {paso > 0 && (
              <button onClick={() => { setPaso(paso - 1); setError(''); }} className="registro-back-btn">
                ← Volver
              </button>
            )}
            <button onClick={paso < 2 ? handleSiguiente : handleRegistrar}
              disabled={loading} className="registro-next-btn">
              {loading ? 'Creando cuenta...' : paso < 2 ? 'Siguiente →' : '🎉 Crear cuenta'}
            </button>
          </div>

          <div className="registro-login-link">
            ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
