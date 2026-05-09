import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CitasPage = () => {
  const [citas, setCitas] = useState([]);
  const API_REASIGNACION = "http://localhost:8082/api/reasignacion";

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    const res = await axios.get(`${API_REASIGNACION}/bloques`);
    setCitas(res.data);
  };

  const handleReasignar = async (id) => {
    const motivo = prompt("Indique el motivo de la cancelación masiva:");
    if (motivo) {
      await axios.post(`${API_REASIGNACION}/cancelar/${id}?motivo=${motivo}`);
      alert("Proceso de reasignación automática iniciado.");
      cargarCitas();
    }
  };

  return (
    <div className="admin-container p-6">
      <h2 className="text-2xl font-bold mb-4">Gestión de Agenda Médica</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {citas.map((cita) => (
          <div key={cita.BloquesAgendaid} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-lg">Bloque #{cita.BloquesAgendaid}</h4>
                <p className="text-gray-600">Especialidad ID: {cita.especialidadId}</p>
                <p className="text-blue-700 font-semibold">{new Date(cita.fechaHora).toLocaleString()}</p>
              </div>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">ID Prof: {cita.profesionalId}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <button 
                onClick={() => handleReasignar(cita.BloquesAgendaid)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Cancelar y Reasignar
              </button>
              <button className="text-red-500 px-4 py-2 text-sm">Eliminar Bloque</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CitasPage;