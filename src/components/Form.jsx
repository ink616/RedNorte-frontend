import React, { useState } from 'react';
import '../css/Form.css';

const Form = ({ title, buttonText, showRole = false }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    email: '',
    rol: 'paciente',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos enviados:", formData);
    alert("Operación realizada con éxito");
  };

  return (
    <div className="universal-form-container">
      <div className="form-header">
        <h3>{title}</h3>
        <p>Complete la información solicitada para continuar.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid-form">
        <div className="input-box">
          <label>Nombre Completo</label>
          <input type="text" placeholder="Ej: Juan Pérez" required />
        </div>

        <div className="input-box">
          <label>RUT</label>
          <input type="text" placeholder="12.345.678-k" required />
        </div>

        <div className="input-box full-width">
          <label>Correo Electrónico</label>
          <input type="email" placeholder="correo@ejemplo.com" required />
        </div>

        {showRole && (
          <div className="input-box full-width">
            <label>Asignar Rol</label>
            <select className="form-select">
              <option value="paciente">Paciente</option>
              <option value="medico">Personal Médico</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        )}

        <div className="input-box full-width">
          <label>Contraseña</label>
          <input type="password" placeholder="••••••••" required />
        </div>

        <button type="submit" className="btn-form-submit">
          {buttonText}
        </button>
      </form>
    </div>
  );
};

export default Form;