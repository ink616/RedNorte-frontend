import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrarUsuario } from '../service/api';

// Validar RUT chileno
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
  const [paso, setPaso] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      const rutLimpio = form.rut.replace(/\./g, '').replace(/-/g, '');
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

  const inputStyle = (valid) => ({
    width: '100%', padding: '10px 14px', fontSize: 14,
    border: `1px solid ${valid === false ? '#EF4444' : valid === true ? '#10B981' : 'var(--color-border-tertiary)'}`,
    borderRadius: 8, background: 'var(--color-background-secondary)',
    color: 'var(--color-text-primary)', outline: 'none', boxSizing: 'border-box',
  });

  if (paso === 3) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: 'var(--color-text-primary)' }}>¡Cuenta creada!</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 28, lineHeight: 1.7 }}>
          Tu cuenta en RedNorte fue creada exitosamente. Ya puedes iniciar sesión y solicitar tu primera consulta médica.
        </p>
        <Link to="/login" style={{
          background: 'linear-gradient(135deg,#2563EB,#0D9488)', color: 'white',
          padding: '12px 32px', borderRadius: 24, fontWeight: 700, fontSize: 15, textDecoration: 'none',
        }}>Iniciar sesión →</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--color-background-secondary)' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="/logo.png" alt="RedNorte" style={{ height: 56 }} />
          <h1 style={{ fontSize: 22, fontWeight: 800, marginTop: 12, color: 'var(--color-text-primary)' }}>
            Crear cuenta en RedNorte
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>
            Accede a atención médica especializada de forma gratuita
          </p>
        </div>

        {/* Pasos */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
          {PASOS.map((p, i) => (
            <React.Fragment key={p}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                  background: i < paso ? '#10B981' : i === paso ? '#2563EB' : 'var(--color-border-tertiary)',
                  color: i <= paso ? 'white' : 'var(--color-text-secondary)',
                }}>{i < paso ? '✓' : i + 1}</div>
                <div style={{ fontSize: 11, marginTop: 4, color: i === paso ? '#2563EB' : 'var(--color-text-secondary)', fontWeight: i === paso ? 600 : 400 }}>{p}</div>
              </div>
              {i < PASOS.length - 1 && <div style={{ flex: 1, height: 2, background: i < paso ? '#10B981' : 'var(--color-border-tertiary)', marginBottom: 16 }} />}
            </React.Fragment>
          ))}
        </div>

        <div style={{ background: 'var(--color-background-primary)', borderRadius: 16, padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

          {error && <div style={{ background: '#FCEBEB', color: '#A32D2D', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>}

          {/* PASO 0: Cuenta */}
          {paso === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: 'var(--color-text-primary)' }}>Datos de acceso</h3>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>CORREO ELECTRÓNICO</label>
                <input style={inputStyle(form.mail ? form.mail.includes('@') : undefined)} value={form.mail} onChange={set('mail')} placeholder="tu@correo.cl" type="email" />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>CONTRASEÑA</label>
                <div style={{ position: 'relative' }}>
                  <input style={{ ...inputStyle(form.pass ? fuerza >= 2 : undefined), paddingRight: 44 }}
                    value={form.pass} onChange={set('pass')} placeholder="Mínimo 8 caracteres"
                    type={mostrarPass ? 'text' : 'password'} />
                  <button type="button" onClick={() => setMostrarPass(!mostrarPass)} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 16,
                  }}>{mostrarPass ? '🙈' : '👁️'}</button>
                </div>
                {form.pass && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= fuerza ? fuerzaColor : 'var(--color-border-tertiary)', transition: 'all 0.3s' }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: fuerzaColor, fontWeight: 600 }}>Contraseña {fuerzaLabel}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                      {fuerza < 4 && '💡 Agrega ' + [form.pass.length < 8 && '8+ caracteres', !/[A-Z]/.test(form.pass) && 'mayúsculas', !/[0-9]/.test(form.pass) && 'números', !/[^A-Za-z0-9]/.test(form.pass) && 'símbolos'].filter(Boolean).join(', ')}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>CONFIRMAR CONTRASEÑA</label>
                <input style={inputStyle(form.confirmPass ? form.confirmPass === form.pass : undefined)}
                  value={form.confirmPass} onChange={set('confirmPass')} placeholder="Repite tu contraseña"
                  type={mostrarPass ? 'text' : 'password'} />
                {form.confirmPass && form.confirmPass !== form.pass && (
                  <div style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>Las contraseñas no coinciden</div>
                )}
                {form.confirmPass && form.confirmPass === form.pass && (
                  <div style={{ fontSize: 11, color: '#10B981', marginTop: 4 }}>✓ Las contraseñas coinciden</div>
                )}
              </div>
            </div>
          )}

          {/* PASO 1: Datos personales */}
          {paso === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: 'var(--color-text-primary)' }}>Datos personales</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>PRIMER APELLIDO *</label>
                  <input style={inputStyle(form.apellido1 ? true : undefined)} value={form.apellido1} onChange={set('apellido1')} placeholder="González" />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>SEGUNDO APELLIDO</label>
                  <input style={inputStyle()} value={form.apellido2} onChange={set('apellido2')} placeholder="Muñoz" />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>RUT *</label>
                <input style={inputStyle(form.rut ? validarRut(form.rut) : undefined)}
                  value={form.rut}
                  onChange={e => setForm({ ...form, rut: formatearRut(e.target.value) })}
                  placeholder="12.345.678-9" />
                {form.rut && !validarRut(form.rut) && <div style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>RUT inválido</div>}
                {form.rut && validarRut(form.rut) && <div style={{ fontSize: 11, color: '#10B981', marginTop: 4 }}>✓ RUT válido</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>FECHA DE NACIMIENTO *</label>
                  <input type="date" style={inputStyle(form.fechaNacimiento ? true : undefined)} value={form.fechaNacimiento} onChange={set('fechaNacimiento')}
                    max={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>SEXO *</label>
                  <select style={inputStyle(form.sexo ? true : undefined)} value={form.sexo} onChange={set('sexo')}>
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
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--color-text-primary)' }}>Confirma tus datos</h3>
              {[
                ['Correo', form.mail],
                ['Contraseña', '••••••••'],
                ['Apellido', `${form.apellido1} ${form.apellido2}`.trim()],
                ['RUT', form.rut],
                ['Fecha de nacimiento', form.fechaNacimiento],
                ['Sexo', form.sexo === 'M' ? 'Masculino' : form.sexo === 'F' ? 'Femenino' : 'Prefiero no decir'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid var(--color-border-tertiary)', fontSize: 14 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{k}</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{v}</span>
                </div>
              ))}
              <div style={{ background: '#EFF6FF', borderRadius: 8, padding: '12px 14px', marginTop: 16, fontSize: 13, color: '#1e40af' }}>
                🔒 Tus datos están protegidos y solo serán usados para tu atención médica.
              </div>
            </div>
          )}

          {/* Botones */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            {paso > 0 && (
              <button onClick={() => { setPaso(paso - 1); setError(''); }} style={{
                flex: 1, padding: '12px', borderRadius: 8, border: '0.5px solid var(--color-border-tertiary)',
                background: 'var(--color-background-secondary)', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                color: 'var(--color-text-primary)',
              }}>← Volver</button>
            )}
            <button onClick={paso < 2 ? handleSiguiente : handleRegistrar} disabled={loading} style={{
              flex: 2, padding: '12px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg,#2563EB,#0D9488)', color: 'white',
              cursor: loading ? 'wait' : 'pointer', fontSize: 14, fontWeight: 700,
            }}>
              {loading ? 'Creando cuenta...' : paso < 2 ? 'Siguiente →' : '🎉 Crear cuenta'}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--color-text-secondary)' }}>
            ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#2563EB', fontWeight: 600 }}>Iniciar sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
