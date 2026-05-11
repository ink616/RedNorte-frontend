import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

function extraerUsuario(texto) {
  try {
    const id = texto.match(/"id":"(USR[^"]+)"/)?.[1];
    const mail = texto.match(/"mail":"([^"]+)"/)?.[1];
    const estado = texto.match(/"estado":"([^"]+)"/)?.[1];
    const fechaRegistro = texto.match(/"fechaRegistro":"([^"]+)"/)?.[1];
    const rolTag = texto.match(/"tag":"([^"]+)"/)?.[1];
    const rolNombre = texto.match(/"nombre":"([^"]+)"/)?.[1];
    const rolId = texto.match(/"id":"(ROL[^"]+)"/)?.[1];
    const pId = texto.match(/"id":"(PER[^"]+)"/)?.[1];
    const apellido1 = texto.match(/"apellido1":"([^"]+)"/)?.[1];
    const apellido2 = texto.match(/"apellido2":"([^"]+)"/)?.[1];
    const rut = texto.match(/"rut":"([^"]+)"/)?.[1];
    const fechaNacimiento = texto.match(/"fechaNacimiento":"([^"]+)"/)?.[1];
    const sexo = texto.match(/"sexo":"([^"]+)"/)?.[1];
    if (!id) return null;
    return {
      id, mail, estado, fechaRegistro,
      rol: rolTag ? { id: rolId, tag: rolTag, nombre: rolNombre } : null,
      persona: pId ? { id: pId, apellido1, apellido2, rut, fechaNacimiento, sexo } : null,
    };
  } catch { return null; }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const raw = localStorage.getItem('rednorte_usuario');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch { return null; }
  });

  const iniciarSesion = (u) => {
    let limpio;
    if (typeof u === 'string') {
      limpio = extraerUsuario(u);
    } else {
      const txt = JSON.stringify(u).slice(0, 3000);
      limpio = extraerUsuario(txt);
    }
    setUsuario(limpio);
    localStorage.setItem('rednorte_usuario', JSON.stringify(limpio));
  };

  const cerrarSesion = () => {
    setUsuario(null);
    localStorage.removeItem('rednorte_usuario');
  };

  const esAdmin  = usuario?.rol?.tag === 'ADMIN';
  const esDoctor = usuario?.rol?.tag === 'DOCTOR';

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion, esAdmin, esDoctor }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
