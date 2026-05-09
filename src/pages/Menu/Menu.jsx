import React, { useState } from 'react';
import styles from './Menu.module.css';
import { useAuth } from '../../context/AuthContext';
import Notification from '../../components/Notification/Notification'; 
import { useNavigate } from 'react-router-dom';


const Menu = () => {
    const { rol,permisos } = useAuth();
    const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: 'info' });
    const navigate = useNavigate();


    const handleTestConsulta = () => {
        setNotificacion({ 
            visible: true, 
            mensaje: "¡Botón listo para probar peticiones al backend!", 
            tipo: "info" 
        });
        setTimeout(() => setNotificacion(prev => ({ ...prev, visible: false })), 3000);
    };

    return (
        <div className={styles.dashboardContainer}>
            <Notification 
                visible={notificacion.visible} 
                mensaje={notificacion.mensaje} 
                tipo={notificacion.tipo} 
            />

            <div className={styles.welcomeCard}>
                <h1 className={styles.title}>¡Bienvenido al Sistema Central!</h1>
                <p className={styles.subtitle}>
                    Has iniciado sesión como <strong>{rol?.replace('ROLE_', '')}</strong>. 
                </p>

                <div className={styles.actionGrid}>
                    {(rol === 'ROLE_SISTEMA' || rol === 'ROLE_ADMIN') && (
                    <div 
                        className={styles.actionCard} 
                        onClick={() => navigate('/admin/usuarios')}
                    >
                        <i className={`bi bi-people ${styles.cardIcon}`}></i>
                        <h3>Consultar usuarios</h3>
                        <p>Gestión del sistema</p>
                    </div>
                    )}

                    {rol === 'ROLE_CIUDADANO' && (
                    <div 
                        className={styles.actionCard} 
                        onClick={() => navigate('/reportar-incidencia')} 
                    >
                        <i className={`bi bi-megaphone ${styles.cardIcon}`} style={{ color: '#00A99D' }}></i>
                        <h3>Reportar incidencia</h3>
                        <p>Baches, fugas, alumbrado, etc.</p>
                    </div>
                    )}

                    <div className={styles.actionCard}>
                        <i className={`bi bi-shield-lock ${styles.cardIcon}`}></i>
                        <h3>Mis permisos</h3>
                        <p>roles actuales</p>
                        {
                            permisos.length > 0 ? (
                                <ul className={styles.permisosList}>
                                    {permisos.map((permiso, index) => (
                                        <li key={index}>{permiso}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className={styles.noPermisos}>No tienes permisos asignados.</p>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Menu;