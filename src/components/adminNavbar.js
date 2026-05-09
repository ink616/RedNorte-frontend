import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminNavbar = ({ setIsLoggedIn }) => {
    const navigate = useNavigate();
    const logoSrc = "IMG/Adobe Express - file.png"; 

    const handleLogout = () => {
        setIsLoggedIn(false);
        navigate('/login');
    };

    return (
        <header className="navbar admin-navbar">
            <div className="logo">
                <Link to="/">
                    <img src={logoSrc} alt="Logo RedNorte" />
                </Link>
            </div>
            
            <nav className="nav-links">
                <Link to="/">Inicio</Link>
                <span>|</span>
                <Link to="/admin/usuarios">Gestión de Usuarios</Link>
                <span>|</span>
                <Link to="/admin/citas">Gestión de Citas</Link>
            </nav>

            <div className="nav-auth">
                <button onClick={handleLogout} className="btn-logout-admin">
                    Cerrar Sesión Admin
                </button>
            </div>
        </header>
    );
};

export default AdminNavbar;