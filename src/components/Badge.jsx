import React from 'react';

const MAP = {
  PENDIENTE:  'badge-pendiente',
  AGENDADA:   'badge-agendada',
  REASIGNADA: 'badge-reasignada',
  CANCELADA:  'badge-cancelada',
  ATENDIDA:   'badge-atendida',
};

const ICONS = {
  PENDIENTE: '⏳', AGENDADA: '📅', REASIGNADA: '🔄', CANCELADA: '❌', ATENDIDA: '✅'
};

export default function Badge({ estado }) {
  return (
    <span className={`badge ${MAP[estado] || 'badge-pendiente'}`}>
      {ICONS[estado]} {estado}
    </span>
  );
}
