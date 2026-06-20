import React, { useEffect, useState } from 'react';
import { obtenerResumenEstadisticas, estadisticasConsultas, estadisticasAgenda } from '../service/api';

const BarChart = ({ datos, colorMap }) => {
  const max = Math.max(...Object.values(datos), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Object.entries(datos).map(([k, v]) => (
        <div key={k}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-soft)' }}>{k}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{v}</span>
          </div>
          <div style={{ height: 10, background: 'var(--bg-soft)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{
              width: `${(v / max) * 100}%`, height: '100%',
              background: colorMap?.[k] || 'var(--grad-primary)',
              borderRadius: 6, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>
        </div>
      ))}
      {Object.keys(datos).length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sin datos disponibles.</p>}
    </div>
  );
};

const DonutChart = ({ datos }) => {
  const total = Object.values(datos).reduce((a, b) => a + b, 0) || 1;
  const colores = ['#2563EB','#0D9488','#F59E0B','#EF4444','#7C3AED','#10B981','#EC4899'];
  let acumulado = 0;
  const segmentos = Object.entries(datos).map(([k, v], i) => {
    const inicio = (acumulado / total) * 360;
    acumulado += v;
    const fin = (acumulado / total) * 360;
    return { k, v, inicio, fin, color: colores[i % colores.length] };
  });
  const gradient = segmentos.map(s => `${s.color} ${s.inicio}deg ${s.fin}deg`).join(', ');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
      <div style={{
        width: 150, height: 150, borderRadius: '50%', flexShrink: 0,
        background: `conic-gradient(${gradient || 'var(--bg-soft) 0deg 360deg'})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
      }}>
        <div style={{ width: 92, height: 92, borderRadius: '50%', background: 'var(--card)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>{total}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>total</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {segmentos.map(s => (
          <div key={s.k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0 }} />
            <span style={{ color: 'var(--text-soft)', flex: 1 }}>{s.k}</span>
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>{s.v}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({Math.round((s.v/total)*100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AdminEstadisticasPage() {
  const [resumen,  setResumen]  = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      obtenerResumenEstadisticas(),
      estadisticasConsultas().catch(() => ({})),
      estadisticasAgenda().catch(() => ({})),
    ]).then(([r]) => { setResumen(r); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const ESTADO_COLOR = {
    PENDIENTE:'#F59E0B', AGENDADA:'#2563EB', REASIGNADA:'#0D9488',
    CANCELADA:'#EF4444', ATENDIDA:'#10B981',
  };
  const BLOQUE_COLOR = {
    DISPONIBLE:'#10B981', RESERVADO:'#2563EB', COMPLETADO:'#7C3AED',
    CANCELADO:'#EF4444', BLOQUEADO:'#94A3B8',
  };

  if (loading) return <div className="page"><div className="spinner">Cargando estadísticas...</div></div>;

  return (
    <div className="page page-wide">
      <div className="page-header">
        <div>
          <h1 className="page-title">📈 Estadísticas y reportes</h1>
          <p className="page-subtitle">Análisis consolidado del sistema RedNorte</p>
        </div>
      </div>

      {/* Totales */}
      <div className="grid-4 stagger" style={{ marginBottom: 28 }}>
        {[
          { label:'Consultas',       valor: resumen?.totalConsultas,        icon:'📋', color:'var(--primary)',      bg:'var(--primary-light)' },
          { label:'Usuarios',        valor: resumen?.totalUsuarios,         icon:'👥', color:'var(--purple)',       bg:'var(--purple-light)' },
          { label:'Bloques agenda',  valor: resumen?.totalBloquesAgenda,    icon:'📅', color:'var(--teal)',         bg:'var(--teal-light)' },
          { label:'Establecimientos',valor: resumen?.totalEstablecimientos, icon:'🏥', color:'var(--warning-dark)', bg:'var(--warning-light)' },
        ].map(t => (
          <div key={t.label} className="stat-card" style={{ '--accent-color': t.color }}>
            <div className="stat-icon" style={{ background: t.bg }}>{t.icon}</div>
            <div><div className="stat-num" style={{ color: t.color }}>{t.valor ?? '—'}</div><div className="stat-label">{t.label}</div></div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Donut consultas por estado */}
        <div className="card">
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>🍩 Consultas por estado</h3>
          <DonutChart datos={resumen?.consultasPorEstado || {}} />
        </div>

        {/* Bloques por estado */}
        <div className="card">
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>📊 Bloques de agenda por estado</h3>
          <BarChart datos={resumen?.bloquesPorEstado || {}} colorMap={BLOQUE_COLOR} />
        </div>

        {/* Establecimientos por tipo */}
        <div className="card">
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>🏥 Establecimientos por tipo</h3>
          <BarChart datos={resumen?.establecimientosPorTipo || {}} />
        </div>

        {/* Consultas por estado (barra) */}
        <div className="card">
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>📋 Distribución de consultas</h3>
          <BarChart datos={resumen?.consultasPorEstado || {}} colorMap={ESTADO_COLOR} />
        </div>
      </div>
    </div>
  );
}
