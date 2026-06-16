import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EQUIPO = [
  { nombre:'Dr. Alejandro Vega Soto',    cargo:'Director Médico',        especialidad:'Cardiología',       iniciales:'AV', color:'#2563EB',
    descripcion:'Más de 20 años de experiencia en cardiología intervencionista. Formado en la Universidad de Chile y con especialización en el Hospital Clínico de Barcelona.' },
  { nombre:'Dra. Camila Rojas Fuentes',  cargo:'Jefa de Medicina General', especialidad:'Medicina General', iniciales:'CR', color:'#0D9488',
    descripcion:'Especialista en atención primaria y medicina familiar. Comprometida con la salud preventiva y el bienestar integral de los pacientes.' },
  { nombre:'Dr. Patricio Morales Ibáñez', cargo:'Jefe de Neurología',     especialidad:'Neurología',       iniciales:'PM', color:'#7C3AED',
    descripcion:'Neurólogo con más de 15 años de trayectoria. Experto en enfermedades cerebrovasculares y trastornos del movimiento.' },
  { nombre:'Dra. Valentina Castro Ríos', cargo:'Traumatóloga',            especialidad:'Traumatología',    iniciales:'VC', color:'#F59E0B',
    descripcion:'Especialista en cirugía ortopédica y traumatología deportiva. Ha atendido a deportistas de alto rendimiento y equipos profesionales.' },
  { nombre:'Dr. Rodrigo Núñez Lagos',    cargo:'Dermatólogo',             especialidad:'Dermatología',     iniciales:'RN', color:'#EF4444',
    descripcion:'Dermatólogo clínico y estético con amplia experiencia en diagnóstico de lesiones cutáneas y tratamientos avanzados.' },
  { nombre:'Dra. Sofía Herrera Pinto',   cargo:'Oftalmóloga',             especialidad:'Oftalmología',     iniciales:'SH', color:'#10B981',
    descripcion:'Especialista en cirugía refractiva y enfermedades de la retina. Más de 10 años dedicados a preservar y restaurar la visión de sus pacientes.' },
];

const HORARIOS = [
  { dia: 'Lunes a Viernes', horario: '08:00 — 20:00' },
  { dia: 'Sábados',         horario: '09:00 — 14:00' },
  { dia: 'Domingos y Festivos', horario: 'Urgencias 24/7' },
];

const VALORES = [
  { icon:'❤️', titulo:'Compromiso',       desc:'Nos comprometemos con el bienestar de cada paciente, tratando cada caso con dedicación y profesionalismo.' },
  { icon:'🔬', titulo:'Excelencia',       desc:'Contamos con tecnología de última generación y profesionales altamente calificados para brindarte la mejor atención.' },
  { icon:'🤝', titulo:'Cercanía',         desc:'Creemos en una medicina humana. Escuchamos a cada paciente y los acompañamos en todo su proceso de salud.' },
  { icon:'🔒', titulo:'Confidencialidad', desc:'Tu información médica es estrictamente privada. Garantizamos la protección total de tus datos.' },
];

export default function SobreNosotrosPage() {
  const { usuario } = useAuth();

  return (
    <div className="nosotros-page">

      {/* ── HERO ── */}
      <div className="nosotros-hero">
        <div className="nosotros-hero-deco-1" />
        <div className="nosotros-hero-deco-2" />
        <img src="/logo.png" alt="RedNorte" className="nosotros-hero-logo" />
        <h1 className="nosotros-hero-titulo">
          Sobre <span className="nosotros-hero-accent">RedNorte</span>
        </h1>
        <p className="nosotros-hero-desc">
          Somos una clínica digital comprometida con hacer la salud accesible, eficiente y humana para todos los chilenos.
        </p>
      </div>

      {/* ── MISIÓN Y VISIÓN ── */}
      <div className="nosotros-section">
        <div className="nosotros-mision-grid">
          <div className="nosotros-mision-card nosotros-mision-card--azul">
            <div className="nosotros-mision-icon">🎯</div>
            <h2 className="nosotros-mision-titulo">Nuestra Misión</h2>
            <p className="nosotros-mision-texto">
              Brindar atención médica de calidad a través de una plataforma digital innovadora, eliminando las barreras de acceso a la salud y poniendo al paciente en el centro de cada decisión.
            </p>
          </div>
          <div className="nosotros-mision-card nosotros-mision-card--verde">
            <div className="nosotros-mision-icon">🌟</div>
            <h2 className="nosotros-mision-titulo">Nuestra Visión</h2>
            <p className="nosotros-mision-texto">
              Convertirnos en la clínica digital de referencia en Chile, reconocida por la excelencia de nuestros profesionales, la innovación de nuestra plataforma y el impacto positivo que generamos en la salud de miles de familias.
            </p>
          </div>
        </div>

        {/* Números */}
        <div className="nosotros-stats-grid">
          {[
            { num:'+500', label:'Pacientes atendidos', icon:'👥' },
            { num:'6',    label:'Especialidades médicas', icon:'🏥' },
            { num:'+15',  label:'Años de experiencia', icon:'📅' },
            { num:'98%',  label:'Satisfacción', icon:'⭐' },
          ].map(s => (
            <div key={s.label} className="nosotros-stat-card">
              <div className="nosotros-stat-icon">{s.icon}</div>
              <div className="nosotros-stat-num">{s.num}</div>
              <div className="nosotros-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Valores */}
        <div className="nosotros-section-header">
          <span className="nosotros-chip">Nuestros valores</span>
          <h2 className="nosotros-section-titulo">Lo que nos define</h2>
        </div>
        <div className="nosotros-valores-grid">
          {VALORES.map(v => (
            <div key={v.titulo} className="nosotros-valor-card">
              <div className="nosotros-valor-icon">{v.icon}</div>
              <h3 className="nosotros-valor-titulo">{v.titulo}</h3>
              <p className="nosotros-valor-desc">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── EQUIPO MÉDICO ── */}
      <div className="nosotros-equipo-bg">
        <div className="nosotros-section">
          <div className="nosotros-section-header">
            <span className="nosotros-chip">Profesionales</span>
            <h2 className="nosotros-section-titulo">Nuestro equipo médico</h2>
            <p className="nosotros-section-sub">Especialistas comprometidos con tu salud y bienestar</p>
          </div>
          <div className="nosotros-equipo-grid">
            {EQUIPO.map(m => (
              <div key={m.nombre} className="nosotros-medico-card">
                <div className="nosotros-medico-header">
                  <div className="nosotros-medico-avatar" style={{ background: `linear-gradient(135deg, ${m.color}, ${m.color}99)` }}>
                    {m.iniciales}
                  </div>
                  <div>
                    <div className="nosotros-medico-nombre">{m.nombre}</div>
                    <div className="nosotros-medico-especialidad" style={{ color: m.color }}>{m.especialidad}</div>
                    <div className="nosotros-medico-cargo">{m.cargo}</div>
                  </div>
                </div>
                <p className="nosotros-medico-desc">{m.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HORARIOS Y UBICACIÓN ── */}
      <div className="nosotros-section nosotros-horarios-grid">

        {/* Horarios */}
        <div>
          <span className="nosotros-chip">Atención</span>
          <h2 className="nosotros-section-titulo" style={{ marginTop: 14 }}>Horarios de atención</h2>
          <div className="nosotros-horarios-list">
            {HORARIOS.map(h => (
              <div key={h.dia} className="nosotros-horario-item">
                <div className="nosotros-horario-dia">
                  <span className="nosotros-horario-ico">🕐</span>
                  <span>{h.dia}</span>
                </div>
                <span className="nosotros-horario-badge">{h.horario}</span>
              </div>
            ))}
          </div>
          <div className="nosotros-urgencias-card">
            <div className="nosotros-urgencias-titulo">🚨 Urgencias 24 horas</div>
            <p className="nosotros-urgencias-desc">
              Contamos con servicio de urgencias disponible las 24 horas del día, los 7 días de la semana, incluidos festivos.
            </p>
            <div className="nosotros-urgencias-telefono">📞 600 RED NORTE (600 733 6673)</div>
          </div>
        </div>

        {/* Ubicación */}
        <div>
          <span className="nosotros-chip nosotros-chip--teal">Dónde estamos</span>
          <h2 className="nosotros-section-titulo" style={{ marginTop: 14 }}>Nuestra ubicación</h2>
          <div className="nosotros-mapa">
            <div className="nosotros-mapa-grid" />
            <div className="nosotros-mapa-pin">
              <div className="nosotros-mapa-pin-icon">📍</div>
              <div className="nosotros-mapa-pin-nombre">RedNorte Clínica Digital</div>
              <div className="nosotros-mapa-pin-dir">Av. Providencia 1234, Santiago</div>
            </div>
          </div>
          <div className="nosotros-ubicacion-list">
            {[
              { icon:'📍', label:'Dirección',        valor:'Av. Providencia 1234, Providencia, Santiago' },
              { icon:'🚇', label:'Metro',             valor:'Pedro de Valdivia (Línea 1)' },
              { icon:'🚌', label:'Buses',             valor:'Líneas 210, 505, C02' },
              { icon:'🚗', label:'Estacionamiento',  valor:'Disponible en el edificio' },
            ].map(u => (
              <div key={u.label} className="nosotros-ubicacion-item">
                <span className="nosotros-ubicacion-ico">{u.icon}</span>
                <div>
                  <div className="nosotros-ubicacion-label">{u.label}</div>
                  <div className="nosotros-ubicacion-val">{u.valor}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      {!usuario && (
        <div className="nosotros-cta-wrap">
          <div className="nosotros-cta-card">
            <h3 className="nosotros-cta-titulo">¿Necesitas atención médica?</h3>
            <p className="nosotros-cta-desc">
              Regístrate gratis y agenda tu consulta hoy mismo. Nuestros especialistas están listos para atenderte.
            </p>
            <div className="nosotros-cta-btns">
              <Link to="/registro" className="nosotros-cta-btn-primary">Crear cuenta gratis</Link>
              <Link to="/login"    className="nosotros-cta-btn-ghost">Iniciar sesión</Link>
            </div>
          </div>
        </div>
      )}

      <div className="nosotros-footer">
        © 2026 RedNorte — Clínica Digital · Todos los derechos reservados
      </div>
    </div>
  );
}
