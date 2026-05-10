import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rednorte_usuario')); } catch { return null; }
  });

  const iniciarSesion = (u) => {
    setUsuario(u);
    localStorage.setItem('rednorte_usuario', JSON.stringify(u));
  };

  const cerrarSesion = () => {
    setUsuario(null);
    localStorage.removeItem('rednorte_usuario');
  };

  const esAdmin = usuario?.rol?.tag === 'ADMIN';

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion, esAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
