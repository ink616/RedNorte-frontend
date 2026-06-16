import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { contarNoLeidas, listarNoLeidas, marcarLeida, marcarTodasLeidas } from '../service/api';

const TIPO_ESTILO = {
  SUCCESS: { color: '#166534', bg: '#dcfce7', icono: '✅' },
  ERROR:   { color: '#991b1b', bg: '#fee2e2', icono: '❌' },
  WARNING: { color: '#854d0e', bg: '#fef9c3', icono: '⚠️' },
  INFO:    { color: '#1e40af', bg: '#dbeafe', icono: 'ℹ️' },
};

export default function NotificationBell() {
  const { usuario } = useAuth();
  const [contador, setContador]           = useState(0);
  const [notifs, setNotifs]               = useState([]);
  const [abierto, setAbierto]             = useState(false);
  const [cargando, setCargando]           = useState(false);
  const ref = useRef(null);

  // Polling cada 30 segundos
  useEffect(() => {
    if (!usuario?.id) return;

    const fetchContador = () => {
      contarNoLeidas(usuario.id)
        .then(data => setContador(data.noLeidas ?? 0))
        .catch(() => {});
    };

    fetchContador();
    const intervalo = setInterval(fetchContador, 30000);
    return () => clearInterval(intervalo);
  }, [usuario]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleAbrir = async () => {
    if (!abierto) {
      setCargando(true);
      try {
        const data = await listarNoLeidas(usuario.id);
        setNotifs(Array.isArray(data) ? data : []);
      } catch {
        setNotifs([]);
      } finally {
        setCargando(false);
      }
    }
    setAbierto(o => !o);
  };

  const handleMarcarLeida = async (id) => {
    await marcarLeida(id).catch(() => {});
    setNotifs(prev => prev.filter(n => n.id !== id));
    setContador(c => Math.max(0, c - 1));
  };

  const handleMarcarTodas = async () => {
    await marcarTodasLeidas(usuario.id).catch(() => {});
    setNotifs([]);
    setContador(0);
  };

  const formatTiempo = (fecha) => {
    if (!fecha) return '';
    const diff = Date.now() - new Date(fecha).getTime();
    const min  = Math.floor(diff / 60000);
    const hrs  = Math.floor(min / 60);
    const dias = Math.floor(hrs / 24);
    if (dias > 0)  return `hace ${dias}d`;
    if (hrs > 0)   return `hace ${hrs}h`;
    if (min > 0)   return `hace ${min}m`;
    return 'ahora';
  };

  return (
    <div className="notif-wrap" ref={ref}>
      {/* Campana */}
      <button className="notif-bell-btn" onClick={handleAbrir} title="Notificaciones">
        🔔
        {contador > 0 && (
          <span className="notif-badge">{contador > 9 ? '9+' : contador}</span>
        )}
      </button>

      {/* Dropdown */}
      {abierto && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <span className="notif-dropdown-title">Notificaciones</span>
            {notifs.length > 0 && (
              <button className="notif-marcar-todas" onClick={handleMarcarTodas}>
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="notif-lista">
            {cargando ? (
              <div className="notif-vacio">Cargando...</div>
            ) : notifs.length === 0 ? (
              <div className="notif-vacio">
                <span>🎉</span>
                <p>Sin notificaciones pendientes</p>
              </div>
            ) : (
              notifs.map(n => {
                const estilo = TIPO_ESTILO[n.tipo] ?? TIPO_ESTILO.INFO;
                return (
                  <div key={n.id} className="notif-item">
                    <div
                      className="notif-item-icono"
                      style={{ background: estilo.bg, color: estilo.color }}
                    >
                      {estilo.icono}
                    </div>
                    <div className="notif-item-contenido">
                      <p className="notif-item-titulo">{n.titulo}</p>
                      <p className="notif-item-mensaje">{n.mensaje}</p>
                      <span className="notif-item-tiempo">{formatTiempo(n.fechaCreacion)}</span>
                    </div>
                    <button
                      className="notif-item-cerrar"
                      onClick={() => handleMarcarLeida(n.id)}
                      title="Marcar como leída"
                    >
                      ✕
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}