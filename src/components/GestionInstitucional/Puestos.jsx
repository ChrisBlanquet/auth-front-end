import React, { useState, useEffect } from 'react';
import { puestosApi } from '../../services/GestionInstitucionalService';
import Notification from '../../components/Notification/Notification';
// Importamos los estilos de GestionUsuarios
import styles from '../../pages/Admin/GestionUsuarios.module.css';

const PERMISOS = [
    'VER_INCIDENCIAS', 'ACTUALIZAR_ESTADO', 'ASIGNAR_PERSONAL',
    'CREAR_REPORTE', 'CERRAR_INCIDENCIA', 'VER_EVIDENCIAS',
];

const Puestos = () => {
    const [puestos, setPuestos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: 'info' });
    
    // Estados para modales y formulario
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ nombre: '', permisos: [] });
    const [verPermisos, setVerPermisos] = useState(null);
    const [guardando, setGuardando] = useState(false);

    // Buscador
    const [busqueda, setBusqueda] = useState('');

    const mostrarMsg = (mensaje, tipo) => {
        setNotificacion({ visible: true, mensaje, tipo });
        setTimeout(() => setNotificacion(prev => ({ ...prev, visible: false })), 3000);
    };

    const cargarPuestos = async () => {
        setCargando(true);
        try {
            const r = await puestosApi.getAll();
            setPuestos(r.data);
        } catch (error) {
            mostrarMsg('Error al cargar puestos', 'error');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarPuestos();
    }, []);

    const openCreate = () => { 
        setEditing(null); 
        setForm({ nombre: '', permisos: [] }); 
        setModal(true); 
    };
    
    const openEdit = (p) => { 
        setEditing(p); 
        setForm({ nombre: p.nombre, permisos: p.permisos || [] }); 
        setModal(true); 
    };

    const togglePerm = (permiso) => {
        setForm(f => ({
            ...f,
            permisos: f.permisos.includes(permiso)
                ? f.permisos.filter(x => x !== permiso)
                : [...f.permisos, permiso],
        }));
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        if (!form.nombre.trim()) { 
            mostrarMsg('El nombre del puesto es obligatorio', 'error'); 
            return; 
        }
        setGuardando(true);
        try {
            if (editing) {
                await puestosApi.update(editing.id, form);
                mostrarMsg('Puesto actualizado correctamente', 'success');
            } else {
                await puestosApi.create(form);
                mostrarMsg('Puesto creado correctamente', 'success');
            }
            setModal(false); 
            cargarPuestos();
        } catch (error) { 
            mostrarMsg('Error al guardar el puesto', 'error'); 
        } finally {
            setGuardando(false);
        }
    };

    const handleEliminar = async (id) => {
        const confirmar = window.confirm(`¿Estás seguro de eliminar el puesto #${id}?`);
        if (!confirmar) return;
        try { 
            await puestosApi.delete(id); 
            mostrarMsg('Puesto eliminado correctamente', 'success'); 
            cargarPuestos(); 
        } catch (error) { 
            mostrarMsg('No se pudo eliminar el puesto', 'error'); 
        }
    };

    const puestosFiltrados = puestos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <Notification {...notificacion} />

            {/* HEADER */}
            <div className={styles.header}>
                <h2 className={styles.headerTitle}>Gestión de Puestos</h2>
                <button onClick={openCreate} className={styles.btnPrimary}>
                    <i className="bi bi-plus-lg"></i> Nuevo Puesto
                </button>
            </div>

            {/* TOOLBAR */}
            <div className={styles.toolbar}>
                <i className="bi bi-search" style={{ color: '#94a3b8', fontSize: '1.2rem', marginLeft: '5px' }}></i>
                
                <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 10px' }}></div>
                
                <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', gap: '10px', flexGrow: 1 }}>
                    <input 
                        className={styles.input} 
                        style={{ flexGrow: 1 }} 
                        type="text" 
                        placeholder="Buscar por nombre del cargo..." 
                        value={busqueda} 
                        onChange={(e) => setBusqueda(e.target.value)} 
                    />
                    {busqueda && (
                        <button type="button" onClick={() => setBusqueda('')} className={styles.btnCancel}>
                            Limpiar
                        </button>
                    )}
                </form>
            </div>

            {/* TABLA DE RESULTADOS */}
            <div className={styles.tableContainer}>
                {cargando ? (
                    <p style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        <i className="bi bi-hourglass-split"></i> Cargando puestos...
                    </p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cargo</th>
                                <th>Permisos</th>
                                <th style={{ textAlign: 'center' }}><i className="bi bi-three-dots"></i></th>
                            </tr>
                        </thead>
                        <tbody>
                            {puestosFiltrados.length > 0 ? puestosFiltrados.map(p => (
                                <tr key={p.id} className={styles.tableRow}>
                                    <td>
                                        <span style={{ color: '#64748b', fontWeight: '600' }}>#{p.id}</span>
                                    </td>
                                    <td>
                                        <div className={styles.userCell}>
                                            <div className={styles.avatar} style={{ background: '#f59e0b' }}>
                                                <i className="bi bi-briefcase-fill"></i>
                                            </div>
                                            <div className={styles.userInfo}>
                                                <span className={styles.userName}>{p.nombre}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                                            {(p.permisos || []).slice(0, 3).map(pm => (
                                                <span key={pm} className={styles.badgeRol} style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: '600' }}>
                                                    {pm}
                                                </span>
                                            ))}
                                            {(p.permisos || []).length > 3 && (
                                                <button 
                                                    onClick={() => setVerPermisos(p)} 
                                                    style={{ 
                                                        fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', 
                                                        background: '#f1f5f9', color: '#475569', 
                                                        border: '1px solid #cbd5e1', fontWeight: '600', cursor: 'pointer' 
                                                    }}
                                                >
                                                    +{p.permisos.length - 3} más
                                                </button>
                                            )}
                                            {(p.permisos || []).length === 0 && (
                                                <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                                    Sin permisos
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button onClick={() => openEdit(p)} className={styles.btnIcon} title="Editar">
                                            <i className="bi bi-pencil-square" style={{ fontSize: '1.1rem', color: '#0ea5e9' }}></i>
                                        </button>
                                        <button onClick={() => handleEliminar(p.id)} className={styles.btnIcon} title="Eliminar">
                                            <i className="bi bi-trash" style={{ fontSize: '1.1rem', color: '#ef4444' }}></i>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                        No se encontraron puestos con esta búsqueda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL CREAR / EDITAR */}
            {modal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
                        <div className={styles.modalHeader}>
                            <h3>{editing ? 'Editar Puesto' : 'Registrar Nuevo Puesto'}</h3>
                            <button type="button" onClick={() => setModal(false)} className={styles.btnIcon}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={handleGuardar}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                                    <label>Nombre del Cargo *</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Ej: Técnico de Campo"
                                        value={form.nombre}
                                        onChange={e => setForm({ ...form, nombre: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label style={{ marginBottom: '10px', display: 'block' }}>Permisos Asignados</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        {PERMISOS.map(pm => {
                                            const activo = form.permisos.includes(pm);
                                            return (
                                                <button
                                                    key={pm}
                                                    type="button"
                                                    onClick={() => togglePerm(pm)}
                                                    style={{
                                                        padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer',
                                                        border: activo ? '1px solid #3b82f6' : '1px solid #cbd5e1',
                                                        backgroundColor: activo ? '#eff6ff' : '#ffffff',
                                                        color: activo ? '#1d4ed8' : '#64748b',
                                                        fontWeight: activo ? '600' : '500',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {pm}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {form.permisos.length > 0 && (
                                        <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#059669', fontWeight: '500' }}>
                                            <i className="bi bi-check2-circle" style={{ marginRight: '5px' }}></i>
                                            {form.permisos.length} permiso{form.permisos.length !== 1 ? 's' : ''} seleccionado{form.permisos.length !== 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setModal(false)} className={styles.btnCancel}>
                                    Cancelar
                                </button>
                                <button type="submit" disabled={guardando} className={styles.btnPrimary}>
                                    {guardando ? 'Procesando...' : (editing ? 'Guardar Cambios' : 'Registrar Puesto')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL VER TODOS LOS PERMISOS */}
            {verPermisos && (
                <div className={styles.modalOverlay} style={{ zIndex: 1010 }}>
                    <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
                        <div className={styles.modalHeader}>
                            <h3 style={{ fontSize: '1.1rem' }}>Permisos: {verPermisos.nombre}</h3>
                            <button type="button" onClick={() => setVerPermisos(null)} className={styles.btnIcon}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        
                        <div className={styles.modalBody}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {(verPermisos.permisos || []).map(pm => (
                                    <span key={pm} className={styles.badgeRol} style={{ background: '#e0f2fe', color: '#0369a1', padding: '6px 14px', fontSize: '0.85rem' }}>
                                        <i className="bi bi-shield-check" style={{ marginRight: '6px' }}></i>
                                        {pm}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className={styles.modalActions}>
                            <button onClick={() => setVerPermisos(null)} className={styles.btnPrimary}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Puestos;