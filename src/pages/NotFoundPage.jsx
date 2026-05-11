import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFoundPage() {
  const { usuario, esAdmin } = useAuth();
  const navigate = useNavigate();

  const inicio = usuario ? (esAdmin ? '/admin/dashboard' : '/inicio') : '/';

  return (
    <div style={{
      minHeight: '80vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem',
    }}>
      <img src="/logo.png" alt="RedNorte" style={{ height: 80, marginBottom: 24, opacity: 0.4 }} />

      <div style={{ fontSize: 96, fontWeight: 900, color: 'var(--primary)', lineHeight: 1, marginBottom: 8 }}>404</div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: 'var(--color-text-primary)' }}>
        Página no encontrada
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, maxWidth: 400, marginBottom: 32, lineHeight: 1.7 }}>
        Lo sentimos, la página que buscas no existe o fue movida. Verifica la URL o vuelve al inicio.
      </p>

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{
          background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 20, padding: '10px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 500,
          color: 'var(--color-text-primary)',
        }}>← Volver</button>
        <Link to={inicio} style={{
          background: 'linear-gradient(135deg, #2563EB, #0D9488)', color: 'white',
          borderRadius: 20, padding: '10px 24px', fontSize: 14, fontWeight: 600, textDecoration: 'none',
        }}>Ir al inicio</Link>
      </div>
    </div>
  );
}
