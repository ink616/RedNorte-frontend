import React, { createContext, useContext, useState } from 'react';
import { login as loginApi } from '../service/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('rednorte_usuario');
    return guardado ? JSON.parse(guardado) : null;
  });

  const login = async (mail, pass) => {
    const data = await loginApi(mail, pass);
    localStorage.setItem('rednorte_usuario', JSON.stringify(data));
    setUsuario(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('rednorte_usuario');
    localStorage.removeItem('rednorte_token');
    setUsuario(null);
  };

  const esAdmin  = usuario?.rol?.tag === 'ADMIN';
  const esDoctor = usuario?.rol?.tag === 'DOCTOR';

  return (
    <AuthContext.Provider value={{ usuario, login, logout, esAdmin, esDoctor }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}