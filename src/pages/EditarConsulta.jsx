import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obtenerConsulta, editarConsultaPaciente } from '../service/api';

const EditarConsulta = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consulta, setConsulta] = useState(null);
  const [form, setForm] = useState({ nombrePaciente: '', sintomas: '' });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerConsulta(id)
      .then(c => { setConsulta(c); setForm({ nombrePaciente: c.nombrePaciente || '', sintomas: c.sintomas || '' }); })
      .catch(() => setError('No se pudo cargar la consulta.'))
      .finally(() => setCargando(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(''); setExito('');
    try {
      await editarConsultaPaciente(id, form);
      setExito('Consulta actualizada correctamente.');
    } catch {
      setError('Error al guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div style={{ padding: '40px 5%', color: '#6b7280' }}>Cargando...</div>;

  return (
    <div style={{ padding: '40px 5%', maxWidth: 560 }}>
      <h2 style={{ color: '#1F2937', fontSize: 26, fontWeight: 700, marginBottom: 24 }}>
        Editar consulta #{id}
      </h2>
      <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        {error  && <div style={{ background: '#fee2e2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}
        {exito  && <div style={{ background: '#d1fae5', color: '#065f46', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{exito}</div>}

        {consulta && (
          <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#374151' }}>
            <strong>Especialidad:</strong> {consulta.especialidad} &nbsp;|&nbsp; <strong>Estado:</strong> {consulta.estado}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#374151' }}>Tu nombre completo</label>
            <input type="text" style={{ width: '100%', padding: 12, border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
              value={form.nombrePaciente} onChange={e => setForm({ ...form, nombrePaciente: e.target.value })} required />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#374151' }}>Síntomas</label>
            <textarea style={{ width: '100%', padding: 12, border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 14, minHeight: 100, resize: 'vertical', boxSizing: 'border-box' }}
              value={form.sintomas} onChange={e => setForm({ ...form, sintomas: e.target.value })} required />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" className="btn-primary" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button type="button" onClick={() => navigate('/mis-consultas')}
              style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #D1D5DB', background: '#fff', cursor: 'pointer', fontSize: 14 }}>
              Volver
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarConsulta;
