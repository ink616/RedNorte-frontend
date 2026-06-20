import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── Datos ──────────────────────────────────────────────────── */
const COBERTURA = [
  { nombre: 'Arica',       activo: false },
  { nombre: 'Iquique',     activo: false },
  { nombre: 'Antofagasta', activo: true  },
  { nombre: 'Copiapó',     activo: false },
  { nombre: 'La Serena',   activo: false },
];

const HERO_STATS = [
  { icon: '🏥', num: 6,    suffix: '',    label: 'Especialidades activas' },
  { icon: '⏰', num: 24,   suffix: '/7',  label: 'Disponibilidad' },
  { icon: '💻', num: 100,  suffix: '%',   label: 'Digital y gratuito' },
  { icon: '⚡', num: 5,    suffix: 'min', label: 'Tiempo prom. de agenda', prefix: '<' },
];

const BIG_STATS = [
  { num: 500,  suffix: '+',  label: 'Pacientes atendidos', icon: '👥', color: 'var(--primary)' },
  { num: 6,    suffix: '',   label: 'Especialidades médicas', icon: '🩺', color: 'var(--teal)' },
  { num: 15,   suffix: '+',  label: 'Años de experiencia combinada', icon: '📅', color: 'var(--purple)' },
  { num: 98,   suffix: '%',  label: 'Satisfacción de pacientes', icon: '⭐', color: 'var(--warning-dark)' },
];

const VALORES = [
  { icon: '❤️', titulo: 'Compromiso', desc: 'Cada caso se trata con dedicación real, no como un número en una lista.', bg: 'var(--danger-light)' },
  { icon: '🔬', titulo: 'Excelencia', desc: 'Tecnología actualizada y profesionales certificados en cada especialidad.', bg: 'var(--primary-light)' },
  { icon: '🤝', titulo: 'Cercanía', desc: 'Escuchamos antes de derivar. La distancia no debería ser una barrera.', bg: 'var(--teal-light)' },
  { icon: '🔒', titulo: 'Confidencialidad', desc: 'Tu ficha médica es privada por diseño, solo personal autorizado accede.', bg: 'var(--purple-light)' },
];

const EQUIPO = [
  { nombre: 'Dr. Alejandro Vega Soto', cargo: 'Director Médico', especialidad: 'Cardiología', iniciales: 'AV', color: '#2563EB', desc: 'Más de 20 años en cardiología intervencionista, formado en la U. de Chile.' },
  { nombre: 'Dra. Camila Rojas Fuentes', cargo: 'Jefa de Medicina General', especialidad: 'Medicina General', iniciales: 'CR', color: '#0D9488', desc: 'Especialista en atención primaria y salud preventiva familiar.' },
  { nombre: 'Dr. Patricio Morales Ibáñez', cargo: 'Jefe de Neurología', especialidad: 'Neurología', iniciales: 'PM', color: '#7C3AED', desc: 'Experto en enfermedades cerebrovasculares y trastornos del movimiento.' },
  { nombre: 'Dra. Valentina Castro Ríos', cargo: 'Traumatóloga', especialidad: 'Traumatología', iniciales: 'VC', color: '#F59E0B', desc: 'Cirugía ortopédica y traumatología deportiva de alto rendimiento.' },
  { nombre: 'Dr. Rodrigo Núñez Lagos', cargo: 'Dermatólogo', especialidad: 'Dermatología', iniciales: 'RN', color: '#EF4444', desc: 'Dermatología clínica y estética, diagnóstico avanzado de lesiones.' },
  { nombre: 'Dra. Sofía Herrera Pinto', cargo: 'Oftalmóloga', especialidad: 'Oftalmología', iniciales: 'SH', color: '#10B981', desc: 'Cirugía refractiva y enfermedades de la retina, más de 10 años de práctica.' },
];

const HITOS = [
  { año: '2021', icon: '💡', titulo: 'Nace la idea', desc: 'Identificamos que pacientes del norte viajaban horas solo para una hora de especialista.' },
  { año: '2022', icon: '🚀', titulo: 'Primer lanzamiento', desc: 'RedNorte conecta sus primeras consultas digitales en Antofagasta.' },
  { año: '2024', icon: '📈', titulo: 'Expansión regional', desc: 'Cobertura activa de Arica a La Serena, con seis especialidades médicas.' },
  { año: '2026', icon: '🔄', titulo: 'Reasignación automática', desc: 'El sistema reagenda solo cuando hay cancelaciones, sin intervención manual.' },
];

const HORARIOS = [
  { icon: '📅', dia: 'Lunes a viernes', valor: '08:00 — 18:00' },
  { icon: '📅', dia: 'Sábados', valor: '09:00 — 14:00' },
  { icon: '🚨', dia: 'Domingos y festivos', valor: 'Urgencias 24/7' },
];

/* ── Hooks de utilidad ──────────────────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('is-visible'); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, as = 'div', className = '', style }) {
  const ref = useReveal();
  const Comp = as;
  return <Comp ref={ref} className={`nx-reveal ${className}`} style={style}>{children}</Comp>;
}

function useCountUp(target, active, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    let frame;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) frame = requestAnimationFrame(step);
      else setVal(target);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);
  return val;
}

function CountStat({ target, prefix = '', suffix = '', className }) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); obs.disconnect(); } },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const val = useCountUp(target, active);
  return <div ref={ref} className={className}>{prefix}{val}{suffix}</div>;
}

export default function SobreNosotrosPage() {
  const { usuario } = useAuth();

  return (
    <div className="nx">

      {/* ════════ HERO ════════ */}
      <section className="nx-hero">
        <div className="nx-hero-blob-1 nx-float" />
        <div className="nx-hero-blob-2 nx-float" style={{ animationDelay: '1.5s' }} />
        <div className="nx-hero-blob-3 nx-float" style={{ animationDelay: '0.7s' }} />

        <div className="nx-hero-badge">
          <span className="nx-hero-badge-dot nx-pulse-dot" />
          <span className="nx-hero-badge-text">CLÍNICA DIGITAL · NORTE DE CHILE</span>
        </div>

        <h1 className="nx-hero-titulo">
          Acortamos distancia<br /><span>entre tú y tu médico</span>
        </h1>
        <p className="nx-hero-lead">
          RedNorte nace para eliminar las barreras geográficas de acceso a la salud,
          conectando pacientes de Arica a La Serena con especialistas reales, sin
          traslados ni esperas innecesarias.
        </p>

        {/* Mapa de cobertura */}
        <div className="nx-cobertura-row">
          {COBERTURA.map((c, i) => (
            <React.Fragment key={c.nombre}>
              <div className="nx-cobertura-punto">
                <span className={`nx-cobertura-nombre ${c.activo ? 'activo' : ''}`}>{c.nombre}</span>
                <span className={`nx-cobertura-dot ${c.activo ? 'activo nx-pulse-dot' : ''}`} />
              </div>
              {i < COBERTURA.length - 1 && <div className="nx-cobertura-linea" />}
            </React.Fragment>
          ))}
        </div>

        <div className="nx-hero-stats">
          {HERO_STATS.map(s => (
            <div key={s.label} className="nx-hero-stat">
              <div className="nx-hero-stat-icon">{s.icon}</div>
              <CountStat target={s.num} prefix={s.prefix} suffix={s.suffix} className="nx-hero-stat-num" />
              <div className="nx-hero-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ MISIÓN Y VISIÓN ════════ */}
      <Reveal as="section" className="nx-section">
        <div className="nx-head">
          <span className="nx-pill">Por qué existimos</span>
          <h2 className="nx-h2">Una plataforma, no una sala de espera</h2>
          <p className="nx-sub">Dos preguntas que respondemos con producto, no con frases de pared.</p>
        </div>
        <div className="nx-mv-grid">
          <div className="nx-mv-card nx-mv-card--azul">
            <div className="nx-mv-icon-wrap">🎯</div>
            <div className="nx-mv-titulo">Nuestra misión</div>
            <p className="nx-mv-texto">
              Brindar atención médica de calidad a través de una plataforma digital
              que elimina las barreras de acceso a la salud, poniendo al paciente en
              el centro de cada decisión clínica.
            </p>
          </div>
          <div className="nx-mv-card nx-mv-card--teal">
            <div className="nx-mv-icon-wrap">🌟</div>
            <div className="nx-mv-titulo">Nuestra visión</div>
            <p className="nx-mv-texto">
              Ser la red de salud digital de referencia en el norte de Chile,
              reduciendo los tiempos de espera y el costo de acceder a un especialista.
            </p>
          </div>
        </div>
      </Reveal>

      {/* ════════ STATS GRANDES ════════ */}
      <Reveal as="section" className="nx-section--soft">
        <div className="nx-inner">
          <div className="nx-head">
            <span className="nx-pill">En números</span>
            <h2 className="nx-h2">El impacto hasta hoy</h2>
            <p className="nx-sub">Resultados acumulados desde nuestro primer lanzamiento.</p>
          </div>
          <div className="nx-bigstats">
            {BIG_STATS.map(s => (
              <div key={s.label} className="nx-bigstat" style={{ '--accent-color': s.color }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                <CountStat target={s.num} suffix={s.suffix} className="nx-bigstat-num" />
                <div className="nx-bigstat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ════════ VALORES ════════ */}
      <Reveal as="section" className="nx-section">
        <div className="nx-head">
          <span className="nx-pill">Cómo trabajamos</span>
          <h2 className="nx-h2">Cuatro principios que no negociamos</h2>
          <p className="nx-sub">Son los criterios contra los que medimos cada decisión de producto.</p>
        </div>
        <div className="nx-valores-grid">
          {VALORES.map(v => (
            <div key={v.titulo} className="nx-valor-card" style={{ background: v.bg }}>
              <span className="nx-valor-icon">{v.icon}</span>
              <div className="nx-valor-titulo">{v.titulo}</div>
              <div className="nx-valor-desc">{v.desc}</div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ════════ NUESTRA HISTORIA (timeline) ════════ */}
      <Reveal as="section" className="nx-section--soft">
        <div className="nx-inner">
          <div className="nx-head">
            <span className="nx-pill">Nuestra historia</span>
            <h2 className="nx-h2">De una idea a una red regional</h2>
            <p className="nx-sub">Los hitos que marcaron el camino de RedNorte.</p>
          </div>
          <div className="nx-timeline">
            {HITOS.map(h => (
              <div key={h.año} className="nx-tl-item">
                <div className="nx-tl-dot">{h.icon}</div>
                <div className="nx-tl-year">{h.año}</div>
                <div className="nx-tl-titulo">{h.titulo}</div>
                <div className="nx-tl-desc">{h.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ════════ EQUIPO MÉDICO ════════ */}
      <Reveal as="section" className="nx-section">
        <div className="nx-head">
          <span className="nx-pill">Profesionales</span>
          <h2 className="nx-h2">Nuestro equipo médico</h2>
          <p className="nx-sub">Especialistas comprometidos con tu salud y bienestar.</p>
        </div>
        <div className="nx-equipo-grid">
          {EQUIPO.map(m => (
            <div key={m.nombre} className="nx-medico-card" style={{ '--medico-color': m.color }}>
              <div className="nx-medico-header">
                <div className="nx-medico-avatar" style={{ background: `linear-gradient(135deg, ${m.color}, ${m.color}99)` }}>
                  {m.iniciales}
                </div>
                <div>
                  <div className="nx-medico-nombre">{m.nombre}</div>
                  <div className="nx-medico-especialidad" style={{ color: m.color }}>{m.especialidad}</div>
                  <div className="nx-medico-cargo">{m.cargo}</div>
                </div>
              </div>
              <p className="nx-medico-desc">{m.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ════════ HORARIOS Y UBICACIÓN ════════ */}
      <Reveal as="section" className="nx-section--soft">
        <div className="nx-inner">
          <div className="nx-head">
            <span className="nx-pill">Atención</span>
            <h2 className="nx-h2">Cuándo y dónde encontrarnos</h2>
          </div>
          <div className="nx-info-grid">
            <div className="nx-info-card">
              <div className="nx-info-card-title">🕐 Horarios de atención</div>
              {HORARIOS.map(h => (
                <div key={h.dia} className="nx-horario-row">
                  <span className="nx-horario-dia">{h.icon} {h.dia}</span>
                  <span className="nx-horario-valor">{h.valor}</span>
                </div>
              ))}
              <div className="nx-urgencia-banner">
                <span style={{ fontSize: 22 }}>🚨</span>
                <div>
                  <div className="nx-urgencia-label">Urgencias 24/7</div>
                  <div className="nx-urgencia-tel">600 733 6673</div>
                </div>
              </div>
            </div>
            <div className="nx-info-card">
              <div className="nx-info-card-title">📍 Información y cobertura</div>
              <div className="nx-ubic-item">
                <span className="nx-ubic-icon">🏢</span>
                <div><div className="nx-ubic-label">Sede central</div><div className="nx-ubic-val">Av. Providencia 1234, Santiago</div></div>
              </div>
              <div className="nx-ubic-item">
                <span className="nx-ubic-icon">🗺️</span>
                <div><div className="nx-ubic-label">Cobertura</div><div className="nx-ubic-val">Arica, Iquique, Antofagasta, Copiapó, La Serena</div></div>
              </div>
              <div className="nx-ubic-item">
                <span className="nx-ubic-icon">💻</span>
                <div><div className="nx-ubic-label">Modalidad</div><div className="nx-ubic-val">100% telemedicina, sin traslados</div></div>
              </div>
              <div className="nx-ubic-item">
                <span className="nx-ubic-icon">💰</span>
                <div><div className="nx-ubic-label">Costo</div><div className="nx-ubic-val">Gratuito para todos los pacientes registrados</div></div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ════════ CTA FINAL ════════ */}
      {!usuario && (
        <Reveal className="nx-cta-wrap">
          <div className="nx-cta">
            <div className="nx-cta-blob" />
            <h3 className="nx-cta-titulo">¿Listo para cuidar tu salud?</h3>
            <p className="nx-cta-desc">
              Únete a RedNorte hoy. Crea tu cuenta gratis y agenda tu primera consulta
              médica especializada desde donde estés.
            </p>
            <div className="nx-cta-btns">
              <Link to="/registro" className="nx-cta-btn-primary">Crear cuenta gratis</Link>
              <Link to="/login" className="nx-cta-btn-ghost">Ya tengo cuenta</Link>
            </div>
          </div>
        </Reveal>
      )}

    </div>
  );
}
