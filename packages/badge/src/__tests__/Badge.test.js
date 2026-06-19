import React from 'react';
import { render, screen } from '@testing-library/react';
import Badge from '../index';

// NOTA: este archivo usa React.createElement en vez de JSX, por la misma
// razon que index.js (ver comentario ahi): Jest/CRA solo aplica el
// transform de Babel para JSX dentro de src/ del proyecto principal,
// y este test vive en packages/badge (fuera de esa carpeta).
const h = React.createElement;

describe('@rednorte/badge', () => {
  test('muestra el texto del estado PENDIENTE', () => {
    render(h(Badge, { estado: 'PENDIENTE' }));
    expect(screen.getByText(/PENDIENTE/)).toBeInTheDocument();
  });

  test('aplica la clase CSS correcta segun el estado', () => {
    const { container } = render(h(Badge, { estado: 'ATENDIDA' }));
    expect(container.querySelector('.badge-atendida')).toBeInTheDocument();
  });

  test('usa la clase por defecto para un estado desconocido', () => {
    const { container } = render(h(Badge, { estado: 'INEXISTENTE' }));
    expect(container.querySelector('.badge-pendiente')).toBeInTheDocument();
  });

  test('renderiza cada estado valido con su clase', () => {
    const casos = [
      ['AGENDADA', 'badge-agendada'],
      ['REASIGNADA', 'badge-reasignada'],
      ['CANCELADA', 'badge-cancelada'],
    ];
    casos.forEach(([estado, clase]) => {
      const { container } = render(h(Badge, { estado }));
      expect(container.querySelector('.' + clase)).toBeInTheDocument();
    });
  });

  // ─── soporte para mapas personalizados (reutilizacion real) ───────────

  test('acepta un classMap personalizado para reutilizar el componente en otro dominio', () => {
    const classMap = { ACTIVO: 'badge-activo', INACTIVO: 'badge-inactivo' };
    const iconMap = { ACTIVO: '🟢', INACTIVO: '🔴' };

    const { container } = render(
      h(Badge, { estado: 'ACTIVO', classMap, iconMap })
    );

    expect(container.querySelector('.badge-activo')).toBeInTheDocument();
    expect(screen.getByText(/ACTIVO/)).toBeInTheDocument();
  });

  test('con classMap personalizado, un estado no mapeado cae al default badge-pendiente', () => {
    const classMap = { ACTIVO: 'badge-activo' };

    const { container } = render(h(Badge, { estado: 'DESCONOCIDO', classMap }));

    expect(container.querySelector('.badge-pendiente')).toBeInTheDocument();
  });
});
