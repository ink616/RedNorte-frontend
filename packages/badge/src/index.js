import React from 'react';

/**
 * @rednorte/badge
 *
 * Badge visual generico, empaquetado como modulo NPM independiente
 * (workspace local) para ser reutilizado en cualquier parte del
 * frontend de RedNorte sin duplicar la logica de mapeo estado -> estilo.
 *
 * Los mapas de clases CSS e iconos por defecto reflejan los estados de
 * una consulta medica, pero se pueden sobreescribir via props para
 * reutilizar el mismo componente con otro dominio (ej. estados de
 * notificacion, estados de auditoria, etc.).
 *
 * NOTA TECNICA: este archivo usa React.createElement en vez de sintaxis
 * JSX a proposito. Create React App (via react-scripts) solo transpila
 * JSX dentro de la carpeta src/ del proyecto principal; como este
 * paquete vive en packages/badge (fuera de src/), el preset de Babel
 * para JSX no se aplica aqui. Usar React.createElement evita depender
 * de una herramienta extra (como react-app-rewired) solo para resolver
 * esto, manteniendo el setup de CRA intacto.
 */

const DEFAULT_MAP = {
  PENDIENTE: 'badge-pendiente',
  AGENDADA: 'badge-agendada',
  REASIGNADA: 'badge-reasignada',
  CANCELADA: 'badge-cancelada',
  ATENDIDA: 'badge-atendida',
};

const DEFAULT_ICONS = {
  PENDIENTE: '⏳',
  AGENDADA: '📅',
  REASIGNADA: '🔄',
  CANCELADA: '❌',
  ATENDIDA: '✅',
};

export default function Badge({ estado, classMap = DEFAULT_MAP, iconMap = DEFAULT_ICONS }) {
  const claseCss = `badge ${classMap[estado] || 'badge-pendiente'}`;
  const icono = iconMap[estado];

  return React.createElement(
    'span',
    { className: claseCss },
    icono ? `${icono} ${estado}` : estado
  );
}
