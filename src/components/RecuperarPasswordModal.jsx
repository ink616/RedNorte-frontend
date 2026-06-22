import React, { useState } from 'react';
import { solicitarCodigoRecuperacion, validarCodigoRecuperacion, cambiarPasswordConCodigo } from '../service/api';

function fortaleza(pass) {
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  return score;
}

/**
 * Flujo de "olvidé mi contraseña" en 3 sub-pantallas, dentro del mismo
 * contenedor visual (.cb-modal-card) que usa ChatbotAccionModal, para
 * que se sienta como una sola experiencia continua:
 *
 *   1) Pide el correo -> dispara el codigo de 6 digitos por mail real.
 *   2) Pide el codigo -> lo valida contra el backend antes de avanzar.
 *   3) Pide la nueva contraseña (con la misma fortaleza animada que el
 *      resto del sistema) -> la cambia usando el codigo ya validado.
 *
 * El codigo se revalida tambien en el paso 3 (no solo en el 2): es
 * defensa en profundidad del lado del backend, asi que aqui no se
 * "confia" en que ya fue validado antes, simplemente se reenvia.
 */
export default function RecuperarPasswordModal({ onCerrar, onExito }) {
  const [paso, setPaso] = useState(1); // 1: mail, 2: codigo, 3: nueva password
  const [mail, setMail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaPass, setNuevaPass] = useState('');
  const [confirmarPass, setConfirmarPass] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  const fuerza = fortaleza(nuevaPass);
  const fuerzaLabel = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'][fuerza];
  const fuerzaColor = ['', 'var(--danger)', 'var(--warning)', '#3B82F6', 'var(--success)'][fuerza];

  const handleSolicitar = async (e) => {
    e.preventDefault();
    if (!mail || !mail.includes('@')) { setError('Ingresa un correo válido.'); return; }
    setLoading(true); setError('');
    try {
      await solicitarCodigoRecuperacion(mail);
      setPaso(2);
    } catch {
      // Por diseño del backend, este endpoint casi nunca falla con un
      // error real (siempre responde 200 aunque el mail no exista, por
      // seguridad). Si de verdad falla, es un problema de red/backend.
      setError('No se pudo procesar la solicitud. Intenta de nuevo en un momento.');
    } finally {
      setLoading(false);
    }
  };

  const handleValidarCodigo = async (e) => {
    e.preventDefault();
    if (codigo.length !== 6) { setError('El código debe tener 6 dígitos.'); return; }
    setLoading(true); setError('');
    try {
      await validarCodigoRecuperacion(mail, codigo);
      setPaso(3);
    } catch {
      setError('El código ingresado no es válido o ya expiró. Solicita uno nuevo si es necesario.');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    if (nuevaPass.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (fuerza < 2) { setError('La contraseña es demasiado débil. Agrega números o mayúsculas.'); return; }
    if (nuevaPass !== confirmarPass) { setError('Las contraseñas no coinciden.'); return; }
    setLoading(true); setError('');
    try {
      await cambiarPasswordConCodigo(mail, codigo, nuevaPass);
      setExito(true);
      setTimeout(() => onExito({ tipo: 'RECUPERAR' }), 1600);
    } catch {
      setError('El código ya expiró. Vuelve a solicitar uno nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async () => {
    setLoading(true); setError('');
    try {
      await solicitarCodigoRecuperacion(mail);
      setError('');
    } catch {
      setError('No se pudo reenviar el código. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (exito) {
    return (
      <div className="cb-modal-overlay" onClick={onCerrar}>
        <div className="cb-modal-card cb-modal-exito" onClick={e => e.stopPropagation()}>
          <div className="cb-modal-exito-icono">🔐</div>
          <div className="cb-modal-exito-titulo">¡Contraseña actualizada!</div>
          <div className="cb-modal-exito-texto">Ya puedes iniciar sesión con tu nueva contraseña.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="cb-modal-overlay" onClick={onCerrar}>
      <div className="cb-modal-card" onClick={e => e.stopPropagation()}>
        <button className="cb-modal-cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>

        <div className="cb-modal-avatar">
          <img src="/img/saludbot/empatico.png" alt="SaludBot" />
        </div>
        <h3 className="cb-modal-titulo">Recuperar contraseña</h3>
        <p className="cb-modal-subtitulo">
          {paso === 1 && 'Ingresa tu correo y te enviaremos un código de verificación.'}
          {paso === 2 && <>Revisa tu correo <strong>{mail}</strong> e ingresa el código de 6 dígitos.</>}
          {paso === 3 && 'Crea tu nueva contraseña.'}
        </p>

        {error && <div className="cb-modal-error">⚠️ {error}</div>}

        {paso === 1 && (
          <form onSubmit={handleSolicitar} className="cb-modal-form">
            <div className="rg-campo">
              <label className="rg-campo-label">Correo electrónico</label>
              <input
                className="rg-input" type="email" value={mail}
                onChange={e => setMail(e.target.value)} placeholder="tu@correo.cl" autoFocus
              />
            </div>
            <button type="submit" className="cb-modal-submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar código →'}
            </button>
          </form>
        )}

        {paso === 2 && (
          <form onSubmit={handleValidarCodigo} className="cb-modal-form">
            <div className="rg-campo">
              <label className="rg-campo-label">Código de verificación</label>
              <input
                className="rg-input" value={codigo} maxLength={6} autoFocus
                onChange={e => setCodigo(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000000"
                style={{ textAlign: 'center', fontSize: '22px', letterSpacing: '6px', fontWeight: 800 }}
              />
            </div>
            <button type="submit" className="cb-modal-submit" disabled={loading}>
              {loading ? 'Validando...' : 'Verificar código →'}
            </button>
            <button type="button" onClick={handleReenviar} disabled={loading}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '13px', cursor: 'pointer', fontWeight: 700 }}>
              ¿No llegó? Reenviar código
            </button>
          </form>
        )}

        {paso === 3 && (
          <form onSubmit={handleCambiarPassword} className="cb-modal-form">
            <div className="rg-campo">
              <label className="rg-campo-label">Nueva contraseña</label>
              <div className="rg-input-wrap">
                <input
                  className="rg-input rg-input--pass" type={mostrarPass ? 'text' : 'password'}
                  value={nuevaPass} onChange={e => setNuevaPass(e.target.value)}
                  placeholder="Mínimo 8 caracteres" autoFocus
                />
                <button type="button" className="rg-pass-toggle" onClick={() => setMostrarPass(p => !p)}>
                  {mostrarPass ? '🙈' : '👁️'}
                </button>
              </div>
              {nuevaPass && (
                <div className="rg-fortaleza">
                  <div className="rg-fortaleza-bar">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`rg-fortaleza-seg ${i <= fuerza ? 'activo' : ''}`}
                        style={{ background: i <= fuerza ? fuerzaColor : undefined }} />
                    ))}
                  </div>
                  <div className="rg-fortaleza-label" style={{ color: fuerzaColor }}>Contraseña {fuerzaLabel}</div>
                </div>
              )}
            </div>
            <div className="rg-campo">
              <label className="rg-campo-label">Confirmar contraseña</label>
              <input
                className="rg-input rg-input--pass" type={mostrarPass ? 'text' : 'password'}
                value={confirmarPass} onChange={e => setConfirmarPass(e.target.value)}
                placeholder="Repite tu nueva contraseña"
              />
              {confirmarPass && confirmarPass !== nuevaPass && (
                <div className="rg-hint rg-hint--error">✕ Las contraseñas no coinciden</div>
              )}
              {confirmarPass && confirmarPass === nuevaPass && (
                <div className="rg-hint rg-hint--ok">✓ Las contraseñas coinciden</div>
              )}
            </div>
            <button type="submit" className="cb-modal-submit" disabled={loading}>
              {loading ? 'Guardando...' : '🔐 Cambiar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
