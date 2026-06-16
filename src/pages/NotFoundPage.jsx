import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFoundPage() {
  const { usuario, esAdmin } = useAuth();
  const navigate = useNavigate();

  const inicio = usuario ? (esAdmin ? '/admin/dashboard' : '/inicio') : '/';

  return (
    <div className="not-found-page">
      <img src="/logo.png" alt="RedNorte" className="not-found-logo" />

      <div className="not-found-code">404</div>
      <h2 className="not-found-title">Página no encontrada</h2>
      <p className="not-found-desc">
        Lo sentimos, la página que buscas no existe o fue movida. Verifica la URL o vuelve al inicio.
      </p>

      <div className="not-found-btns">
        <button onClick={() => navigate(-1)} className="not-found-back">← Volver</button>
        <Link to={inicio} className="not-found-home">Ir al inicio</Link>
      </div>
    </div>
  );
}
