import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listarConsultasPorUsuario } from '../service/api';
import Badge from '../components/Badge';

export default function MisConsultasPage() {
  const { usuario } = useAuth();
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listarConsultasPorUsuario(usuario.id)
      .then(setConsultas)
      .catch(() => setError('No se pudieron cargar tus consultas.'))
      .finally(() => setLoading(false));
  }, [usuario]);

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 className="page-title" style={{ margin: 0 }}>📋 Mis consultas</h2>
        <Link to="/nueva-consulta" className="btn btn-primary">+ Nueva consulta</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner">Cargando tus consultas...</div>
      ) : consultas.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 56 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <h3 style={{ marginBottom: 8 }}>No tienes consultas aún</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Crea tu primera consulta médica</p>
          <Link to="/nueva-consulta" className="btn btn-primary">Crear consulta</Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="tabla">
            <thead>
              <tr>
                <th>N°</th><th>Especialidad</th><th>Síntomas</th>
                <th>Estado</th><th>Fecha cita</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {consultas.map(c => (
                <tr key={c.id}>
                  <td><strong>#{c.id}</strong></td>
                  <td style={{ textTransform: 'capitalize', fontWeight: 500 }}>{c.especialidad}</td>
                  <td style={{ maxWidth: 200, color: 'var(--text-muted)', fontSize: 13 }}>
                    {c.sintomas ? c.sintomas.slice(0, 60) + (c.sintomas.length > 60 ? '…' : '') : '—'}
                  </td>
                  <td><Badge estado={c.estado} /></td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {c.fechaCita
                      ? new Date(c.fechaCita).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : <span style={{ color: 'var(--warning)', fontWeight: 500 }}>Sin asignar</span>}
                  </td>
                  <td>
                    {(c.estado === 'PENDIENTE' || c.estado === 'AGENDADA') && (
                      <Link to={`/editar-consulta/${c.id}`} className="btn btn-ghost btn-sm">✏️ Editar</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
