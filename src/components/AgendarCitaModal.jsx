import React from 'react';
import AgendarFlujo from './AgendarFlujo';

/**
 * Envoltorio modal para AgendarFlujo, en el mismo lenguaje visual que
 * ChatbotAccionModal/RecuperarPasswordModal: SaludBot lo abre cuando
 * el paciente (ya con cuenta activa) confirma que quiere agendar una
 * cita (accionRealizada REDIRIGIR_AGENDAR), sin salir del contexto
 * del chat ni tener que dictar fecha/hora/especialidad por texto.
 *
 * A diferencia de los otros modales de accion rapida, este NO se
 * autocierra al terminar: tras agendar con exito, AgendarFlujo muestra
 * su propia pantalla de confirmacion (con "Agendar otra" / "Ver mis
 * consultas"), y es el paciente quien decide cuando volver al chat.
 * onExito aqui solo le avisa a ChatbotWidget que anuncie la cita en la
 * conversacion; onCerrar cierra el modal (boton X, "Cancelar", o tras
 * "Ver mis consultas").
 */
export default function AgendarCitaModal({ onCerrar, onExito, onVerConsultas }) {
  return (
    <div className="cb-modal-overlay" onClick={onCerrar}>
      <div className="cb-modal-card cb-modal-card--agendar" onClick={e => e.stopPropagation()}>
        <button className="cb-modal-cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
        <AgendarFlujo
          onExito={onExito}
          onCancelar={onCerrar}
          onVerConsultas={onVerConsultas}
        />
      </div>
    </div>
  );
}
