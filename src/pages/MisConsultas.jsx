import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listarConsultasPorUsuario } from '../service/api';

const BADGE = {
  PENDIENTE:  { bg: '#fef3c7', color: '#92400e' },
  AGENDADA:   { bg: '#dbeafe', color: '#1e40af' },
  REASIGNADA: { bg: '#d1fae5', color: '#065f46' },
  CANCELADA:  { bg: '#fee2e2', color: '#991b1b' },
  ATENDIDA:   { bg: '#f0fdf4', color: '#166534' },
};

const MisConsultas = () => {
  const { usuario } = useAuth();
  const [consultas, setConsultas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!usuario) return;
    listarConsultasPorUsuario(usuario.id)
      .then(setConsultas)
      .catch(() => setError('No se pudieron cargar tus consultas.'))
      .finally(() => setCargando(false));
  }, [usuario]);

  return (
    <div style={{ padding: '40px 5%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: '#1F2937', fontSize: 26, fontWeight: 700 }}>Mis consultas</h2>
        <Link to="/nueva-consulta" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 20px' }}>
          + Nueva consulta
        </Link>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16 }}>{error}</div>}

      {cargando ? (
        <p style={{ color: '#6b7280' }}>Cargando...</p>
      ) : consultas.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 16, padding: 48, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#6b7280', marginBottom: 16 }}>Aún no tienes consultas registradas.</p>
          <Link to="/nueva-consulta" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 20px' }}>
            Crear mi primera consulta
          </Link>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['N°', 'Especialidad', 'Síntomas', 'Estado', 'Fecha cita', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {consultas.map(c => {
                const badge = BADGE[c.estado] || BADGE.PENDIENTE;
                return (
                  <tr key={c.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>#{c.id}</td>
                    <td style={{ padding: '14px 16px', textTransform: 'capitalize' }}>{c.especialidad}</td>
                    <td style={{ padding: '14px 16px', maxWidth: 180, color: '#6b7280' }}>
                      {c.sintomas ? c.sintomas.slice(0, 50) + (c.sintomas.length > 50 ? '...' : '') : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: badge.bg, color: badge.color, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                        {c.estado}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: 13 }}>
                      {c.fechaCita ? new Date(c.fechaCita).toLocaleDateString('es-CL') : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {(c.estado === 'PENDIENTE' || c.estado === 'AGENDADA') && (
                        <Link to={`/editar-consulta/${c.id}`} style={{ color: '#2563EB', fontWeight: 500, textDecoration: 'none', fontSize: 13 }}>
                          Editar
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MisConsultas;
