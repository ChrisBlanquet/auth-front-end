import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';
import logoAyuntamiento from '../../assets/img/disenoayutnamiento.png';

const Header = ({ onLogout, cargando }) => {
    const { rol, usuario } = useAuth(); 
    const [showDropdown, setShowDropdown] = useState(false);

    const displayRole = rol ? rol.replace('ROLE_', '') : '';
    const displayNombre = usuario ? usuario.nombre : 'Cargando...';
    // Extraemos el email del objeto usuario
    const displayEmail = usuario ? usuario.email : '';

    return (
        <header className={styles.headerContainer}>
            {/* --- SECCIÓN IZQUIERDA: LOGOS --- */}
            <div className={styles.logoSection}>
                <img src={logoAyuntamiento} alt="H. Ayuntamiento" className={styles.logo} />
            </div>

            {/* --- SECCIÓN CENTRAL: MENÚ DE NAVEGACIÓN --- */}
            <nav className={styles.navSection}>
                <NavLink to="/menu" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                    Inicio
                </NavLink>

                {rol === 'ROLE_CIUDADANO' && (
                    <NavLink to="/mis-reportes" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                        Reportes
                    </NavLink>
                )}

                {(rol === 'ROLE_EMPLEADO' || rol === 'ROLE_ADMIN') && (
                    <NavLink to="/gestion" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                        Gestión
                    </NavLink>
                )}

                {rol === 'ROLE_ADMIN' && (
                    <NavLink to="/estadisticas" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                        Estadísticas
                    </NavLink>
                )}
            </nav>

            {/* --- SECCIÓN DERECHA --- */}
            <div className={styles.actionSection}>
                <button className={styles.notificationBtn}>
                    <i className="bi bi-bell"></i>
                    <span className={styles.badge}>3</span>
                </button>

                <div 
                    className={styles.userProfileContainer}
                    onMouseEnter={() => setShowDropdown(true)}
                    onMouseLeave={() => setShowDropdown(false)}
                >
                    <div className={styles.userTrigger}>
                        <div className={styles.avatar}>
                            <i className="bi bi-person-circle"></i>
                        </div>
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>{displayNombre}</span>
                            <span className={styles.userRole}>{displayRole}</span>
                        </div>
                        <i className={`bi bi-chevron-down ${styles.arrow} ${showDropdown ? styles.arrowRotate : ''}`}></i>
                    </div>

                    {showDropdown && (
                        <div className={styles.dropdownMenu}>

                            <div className={styles.dropdownHeader}>
                                <span className={styles.userFullname}>{displayNombre}</span>
                                <span className={styles.userEmail}>{displayEmail}</span>
                            </div>
                            
                            <hr className={styles.divider} />
                            
                            <NavLink to="/perfil" className={styles.dropdownItem}>
                                <i className="bi bi-person"></i> Mi Perfil
                            </NavLink>
                            
                            <NavLink to="/configuracion" className={styles.dropdownItem}>
                                <i className="bi bi-gear"></i> Configuraciones
                            </NavLink>

                            {rol === 'ROLE_ADMIN' && (
                                <NavLink to="/admin/usuarios" className={styles.dropdownItem}>
                                    <i className="bi bi-shield-check"></i> Admin Usuarios
                                </NavLink>
                            )}
                            
                            <hr className={styles.divider} />
                            
                            <button 
                                onClick={onLogout} 
                                disabled={cargando}
                                className={`${styles.dropdownItem} ${styles.logoutBtn}`}
                                style={{ opacity: cargando ? 0.5 : 1, cursor: cargando ? 'wait' : 'pointer' }}
                            >
                                <i className="bi bi-box-arrow-right"></i>
                                {cargando ? 'Cerrando...' : 'Cerrar Sesión'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;