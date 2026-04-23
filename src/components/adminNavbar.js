import React from 'react';

const AdminNavbar = () => {
    const logoSrc = "IMG/Adobe Express - file.png"; 

    return (
        <header className="navbar">
            <div className="logo">
                <img src={logoSrc} alt="Logo de la Empresa" />
            </div>
            <nav className="nav-links">
                <a href="administrador.html">inicio</a>
                <span>|</span>
                <a href="crearUsuario.html">crear usuario</a>
                <span>|</span>
                <a href="modificarUsuario.html">modificar usuario</a>
                <span>|</span>
                <a href="mostrarUsuario.html">mostrar usuarios</a>
                <span>|</span>
                <a href="crearProducto.html">crear producto</a>
                <span>|</span>
                <a href="modificarProducto.html">modificar producor</a>
                <span>|</span>
                <a href="mostrarProducto.html">moctrar producto</a>
            </nav>
        </header>
    );
};

export default AdminNavbar;