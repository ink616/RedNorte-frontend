// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../css/css.css';


export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">

        {/* Marca */}
        <div className="footer-brand">
          <h3>Red<span>Norte</span></h3>
          <p>Clínica Digital — Servicio público de salud que conecta pacientes con especialistas médicos en el norte del país.</p>
        </div>

        {/* Contacto */}
        <div className="footer-col">
          <h4>Contacto</h4>
          <ul>
            <li><span>📧</span><a href="mailto:contacto@rednorte.cl">contacto@rednorte.cl</a></li>
            <li><span>📞</span><a href="tel:+56232001000">+56 2 3200 1000</a></li>
            <li><span>🕐</span>Lunes a viernes, 8:00 – 18:00</li>
            <li><span>📍</span>Región Norte de Chile</li>
          </ul>

          <div className="footer-emergency">
            <p>🚨 Urgencias 24/7</p>
            <span>131</span>
          </div>
        </div>

        {/* Navegación */}
        <div className="footer-col">
          <h4>Navegación</h4>
          <ul>
            <li><span>🏠</span><Link to="/">Inicio</Link></li>
            <li><span>📋</span><Link to="/mis-consultas">Mis Consultas</Link></li>
            <li><span>➕</span><Link to="/agendar">Agendar Cita</Link></li>
            <li><span>🏥</span><Link to="/sobre-nosotros">Sobre Nosotros</Link></li>
          </ul>
        </div>

        {/* Especialidades */}
        <div className="footer-col">
          <h4>Especialidades</h4>
          <ul>
            <li><span>🫀</span>Cardiología</li>
            <li><span>🧠</span>Neurología</li>
            <li><span>👶</span>Pediatría</li>
            <li><span>🦴</span>Traumatología</li>
            <li><span>👁️</span>Oftalmología</li>
            <li><span>+8</span>más especialidades</li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} RedNorte Clínica Digital — Todos los derechos reservados</p>
        <p>Desarrollado con React + Spring Boot</p>
      </div>
    </footer>
  );
}