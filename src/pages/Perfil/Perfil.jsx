import React, { useState, useEffect } from 'react';
import styles from './Perfil.module.css';
import { useAuth } from '../../context/AuthContext';
import Notification from '../../components/Notification/Notification';
import { actualizarDatosPerfil, actualizarPasswordPerfil } from '../../services/authService';

// 🎨 Función para el Avatar de Colores
const getAvatarProps = (nombre) => {
    const nameStr = nombre || '?';
    const initials = nameStr.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];
    const colorIndex = nameStr.length % colors.length;
    return { iniciales: initials, color: colors[colorIndex] };
};

const Perfil = () => {
    const { usuario, rol, actualizarUsuario } = useAuth();
    
    const [editandoDatos, setEditandoDatos] = useState(false);
    const [cargando, setCargando] = useState(false);

    // Formularios
    const [datosForm, setDatosForm] = useState({ nombre: '', email: '', telefono: '' });
    const [passForm, setPassForm] = useState({ passwordActual: '', nuevapassword: '' });

    const [verActual, setVerActual] = useState(false);
    const [verNueva, setVerNueva] = useState(false);
    const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: 'info' });

    useEffect(() => {
        if (usuario) {
            setDatosForm({
                nombre: usuario.nombre || '',
                email: usuario.email || '',
                telefono: usuario.telefono || ''
            });
        }
    }, [usuario]);

    const mostrarNotificacion = (mensaje, tipo) => {
        setNotificacion({ visible: true, mensaje, tipo });
        setTimeout(() => setNotificacion(prev => ({ ...prev, visible: false })), 3000);
    };

    if (!usuario) return <div className={styles.container}>Cargando tu perfil...</div>;

    const avatar = getAvatarProps(usuario.nombre);

    const handleActualizarDatos = async (e) => {
        e.preventDefault();
        setCargando(true);
        try {
            const data = await actualizarDatosPerfil(usuario.id, datosForm);
            if (actualizarUsuario) actualizarUsuario(data);
            mostrarNotificacion("¡Datos personales actualizados!", "success");
            setEditandoDatos(false);
        } catch (error) {
            mostrarNotificacion(error.response?.data?.mensaje || "Error al actualizar", "error");
        } finally {
            setCargando(false);
        }
    };

    const handleActualizarPass = async (e) => {
        e.preventDefault();
        if (passForm.nuevapassword.length < 8) {
            return mostrarNotificacion("La contraseña debe tener 8 caracteres mínimo", "warning");
        }
        setCargando(true);
        try {
            await actualizarPasswordPerfil(usuario.id, passForm);
            mostrarNotificacion("Contraseña actualizada con seguridad", "success");
            setPassForm({ passwordActual: '', nuevapassword: '' });
            setVerActual(false); setVerNueva(false);
        } catch (error) {
            mostrarNotificacion(error.response?.data?.mensaje || "Contraseña actual incorrecta", "error");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className={styles.container}>
            <Notification {...notificacion} />

            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Mi Cuenta</h1>
                <p className={styles.pageSubtitle}>Administra tu información personal y credenciales de acceso.</p>
            </div>

            {/* TARJETA SUPERIOR (IDENTIDAD) */}
            <div className={styles.identityCard}>
                <div className={styles.avatarCircle} style={{ background: avatar.color }}>
                    {avatar.iniciales}
                </div>
                <div className={styles.identityInfo}>
                    <h2>{usuario.nombre}</h2>
                    <p>{usuario.email}</p>
                    <span className={styles.badgeRol}>{rol?.replace('ROLE_', '')}</span>
                </div>
            </div>

            {/* FORMULARIOS */}
            <div className={styles.mainGrid}>
                
                {/* 1. DATOS PERSONALES */}
                <form onSubmit={handleActualizarDatos} className={styles.formCard}>
                    <div className={styles.cardHeader}>
                        <i className="bi bi-person-lines-fill" style={{ color: '#3b82f6' }}></i> Datos Personales
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nombre Completo</label>
                            <input type="text" disabled={!editandoDatos} className={styles.input} value={datosForm.nombre} onChange={(e) => setDatosForm({...datosForm, nombre: e.target.value})} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Correo Electrónico</label>
                            <input type="email" disabled={!editandoDatos} className={styles.input} value={datosForm.email} onChange={(e) => setDatosForm({...datosForm, email: e.target.value})} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Teléfono</label>
                            <input type="text" disabled={!editandoDatos} className={styles.input} value={datosForm.telefono} onChange={(e) => setDatosForm({...datosForm, telefono: e.target.value})} />
                        </div>
                    </div>
                    <div className={styles.cardFooter}>
                        {!editandoDatos ? (
                            <button type="button" onClick={() => setEditandoDatos(true)} className={styles.btnSecondary}>
                                <i className="bi bi-pencil"></i> Modificar Datos
                            </button>
                        ) : (
                            <>
                                <button type="button" onClick={() => { setEditandoDatos(false); setDatosForm({nombre: usuario.nombre, email: usuario.email, telefono: usuario.telefono}); }} className={styles.btnSecondary}>
                                    Cancelar
                                </button>
                                <button type="submit" disabled={cargando} className={styles.btnPrimary}>
                                    {cargando ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </>
                        )}
                    </div>
                </form>

                <form onSubmit={handleActualizarPass} className={styles.formCard}>
                    <div className={styles.cardHeader}>
                        <i className="bi bi-shield-lock-fill" style={{ color: '#10b981' }}></i> Seguridad de Acceso
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Contraseña Actual</label>
                            <div className={styles.inputWrapper}>
                                <input type={verActual ? "text" : "password"} className={styles.input} placeholder="Ingresa tu contraseña actual" value={passForm.passwordActual} onChange={(e) => setPassForm({...passForm, passwordActual: e.target.value})} required />
                                <i className={`bi ${verActual ? 'bi-eye-slash' : 'bi-eye'} ${styles.eyeIcon}`} onClick={() => setVerActual(!verActual)}></i>
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nueva Contraseña</label>
                            <div className={styles.inputWrapper}>
                                <input type={verNueva ? "text" : "password"} className={styles.input} placeholder="Mínimo 8 caracteres" value={passForm.nuevapassword} onChange={(e) => setPassForm({...passForm, nuevapassword: e.target.value})} required />
                                <i className={`bi ${verNueva ? 'bi-eye-slash' : 'bi-eye'} ${styles.eyeIcon}`} onClick={() => setVerNueva(!verNueva)}></i>
                            </div>
                        </div>
                    </div>
                    <div className={styles.cardFooter}>
                        <button type="submit" disabled={cargando || !passForm.passwordActual || !passForm.nuevapassword} className={styles.btnPrimary}>
                            {cargando ? 'Actualizando...' : 'Actualizar Contraseña'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default Perfil;