import React, { useState, useEffect } from 'react';
import { departamentosApi } from '../../services/GestionInstitucionalService';
import Notification from '../../components/Notification/Notification';
import styles from '../../pages/Admin/GestionUsuarios.module.css'; 

const Departamentos = () => {
    const [departamentos, setDepartamentos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: 'info' });
    
    // Estados para filtros y modal
    const [busqueda, setBusqueda] = useState('');
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ nombre: '', descripcion: '' });
    const [guardando, setGuardando] = useState(false);

    // Función para mostrar notificaciones
    const mostrarMsg = (mensaje, tipo) => {
        setNotificacion({ visible: true, mensaje, tipo });
        setTimeout(() => setNotificacion(prev => ({ ...prev, visible: false })), 3000);
    };

    const cargarDepartamentos = async () => {
        setCargando(true);
        try {
            const r = await departamentosApi.getAll();
            setDepartamentos(r.data);
        } catch (error) {
            mostrarMsg("Error al cargar departamentos", "error");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDepartamentos();
    }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ nombre: '', descripcion: '' });
        setModal(true);
    };

    const openEdit = (d) => {
        setEditing(d);
        setForm({ nombre: d.nombre, descripcion: d.descripcion || '' });
        setModal(true);
    };

    const handleGuardar = async (e) => {
        e.preventDefault(); // Prevenimos la recarga del form
        if (!form.nombre.trim()) {
            mostrarMsg("El nombre es obligatorio", "error");
            return;
        }
        setGuardando(true);
        try {
            if (editing) {
                await departamentosApi.update(editing.id, form);
                mostrarMsg("Departamento actualizado correctamente", "success");
            } else {
                await departamentosApi.create(form);
                mostrarMsg("Departamento creado correctamente", "success");
            }
            setModal(false);
            cargarDepartamentos();
        } catch (error) {
            mostrarMsg("Error al guardar el departamento", "error");
        } finally {
            setGuardando(false);
        }
    };

    const handleEliminar = async (id) => {
        const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar el departamento #${id}? Esta acción no se puede deshacer.`);
        if (confirmar) {
            try {
                await departamentosApi.delete(id);
                mostrarMsg("Departamento eliminado correctamente", "success");
                cargarDepartamentos();
            } catch (error) {
                mostrarMsg("No se pudo eliminar. Puede tener cuadrillas asociadas.", "error");
            }
        }
    };

    // Filtro de búsqueda local
    const departamentosFiltrados = departamentos.filter(d =>
        d.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (d.descripcion || '').toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <Notification {...notificacion} />
            <div className={styles.header}>
                <h2 className={styles.headerTitle}>Gestión de Departamentos</h2>
                <button onClick={openCreate} className={styles.btnPrimary}>
                    <i className="bi bi-plus-lg"></i> Nuevo Departamento
                </button>
            </div>
            <div className={styles.toolbar}>
                <i className="bi bi-search" style={{ color: '#94a3b8', fontSize: '1.2rem', marginLeft: '5px' }}></i>
                
                <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 10px' }}></div>
                
                <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', gap: '10px', flexGrow: 1 }}>
                    <input 
                        className={styles.input} 
                        style={{ flexGrow: 1 }} 
                        type="text" 
                        placeholder="Buscar por nombre o descripción..." 
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
                        <i className="bi bi-hourglass-split"></i> Cargando departamentos...
                    </p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Departamento</th>
                                <th>Descripción</th>
                                <th style={{ textAlign: 'center' }}><i className="bi bi-three-dots"></i></th>
                            </tr>
                        </thead>
                        <tbody>
                            {departamentosFiltrados.length > 0 ? departamentosFiltrados.map(d => (
                                <tr key={d.id} className={styles.tableRow}>
                                    <td>
                                        <span style={{ color: '#64748b', fontWeight: '600' }}>#{d.id}</span>
                                    </td>
                                    <td>
                                        <div className={styles.userCell}>
                                            <div className={styles.avatar} style={{ background: '#6366f1' }}>
                                                <i className="bi bi-building"></i>
                                            </div>
                                            <div className={styles.userInfo}>
                                                <span className={styles.userName}>{d.nombre}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={styles.contactText} style={{ maxWidth: '350px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {d.descripcion || 'Sin descripción'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button onClick={() => openEdit(d)} className={styles.btnIcon} title="Editar">
                                            <i className="bi bi-pencil-square" style={{ fontSize: '1.1rem', color: '#0ea5e9' }}></i>
                                        </button>
                                        <button onClick={() => handleEliminar(d.id)} className={styles.btnIcon} title="Eliminar">
                                            <i className="bi bi-trash" style={{ fontSize: '1.1rem', color: '#ef4444' }}></i>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                        No se encontraron departamentos con esta búsqueda.
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
                    <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
                        <div className={styles.modalHeader}>
                            <h3>{editing ? 'Editar Departamento' : 'Registrar Nuevo Departamento'}</h3>
                            <button type="button" onClick={() => setModal(false)} className={styles.btnIcon}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={handleGuardar}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
                                    <label>Nombre del Departamento *</label>
                                    <input 
                                        className={styles.input} 
                                        type="text" 
                                        placeholder="Ej: Alumbrado Público"
                                        value={form.nombre} 
                                        onChange={(e) => setForm({...form, nombre: e.target.value})} 
                                        required 
                                    />
                                </div>
                                
                                <div className={styles.formGroup}>
                                    <label>Descripción</label>
                                    <textarea 
                                        className={styles.input} 
                                        placeholder="Breve descripción..."
                                        value={form.descripcion} 
                                        onChange={(e) => setForm({...form, descripcion: e.target.value})} 
                                        rows="4"
                                        style={{ resize: 'vertical' }}
                                    />
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setModal(false)} className={styles.btnCancel}>
                                    Cancelar
                                </button>
                                <button type="submit" disabled={guardando} className={styles.btnPrimary}>
                                    {guardando ? 'Procesando...' : (editing ? 'Guardar Cambios' : 'Registrar Departamento')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Departamentos;