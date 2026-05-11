import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ESPECIALIDADES = [
  { icon: '🫀', nombre: 'Cardiología', desc: 'Corazón y sistema circulatorio' },
  { icon: '🧠', nombre: 'Neurología', desc: 'Sistema nervioso' },
  { icon: '🦴', nombre: 'Traumatología', desc: 'Huesos y articulaciones' },
  { icon: '👁️', nombre: 'Oftalmología', desc: 'Salud visual' },
  { icon: '🫁', nombre: 'Neumología', desc: 'Sistema respiratorio' },
  { icon: '🩺', nombre: 'Medicina General', desc: 'Atención primaria' },
  { icon: '🦷', nombre: 'Odontología', desc: 'Salud dental' },
  { icon: '🧬', nombre: 'Dermatología', desc: 'Piel y tejidos' },
];

const PASOS = [
  { num: '01', titulo: 'Crea tu cuenta', desc: 'Regístrate gratis en minutos con tu correo electrónico.' },
  { num: '02', titulo: 'Completa tu ficha', desc: 'Agrega tus datos médicos para una atención más personalizada.' },
  { num: '03', titulo: 'Solicita una consulta', desc: 'Elige la especialidad y describe tus síntomas.' },
  { num: '04', titulo: 'Recibe tu cita', desc: 'El sistema te asigna automáticamente y te notifica.' },
];

const STATS = [
  { num: '4', label: 'Especialidades activas', icon: '🏥' },
  { num: '24/7', label: 'Disponibilidad', icon: '⏰' },
  { num: '100%', label: 'Digital y gratuito', icon: '💻' },
  { num: '<5min', label: 'Para agendar', icon: '⚡' },
];

function CountUp({ target, suffix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (isNaN(target)) return;
    let start = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(start);
    }, 40);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{isNaN(target) ? target : val}{suffix}</span>;
}

export default function HomePage() {
  const { usuario } = useAuth();

  return (
    <div style={{ background: 'var(--color-background-primary)' }}>

      {/* ── HERO ── */}
      <div style={{
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 40%, #1e3a8a 75%, #0f766e 100%)',
        minHeight: '88vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '4rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decoración */}
        <div style={{ position:'absolute', top:-120, right:-120, width:400, height:400, borderRadius:'50%', background:'rgba(94,234,212,0.06)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-80, left:-80, width:280, height:280, borderRadius:'50%', background:'rgba(37,99,235,0.08)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:'30%', left:'5%', width:2, height:120, background:'linear-gradient(to bottom, transparent, rgba(94,234,212,0.4), transparent)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:'20%', right:'8%', width:2, height:80, background:'linear-gradient(to bottom, transparent, rgba(37,99,235,0.4), transparent)', pointerEvents:'none' }}/>

        {/* Logo */}
        <img src="/logo.png" alt="RedNorte" style={{ height: 110, width: 'auto', marginBottom: 24, filter: 'drop-shadow(0 8px 32px rgba(94,234,212,0.3))' }} />

        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(94,234,212,0.1)', border:'1px solid rgba(94,234,212,0.3)', borderRadius:20, padding:'4px 16px', marginBottom:20 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:'#5eead4', display:'inline-block', animation:'pulse 2s infinite' }}></span>
          <span style={{ color:'#5eead4', fontSize:12, fontWeight:600, letterSpacing:'1px' }}>SISTEMA OPERATIVO</span>
        </div>

        <h1 style={{ fontSize: 'clamp(36px, 6vw, 62px)', fontWeight: 900, color: 'white', marginBottom: 16, lineHeight: 1.05, letterSpacing: '-1px' }}>
          Tu salud,<br />
          <span style={{ background: 'linear-gradient(90deg, #5eead4, #2563EB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            nuestra prioridad
          </span>
        </h1>

        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.8 }}>
          RedNorte es una clínica digital que conecta pacientes con especialistas médicos de forma rápida, ordenada y completamente gratuita.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
          {usuario ? (
            <Link to="/mis-consultas" style={{
              background: 'linear-gradient(135deg, #2563EB, #0D9488)', color: 'white',
              padding: '14px 36px', borderRadius: 30, fontWeight: 700, fontSize: 16,
              textDecoration: 'none', boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
            }}>Ver mis consultas →</Link>
          ) : (
            <>
              <Link to="/registro" style={{
                background: 'linear-gradient(135deg, #2563EB, #0D9488)', color: 'white',
                padding: '14px 36px', borderRadius: 30, fontWeight: 700, fontSize: 16,
                textDecoration: 'none', boxShadow: '0 8px 24px rgba(37,99,235,0.35)',
              }}>Comenzar ahora →</Link>
              <Link to="/login" style={{
                background: 'rgba(255,255,255,0.08)', color: 'white',
                padding: '14px 36px', borderRadius: 30, fontWeight: 600, fontSize: 16,
                textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)',
              }}>Iniciar sesión</Link>
            </>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, maxWidth: 700, width: '100%' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '20px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#5eead4', marginBottom: 4 }}>{s.num}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ESPECIALIDADES ── */}
      <div style={{ padding: '5rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ background: 'var(--color-background-secondary)', color: 'var(--primary)', borderRadius: 20, padding: '4px 16px', fontSize: 12, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Nuestras especialidades</span>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginTop: 16, marginBottom: 8, color: 'var(--color-text-primary)' }}>Atención médica especializada</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, maxWidth: 500, margin: '0 auto' }}>Contamos con especialistas en múltiples áreas para brindarte la mejor atención.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {ESPECIALIDADES.map(e => (
            <div key={e.nombre} style={{
              background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 14, padding: '1.5rem', textAlign: 'center', cursor: 'default',
              transition: 'all 0.25s',
            }}
              onMouseEnter={el => { el.currentTarget.style.transform='translateY(-4px)'; el.currentTarget.style.boxShadow='0 12px 32px rgba(37,99,235,0.12)'; el.currentTarget.style.borderColor='#2563EB'; }}
              onMouseLeave={el => { el.currentTarget.style.transform='translateY(0)'; el.currentTarget.style.boxShadow='none'; el.currentTarget.style.borderColor='var(--color-border-tertiary)'; }}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>{e.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)', marginBottom: 4 }}>{e.nombre}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{e.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CÓMO FUNCIONA ── */}
      <div style={{ background: 'var(--color-background-secondary)', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ background: 'var(--color-background-primary)', color: 'var(--primary)', borderRadius: 20, padding: '4px 16px', fontSize: 12, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Proceso simple</span>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginTop: 16, marginBottom: 8, color: 'var(--color-text-primary)' }}>¿Cómo funciona?</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 15 }}>En 4 pasos simples puedes tener tu consulta médica agendada.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, position: 'relative' }}>
            {/* Línea conectora */}
            <div style={{ position:'absolute', top:28, left:'12%', right:'12%', height:2, background:'linear-gradient(90deg,#2563EB,#0D9488)', opacity:0.3, zIndex:0 }}/>
            {PASOS.map((paso, i) => (
              <div key={paso.num} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
                  background: `linear-gradient(135deg, #2563EB, #0D9488)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 800, fontSize: 18,
                  boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
                }}>{paso.num}</div>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: 'var(--color-text-primary)' }}>{paso.titulo}</h3>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{paso.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BENEFICIOS ── */}
      <div style={{ padding: '5rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <span style={{ background: 'var(--color-background-secondary)', color: 'var(--primary)', borderRadius: 20, padding: '4px 16px', fontSize: 12, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Por qué elegirnos</span>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginTop: 16, marginBottom: 16, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
              Una clínica diseñada para ti
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, lineHeight: 1.8, marginBottom: 28 }}>
              RedNorte nace para eliminar las barreras de acceso a la salud. Sin filas, sin esperas innecesarias, sin papeles.
            </p>
            {[
              ['✅', 'Sin costo para pacientes', 'Acceso completamente gratuito a todos los servicios.'],
              ['🔒', 'Datos protegidos', 'Tu información médica es privada y solo la ve personal autorizado.'],
              ['⚡', 'Respuesta rápida', 'Confirmación de tu cita en minutos, no días.'],
              ['🔄', 'Reasignación automática', 'Si hay una cancelación, el sistema te reagenda automáticamente.'],
            ].map(([icon, titulo, desc]) => (
              <div key={titulo} style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)', marginBottom: 2 }}>{titulo}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { icon: '🩺', titulo: 'Ficha médica digital', desc: 'Tu historial siempre disponible para el médico.', color: '#EFF6FF' },
              { icon: '📱', titulo: 'Acceso móvil', desc: 'Desde cualquier dispositivo, en cualquier lugar.', color: '#F0FDF4' },
              { icon: '👨‍⚕️', titulo: 'Especialistas reales', desc: 'Médicos certificados en cada especialidad.', color: '#FEF3C7' },
              { icon: '📊', titulo: 'Seguimiento total', desc: 'Sigue el estado de tu consulta en tiempo real.', color: '#FDF4FF' },
            ].map(b => (
              <div key={b.titulo} style={{
                background: b.color, borderRadius: 14, padding: '1.5rem',
                border: '0.5px solid rgba(0,0,0,0.06)',
              }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{b.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 4 }}>{b.titulo}</div>
                <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA FINAL ── */}
      {!usuario && (
        <div style={{ padding: '0 2rem 5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #020617, #1e3a8a, #0f766e)',
            borderRadius: 24, padding: '4rem 2rem', textAlign: 'center', color: 'white',
            maxWidth: 800, margin: '0 auto', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position:'absolute', top:-60, right:-60, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }}/>
            <img src="/logo.png" alt="RedNorte" style={{ height: 70, marginBottom: 20, filter:'drop-shadow(0 4px 16px rgba(94,234,212,0.3))' }}/>
            <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
              ¿Listo para cuidar tu salud?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 32, fontSize: 16, maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.7 }}>
              Únete a RedNorte hoy. Crea tu cuenta gratis y accede a atención médica especializada desde donde estés.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/registro" style={{
                background: 'white', color: '#1e3a8a', padding: '14px 36px',
                borderRadius: 30, fontWeight: 800, fontSize: 15, textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}>Crear cuenta gratis</Link>
              <Link to="/login" style={{
                background: 'rgba(255,255,255,0.12)', color: 'white', padding: '14px 36px',
                borderRadius: 30, fontWeight: 600, fontSize: 15, textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.25)',
              }}>Ya tengo cuenta</Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: '0.5px solid var(--color-border-tertiary)', padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13 }}>
        © 2026 RedNorte — Clínica Digital · Todos los derechos reservados
      </div>
    </div>
  );
}
