// src/pages/SobreNosotrosPage.jsx
import React from 'react';

const PROBLEMAS = [
  'Pacientes que permanecen largos períodos en lista de espera sin respuesta',
  'Cancelaciones de citas que generan pérdida de horas médicas disponibles',
  'Falta de herramientas para reasignar citas canceladas automáticamente',
  'Escasa visibilidad del paciente sobre el estado de sus solicitudes médicas',
  'Sistemas de registro desintegrados entre hospitales y centros de salud',
];

const MODULOS = [
  { icon: '📋', titulo: 'Listas de espera',       desc: 'Registro y administración centralizada de pacientes en espera de atención médica.' },
  { icon: '🔄', titulo: 'Reasignación automática', desc: 'Optimiza horas médicas cuando ocurre una cancelación, reduciendo pérdidas.' },
  { icon: '🧑‍⚕️', titulo: 'Portal del paciente',  desc: 'Transparencia y comunicación directa entre paciente y sistema de salud.' },
  { icon: '🩺', titulo: 'Panel médico',            desc: 'Herramientas para que los doctores gestionen y actualicen sus consultas.' },
];

const STATS = [
  { num: '13',   label: 'Especialidades médicas' },
  { num: '3',    label: 'Microservicios activos'  },
  { num: '3',    label: 'Tipos de usuarios'       },
  { num: '24/7', label: 'Disponibilidad'          },
];

const FASES = [
  {
    num: '01', tagClass: 'parcial-1', tag: 'Parcial 1',
    titulo: 'Diseño de arquitectura y microservicios',
    desc: 'Arquitectura base con patrones Repository, Factory Method y Circuit Breaker. Diseño del API Gateway y separación de responsabilidades entre servicios.',
  },
  {
    num: '02', tagClass: 'parcial-2', tag: 'Parcial 2',
    titulo: 'Desarrollo de componentes frontend y backend',
    desc: 'Implementación con React y microservicios Spring Boot. Conexión con bases de datos vía JPA y primeras versiones funcionales de los tres módulos.',
  },
  {
    num: '03', tagClass: 'parcial-3', tag: 'Parcial 3',
    titulo: 'Integración, pruebas y presentación final',
    desc: 'Pruebas unitarias con JUnit y Jest, cobertura mínima del 60% validada con SonarQube e integración continua automatizada.',
  },
];

const TECNOLOGIAS = [
  'React 18', 'Spring Boot', 'JPA / MySQL', 'API Gateway',
  'Docker', 'JWT / BCrypt', 'JUnit / Jest', 'Git Flow', 'SonarQube',
];

export default function SobreNosotrosPage() {
  return (
    <div className="nosotros-page">

      {/* Hero */}
      <div className="nosotros-hero">
        <p className="nosotros-eyebrow">Servicio Público de Salud</p>
        <h1>Red<span>Norte</span> Clínica Digital</h1>
        <p>
          Administramos una red de hospitales, centros de atención primaria y clínicas
          especializadas que brindan atención médica a miles de pacientes en el norte del país.
          Nuestra plataforma centraliza la gestión de listas de espera y optimiza la asignación
          de citas médicas.
        </p>
      </div>

      {/* Problemas */}
      <div className="nosotros-section">
        <p className="nosotros-section-label">El problema que resolvemos</p>
        <h2>Desafíos del sistema de salud pública</h2>
        <div className="nosotros-problemas-grid">
          {PROBLEMAS.map((p, i) => (
            <div key={i} className="nosotros-problema-item">
              <div className="nosotros-problema-dot" />
              <p>{p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Módulos — reutiliza .shortcut-card de Home.css */}
      <div className="nosotros-section">
        <p className="nosotros-section-label">Nuestra solución</p>
        <h2>Tres módulos integrados</h2>
        <div className="nosotros-modulos-grid">
          {MODULOS.map((m, i) => (
            <div key={i} className="shortcut-card">
              <span className="shortcut-icon">{m.icon}</span>
              <h3>{m.titulo}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="nosotros-section">
        <p className="nosotros-section-label">Estadísticas</p>
        <h2>La red en números</h2>
        <div className="nosotros-stats-grid">
          {STATS.map((s, i) => (
            <div key={i} className="nosotros-stat">
              <div className="nosotros-stat-num">{s.num}</div>
              <div className="nosotros-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fases */}
      <div className="nosotros-section">
        <p className="nosotros-section-label">Desarrollo del proyecto</p>
        <h2>Tres etapas de construcción</h2>
        <div>
          {FASES.map((f, i) => (
            <div key={i} className="nosotros-fase">
              <div className="nosotros-fase-num">{f.num}</div>
              <div>
                <span className={`nosotros-fase-tag ${f.tagClass}`}>{f.tag}</span>
                <h3>{f.titulo}</h3>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tecnologías */}
      <div className="nosotros-section">
        <p className="nosotros-section-label">Stack tecnológico</p>
        <h2>Tecnologías utilizadas</h2>
        <div className="nosotros-tech-grid">
          {TECNOLOGIAS.map((t, i) => (
            <span key={i} className="nosotros-tech-pill">{t}</span>
          ))}
        </div>
      </div>

      {/* Mapa */}
      <div className="nosotros-section">
        <p className="nosotros-section-label">Ubicación</p>
        <h2>Encuéntranos</h2>
        <iframe
          title="Ubicación RedNorte"
          className="nosotros-mapa"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3557.123!2d-70.6693!3d-18.4746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDI4JzI4LjYiUyA3MMKwNDAnMDkuNSJX!5e0!3m2!1ses!2scl!4v1"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

    </div>
  );
}