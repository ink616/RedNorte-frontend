import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const raw = localStorage.getItem('rednorte_usuario');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch { return null; }
  });

  const iniciarSesion = (u) => {
    // u ya viene como objeto JSON limpio desde el backend (LoginResponseDTO)
    setUsuario(u);
    localStorage.setItem('rednorte_usuario', JSON.stringify(u));
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
