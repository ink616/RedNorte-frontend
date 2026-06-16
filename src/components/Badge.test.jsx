import React from 'react';
import { render, screen } from '@testing-library/react';
import Badge from './Badge';

describe('Badge', () => {
  test('muestra el texto del estado PENDIENTE', () => {
    render(<Badge estado="PENDIENTE" />);
    expect(screen.getByText(/PENDIENTE/)).toBeInTheDocument();
  });

  test('aplica la clase CSS correcta segun el estado', () => {
    const { container } = render(<Badge estado="ATENDIDA" />);
    expect(container.querySelector('.badge-atendida')).toBeInTheDocument();
  });

  test('usa la clase por defecto para un estado desconocido', () => {
    const { container } = render(<Badge estado="INEXISTENTE" />);
    expect(container.querySelector('.badge-pendiente')).toBeInTheDocument();
  });

  test('renderiza cada estado valido con su clase', () => {
    const casos = [
      ['AGENDADA', 'badge-agendada'],
      ['REASIGNADA', 'badge-reasignada'],
      ['CANCELADA', 'badge-cancelada'],
    ];
    casos.forEach(([estado, clase]) => {
      const { container } = render(<Badge estado={estado} />);
      expect(container.querySelector('.' + clase)).toBeInTheDocument();
    });
  });
});
