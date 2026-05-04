import React, { useState } from 'react';
import '../css/RegisterForm.css';

const RegisterForm = ({ isAdminView = false }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'paciente' // Por defecto
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    console.log("Datos de registro:", formData);
    alert(isAdminView ? "Usuario creado por administrador" : "Registro completado con éxito");
  };

  return (
    <div className="register-card">
      <div className="register-header">
        <h2>{isAdminView ? "Alta de Nuevo Usuario" : "Crea tu Cuenta Médica"}</h2>
        <p>{isAdminView ? "Panel de control administrativo" : "Únete a nuestra red de salud digital"}</p>
      </div>

      <form onSubmit={handleSubmit} className="register-grid">
        <div className="reg-group">
          <label>Nombre Completo</label>
          <input name="nombre" type="text" placeholder="Ej: Maria López" onChange={handleChange} required />
        </div>

        <div className="reg-group">
          <label>RUT</label>
          <input name="rut" type="text" placeholder="12.345.678-9" onChange={handleChange} required />
        </div>

        <div className="reg-group full-width">
          <label>Correo Electrónico</label>
          <input name="email" type="email" placeholder="correo@ejemplo.com" onChange={handleChange} required />
        </div>

        {/* Si es Admin, mostramos el selector de Roles */}
        {isAdminView && (
          <div className="reg-group full-width">
            <label>Asignar Rol</label>
            <select name="rol" className="reg-select" onChange={handleChange}>
              <option value="paciente">Paciente</option>
              <option value="medico">Médico / Especialista</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        )}

        <div className="reg-group">
          <label>Contraseña</label>
          <input name="password" type="password" placeholder="••••••••" onChange={handleChange} required />
        </div>

        <div className="reg-group">
          <label>Confirmar Contraseña</label>
          <input name="confirmPassword" type="password" placeholder="••••••••" onChange={handleChange} required />
        </div>

        <button type="submit" className="btn-register-now">
          {isAdminView ? "Registrar en Sistema" : "Registrarme"}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;