import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('rednorte_theme') === 'dark');

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-theme', dark ? 'dark' : 'light');
    html.style.colorScheme = dark ? 'dark' : 'light';
    localStorage.setItem('rednorte_theme', dark ? 'dark' : 'light');
  }, [dark]);

  const toggleTheme = () => setDark(prev => !prev);

  // Expone ambos nombres por compatibilidad con todo el codigo del proyecto
  const value = {
    dark,
    darkMode: dark,
    toggleTheme,
    toggleDark: toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
