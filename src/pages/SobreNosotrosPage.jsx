import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EQUIPO = [
  { nombre: 'Dr. Alejandro Vega Soto',     cargo: 'Director Médico',          especialidad: 'Cardiología',       descripcion: 'Más de 20 años de experiencia en cardiología intervencionista. Formado en la Universidad de Chile y con especialización en el Hospital Clínico de Barcelona.',             iniciales: 'AV', color: '#2563EB' },
  { nombre: 'Dra. Camila Rojas Fuentes',   cargo: 'Jefa de Medicina General', especialidad: 'Medicina General',  descripcion: 'Especialista en atención primaria y medicina familiar. Comprometida con la salud preventiva y el bienestar integral de los pacientes.',                                   iniciales: 'CR', color: '#0D9488' },
  { nombre: 'Dr. Patricio Morales Ibáñez', cargo: 'Jefe de Neurología',        especialidad: 'Neurología',        descripcion: 'Neurólogo con más de 15 años de trayectoria. Experto en enfermedades cerebrovasculares y trastornos del movimiento.',                                                  iniciales: 'PM', color: '#7C3AED' },
  { nombre: 'Dra. Valentina Castro Ríos',  cargo: 'Traumatóloga',              especialidad: 'Traumatología',     descripcion: 'Especialista en cirugía ortopédica y traumatología deportiva. Ha atendido a deportistas de alto rendimiento y equipos profesionales.',                                 iniciales: 'VC', color: '#F59E0B' },
  { nombre: 'Dr. Rodrigo Núñez Lagos',     cargo: 'Dermatólogo',               especialidad: 'Dermatología',      descripcion: 'Dermatólogo clínico y estético con amplia experiencia en diagnóstico de lesiones cutáneas y tratamientos avanzados.',                                                  iniciales: 'RN', color: '#EF4444' },
  { nombre: 'Dra. Sofía Herrera Pinto',    cargo: 'Oftalmóloga',               especialidad: 'Oftalmología',      descripcion: 'Especialista en cirugía refractiva y enfermedades de la retina. Más de 10 años dedicados a preservar y restaurar la visión de sus pacientes.',                        iniciales: 'SH', color: '#10B981' },
];

const HORARIOS = [
  { dia: 'Lunes a Viernes',    horario: '08:00 — 20:00' },
  { dia: 'Sábados',            horario: '09:00 — 14:00' },
  { dia: 'Domingos y Festivos',horario: 'Urgencias 24/7' },
];

const VALORES = [
  { icon: '❤️', titulo: 'Compromiso',       desc: 'Nos comprometemos con el bienestar de cada paciente, tratando cada caso con dedicación y profesionalismo.' },
  { icon: '🔬', titulo: 'Excelencia',       desc: 'Contamos con tecnología de última generación y profesionales altamente calificados para brindarte la mejor atención.' },
  { icon: '🤝', titulo: 'Cercanía',         desc: 'Creemos en una medicina humana. Escuchamos a cada paciente y los acompañamos en todo su proceso de salud.' },
  { icon: '🔒', titulo: 'Confidencialidad', desc: 'Tu información médica es estrictamente privada. Garantizamos la protección total de tus datos.' },
];

export default function SobreNosotrosPage() {
  const { usuario } = useAuth();

  return (
    <div className="nosotros-page">

      {/* ── HERO ── */}
      <div className="nosotros-hero">
        <div className="nosotros-hero-deco1" />
        <div className="nosotros-hero-deco2" />
        <img src="/logo.png" alt="RedNorte" className="nosotros-hero-logo" />
        <h1 className="nosotros-hero-title">
          Sobre <span className="nosotros-hero-accent">RedNorte</span>
        </h1>
        <p className="nosotros-hero-desc">
          Somos una clínica digital comprometida con hacer la salud accesible, eficiente y humana para todos los chilenos.
        </p>
      </div>

      {/* ── MISIÓN Y VISIÓN ── */}
      <div className="nosotros-content">
        <div className="nosotros-mv-grid">
          <div className="nosotros-mision">
            <div className="nosotros-mv-icon">🎯</div>
            <h2 className="nosotros-mision-title">Nuestra Misión</h2>
            <p className="nosotros-mv-text">
              Brindar atención médica de calidad a través de una plataforma digital innovadora, eliminando las barreras de acceso a la salud y poniendo al paciente en el centro de cada decisión. Trabajamos para que obtener una consulta médica sea tan simple como enviar un mensaje.
            </p>
          </div>
          <div className="nosotros-vision">
            <div className="nosotros-mv-icon">🌟</div>
            <h2 className="nosotros-vision-title">Nuestra Visión</h2>
            <p className="nosotros-mv-text">
              Convertirnos en la clínica digital de referencia en Chile, reconocida por la excelencia de nuestros profesionales, la innovación de nuestra plataforma y el impacto positivo que generamos en la salud de miles de familias a lo largo del país.
            </p>
          </div>
        </div>

        {/* Números */}
        <div className="nosotros-numeros">
          {[
            { num: '+500', label: 'Pacientes atendidos',   icon: '👥' },
            { num: '6',    label: 'Especialidades médicas', icon: '🏥' },
            { num: '+15',  label: 'Años de experiencia',   icon: '📅' },
            { num: '98%',  label: 'Satisfacción',          icon: '⭐' },
          ].map(s => (
            <div key={s.label} className="nosotros-numero-card">
              <div className="nosotros-numero-icon">{s.icon}</div>
              <div className="nosotros-numero-num">{s.num}</div>
              <div className="nosotros-numero-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Valores */}
        <div className="nosotros-section-head">
          <span className="nosotros-badge-blue">Nuestros valores</span>
          <h2 className="nosotros-section-title">Lo que nos define</h2>
        </div>
        <div className="nosotros-valores-grid">
          {VALORES.map(v => (
            <div key={v.titulo} className="nosotros-valor-card">
              <div className="nosotros-valor-icon">{v.icon}</div>
              <h3 className="nosotros-valor-title">{v.titulo}</h3>
              <p className="nosotros-valor-desc">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── EQUIPO MÉDICO ── */}
      <div className="nosotros-equipo">
        <div className="nosotros-equipo-inner">
          <div className="nosotros-equipo-head">
            <span className="nosotros-badge-blue">Profesionales</span>
            <h2 className="nosotros-section-title">Nuestro equipo médico</h2>
            <p className="nosotros-section-sub">Especialistas comprometidos con tu salud y bienestar</p>
          </div>

          <div className="nosotros-equipo-grid">
            {EQUIPO.map(m => (
              <div key={m.nombre} className="nosotros-medico-card">
                <div className="nosotros-medico-header">
                  {/* color del avatar es dinámico (por médico) → queda inline */}
                  <div className="nosotros-medico-avatar"
                    style={{ background: `linear-gradient(135deg, ${m.color}, ${m.color}99)` }}>
                    {m.iniciales}
                  </div>
                  <div>
                    <div className="nosotros-medico-nombre">{m.nombre}</div>
                    <div style={{ fontSize: 12, color: m.color, fontWeight: 600 }}>{m.especialidad}</div>
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
      <div className="nosotros-hl">
        <div className="nosotros-hl-grid">

          {/* Horarios */}
          <div>
            <span className="nosotros-badge-blue">Atención</span>
            <h2 className="nosotros-seccion-titulo">Horarios de atención</h2>
            <div className="nosotros-horarios-lista">
              {HORARIOS.map(h => (
                <div key={h.dia} className="nosotros-horario-item">
                  <div className="nosotros-horario-left">
                    <span className="nosotros-horario-icon">🕐</span>
                    <span className="nosotros-horario-dia">{h.dia}</span>
                  </div>
                  <span className="nosotros-horario-hora">{h.horario}</span>
                </div>
              ))}
            </div>
            <div className="nosotros-urgencias">
              <div className="nosotros-urgencias-title">🚨 Urgencias 24 horas</div>
              <p className="nosotros-urgencias-desc">
                Contamos con servicio de urgencias disponible las 24 horas del día, los 7 días de la semana, incluidos festivos.
              </p>
              <div className="nosotros-urgencias-tel">📞 600 RED NORTE (600 733 6673)</div>
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <span className="nosotros-badge-teal">Dónde estamos</span>
            <h2 className="nosotros-seccion-titulo">Nuestra ubicación</h2>

            <div className="nosotros-mapa">
              <div className="nosotros-mapa-grid" />
              <div className="nosotros-mapa-body">
                <div className="nosotros-mapa-icon">📍</div>
                <div className="nosotros-mapa-nombre">RedNorte Clínica Digital</div>
                <div className="nosotros-mapa-dir">Av. Providencia 1234, Santiago</div>
              </div>
            </div>

            <div className="nosotros-ubicacion-lista">
              {[
                { icon: '📍', label: 'Dirección',        valor: 'Av. Providencia 1234, Providencia, Santiago' },
                { icon: '🚇', label: 'Metro',             valor: 'Pedro de Valdivia (Línea 1)' },
                { icon: '🚌', label: 'Buses',             valor: 'Líneas 210, 505, C02' },
                { icon: '🚗', label: 'Estacionamiento',   valor: 'Disponible en el edificio' },
              ].map(u => (
                <div key={u.label} className="nosotros-ubicacion-item">
                  <span className="nosotros-ubicacion-icon">{u.icon}</span>
                  <div>
                    <div className="nosotros-ubicacion-label">{u.label}</div>
                    <div className="nosotros-ubicacion-val">{u.valor}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      {!usuario && (
        <div className="nosotros-cta">
          <div className="nosotros-cta-card">
            <h3 className="nosotros-cta-title">¿Necesitas atención médica?</h3>
            <p className="nosotros-cta-desc">
              Regístrate gratis y agenda tu consulta hoy mismo. Nuestros especialistas están listos para atenderte.
            </p>
            <div className="nosotros-cta-btns">
              <Link to="/registro" className="nosotros-cta-primary">Crear cuenta gratis</Link>
              <Link to="/login"    className="nosotros-cta-secondary">Iniciar sesión</Link>
            </div>
          </div>
        </div>
      )}

      <div className="nosotros-footer-mini">
        © 2026 RedNorte — Clínica Digital · Todos los derechos reservados
      </div>
    </div>
  );
}
