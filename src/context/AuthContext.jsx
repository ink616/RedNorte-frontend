import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Configura el header Authorization de axios con el token JWT
export function aplicarToken(token) {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const raw = localStorage.getItem('rednorte_usuario');
      if (!raw) return null;
      const u = JSON.parse(raw);
      // Al recargar la pagina, re-aplica el token guardado
      if (u?.token) aplicarToken(u.token);
      return u;
    } catch { return null; }
  });

  const iniciarSesion = (u) => {
    setUsuario(u);
    localStorage.setItem('rednorte_usuario', JSON.stringify(u));
    if (u?.token) aplicarToken(u.token);
  };

  const cerrarSesion = () => {
    setUsuario(null);
    localStorage.removeItem('rednorte_usuario');
    aplicarToken(null);
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
