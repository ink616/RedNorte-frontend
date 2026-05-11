import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { crearConsulta } from '../service/api';

const ESPECIALIDADES = [
  'cardiologia','dermatologia','gastroenterologia','ginecologia',
  'medicina general','neurologia','oftalmologia','ortopedia',
  'otorrinolaringologia','pediatria','psiquiatria','traumatologia','urologia'
];

export default function NuevaConsultaPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombrePaciente: '', especialidad: '', sintomas: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.especialidad) { setError('Selecciona una especialidad.'); return; }
    setLoading(true);
    try {
      await crearConsulta({
        usuarioId: usuario.id,
        nombrePaciente: form.nombrePaciente,
        especialidad: form.especialidad,
        sintomas: form.sintomas,
      });
      navigate('/mis-consultas');
    } catch {
      setError('Error al crear la consulta. Intenta de nuevo.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <h2 className="page-title">📋 Nueva consulta médica</h2>

      <div className="card">
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <div className="alert alert-info">
          💡 Describe tus síntomas con detalle para que podamos asignarte el médico más adecuado.
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tu nombre completo</label>
            <input className="form-control" value={form.nombrePaciente}
              onChange={e => setForm({ ...form, nombrePaciente: e.target.value })}
              placeholder="Ej: Juan Pérez González" required />
          </div>

          <div className="form-group">
            <label>Especialidad médica</label>
            <select className="form-control" value={form.especialidad}
              onChange={e => setForm({ ...form, especialidad: e.target.value })} required>
              <option value="">Selecciona una especialidad...</option>
              {ESPECIALIDADES.map(e => (
                <option key={e} value={e}>
                  {e.charAt(0).toUpperCase() + e.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Descripción de síntomas</label>
            <textarea className="form-control" value={form.sintomas}
              onChange={e => setForm({ ...form, sintomas: e.target.value })}
              placeholder="Describe detalladamente tus síntomas..."
              style={{ minHeight: 120 }} required />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Enviando...' : '✅ Enviar consulta'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/mis-consultas')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}