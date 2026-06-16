import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { obtenerFicha, guardarFicha, listarConsultasPorUsuario } from '../service/api';

const MEDICAMENTOS_COMUNES = [
  'Paracetamol 500mg','Ibuprofeno 400mg','Aspirina 100mg','Amoxicilina 500mg',
  'Metformina 500mg','Enalapril 10mg','Atorvastatina 20mg','Omeprazol 20mg',
  'Losartán 50mg','Amlodipino 5mg','Metoprolol 50mg','Salbutamol inhalador',
  'Levotiroxina 50mcg','Sertralina 50mg','Alprazolam 0.5mg','Clonazepam 0.5mg',
];
const ALERGIAS_COMUNES = [
  'Penicilina','Amoxicilina','Ibuprofeno','Aspirina','Sulfa','Látex','Polen',
  'Mariscos','Nueces','Gluten','Lactosa','Ácaros',
];
const CONDICIONES_COMUNES = [
  'Hipertensión','Diabetes tipo 1','Diabetes tipo 2','Asma','Hipotiroidismo',
  'Hipertiroidismo','Artritis','Osteoporosis','Depresión','Ansiedad',
  'Epilepsia','Insuficiencia renal','Enfermedad coronaria',
];

/* ── Tooltip ─────────────────────────────────────────── */
const Tooltip = ({ texto }) => {
  const [visible, setVisible] = useState(false);
  return (
    <span className="tooltip-wrap">
      <span onClick={() => setVisible(!visible)} className="tooltip-btn">?</span>
      {visible && (
        <div onClick={() => setVisible(false)} className="tooltip-popup">{texto}</div>
      )}
    </span>
  );
};

/* ── No sé button ────────────────────────────────────── */
const NoSeBtn = ({ onClick }) => (
  <button type="button" onClick={onClick} className="no-se-btn">No sé / No tengo este dato</button>
);

/* ── Tag selector ────────────────────────────────────── */
const TagSelector = ({ opciones, seleccionados, onChange, placeholder }) => {
  const [input, setInput] = useState('');
  const lista = seleccionados ? seleccionados.split(',').map(s => s.trim()).filter(Boolean) : [];
  const agregar = (item) => { if (!lista.includes(item) && item) onChange([...lista, item].join(', ')); setInput(''); };
  const quitar  = (item) => onChange(lista.filter(x => x !== item).join(', '));
  const filtradas = opciones.filter(o => o.toLowerCase().includes(input.toLowerCase()) && !lista.includes(o));
  return (
    <div>
      <div className="tag-selector-tags">
        {lista.map(item => (
          <span key={item} className="tag-selected">
            {item}<span onClick={() => quitar(item)} className="tag-remove">×</span>
          </span>
        ))}
      </div>
      <input className="form-control" value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && agregar(input)} placeholder={placeholder}
        style={{ marginBottom: 6 }} />
      {input && filtradas.length > 0 && (
        <div className="tag-sugerencias">
          {filtradas.slice(0, 6).map(o => (
            <div key={o} onClick={() => agregar(o)} className="tag-sugerencia">{o}</div>
          ))}
          {!filtradas.find(o => o.toLowerCase() === input.toLowerCase()) && (
            <div onClick={() => agregar(input)} className="tag-agregar">+ Agregar "{input}"</div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Tags display ────────────────────────────────────── */
const Tags = ({ str, color }) => {
  if (!str) return <span className="perfil-tag-empty">Sin registrar</span>;
  return str.split(',').map(s => s.trim()).filter(Boolean)
    .map(s => <span key={s} className={`perfil-tag-${color}`}>{s}</span>);
};

/* ── Página ──────────────────────────────────────────── */
export default function PerfilPage() {
  const { usuario } = useAuth();
  const p = usuario?.persona;
  const [vista, setVista]               = useState('resumen');
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [exito, setExito]               = useState('');
  const [totalConsultas, setTotalConsultas] = useState(0);
  const [ficha, setFicha]               = useState({
    telefono:'',direccion:'',estatura:'',peso:'',grupoSanguineo:'',presionArterial:'',
    frecuenciaCardiaca:'',glucosa:'',alergias:'',condicionesCronicas:'',medicamentosActuales:'',
    cirugiasPrevias:'',antecedentesFamiliares:'',habitoTabaco:'',habitoAlcohol:'',
    emergenciaNombre:'',emergenciaTelefono:'',emergenciaRelacion:'',
  });

  useEffect(() => {
    if (!usuario?.id) return;
    Promise.all([
      obtenerFicha(usuario.id),
      listarConsultasPorUsuario(usuario.id).catch(() => []),
    ]).then(([data, consultas]) => {
      if (data) setFicha(f => ({ ...f, ...data }));
      setTotalConsultas(Array.isArray(consultas) ? consultas.length : 0);
    }).finally(() => setLoading(false));
  }, [usuario]);

  const set  = k => v => setFicha(f => ({ ...f, [k]: v }));
  const setE = k => e => set(k)(e.target.value);
  const noSe = k => () => set(k)('No lo sé');

  const imc      = ficha.estatura && ficha.peso && ficha.estatura > 0
    ? (ficha.peso / ((ficha.estatura / 100) ** 2)).toFixed(1) : null;
  const imcLabel = imc ? (imc < 18.5 ? 'Bajo peso' : imc < 25 ? 'Normal ✅' : imc < 30 ? 'Sobrepeso' : 'Obesidad') : null;
  const imcColor = imc ? (imc < 18.5 ? '#F59E0B' : imc < 25 ? '#10B981' : imc < 30 ? '#F59E0B' : '#EF4444') : 'var(--color-text-primary)';

  const completitud = () => {
    const campos = [ficha.telefono,ficha.estatura,ficha.peso,ficha.grupoSanguineo,ficha.alergias,ficha.condicionesCronicas,ficha.emergenciaNombre];
    return Math.round((campos.filter(c => c && c !== '').length / campos.length) * 100);
  };

  const iniciales = p ? (p.apellido1?.[0] || '') + (p.apellido2?.[0] || '') : usuario?.mail?.[0]?.toUpperCase() || '?';
  const nombre    = p ? `${p.apellido1 || ''} ${p.apellido2 || ''}`.trim() : usuario?.mail?.split('@')[0] || 'Paciente';

  const handleGuardar = async () => {
    setSaving(true); setExito('');
    try {
      await guardarFicha(usuario.id, ficha);
      setExito('Cambios guardados correctamente.');
      setTimeout(() => { setExito(''); setVista('resumen'); }, 2000);
    } catch {} finally { setSaving(false); }
  };

  if (loading) return <div className="spinner">Cargando perfil...</div>;

  const pct = completitud();

  return (
    <div className="page perfil-page">

      {/* Header */}
      <div className="perfil-header">
        <div className="perfil-avatar">{iniciales}</div>
        <div className="perfil-header-info">
          <div className="perfil-nombre">{nombre}</div>
          <div className="perfil-mail">{usuario?.mail}</div>
          <div className="perfil-badges">
            <span className="perfil-badge-pill">Paciente activo</span>
            {ficha.grupoSanguineo && <span className="perfil-badge-pill">Grupo {ficha.grupoSanguineo}</span>}
          </div>
        </div>
        <div className="perfil-completitud">
          <div className="perfil-completitud-label">Perfil completado</div>
          <div className="perfil-completitud-num">{pct}%</div>
          <div className="perfil-barra-wrap">
            <div className="perfil-barra-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {exito && <div className="alert alert-success mb-24">✅ {exito}</div>}

      {/* Stats */}
      <div className="perfil-stats-grid">
        {[
          { icon: '📋', num: totalConsultas,   label: 'Consultas',   color: '#2563EB' },
          { icon: '⚖️', num: imc || '—',       label: imcLabel || 'IMC', color: imcColor },
          { icon: '💊', num: ficha.medicamentosActuales ? ficha.medicamentosActuales.split(',').filter(Boolean).length : 0, label: 'Medicamentos', color: '#F59E0B' },
          { icon: '⚠️', num: ficha.alergias ? ficha.alergias.split(',').filter(Boolean).length : 0, label: 'Alergias', color: '#EF4444' },
        ].map(s => (
          <div key={s.label} className="perfil-stat-card">
            <div className="perfil-stat-icon">{s.icon}</div>
            <div className="perfil-stat-num" style={{ color: s.color }}>{s.num}</div>
            <div className="perfil-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {vista === 'resumen' ? (
        <>
          <div className="perfil-resumen-grid">
            <div className="perfil-card">
              <div className="perfil-card-header">
                <span className="perfil-card-titulo">🩺 Ficha médica</span>
                <button onClick={() => setVista('editar')} className="btn btn-ghost btn-sm">Editar</button>
              </div>
              {[
                ['Estatura',      ficha.estatura ? `${ficha.estatura} cm` : '—'],
                ['Peso',          ficha.peso     ? `${ficha.peso} kg`     : '—'],
                ['Presión arterial', ficha.presionArterial   || '—'],
                ['Glucosa',          ficha.glucosa           || '—'],
                ['Frec. cardíaca',   ficha.frecuenciaCardiaca|| '—'],
              ].map(([k, v]) => (
                <div key={k} className="perfil-row">
                  <span className="perfil-row-label">{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>

            <div className="perfil-card">
              <div className="perfil-card-titulo" style={{ marginBottom: 12 }}>⚠️ Alertas médicas</div>
              <div className="perfil-alerta-grupo">
                <div className="perfil-alerta-titulo">Alergias</div>
                <Tags str={ficha.alergias} color="red" />
              </div>
              <div className="perfil-alerta-grupo">
                <div className="perfil-alerta-titulo">Condiciones crónicas</div>
                <Tags str={ficha.condicionesCronicas} color="amber" />
              </div>
              <div>
                <div className="perfil-alerta-titulo">Medicamentos</div>
                <Tags str={ficha.medicamentosActuales} color="blue" />
              </div>
            </div>
          </div>

          <div className="perfil-card">
            <div className="perfil-card-header">
              <span className="perfil-card-titulo">📞 Contacto y emergencia</span>
              <button onClick={() => setVista('editar')} className="btn btn-ghost btn-sm">Editar</button>
            </div>
            <div className="perfil-contacto-grid">
              <div><div className="perfil-contacto-label">Teléfono</div><div>{ficha.telefono || '—'}</div></div>
              <div><div className="perfil-contacto-label">Dirección</div><div>{ficha.direccion || '—'}</div></div>
              <div><div className="perfil-contacto-label">Emergencia</div><div>{ficha.emergenciaNombre ? `${ficha.emergenciaNombre} · ${ficha.emergenciaTelefono}` : '—'}</div></div>
            </div>
          </div>

          {pct < 80 && (
            <div className="alert alert-info">
              💡 Tu perfil está al {pct}%. Completar tu información médica ayuda a los médicos a atenderte mejor.
              <button onClick={() => setVista('editar')}
                style={{ marginLeft: 12, background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
                Completar ahora →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="perfil-card">
          <div className="perfil-editor-header">
            <h3 className="perfil-editor-titulo">✏️ Editar información</h3>
            <button onClick={() => setVista('resumen')} className="btn btn-ghost btn-sm">← Volver</button>
          </div>

          <div className="perfil-editor-grid">
            <div className="form-group"><label>Teléfono</label><input className="form-control" value={ficha.telefono} onChange={setE('telefono')} placeholder="+56 9 1234 5678" /></div>
            <div className="form-group"><label>Dirección</label><input className="form-control" value={ficha.direccion} onChange={setE('direccion')} placeholder="Calle, número, ciudad" /></div>

            <div className="form-group">
              <label>Estatura (cm) <Tooltip texto="Tu altura en centímetros. Ej: si mides 1 metro 70, escribe 170." /></label>
              <input type="number" className="form-control" value={ficha.estatura} onChange={setE('estatura')} placeholder="170" />
              <NoSeBtn onClick={noSe('estatura')} />
            </div>
            <div className="form-group">
              <label>Peso (kg) <Tooltip texto="Tu peso en kilogramos. Junto con la estatura calcula tu IMC." /></label>
              <input type="number" className="form-control" value={ficha.peso} onChange={setE('peso')} placeholder="70" />
              <NoSeBtn onClick={noSe('peso')} />
            </div>
            <div className="form-group">
              <label>Grupo sanguíneo <Tooltip texto="Tu tipo de sangre (0+, A-, AB+, etc.). Lo encuentras en tu carnet de donante o resultados de exámenes." /></label>
              <select className="form-control" value={ficha.grupoSanguineo} onChange={setE('grupoSanguineo')}>
                <option value="">Selecciona...</option>
                {['0+','0-','A+','A-','B+','B-','AB+','AB-'].map(g => <option key={g}>{g}</option>)}
              </select>
              <NoSeBtn onClick={noSe('grupoSanguineo')} />
            </div>
            <div className="form-group">
              <label>Presión arterial <Tooltip texto="Dos números como '120/80'. Puedes medirla gratis en cualquier farmacia." /></label>
              <input className="form-control" value={ficha.presionArterial} onChange={setE('presionArterial')} placeholder="120/80 mmHg" />
              <NoSeBtn onClick={noSe('presionArterial')} />
            </div>
            <div className="form-group">
              <label>Frecuencia cardíaca <Tooltip texto="Cuántas veces late tu corazón por minuto. Pon dos dedos en tu muñeca, cuenta 15 segundos y multiplica por 4." /></label>
              <input className="form-control" value={ficha.frecuenciaCardiaca} onChange={setE('frecuenciaCardiaca')} placeholder="72 bpm" />
              <NoSeBtn onClick={noSe('frecuenciaCardiaca')} />
            </div>
            <div className="form-group">
              <label>Glucosa en sangre <Tooltip texto="El nivel de azúcar en sangre. Normal en ayunas: entre 70 y 100 mg/dL. Lo puedes saber con un examen de laboratorio." /></label>
              <input className="form-control" value={ficha.glucosa} onChange={setE('glucosa')} placeholder="90 mg/dL" />
              <NoSeBtn onClick={noSe('glucosa')} />
            </div>
          </div>

          <div className="perfil-editor-extras">
            <div className="form-group">
              <label>Alergias <Tooltip texto="Sustancias que te causan reacción alérgica: medicamentos, alimentos, materiales, etc." /></label>
              <TagSelector opciones={ALERGIAS_COMUNES} seleccionados={ficha.alergias} onChange={set('alergias')} placeholder="Escribe o selecciona una alergia..." />
              <NoSeBtn onClick={noSe('alergias')} />
            </div>
            <div className="form-group">
              <label>Condiciones crónicas <Tooltip texto="Enfermedades de largo plazo que requieren control continuo, como diabetes, hipertensión, asma, etc." /></label>
              <TagSelector opciones={CONDICIONES_COMUNES} seleccionados={ficha.condicionesCronicas} onChange={set('condicionesCronicas')} placeholder="Escribe o selecciona una condición..." />
              <NoSeBtn onClick={noSe('condicionesCronicas')} />
            </div>
            <div className="form-group">
              <label>Medicamentos actuales <Tooltip texto="Medicamentos que tomas regularmente. Esta información es clave para evitar interacciones peligrosas." /></label>
              <TagSelector opciones={MEDICAMENTOS_COMUNES} seleccionados={ficha.medicamentosActuales} onChange={set('medicamentosActuales')} placeholder="Escribe o selecciona un medicamento..." />
              <NoSeBtn onClick={noSe('medicamentosActuales')} />
            </div>

            <div className="perfil-editor-grid">
              <div className="form-group">
                <label>Cirugías previas</label>
                <textarea className="form-control" value={ficha.cirugiasPrevias} onChange={setE('cirugiasPrevias')} placeholder="Ej: Apendicectomía (2015)" />
                <NoSeBtn onClick={noSe('cirugiasPrevias')} />
              </div>
              <div className="form-group">
                <label>Antecedentes familiares <Tooltip texto="Enfermedades de tus padres, hermanos o abuelos. Ayuda a identificar riesgos hereditarios." /></label>
                <textarea className="form-control" value={ficha.antecedentesFamiliares} onChange={setE('antecedentesFamiliares')} placeholder="Ej: Padre con diabetes" />
                <NoSeBtn onClick={noSe('antecedentesFamiliares')} />
              </div>
              <div className="form-group">
                <label>Hábito tabaco</label>
                <select className="form-control" value={ficha.habitoTabaco} onChange={setE('habitoTabaco')}>
                  <option value="">Selecciona...</option>
                  <option>No fumador</option><option>Ex fumador</option>
                  <option>Fumador ocasional</option><option>Fumador frecuente</option>
                </select>
              </div>
              <div className="form-group">
                <label>Consumo de alcohol</label>
                <select className="form-control" value={ficha.habitoAlcohol} onChange={setE('habitoAlcohol')}>
                  <option value="">Selecciona...</option>
                  <option>No consume</option><option>Ocasional</option>
                  <option>Moderado</option><option>Frecuente</option>
                </select>
              </div>
            </div>

            <div className="perfil-editor-sep">
              <div className="perfil-emergencia-titulo">🆘 Contacto de emergencia</div>
              <div className="perfil-emergencia-grid">
                <div className="form-group"><label>Nombre completo</label><input className="form-control" value={ficha.emergenciaNombre} onChange={setE('emergenciaNombre')} placeholder="María Pérez" /></div>
                <div className="form-group"><label>Teléfono</label><input className="form-control" value={ficha.emergenciaTelefono} onChange={setE('emergenciaTelefono')} placeholder="+56 9 8765 4321" /></div>
                <div className="form-group">
                  <label>Relación</label>
                  <select className="form-control" value={ficha.emergenciaRelacion} onChange={setE('emergenciaRelacion')}>
                    <option value="">Selecciona...</option>
                    <option>Familiar</option><option>Cónyuge</option>
                    <option>Pareja</option><option>Amigo/a</option><option>Otro</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="perfil-btns">
            <button className="btn btn-primary" onClick={handleGuardar} disabled={saving}>{saving ? 'Guardando...' : '💾 Guardar cambios'}</button>
            <button className="btn btn-ghost" onClick={() => setVista('resumen')}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
