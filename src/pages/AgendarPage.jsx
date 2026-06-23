import React from 'react';
import AgendarFlujo from '../components/AgendarFlujo';

/**
 * Pagina de pantalla completa /agendar. Toda la logica vive en
 * AgendarFlujo (components/AgendarFlujo.jsx), reutilizada tambien por
 * AgendarCitaModal.jsx cuando SaludBot abre el agendamiento desde el
 * chat. Aqui solo se aporta el contenedor de pagina estandar.
 */
export default function AgendarPage() {
  return (
    <div className="page page-narrow">
      <AgendarFlujo />
    </div>
  );
}
