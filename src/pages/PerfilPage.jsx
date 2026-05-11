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

const Tooltip = ({ texto }) => {
  const [visible, setVisible] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-block', marginLeft: 6 }}>
      <span onClick={() => setVisible(!visible)} style={{
        width: 18, height: 18, borderRadius: '50%', background: 'var(--color-background-secondary)',
        border: '1px solid var(--color-border-tertiary)', display: 'inline-flex',
        alignItems: 'center', justifyContent: 'center', fontSize: 11,
        cursor: 'pointer', color: 'var(--color-text-secondary)', fontWeight: 700, userSelect: 'none',
      }}>?</span>
      {visible && (
        <div onClick={() => setVisible(false)} style={{
          position: 'absolute', bottom: 24, left: 0, zIndex: 100, width: 220,
          background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 8, padding: '10px 12px', fontSize: 12,
          color: 'var(--color-text-secondary)', lineHeight: 1.5, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        }}>{texto}</div>
      )}
    </span>
  );
};

const NoSeBtn = ({ onClick }) => (
  <button type="button" onClick={onClick} style={{
    fontSize: 11, color: 'var(--color-text-secondary)', background: 'none',
    border: '0.5px dashed var(--color-border-tertiary)', borderRadius: 20,
    padding: '2px 10px', cursor: 'pointer', marginTop: 4,
  }}>No sé / No tengo este dato</button>
);

const TagSelector = ({ opciones, seleccionados, onChange, placeholder }) => {
  const [input, setInput] = useState('');
  const lista = seleccionados ? seleccionados.split(',').map(s => s.trim()).filter(Boolean) : [];
  const agregar = (item) => { if (!lista.includes(item) && item) onChange([...lista, item].join(', ')); setInput(''); };
  const quitar = (item) => onChange(lista.filter(x => x !== item).join(', '));
  const filtradas = opciones.filter(o => o.toLowerCase().includes(input.toLowerCase()) && !lista.includes(o));
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {lista.map(item => (
          <span key={item} style={{ background: '#E6F1FB', color: '#185FA5', borderRadius: 20, padding: '3px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            {item}<span onClick={() => quitar(item)} style={{ cursor: 'pointer', fontWeight: 700, opacity: 0.7 }}>×</span>
          </span>
        ))}
      </div>
      <input className="form-control" value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && agregar(input)} placeholder={placeholder} style={{ marginBottom: 6 }} />
      {input && filtradas.length > 0 && (
        <div style={{ border: '0.5px solid var(--color-border-tertiary)', borderRadius: 8, background: 'var(--color-background-primary)', maxHeight: 160, overflowY: 'auto' }}>
          {filtradas.slice(0, 6).map(o => (
            <div key={o} onClick={() => agregar(o)} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, borderBottom: '0.5px solid var(--color-border-tertiary)' }}
              onMouseEnter={e => e.target.style.background = 'var(--color-background-secondary)'}
              onMouseLeave={e => e.target.style.background = 'transparent'}>{o}</div>
          ))}
          {!filtradas.find(o => o.toLowerCase() === input.toLowerCase()) && (
            <div onClick={() => agregar(input)} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: '#2563EB' }}>+ Agregar "{input}"</div>
          )}
        </div>
      )}
    </div>
  );
};

export default function PerfilPage() {
  const { usuario } = useAuth();
  const p = usuario?.persona;
  const [vista, setVista] = useState('resumen');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exito, setExito] = useState('');
  const [totalConsultas, setTotalConsultas] = useState(0);
  const [ficha, setFicha] = useState({
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

  const set = k => v => setFicha(f => ({ ...f, [k]: v }));
  const setE = k => e => set(k)(e.target.value);
  const noSe = k => () => set(k)('No lo sé');

  const imc = ficha.estatura && ficha.peso && ficha.estatura > 0
    ? (ficha.peso / ((ficha.estatura/100)**2)).toFixed(1) : null;
  const imcLabel = imc ? (imc<18.5?'Bajo peso':imc<25?'Normal ✅':imc<30?'Sobrepeso':'Obesidad') : null;
  const imcColor = imc ? (imc<18.5?'#F59E0B':imc<25?'#10B981':imc<30?'#F59E0B':'#EF4444') : 'var(--color-text-primary)';

  const completitud = () => {
    const campos = [ficha.telefono,ficha.estatura,ficha.peso,ficha.grupoSanguineo,ficha.alergias,ficha.condicionesCronicas,ficha.emergenciaNombre];
    return Math.round((campos.filter(c=>c&&c!=='').length/campos.length)*100);
  };

  const iniciales = p ? (p.apellido1?.[0]||'')+(p.apellido2?.[0]||'') : usuario?.mail?.[0]?.toUpperCase()||'?';
  const nombre = p ? `${p.apellido1||''} ${p.apellido2||''}`.trim() : usuario?.mail?.split('@')[0]||'Paciente';

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
  const card = { background:'var(--color-background-primary)', border:'0.5px solid var(--color-border-tertiary)', borderRadius:12, padding:'1.25rem', marginBottom:14 };
  const row = { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'0.5px solid var(--color-border-tertiary)', fontSize:14 };
  const tag = (color) => ({ background:color==='red'?'#FCEBEB':color==='amber'?'#FAEEDA':color==='blue'?'#E6F1FB':'#E1F5EE', color:color==='red'?'#A32D2D':color==='amber'?'#854F0B':color==='blue'?'#185FA5':'#0F6E56', borderRadius:20, padding:'3px 12px', fontSize:12, fontWeight:500, display:'inline-block', margin:'2px' });
  const tags = (str, color) => str ? str.split(',').map(s=>s.trim()).filter(Boolean).map(s=><span key={s} style={tag(color)}>{s}</span>) : <span style={{fontSize:13,color:'var(--color-text-secondary)'}}>Sin registrar</span>;

  return (
    <div className="page" style={{ maxWidth:720 }}>

      <div style={{ background:'linear-gradient(135deg,#1e40af,#0f766e)', borderRadius:16, padding:'2rem', marginBottom:16, color:'white', display:'flex', alignItems:'center', gap:20 }}>
        <div style={{ width:80,height:80,borderRadius:'50%',background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,fontWeight:700,flexShrink:0 }}>{iniciales}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:22,fontWeight:600,marginBottom:4 }}>{nombre}</div>
          <div style={{ fontSize:13,opacity:0.8,marginBottom:10 }}>{usuario?.mail}</div>
          <div style={{ display:'flex',gap:8 }}>
            <span style={{ background:'rgba(255,255,255,0.2)',padding:'3px 12px',borderRadius:20,fontSize:12 }}>Paciente activo</span>
            {ficha.grupoSanguineo&&<span style={{ background:'rgba(255,255,255,0.2)',padding:'3px 12px',borderRadius:20,fontSize:12 }}>Grupo {ficha.grupoSanguineo}</span>}
          </div>
        </div>
        <div style={{ textAlign:'center',flexShrink:0 }}>
          <div style={{ fontSize:11,opacity:0.7,marginBottom:4 }}>Perfil completado</div>
          <div style={{ fontSize:36,fontWeight:700 }}>{pct}%</div>
          <div style={{ width:80,height:6,background:'rgba(255,255,255,0.3)',borderRadius:3,marginTop:6 }}>
            <div style={{ width:`${pct}%`,height:'100%',background:'white',borderRadius:3 }}></div>
          </div>
        </div>
      </div>

      {exito && <div className="alert alert-success" style={{ marginBottom:14 }}>✅ {exito}</div>}

      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16 }}>
        {[
          { icon:'📋',num:totalConsultas,label:'Consultas',color:'#2563EB' },
          { icon:'⚖️',num:imc||'—',label:imcLabel||'IMC',color:imcColor },
          { icon:'💊',num:ficha.medicamentosActuales?ficha.medicamentosActuales.split(',').filter(Boolean).length:0,label:'Medicamentos',color:'#F59E0B' },
          { icon:'⚠️',num:ficha.alergias?ficha.alergias.split(',').filter(Boolean).length:0,label:'Alergias',color:'#EF4444' },
        ].map(s=>(
          <div key={s.label} style={{ background:'var(--color-background-secondary)',borderRadius:10,padding:'1rem',textAlign:'center' }}>
            <div style={{ fontSize:22,marginBottom:4 }}>{s.icon}</div>
            <div style={{ fontSize:22,fontWeight:600,color:s.color }}>{s.num}</div>
            <div style={{ fontSize:11,color:'var(--color-text-secondary)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {vista==='resumen' ? (
        <>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14 }}>
            <div style={card}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12 }}>
                <span style={{ fontWeight:500 }}>🩺 Ficha médica</span>
                <button onClick={()=>setVista('editar')} className="btn btn-ghost" style={{ fontSize:12,padding:'4px 12px' }}>Editar</button>
              </div>
              {[['Estatura',ficha.estatura?`${ficha.estatura} cm`:'—'],['Peso',ficha.peso?`${ficha.peso} kg`:'—'],['Presión arterial',ficha.presionArterial||'—'],['Glucosa',ficha.glucosa||'—'],['Frec. cardíaca',ficha.frecuenciaCardiaca||'—']].map(([k,v])=>(
                <div key={k} style={{...row}}><span style={{color:'var(--color-text-secondary)',fontSize:13}}>{k}</span><span>{v}</span></div>
              ))}
            </div>
            <div style={card}>
              <div style={{ fontWeight:500,marginBottom:12 }}>⚠️ Alertas médicas</div>
              <div style={{ marginBottom:10 }}><div style={{ fontSize:12,color:'var(--color-text-secondary)',marginBottom:6 }}>Alergias</div>{tags(ficha.alergias,'red')}</div>
              <div style={{ marginBottom:10 }}><div style={{ fontSize:12,color:'var(--color-text-secondary)',marginBottom:6 }}>Condiciones crónicas</div>{tags(ficha.condicionesCronicas,'amber')}</div>
              <div><div style={{ fontSize:12,color:'var(--color-text-secondary)',marginBottom:6 }}>Medicamentos</div>{tags(ficha.medicamentosActuales,'blue')}</div>
            </div>
          </div>

          <div style={card}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12 }}>
              <span style={{ fontWeight:500 }}>📞 Contacto y emergencia</span>
              <button onClick={()=>setVista('editar')} className="btn btn-ghost" style={{ fontSize:12,padding:'4px 12px' }}>Editar</button>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,fontSize:14 }}>
              <div><div style={{ fontSize:12,color:'var(--color-text-secondary)',marginBottom:4 }}>Teléfono</div><div>{ficha.telefono||'—'}</div></div>
              <div><div style={{ fontSize:12,color:'var(--color-text-secondary)',marginBottom:4 }}>Dirección</div><div>{ficha.direccion||'—'}</div></div>
              <div><div style={{ fontSize:12,color:'var(--color-text-secondary)',marginBottom:4 }}>Emergencia</div><div>{ficha.emergenciaNombre?`${ficha.emergenciaNombre} · ${ficha.emergenciaTelefono}`:'—'}</div></div>
            </div>
          </div>

          {pct<80&&(
            <div className="alert alert-info">
              💡 Tu perfil está al {pct}%. Completar tu información médica ayuda a los médicos a atenderte mejor.
              <button onClick={()=>setVista('editar')} style={{ marginLeft:12,background:'none',border:'none',color:'var(--primary)',cursor:'pointer',fontWeight:600 }}>Completar ahora →</button>
            </div>
          )}
        </>
      ) : (
        <div style={card}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
            <h3 style={{ fontSize:16,fontWeight:500 }}>✏️ Editar información</h3>
            <button onClick={()=>setVista('resumen')} className="btn btn-ghost" style={{ fontSize:12 }}>← Volver</button>
          </div>

          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
            <div className="form-group"><label>Teléfono</label><input className="form-control" value={ficha.telefono} onChange={setE('telefono')} placeholder="+56 9 1234 5678"/></div>
            <div className="form-group"><label>Dirección</label><input className="form-control" value={ficha.direccion} onChange={setE('direccion')} placeholder="Calle, número, ciudad"/></div>

            <div className="form-group">
              <label>Estatura (cm) <Tooltip texto="Tu altura en centímetros. Ej: si mides 1 metro 70, escribe 170."/></label>
              <input type="number" className="form-control" value={ficha.estatura} onChange={setE('estatura')} placeholder="170"/>
              <NoSeBtn onClick={noSe('estatura')}/>
            </div>
            <div className="form-group">
              <label>Peso (kg) <Tooltip texto="Tu peso en kilogramos. Junto con la estatura calcula tu IMC."/></label>
              <input type="number" className="form-control" value={ficha.peso} onChange={setE('peso')} placeholder="70"/>
              <NoSeBtn onClick={noSe('peso')}/>
            </div>
            <div className="form-group">
              <label>Grupo sanguíneo <Tooltip texto="Tu tipo de sangre (0+, A-, AB+, etc.). Lo encuentras en tu carnet de donante o resultados de exámenes."/></label>
              <select className="form-control" value={ficha.grupoSanguineo} onChange={setE('grupoSanguineo')}>
                <option value="">Selecciona...</option>
                {['0+','0-','A+','A-','B+','B-','AB+','AB-'].map(g=><option key={g}>{g}</option>)}
              </select>
              <NoSeBtn onClick={noSe('grupoSanguineo')}/>
            </div>
            <div className="form-group">
              <label>Presión arterial <Tooltip texto="Dos números como '120/80'. Puedes medirla gratis en cualquier farmacia."/></label>
              <input className="form-control" value={ficha.presionArterial} onChange={setE('presionArterial')} placeholder="120/80 mmHg"/>
              <NoSeBtn onClick={noSe('presionArterial')}/>
            </div>
            <div className="form-group">
              <label>Frecuencia cardíaca <Tooltip texto="Cuántas veces late tu corazón por minuto. Pon dos dedos en tu muñeca, cuenta 15 segundos y multiplica por 4."/></label>
              <input className="form-control" value={ficha.frecuenciaCardiaca} onChange={setE('frecuenciaCardiaca')} placeholder="72 bpm"/>
              <NoSeBtn onClick={noSe('frecuenciaCardiaca')}/>
            </div>
            <div className="form-group">
              <label>Glucosa en sangre <Tooltip texto="El nivel de azúcar en sangre. Normal en ayunas: entre 70 y 100 mg/dL. Lo puedes saber con un examen de laboratorio."/></label>
              <input className="form-control" value={ficha.glucosa} onChange={setE('glucosa')} placeholder="90 mg/dL"/>
              <NoSeBtn onClick={noSe('glucosa')}/>
            </div>
          </div>

          <div style={{ marginTop:16 }}>
            <div className="form-group">
              <label>Alergias <Tooltip texto="Sustancias que te causan reacción alérgica: medicamentos, alimentos, materiales, etc."/></label>
              <TagSelector opciones={ALERGIAS_COMUNES} seleccionados={ficha.alergias} onChange={set('alergias')} placeholder="Escribe o selecciona una alergia..."/>
              <NoSeBtn onClick={noSe('alergias')}/>
            </div>
            <div className="form-group">
              <label>Condiciones crónicas <Tooltip texto="Enfermedades de largo plazo que requieren control continuo, como diabetes, hipertensión, asma, etc."/></label>
              <TagSelector opciones={CONDICIONES_COMUNES} seleccionados={ficha.condicionesCronicas} onChange={set('condicionesCronicas')} placeholder="Escribe o selecciona una condición..."/>
              <NoSeBtn onClick={noSe('condicionesCronicas')}/>
            </div>
            <div className="form-group">
              <label>Medicamentos actuales <Tooltip texto="Medicamentos que tomas regularmente. Esta información es clave para evitar interacciones peligrosas."/></label>
              <TagSelector opciones={MEDICAMENTOS_COMUNES} seleccionados={ficha.medicamentosActuales} onChange={set('medicamentosActuales')} placeholder="Escribe o selecciona un medicamento..."/>
              <NoSeBtn onClick={noSe('medicamentosActuales')}/>
            </div>

            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
              <div className="form-group">
                <label>Cirugías previas</label>
                <textarea className="form-control" value={ficha.cirugiasPrevias} onChange={setE('cirugiasPrevias')} placeholder="Ej: Apendicectomía (2015)"/>
                <NoSeBtn onClick={noSe('cirugiasPrevias')}/>
              </div>
              <div className="form-group">
                <label>Antecedentes familiares <Tooltip texto="Enfermedades de tus padres, hermanos o abuelos. Ayuda a identificar riesgos hereditarios."/></label>
                <textarea className="form-control" value={ficha.antecedentesFamiliares} onChange={setE('antecedentesFamiliares')} placeholder="Ej: Padre con diabetes"/>
                <NoSeBtn onClick={noSe('antecedentesFamiliares')}/>
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

            <div style={{ borderTop:'0.5px solid var(--color-border-tertiary)',paddingTop:16,marginTop:8 }}>
              <div style={{ fontWeight:500,marginBottom:12 }}>🆘 Contacto de emergencia</div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14 }}>
                <div className="form-group"><label>Nombre completo</label><input className="form-control" value={ficha.emergenciaNombre} onChange={setE('emergenciaNombre')} placeholder="María Pérez"/></div>
                <div className="form-group"><label>Teléfono</label><input className="form-control" value={ficha.emergenciaTelefono} onChange={setE('emergenciaTelefono')} placeholder="+56 9 8765 4321"/></div>
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

          <div style={{ display:'flex',gap:12,marginTop:20 }}>
            <button className="btn btn-primary" onClick={handleGuardar} disabled={saving}>{saving?'Guardando...':'💾 Guardar cambios'}</button>
            <button className="btn btn-ghost" onClick={()=>setVista('resumen')}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
