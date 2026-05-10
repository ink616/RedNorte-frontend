import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../service/api';
import '../css/login.css';

const Login = () => {
  const [mail, setMail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const usuario = await login(mail, pass);
      if (!usuario) throw new Error('Sin respuesta');
      iniciarSesion(usuario);
      if (usuario?.rol?.tag === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/mis-consultas');
      }
    } catch {
      setError('Correo o contraseña incorrectos.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-box">
        <div className="login-header">
          <h2>Iniciar Sesión</h2>
          <p>Bienvenido de vuelta a RedNorte</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input type="email" placeholder="usuario@correo.cl" value={mail} onChange={e => setMail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} required />
          </div>
          <button type="submit" className="btn-login-submit" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="login-footer" style={{ marginTop: 20, fontSize: 13, color: '#6b7280' }}>
          ¿No tienes cuenta? Contacta al administrador.
        </p>
      </div>
    </div>
  );
};

export default Login;
