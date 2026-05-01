import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header/Header'; 
import Footer from './Footer/Footer';
import { useAuth } from '../context/AuthContext';
import styles from './PrivateLayout.module.css';
import { logoutUsuario } from '../services/authService';
import Notification from './Notification/Notification';

const PrivateLayout = () => {
    const { logoutExitoso } = useAuth();
    const [cargando, setCargando] = useState(false);
    
    // Estado para la notificación de cierre de sesión
    const [notificacion, setNotificacion] = useState({
        visible: false,
        mensaje: '',
        tipo: 'info'
    });

    const handleLogout = async () => {
        setCargando(true);
        try {
            await logoutUsuario();
            setNotificacion({ 
                visible: true, 
                mensaje: "Sesión cerrada correctamente. ¡Hasta pronto!", 
                tipo: "success" 
            });
            
            setTimeout(() => {
                logoutExitoso();
            }, 1500);
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            setNotificacion({ 
                visible: true, 
                mensaje: "Problema al cerrar sesión. Cerrando por seguridad...", 
                tipo: "error" 
            });
            setTimeout(() => {
                logoutExitoso();
            }, 1500);
        }
    };

    return (
        <div className={styles.layoutContainer}>
            <Notification 
                visible={notificacion.visible} 
                mensaje={notificacion.mensaje} 
                tipo={notificacion.tipo} 
            />

            <Header onLogout={handleLogout} cargando={cargando} />

            <main className={styles.mainContent}>
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};

export default PrivateLayout;