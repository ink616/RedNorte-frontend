import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function PerfilPage() {
  const { usuario } = useAuth();
  const p = usuario?.persona;

  const campo = (label, valor) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15, color: 'var(--text)', fontWeight: 500 }}>{valor || '—'}</div>
    </div>
  );

  return (
    <div className="page" style={{ maxWidth: 600 }}>
      <h2 className="page-title">👤 Mi perfil</h2>

      {/* Avatar */}
      <div className="card" style={{ textAlign: 'center', marginBottom: 20, padding: 32 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--teal))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', fontSize: 32, color: 'white', fontWeight: 700
        }}>
          {p?.apellido1?.charAt(0) || usuario?.mail?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <h3 style={{ fontSize: 20, marginBottom: 4 }}>
          {p ? `${p.apellido1} ${p.apellido2 || ''}` : 'Paciente'}
        </h3>
        <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>
          {usuario?.rol?.nombre || 'Paciente'}
        </span>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--text)' }}>Datos personales</h3>
        <div className="grid-2">
          {campo('Primer apellido', p?.apellido1)}
          {campo('Segundo apellido', p?.apellido2)}
          {campo('RUT', p?.rut)}
          {campo('Fecha de nacimiento', p?.fechaNacimiento)}
          {campo('Sexo', p?.sexo === 'M' ? 'Masculino' : p?.sexo === 'F' ? 'Femenino' : p?.sexo)}
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>Datos de acceso</h3>
        {campo('Correo electrónico', usuario?.mail)}
        {campo('Estado de cuenta', usuario?.estado)}
        {campo('Fecha de registro', usuario?.fechaRegistro ? new Date(usuario.fechaRegistro).toLocaleDateString('es-CL') : null)}

        <div className="alert alert-info" style={{ marginTop: 16 }}>
          💡 Para modificar tus datos personales, contacta al administrador del sistema.
        </div>
      </div>
    </div>
  );
}
