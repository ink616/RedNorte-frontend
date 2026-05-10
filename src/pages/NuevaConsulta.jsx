import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { crearConsulta } from '../service/api';

const ESPECIALIDADES = [
  'cardiologia','dermatologia','gastroenterologia','ginecologia',
  'medicina general','neurologia','oftalmologia','ortopedia',
  'otorrinolaringologia','pediatria','psiquiatria','traumatologia','urologia',
];

const NuevaConsulta = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombrePaciente: '', sintomas: '', especialidad: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.especialidad) { setError('Selecciona una especialidad.'); return; }
    setCargando(true);
    try {
      await crearConsulta({ usuarioId: usuario.id, ...form });
      navigate('/mis-consultas');
    } catch {
      setError('Error al crear la consulta. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ padding: '40px 5%', maxWidth: 600 }}>
      <h2 style={{ color: '#1F2937', fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Nueva consulta médica</h2>

      <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#374151' }}>Tu nombre completo</label>
            <input type="text" style={{ width: '100%', padding: 12, border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
              value={form.nombrePaciente} onChange={e => setForm({ ...form, nombrePaciente: e.target.value })}
              placeholder="Ej: Juan Pérez González" required />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#374151' }}>Especialidad médica</label>
            <select style={{ width: '100%', padding: 12, border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
              value={form.especialidad} onChange={e => setForm({ ...form, especialidad: e.target.value })} required>
              <option value="">Selecciona una especialidad...</option>
              {ESPECIALIDADES.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#374151' }}>Describe tus síntomas</label>
            <textarea style={{ width: '100%', padding: 12, border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 14, minHeight: 100, resize: 'vertical', boxSizing: 'border-box' }}
              value={form.sintomas} onChange={e => setForm({ ...form, sintomas: e.target.value })}
              placeholder="Describe detalladamente lo que estás sintiendo..." required />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" className="btn-primary" disabled={cargando}>
              {cargando ? 'Enviando...' : 'Enviar consulta'}
            </button>
            <button type="button" onClick={() => navigate('/mis-consultas')}
              style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #D1D5DB', background: '#fff', cursor: 'pointer', fontSize: 14 }}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevaConsulta;
