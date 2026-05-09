import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const API_URL = "http://localhost:8080/api/usuarios";

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await axios.get(`${API_URL}/listar`);
      setUsuarios(res.data);
    } catch (err) { console.error("Error al cargar usuarios"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        await axios.delete(`${API_URL}/eliminar/${id}`);
        fetchUsuarios(); // Recargar lista
      } catch (err) { alert("Error: " + err.response.data); }
    }
  };

  return (
    <div className="admin-container p-6">
      <h2 className="text-2xl font-bold mb-4">Base de Datos de Usuarios</h2>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Email</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-4 text-sm text-gray-500">{u.id}</td>
                <td className="p-4">{u.mail}</td>
                <td className="p-4">
                  <span className={`badge ${u.estado === 'ACTIVO' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {u.estado}
                  </span>
                </td>
                <td className="p-4">
                  <button className="text-blue-600 mr-3">Editar</button>
                  <button onClick={() => handleDelete(u.id)} className="text-red-600">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsuariosPage;