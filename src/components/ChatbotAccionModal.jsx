import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login, registrarUsuario } from '../service/api';

/* ── Validación de RUT chileno (misma lógica que RegistroPage) ─ */
function validarRut(rut) {
  if (!rut) return false;
  const limpio = rut.replace(/\./g, '').replace(/-/g, '');
  if (limpio.length < 2) return false;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1).toUpperCase();
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
  return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
}

function fortaleza(pass) {
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  return score;
}

/**
 * Modal de "acción rápida" que SaludBot abre cuando detecta que el
 * paciente quiere registrarse o iniciar sesión (accionRealizada
 * REDIRIGIR_REGISTRO / REDIRIGIR_LOGIN). En vez de navegar a otra
 * página y perder el contexto del chat, el formulario aparece encima
 * con una animación, el usuario completa sus datos ahí mismo (nunca
 * en el chat: ni el bot ni el historial ven la contraseña), y al
 * terminar se cierra solo con una confirmación visual antes de volver
 * a la conversación.
 *
 * Tiene PARIDAD TOTAL con RegistroPage.jsx: mismos campos (incluida
 * fecha de nacimiento y sexo, que el backend exige), misma validacion
 * de RUT con digito verificador, misma fortaleza de contrasena animada
 * y los mismos checks en tiempo real. La unica diferencia es el
 * contenedor (modal flotante de un solo bloque, en vez de un wizard
 * de 3 pasos con panel visual): el contenido debe sentirse igual de
 * completo y cuidado en ambos lugares.
 */
export default function ChatbotAccionModal({ tipo, onCerrar, onExito }) {
  const { iniciarSesion } = useAuth();
  const [form, setForm] = useState({
    mail: '', pass: '', confirmPass: '',
    apellido1: '', apellido2: '', rut: '', sexo: '', fechaNacimiento: '',
  });
  const [mostrarPass, setMostrarPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  const set = k => e => setForm({ ...form, [k]: e.target.value });
  const esRegistro = tipo === 'REGISTRO';

  const fuerza = fortaleza(form.pass);
  const fuerzaLabel = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'][fuerza];
  const fuerzaColor = ['', 'var(--danger)', 'var(--warning)', '#3B82F6', 'var(--success)'][fuerza];

  const claseInput = (valido) =>
    `rg-input${valido === false ? ' rg-input--invalido' : valido === true ? ' rg-input--valido' : ''}`;

  const handleLogin = async () => {
    if (!form.mail || !form.pass) { setError('Completa correo y contraseña.'); return; }
    setLoading(true); setError('');
    try {
      const data = await login(form.mail, form.pass);
      iniciarSesion(data);
      setExito(true);
      setTimeout(() => onExito({ tipo: 'LOGIN', usuario: data }), 1400);
    } catch {
      setError('Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistro = async () => {
    if (!form.mail || !form.mail.includes('@')) { setError('Ingresa un correo válido.'); return; }
    if (form.pass.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (fuerza < 2) { setError('La contraseña es demasiado débil. Agrega números o mayúsculas.'); return; }
    if (form.pass !== form.confirmPass) { setError('Las contraseñas no coinciden.'); return; }
    if (!form.apellido1.trim()) { setError('Ingresa tu primer apellido.'); return; }
    if (!validarRut(form.rut)) { setError('El RUT ingresado no es válido.'); return; }
    if (!form.fechaNacimiento) { setError('Ingresa tu fecha de nacimiento.'); return; }
    if (!form.sexo) { setError('Selecciona tu sexo.'); return; }

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
      setTimeout(() => onExito({ tipo: 'REGISTRO' }), 1400);
    } catch {
      setError('No se pudo crear la cuenta. El correo ya puede estar en uso.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (esRegistro) handleRegistro();
    else handleLogin();
  };

  if (exito) {
    return (
      <div className="cb-modal-overlay" onClick={onCerrar}>
        <div className="cb-modal-card cb-modal-exito" onClick={e => e.stopPropagation()}>
          <div className="cb-modal-exito-icono">✅</div>
          <div className="cb-modal-exito-titulo">
            {esRegistro ? '¡Cuenta creada con éxito!' : '¡Bienvenido de nuevo!'}
          </div>
          <div className="cb-modal-exito-texto">Volviendo a la conversación con SaludBot...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="cb-modal-overlay" onClick={onCerrar}>
      <div className={`cb-modal-card ${esRegistro ? 'cb-modal-card--registro' : ''}`} onClick={e => e.stopPropagation()}>
        <button className="cb-modal-cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>

        <div className="cb-modal-avatar">
          <img src="/img/saludbot/acogedor.png" alt="SaludBot" />
        </div>
        <h3 className="cb-modal-titulo">
          {esRegistro ? 'Crea tu cuenta gratis' : 'Inicia sesión'}
        </h3>
        <p className="cb-modal-subtitulo">
          {esRegistro
            ? 'Completa estos datos y vuelve directo al chat para agendar tu cita.'
            : 'Ingresa tus datos para continuar conversando con SaludBot.'}
        </p>

        {error && <div className="cb-modal-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="cb-modal-form">
          <div className="rg-campo">
            <label className="rg-campo-label">Correo electrónico</label>
            <div className="rg-input-wrap">
              <input
                className={claseInput(form.mail ? form.mail.includes('@') : undefined)}
                type="email" value={form.mail} onChange={set('mail')} placeholder="tu@correo.cl" autoFocus
              />
              {form.mail && form.mail.includes('@') && <span className="rg-check-icono">✅</span>}
            </div>
          </div>

          <div className="rg-campo">
            <label className="rg-campo-label">Contraseña</label>
            <div className="rg-input-wrap">
              <input
                className={`${claseInput(esRegistro ? (form.pass ? fuerza >= 2 : undefined) : undefined)} rg-input--pass`}
                type={mostrarPass ? 'text' : 'password'}
                value={form.pass}
                onChange={set('pass')}
                placeholder={esRegistro ? 'Mínimo 8 caracteres' : 'Tu contraseña'}
              />
              <button type="button" className="rg-pass-toggle" onClick={() => setMostrarPass(p => !p)}>
                {mostrarPass ? '🙈' : '👁️'}
              </button>
            </div>
            {esRegistro && form.pass && (
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

          {esRegistro && (
            <>
              <div className="rg-campo">
                <label className="rg-campo-label">Confirmar contraseña</label>
                <input
                  className={`${claseInput(form.confirmPass ? form.confirmPass === form.pass : undefined)} rg-input--pass`}
                  type={mostrarPass ? 'text' : 'password'}
                  value={form.confirmPass} onChange={set('confirmPass')}
                  placeholder="Repite tu contraseña"
                />
                {form.confirmPass && form.confirmPass !== form.pass && (
                  <div className="rg-hint rg-hint--error">✕ Las contraseñas no coinciden</div>
                )}
                {form.confirmPass && form.confirmPass === form.pass && (
                  <div className="rg-hint rg-hint--ok">✓ Las contraseñas coinciden</div>
                )}
              </div>

              <div className="rg-grid-2">
                <div className="rg-campo">
                  <label className="rg-campo-label">Primer apellido</label>
                  <input className={claseInput(form.apellido1 ? true : undefined)} value={form.apellido1} onChange={set('apellido1')} placeholder="González" />
                </div>
                <div className="rg-campo">
                  <label className="rg-campo-label">Segundo apellido</label>
                  <input className="rg-input" value={form.apellido2} onChange={set('apellido2')} placeholder="Muñoz" />
                </div>
              </div>

              <div className="rg-campo">
                <label className="rg-campo-label">RUT</label>
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
                  <label className="rg-campo-label">Fecha de nacimiento</label>
                  <input type="date" className={claseInput(form.fechaNacimiento ? true : undefined)}
                    value={form.fechaNacimiento} onChange={set('fechaNacimiento')}
                    max={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="rg-campo">
                  <label className="rg-campo-label">Sexo</label>
                  <select className={claseInput(form.sexo ? true : undefined)} value={form.sexo} onChange={set('sexo')}>
                    <option value="">Selecciona...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Prefiero no decir</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <button type="submit" className="cb-modal-submit" disabled={loading}>
            {loading ? 'Procesando...' : esRegistro ? '🎉 Crear cuenta' : 'Iniciar sesión →'}
          </button>
        </form>
      </div>
    </div>
  );
}
