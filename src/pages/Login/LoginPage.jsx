import React, { useState, useEffect } from 'react'; 
import styles from './LoginPage.module.css';

import logoAyuntamiento from '../../assets/img/disenoayutnamiento.png';
import logoRenace from '../../assets/img/logoRenace.png';
import fondoAyuntamiento from '../../assets/img/ayutamientofisico.png';
import logoRenaceSinPalabras from '../../assets/img/logoRenacesinpalabras.png';
import { loginUsuario, registrarCiudadano } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import Notification from '../../components/Notification/Notification'; // 👈 1. Importamos la Notificación

const LoginPage = () => {
    const navigate = useNavigate();

    const { loginExitoso, isAuthenticated, loading } = useAuth(); 

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/menu', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const [isRegistering, setIsRegistering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // ESTADOS DE CARGA 
    const [isLoading, setIsLoading] = useState(false); 
    const [isRegisterLoading, setIsRegisterLoading] = useState(false); 

    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerData, setRegisterData] = useState({ nombre: '', email: '', password: '', telefono: '' });

    // 👈 2. Estado para controlar las notificaciones
    const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: 'info' });

    // 👈 3. Función auxiliar para mostrar notificaciones fácilmente
    const mostrarNotificacion = (mensaje, tipo) => {
        setNotificacion({ visible: true, mensaje, tipo });
        setTimeout(() => setNotificacion(prev => ({ ...prev, visible: false })), 3000);
    };

    const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
    const handleRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

    const togglePanel = () => {
        setIsRegistering(!isRegistering);
        setShowPassword(false);
    };

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const onLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); 
        
        try {
            const respuesta = await loginUsuario(loginData);
            loginExitoso(respuesta.accessToken); 
            navigate('/menu'); 
        } catch (error) {
            // 🔥 Cambiamos el alert por nuestra Notificación
            mostrarNotificacion(error.response?.data?.mensaje || "Credenciales incorrectas o error en el servidor", "error");
            setIsLoading(false); 
            setLoginData({ ...loginData, password: '' }); 
        }
    };

    const onRegisterSubmit = async (e) => {
        e.preventDefault();
        setIsRegisterLoading(true); 

        try {
            console.log("Enviando registro...", registerData);
            const respuesta = await registrarCiudadano(registerData);
            console.log("¡Ciudadano registrado!", respuesta);
            
            // 🔥 Cambiamos el alert por nuestra Notificación
            mostrarNotificacion("Cuenta creada con éxito. Por favor inicia sesión.", "success");
            togglePanel(); 
            
        } catch (error) {
            // 🔥 Cambiamos el alert por nuestra Notificación
            mostrarNotificacion(error.response?.data?.mensaje || "Error al crear la cuenta", "error");
        } finally {
            setIsRegisterLoading(false); 
            setRegisterData({ ...registerData, password: '' });
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className={styles.container}>
            
            {/* 👈 4. Insertamos el componente de Notificación aquí */}
            <Notification 
                visible={notificacion.visible} 
                mensaje={notificacion.mensaje} 
                tipo={notificacion.tipo} 
            />
            
            <div className={styles.topHeader}>
                <img src={logoAyuntamiento} alt="Ayuntamiento" className={styles.logoHeader} />
                <img src={logoRenace} alt="Unidos Renace" className={styles.logoHeader} />
            </div>

            <img 
                src={logoRenaceSinPalabras} 
                alt="Adorno Renace" 
                className={`${styles.logoInferiorAnimado} ${isRegistering ? styles.logoInferiorDerecha : ''}`} 
            />

            <div className={`${styles.mainWrapper} ${isRegistering ? styles.rightPanelActive : ''}`}>
                
                {/* ---------- PANEL DE REGISTRO ---------- */}
                <div className={`${styles.formContainer} ${styles.registerContainer}`}>
                    <form onSubmit={onRegisterSubmit} className={styles.form}>
                        <h1 className={styles.title}>Regístrate</h1>
                        <p className={styles.subtitle}>Crea tu cuenta ciudadana</p>
                        
                        <div className={styles.inputGroup}>
                            <input type="text" name="nombre" placeholder="Nombre completo" value={registerData.nombre} onChange={handleRegisterChange} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <input type="email" name="email" placeholder="Correo electrónico" value={registerData.email} onChange={handleRegisterChange} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <input type="tel" name="telefono" placeholder="Teléfono a 10 dígitos" value={registerData.telefono} onChange={handleRegisterChange} required />
                        </div>
                        <div className={styles.inputGroup}>
                                <input type={showPassword ? "text" : "password"} name="password" placeholder="Contraseña" value={registerData.password} onChange={handleRegisterChange} required />
                                {registerData.password.length > 0 && (
                                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} ${styles.eyeIcon}`} onClick={togglePasswordVisibility}></i>
                                )}
                        </div>

                        <button 
                            type="submit" 
                            className={styles.btnPrimary} 
                            disabled={isRegisterLoading}
                            style={{ opacity: isRegisterLoading ? 0.7 : 1, cursor: isRegisterLoading ? 'not-allowed' : 'pointer' }}
                        >
                            {isRegisterLoading ? 'Registrando...' : 'Registrar'}
                        </button>
                        <p className={styles.switchText}>¿Ya tienes cuenta? <span onClick={togglePanel} className={styles.linkText}>Inicia sesión aquí</span></p>
                    </form>
                </div>

                {/* ---------- PANEL DE LOGIN ---------- */}
                <div className={`${styles.formContainer} ${styles.loginContainer}`}>
                    <form onSubmit={onLoginSubmit} className={styles.form}>
                        <h1 className={styles.title}>Bienvenido</h1>
                        <p className={styles.subtitle}>Inicia sesión en tu cuenta</p>
                        
                        <div className={styles.inputGroup}>
                            <input type="email" name="email" placeholder="Correo electrónico" value={loginData.email} onChange={handleLoginChange} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <input type={showPassword ? "text" : "password"} name="password" placeholder="Contraseña" value={loginData.password} onChange={handleLoginChange} required />
                            {loginData.password.length > 0 && (
                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} ${styles.eyeIcon}`} onClick={togglePasswordVisibility}></i>
                            )}
                        </div>

                        <div className={styles.formOptions}>
                            <label className={styles.checkboxLabel}><input type="checkbox" /> Recordarme</label>
                            <a href="#" className={styles.forgotPassword}>¿Olvidaste tu contraseña?</a>
                        </div>

                        <button 
                            type="submit" 
                            className={styles.btnPrimary} 
                            disabled={isLoading}
                            style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                        >
                            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>
                        <p className={styles.switchText}>¿No tienes cuenta? <span onClick={togglePanel} className={styles.linkText}>Regístrate ahora</span></p>
                    </form>
                </div>

                {/* ---------- PANEL DESLIZANTE DE LA IMAGEN ---------- */}
                <div className={styles.overlayContainer}>
                    <div className={styles.overlay} style={{ backgroundImage: `url(${fondoAyuntamiento})` }}>
                        <div className={styles.overlayShadow}></div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LoginPage;