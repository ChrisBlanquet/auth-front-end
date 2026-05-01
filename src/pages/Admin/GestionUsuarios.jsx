import React, { useState, useEffect } from 'react';
import styles from './GestionUsuarios.module.css';
import { 
    obtenerTodosLosUsuarios, obtenerCiudadanos, obtenerEmpleados, 
    buscarUsuarioPorEmailCoincidencia, buscarUsuarioPorId, 
    obtenerUsuariosActivos, obtenerUsuariosInactivos, 
    bloquearUsuario, reactivarUsuario, actualizarUsuarioAdmin, actualizarRolUsuario,
    crearUsuarioAdmin // 👈 El nuevo servicio que agregamos
} from '../../services/authService';
import Notification from '../../components/Notification/Notification';

// Utilidad para generar el Avatar
const getAvatarProps = (nombre) => {
    const nameStr = nombre || '?';
    const initials = nameStr.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];
    const colorIndex = nameStr.length % colors.length;
    return { iniciales: initials, color: colors[colorIndex] };
};

const GestionUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: 'info' });

    const [filtroLista, setFiltroLista] = useState('TODOS'); 
    const [tipoBusqueda, setTipoBusqueda] = useState('email'); 
    const [terminoBusqueda, setTerminoBusqueda] = useState('');

    // --- ESTADOS DEL MODAL MULTIUSOS ---
    const [modalVisible, setModalVisible] = useState(false);
    const [modoModal, setModoModal] = useState('crear'); // 'crear' o 'editar'
    const [procesando, setProcesando] = useState(false);
    const [formData, setFormData] = useState({ id: '', nombre: '', telefono: '', email: '', rol: 'CIUDADANO', password: '', activo: true });

    const mostrarMsg = (mensaje, tipo) => {
        setNotificacion({ visible: true, mensaje, tipo });
        setTimeout(() => setNotificacion(prev => ({ ...prev, visible: false })), 3000);
    };

    useEffect(() => {
        if (!terminoBusqueda) cargarUsuariosPorFiltro();
    }, [filtroLista, terminoBusqueda]);

    const cargarUsuariosPorFiltro = async () => {
        setCargando(true);
        try {
            let data = [];
            if (filtroLista === 'TODOS') data = await obtenerTodosLosUsuarios();
            else if (filtroLista === 'CIUDADANOS') data = await obtenerCiudadanos();
            else if (filtroLista === 'EMPLEADOS') data = await obtenerEmpleados();
            else if (filtroLista === 'ACTIVOS') data = await obtenerUsuariosActivos();
            else if (filtroLista === 'INACTIVOS') data = await obtenerUsuariosInactivos();
            setUsuarios(data);
        } catch (error) { mostrarMsg("Error al cargar datos", "error"); } 
        finally { setCargando(false); }
    };

    const handleBuscar = async (e) => {
        e.preventDefault();
        if (!terminoBusqueda) return cargarUsuariosPorFiltro();
        setCargando(true);
        try {
            let data = tipoBusqueda === 'email' ? await buscarUsuarioPorEmailCoincidencia(terminoBusqueda) : await buscarUsuarioPorId(terminoBusqueda);
            setUsuarios(data);
        } catch (error) {
            setUsuarios([]);
            mostrarMsg("Sin resultados", "warning");
        } finally { setCargando(false); }
    };

    // --- LÓGICA DEL MODAL ---
    const abrirModalCrear = () => {
        setModoModal('crear');
        setFormData({ id: '', nombre: '', telefono: '', email: '', rol: 'CIUDADANO', password: '', activo: true });
        setModalVisible(true);
    };

    const abrirModalEditar = (usuario) => {
        setModoModal('editar');
        setFormData({
            id: usuario.id, nombre: usuario.nombre, telefono: usuario.telefono || '', email: usuario.email,
            rol: usuario.rol?.replace('ROLE_', '') || 'CIUDADANO', activo: usuario.activo || usuario.enabled || usuario.estado === 'ACTIVO', password: ''
        });
        setModalVisible(true);
    };

    const handleGuardarModal = async (e) => {
        e.preventDefault();
        setProcesando(true);
        try {
            if (modoModal === 'crear') {
                // LLamada al nuevo endpoint
                await crearUsuarioAdmin(formData);
                mostrarMsg("Usuario creado exitosamente", "success");
            } else {
                // Modo Editar
                await actualizarUsuarioAdmin(formData.id, { nombre: formData.nombre, telefono: formData.telefono, email: formData.email });
                await actualizarRolUsuario(formData.id, { rol: formData.rol });
                mostrarMsg("Usuario actualizado correctamente", "success");
            }
            setModalVisible(false);
            cargarUsuariosPorFiltro();
        } catch (error) {
            mostrarMsg(error.response?.data?.mensaje || "Error en la operación", "error");
        } finally {
            setProcesando(false);
        }
    };

    const toggleEstadoBloqueo = async () => {
        try {
            if (formData.activo) {
                await bloquearUsuario(formData.id);
                mostrarMsg("Cuenta bloqueada", "success");
            } else {
                await reactivarUsuario(formData.id);
                mostrarMsg("Cuenta reactivada", "success");
            }
            setModalVisible(false);
            cargarUsuariosPorFiltro();
        } catch (error) { mostrarMsg("Error al cambiar estado", "error"); }
    };

    return (
        <div className={styles.container}>
            <Notification {...notificacion} />
            
            <div className={styles.header}>
                <h2 className={styles.headerTitle}>Directorio de Usuarios</h2>
                {/* 👈 NUEVO BOTÓN DE CREAR */}
                <button onClick={abrirModalCrear} className={styles.btnPrimary}>
                    <i className="bi bi-plus-lg"></i> Nuevo Usuario
                </button>
            </div>

            <div className={styles.toolbar}>
                <i className="bi bi-filter" style={{ color: '#94a3b8', fontSize: '1.2rem' }}></i>
                <select className={styles.select} value={filtroLista} onChange={(e) => setFiltroLista(e.target.value)}>
                    <option value="TODOS">Todos los usuarios</option>
                    <option value="CIUDADANOS">Ciudadanos</option>
                    <option value="EMPLEADOS">Empleados</option>
                    <option value="ACTIVOS">Activos</option>
                    <option value="INACTIVOS">Inactivos</option>
                </select>

                <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 10px' }}></div>

                <form onSubmit={handleBuscar} style={{ display: 'flex', gap: '10px', flexGrow: 1 }}>
                    <select className={styles.select} value={tipoBusqueda} onChange={(e) => setTipoBusqueda(e.target.value)}>
                        <option value="email">Email</option>
                        <option value="id">ID</option>
                    </select>
                    <input className={styles.input} style={{ flexGrow: 1 }} type="text" placeholder="Buscar registros..." value={terminoBusqueda} onChange={(e) => setTerminoBusqueda(e.target.value)} />
                </form>
            </div>

            <div className={styles.tableContainer}>
                {cargando ? (
                    <p style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}><i className="bi bi-hourglass-split"></i> Cargando...</p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Nivel / Rol</th>
                                <th>Contacto</th>
                                <th>Estado</th>
                                <th style={{ textAlign: 'center' }}><i className="bi bi-three-dots"></i></th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.length > 0 ? usuarios.map(u => {
                                const esActivo = u.activo || u.enabled || u.estado === 'ACTIVO';
                                const avatar = getAvatarProps(u.nombre);
                                
                                return (
                                <tr key={u.id} className={styles.tableRow}>
                                    <td>
                                        <div className={styles.userCell}>
                                            <div className={styles.avatar} style={{ background: avatar.color }}>{avatar.iniciales}</div>
                                            <div className={styles.userInfo}>
                                                <span className={styles.userName}>{u.nombre}</span>
                                                <span className={styles.userId}>User ID: {u.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.badgeRol} ${styles[`rol-${u.rol?.replace('ROLE_', '')}`]}`}>
                                            {u.rol?.replace('ROLE_', '')}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.contactCell}>
                                            <span className={styles.contactText}><i className="bi bi-envelope"></i> {u.email}</span>
                                            {u.telefono && <span className={styles.contactText}><i className="bi bi-telephone"></i> {u.telefono}</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.statusBadge}>
                                            <div className={`${styles.dot} ${esActivo ? styles.dotActive : styles.dotInactive}`}></div>
                                            <span className={esActivo ? styles.statusActive : styles.statusInactive}>
                                                {esActivo ? 'Activo' : 'Bloqueado'}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button onClick={() => abrirModalEditar(u)} className={styles.btnIcon} title="Gestionar">
                                            <i className="bi bi-pencil-square" style={{ fontSize: '1.1rem' }}></i>
                                        </button>
                                    </td>
                                </tr>
                            )}) : (
                                <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No se encontraron coincidencias.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL UNIFICADO (CREAR / EDITAR) */}
            {modalVisible && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>{modoModal === 'crear' ? 'Registrar Nuevo Usuario' : 'Editar Usuario'}</h3>
                            <button onClick={() => setModalVisible(false)} className={styles.btnIcon}><i className="bi bi-x-lg"></i></button>
                        </div>
                        
                        <form onSubmit={handleGuardarModal}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGrid}>
                                    <div className={`${styles.formGroup} ${styles.full}`}>
                                        <label>Nombre Completo</label>
                                        <input className={styles.input} type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Correo Electrónico</label>
                                        <input className={styles.input} type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Teléfono</label>
                                        <input className={styles.input} type="text" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
                                    </div>
                                    
                                    <div className={styles.formGroup}>
                                        <label>Nivel de Acceso</label>
                                        <select className={styles.select} value={formData.rol} onChange={(e) => setFormData({...formData, rol: e.target.value})}>
                                            <option value="CIUDADANO">Ciudadano</option>
                                            <option value="EMPLEADO">Empleado</option>
                                            <option value="ADMIN">Administrador</option>
                                        </select>
                                    </div>

                                    {/* El password solo se pide al crear */}
                                    {modoModal === 'crear' && (
                                        <div className={styles.formGroup}>
                                            <label>Contraseña Temporal</label>
                                            <input className={styles.input} type="text" placeholder="Mínimo 8 caracteres" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required={modoModal === 'crear'} />
                                        </div>
                                    )}
                                </div>

                                {/* ZONA DE SEGURIDAD (Solo en modo editar) */}
                                {modoModal === 'editar' && (
                                    <div style={{ marginTop: '2rem', padding: '1rem', background: formData.activo ? '#fff1f2' : '#f0fdf4', borderRadius: '8px', border: `1px solid ${formData.activo ? '#fecdd3' : '#bbf7d0'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <strong style={{ color: formData.activo ? '#991b1b' : '#166534', display: 'block', fontSize: '0.9rem' }}>
                                                {formData.activo ? 'Acceso Permitido' : 'Acceso Bloqueado'}
                                            </strong>
                                        </div>
                                        <button type="button" onClick={toggleEstadoBloqueo} className={styles.btnPrimary} style={{ background: formData.activo ? '#ef4444' : '#10b981' }}>
                                            {formData.activo ? <><i className="bi bi-lock-fill"></i> Bloquear</> : <><i className="bi bi-unlock-fill"></i> Reactivar</>}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setModalVisible(false)} className={styles.btnCancel}>Cancelar</button>
                                <button type="submit" disabled={procesando} className={styles.btnPrimary}>
                                    {procesando ? 'Procesando...' : (modoModal === 'crear' ? 'Registrar Usuario' : 'Guardar Cambios')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionUsuarios;