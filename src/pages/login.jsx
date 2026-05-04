import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../css/login.css';

const Login = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulación de inicio de sesión exitoso
    setIsLoggedIn(true);
    navigate('/');
  };

  return (
    <div className="login-screen">
      <div className="login-box">
        <div className="login-header">
          <h2>Iniciar Sesión</h2>
          <p>Bienvenido de vuelta a RedNorte</p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input type="email" placeholder="usuario@correo.cl" required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn-login-submit">Ingresar</button>
        </form>
        
        <p className="login-footer">
          ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;