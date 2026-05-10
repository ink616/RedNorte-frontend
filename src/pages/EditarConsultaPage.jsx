import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obtenerConsulta, editarConsultaPaciente } from '../service/api';
import Badge from '../components/Badge';

export default function EditarConsultaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consulta, setConsulta] = useState(null);
  const [form, setForm] = useState({ nombrePaciente: '', sintomas: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [exito, setExito]     = useState('');

  useEffect(() => {
    obtenerConsulta(id)
      .then(c => { setConsulta(c); setForm({ nombrePaciente: c.nombrePaciente || '', sintomas: c.sintomas || '' }); })
      .catch(() => setError('No se pudo cargar la consulta.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setExito('');
    try {
      await editarConsultaPaciente(id, form);
      setExito('✅ Consulta actualizada correctamente.');
    } catch { setError('Error al guardar los cambios.');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="spinner">Cargando...</div>;

  return (
    <div className="page" style={{ maxWidth: 580 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <h2 className="page-title" style={{ margin: 0 }}>✏️ Editar consulta #{id}</h2>
        {consulta && <Badge estado={consulta.estado} />}
      </div>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        {exito && <div className="alert alert-success">{exito}</div>}

        {consulta && (
          <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: 'var(--text-soft)' }}>
            <strong>Especialidad:</strong> {consulta.especialidad}
            {consulta.fechaCita && <span style={{ marginLeft: 16 }}><strong>Cita:</strong> {new Date(consulta.fechaCita).toLocaleDateString('es-CL')}</span>}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tu nombre completo</label>
            <input className="form-control" value={form.nombrePaciente}
              onChange={e => setForm({ ...form, nombrePaciente: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Descripción de síntomas</label>
            <textarea className="form-control" value={form.sintomas}
              onChange={e => setForm({ ...form, sintomas: e.target.value })} required />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : '💾 Guardar cambios'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/mis-consultas')}>
              Volver
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
