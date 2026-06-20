import React from 'react';

const ICONOS = {
  PENDIENTE:  '⏳',
  AGENDADA:   '📅',
  REASIGNADA: '🔄',
  CANCELADA:  '❌',
  ATENDIDA:   '✅',
};

export default function Badge({ estado }) {
  if (!estado) return <span className="badge badge-gray">—</span>;

  const clase = `badge-${estado.toLowerCase()}`;
  const icono = ICONOS[estado] || '•';

  return (
    <span className={`badge ${clase}`}>
      {icono} {estado}
    </span>
  );
}
