import React from 'react';
import Form from '../components/Form';

const Registro = () => {
  return (
    <div style={{ padding: '60px 0', backgroundColor: 'var(--bg-global)' }}>
      <Form 
        title="Registro de Nuevo Paciente" 
        buttonText="Crear Cuenta" 
        showRole={false} 
      />
    </div>
  );
};

export default Registro;