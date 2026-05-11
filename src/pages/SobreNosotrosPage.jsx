import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EQUIPO = [
  {
    nombre: 'Dr. Alejandro Vega Soto',
    cargo: 'Director Médico',
    especialidad: 'Cardiología',
    descripcion: 'Más de 20 años de experiencia en cardiología intervencionista. Formado en la Universidad de Chile y con especialización en el Hospital Clínico de Barcelona.',
    iniciales: 'AV',
    color: '#2563EB',
  },
  {
    nombre: 'Dra. Camila Rojas Fuentes',
    cargo: 'Jefa de Medicina General',
    especialidad: 'Medicina General',
    descripcion: 'Especialista en atención primaria y medicina familiar. Comprometida con la salud preventiva y el bienestar integral de los pacientes.',
    iniciales: 'CR',
    color: '#0D9488',
  },
  {
    nombre: 'Dr. Patricio Morales Ibáñez',
    cargo: 'Jefe de Neurología',
    especialidad: 'Neurología',
    descripcion: 'Neurólogo con más de 15 años de trayectoria. Experto en enfermedades cerebrovasculares y trastornos del movimiento.',
    iniciales: 'PM',
    color: '#7C3AED',
  },
  {
    nombre: 'Dra. Valentina Castro Ríos',
    cargo: 'Traumatóloga',
    especialidad: 'Traumatología',
    descripcion: 'Especialista en cirugía ortopédica y traumatología deportiva. Ha atendido a deportistas de alto rendimiento y equipos profesionales.',
    iniciales: 'VC',
    color: '#F59E0B',
  },
  {
    nombre: 'Dr. Rodrigo Núñez Lagos',
    cargo: 'Dermatólogo',
    especialidad: 'Dermatología',
    descripcion: 'Dermatólogo clínico y estético con amplia experiencia en diagnóstico de lesiones cutáneas y tratamientos avanzados.',
    iniciales: 'RN',
    color: '#EF4444',
  },
  {
    nombre: 'Dra. Sofía Herrera Pinto',
    cargo: 'Oftalmóloga',
    especialidad: 'Oftalmología',
    descripcion: 'Especialista en cirugía refractiva y enfermedades de la retina. Más de 10 años dedicados a preservar y restaurar la visión de sus pacientes.',
    iniciales: 'SH',
    color: '#10B981',
  },
];

const HORARIOS = [
  { dia: 'Lunes a Viernes', horario: '08:00 — 20:00' },
  { dia: 'Sábados', horario: '09:00 — 14:00' },
  { dia: 'Domingos y Festivos', horario: 'Urgencias 24/7' },
];

const VALORES = [
  { icon: '❤️', titulo: 'Compromiso', desc: 'Nos comprometemos con el bienestar de cada paciente, tratando cada caso con dedicación y profesionalismo.' },
  { icon: '🔬', titulo: 'Excelencia', desc: 'Contamos con tecnología de última generación y profesionales altamente calificados para brindarte la mejor atención.' },
  { icon: '🤝', titulo: 'Cercanía', desc: 'Creemos en una medicina humana. Escuchamos a cada paciente y los acompañamos en todo su proceso de salud.' },
  { icon: '🔒', titulo: 'Confidencialidad', desc: 'Tu información médica es estrictamente privada. Garantizamos la protección total de tus datos.' },
];

export default function SobreNosotrosPage() {
  const { usuario } = useAuth();
  const [tabEquipo, setTabEquipo] = useState(0);

  return (
    <div style={{ background: 'var(--color-background-primary)' }}>

      {/* ── HERO ── */}
      <div style={{
        background: 'linear-gradient(135deg, #020617 0%, #1e3a8a 60%, #0f766e 100%)',
        padding: '5rem 2rem', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:-100, right:-100, width:350, height:350, borderRadius:'50%', background:'rgba(255,255,255,0.03)' }}/>
        <div style={{ position:'absolute', bottom:-80, left:-80, width:250, height:250, borderRadius:'50%', background:'rgba(94,234,212,0.05)' }}/>

        <img src="/logo.png" alt="RedNorte" style={{ height: 72, marginBottom: 20, filter: 'drop-shadow(0 4px 20px rgba(94,234,212,0.3))' }} />
        <h1 style={{ fontSize: 42, fontWeight: 900, marginBottom: 12 }}>
          Sobre <span style={{ color: '#5eead4' }}>RedNorte</span>
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)', maxWidth: 600, margin: '0 auto', lineHeight: 1.8 }}>
          Somos una clínica digital comprometida con hacer la salud accesible, eficiente y humana para todos los chilenos.
        </p>
      </div>

      {/* ── MISIÓN Y VISIÓN ── */}
      <div style={{ padding: '5rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 48 }}>
          <div style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', borderRadius: 20, padding: '2.5rem', border: '1px solid #BFDBFE' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🎯</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e3a8a', marginBottom: 12 }}>Nuestra Misión</h2>
            <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8 }}>
              Brindar atención médica de calidad a través de una plataforma digital innovadora, eliminando las barreras de acceso a la salud y poniendo al paciente en el centro de cada decisión. Trabajamos para que obtener una consulta médica sea tan simple como enviar un mensaje.
            </p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', borderRadius: 20, padding: '2.5rem', border: '1px solid #BBF7D0' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🌟</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#065F46', marginBottom: 12 }}>Nuestra Visión</h2>
            <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8 }}>
              Convertirnos en la clínica digital de referencia en Chile, reconocida por la excelencia de nuestros profesionales, la innovación de nuestra plataforma y el impacto positivo que generamos en la salud de miles de familias a lo largo del país.
            </p>
          </div>
        </div>

        {/* Números */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 64 }}>
          {[
            { num: '+500', label: 'Pacientes atendidos', icon: '👥' },
            { num: '6', label: 'Especialidades médicas', icon: '🏥' },
            { num: '+15', label: 'Años de experiencia', icon: '📅' },
            { num: '98%', label: 'Satisfacción', icon: '⭐' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--color-background-secondary)', borderRadius: 16, padding: '1.5rem', textAlign: 'center', border: '0.5px solid var(--color-border-tertiary)' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#2563EB', marginBottom: 4 }}>{s.num}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Valores */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span style={{ background: 'var(--color-background-secondary)', color: '#2563EB', borderRadius: 20, padding: '4px 16px', fontSize: 12, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Nuestros valores</span>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 14, color: 'var(--color-text-primary)' }}>Lo que nos define</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 64 }}>
          {VALORES.map(v => (
            <div key={v.titulo} style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 14, padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{v.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--color-text-primary)' }}>{v.titulo}</h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── EQUIPO MÉDICO ── */}
      <div style={{ background: 'var(--color-background-secondary)', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ background: 'var(--color-background-primary)', color: '#2563EB', borderRadius: 20, padding: '4px 16px', fontSize: 12, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Profesionales</span>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 14, marginBottom: 8, color: 'var(--color-text-primary)' }}>Nuestro equipo médico</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 15 }}>Especialistas comprometidos con tu salud y bienestar</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {EQUIPO.map((m, i) => (
              <div key={m.nombre} style={{
                background: 'var(--color-background-primary)', borderRadius: 16, padding: '1.75rem',
                border: '0.5px solid var(--color-border-tertiary)', transition: 'all 0.25s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(135deg, ${m.color}, ${m.color}99)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 800, fontSize: 18,
                  }}>{m.iniciales}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)', marginBottom: 2 }}>{m.nombre}</div>
                    <div style={{ fontSize: 12, color: m.color, fontWeight: 600 }}>{m.especialidad}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{m.cargo}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{m.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HORARIOS Y UBICACIÓN ── */}
      <div style={{ padding: '5rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

          {/* Horarios */}
          <div>
            <span style={{ background: 'var(--color-background-secondary)', color: '#2563EB', borderRadius: 20, padding: '4px 16px', fontSize: 12, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Atención</span>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginTop: 14, marginBottom: 20, color: 'var(--color-text-primary)' }}>Horarios de atención</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              {HORARIOS.map(h => (
                <div key={h.dia} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-background-secondary)', borderRadius: 12, padding: '16px 20px', border: '0.5px solid var(--color-border-tertiary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>🕐</span>
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>{h.dia}</span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#2563EB', background: '#EFF6FF', padding: '4px 12px', borderRadius: 20 }}>{h.horario}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', borderRadius: 14, padding: '1.5rem', border: '1px solid #BFDBFE' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1e3a8a', marginBottom: 8 }}>🚨 Urgencias 24 horas</div>
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, marginBottom: 10 }}>
                Contamos con servicio de urgencias disponible las 24 horas del día, los 7 días de la semana, incluidos festivos.
              </p>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a8a' }}>📞 600 RED NORTE (600 733 6673)</div>
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <span style={{ background: 'var(--color-background-secondary)', color: '#0D9488', borderRadius: 20, padding: '4px 16px', fontSize: 12, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Dónde estamos</span>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginTop: 14, marginBottom: 20, color: 'var(--color-text-primary)' }}>Nuestra ubicación</h2>

            {/* Mapa simulado */}
            <div style={{ background: 'linear-gradient(135deg,#F1F5F9,#E2E8F0)', borderRadius: 14, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, border: '0.5px solid var(--color-border-tertiary)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position:'absolute', inset:0, background: 'repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(0,0,0,0.04) 40px,rgba(0,0,0,0.04) 41px), repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(0,0,0,0.04) 40px,rgba(0,0,0,0.04) 41px)' }}/>
              <div style={{ textAlign:'center', position:'relative', zIndex:1 }}>
                <div style={{ fontSize:48, marginBottom:8 }}>📍</div>
                <div style={{ fontWeight:700, color:'#1e3a8a', fontSize:14 }}>RedNorte Clínica Digital</div>
                <div style={{ fontSize:12, color:'#6B7280', marginTop:4 }}>Av. Providencia 1234, Santiago</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '📍', label: 'Dirección', valor: 'Av. Providencia 1234, Providencia, Santiago' },
                { icon: '🚇', label: 'Metro', valor: 'Pedro de Valdivia (Línea 1)' },
                { icon: '🚌', label: 'Buses', valor: 'Líneas 210, 505, C02' },
                { icon: '🚗', label: 'Estacionamiento', valor: 'Disponible en el edificio' },
              ].map(u => (
                <div key={u.label} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px', background: 'var(--color-background-secondary)', borderRadius: 10, border: '0.5px solid var(--color-border-tertiary)' }}>
                  <span style={{ fontSize: 20 }}>{u.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 1 }}>{u.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{u.valor}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      {!usuario && (
        <div style={{ padding: '0 2rem 5rem' }}>
          <div style={{ background: 'linear-gradient(135deg,#020617,#1e3a8a,#0f766e)', borderRadius: 24, padding: '3.5rem 2rem', textAlign: 'center', color: 'white', maxWidth: 700, margin: '0 auto' }}>
            <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>¿Necesitas atención médica?</h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 28, fontSize: 15, lineHeight: 1.7 }}>
              Regístrate gratis y agenda tu consulta hoy mismo. Nuestros especialistas están listos para atenderte.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/registro" style={{ background: 'white', color: '#1e3a8a', padding: '12px 32px', borderRadius: 30, fontWeight: 800, fontSize: 15, textDecoration: 'none' }}>Crear cuenta gratis</Link>
              <Link to="/login" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', padding: '12px 32px', borderRadius: 30, fontWeight: 600, fontSize: 15, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)' }}>Iniciar sesión</Link>
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
