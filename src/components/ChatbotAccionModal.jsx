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

/**
 * Modal de "acción rápida" que SaludBot abre cuando detecta que el
 * paciente quiere registrarse o iniciar sesión (accionRealizada
 * REDIRIGIR_REGISTRO / REDIRIGIR_LOGIN). En vez de navegar a otra
 * página y perder el contexto del chat, el formulario aparece encima
 * con una animación, el usuario completa sus datos ahí mismo (nunca
 * en el chat: ni el bot ni el historial ven la contraseña), y al
 * terminar se cierra solo con una confirmación visual antes de volver
 * a la conversación.
 */
export default function ChatbotAccionModal({ tipo, onCerrar, onExito }) {
  const { iniciarSesion } = useAuth();
  const [form, setForm] = useState({ mail: '', pass: '', apellido1: '', apellido2: '', rut: '' });
  const [mostrarPass, setMostrarPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  const set = k => e => setForm({ ...form, [k]: e.target.value });
  const esRegistro = tipo === 'REGISTRO';

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
    if (!form.apellido1.trim()) { setError('Ingresa tu primer apellido.'); return; }
    if (!validarRut(form.rut)) { setError('El RUT ingresado no es válido.'); return; }

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
      <div className="cb-modal-card" onClick={e => e.stopPropagation()}>
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
          <div className="cb-modal-campo">
            <label>Correo electrónico</label>
            <input type="email" value={form.mail} onChange={set('mail')} placeholder="tu@correo.cl" autoFocus />
          </div>

          <div className="cb-modal-campo">
            <label>Contraseña</label>
            <div className="cb-modal-pass-wrap">
              <input
                type={mostrarPass ? 'text' : 'password'}
                value={form.pass}
                onChange={set('pass')}
                placeholder={esRegistro ? 'Mínimo 8 caracteres' : 'Tu contraseña'}
              />
              <button type="button" className="cb-modal-pass-toggle" onClick={() => setMostrarPass(p => !p)}>
                {mostrarPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {esRegistro && (
            <>
              <div className="cb-modal-fila-2">
                <div className="cb-modal-campo">
                  <label>Primer apellido</label>
                  <input value={form.apellido1} onChange={set('apellido1')} placeholder="González" />
                </div>
                <div className="cb-modal-campo">
                  <label>Segundo apellido</label>
                  <input value={form.apellido2} onChange={set('apellido2')} placeholder="Muñoz" />
                </div>
              </div>
              <div className="cb-modal-campo">
                <label>RUT</label>
                <input
                  value={form.rut}
                  onChange={e => setForm({ ...form, rut: formatearRut(e.target.value) })}
                  placeholder="12.345.678-9"
                />
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
