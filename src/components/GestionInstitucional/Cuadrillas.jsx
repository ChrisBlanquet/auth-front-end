import React, { useState, useEffect } from 'react';
import { cuadrillasApi, departamentosApi } from '../../services/GestionInstitucionalService';
import Notification from '../../components/Notification/Notification';
import styles from '../../pages/Admin/GestionUsuarios.module.css';

const Cuadrillas = () => {
    const [cuadrillas, setCuadrillas] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: 'info' });
    
    // Estados para modales y formulario
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ nombre: '', departamentoId: '' });
    const [guardando, setGuardando] = useState(false);

    // Filtros y búsqueda
    const [filtroDepto, setFiltroDepto] = useState('todos');
    const [busqueda, setBusqueda] = useState('');

    const mostrarMsg = (mensaje, tipo) => {
        setNotificacion({ visible: true, mensaje, tipo });
        setTimeout(() => setNotificacion(prev => ({ ...prev, visible: false })), 3000);
    };

    const cargarDatos = async () => {
        setCargando(true);
        try {
            const [cRes, dRes] = await Promise.all([
                cuadrillasApi.getAll(), 
                departamentosApi.getAll()
            ]);
            setCuadrillas(cRes.data || []);
            setDepartamentos(dRes.data || []);
        } catch (error) {
            mostrarMsg('Error al cargar datos', 'error');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const openCreate = () => { 
        setEditing(null); 
        setForm({ nombre: '', departamentoId: '' }); 
        setModal(true); 
    };

    const openEdit = (c) => { 
        setEditing(c); 
        setForm({ nombre: c.nombre, departamentoId: c.departamentoId }); 
        setModal(true); 
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        if (!form.nombre.trim() || !form.departamentoId) { 
            mostrarMsg('Completa todos los campos obligatorios', 'error'); 
            return; 
        }
        setGuardando(true);
        try {
            if (editing) {
                await cuadrillasApi.update(editing.id, { 
                    nombre: form.nombre, 
                    departamentoId: Number(form.departamentoId) 
                });
                mostrarMsg('Cuadrilla actualizada correctamente', 'success');
            } else {
                await cuadrillasApi.create({ 
                    nombre: form.nombre, 
                    departamentoId: Number(form.departamentoId) 
                });
                mostrarMsg('Cuadrilla creada correctamente', 'success');
            }
            setModal(false); 
            cargarDatos();
        } catch (error) { 
            mostrarMsg('Error al guardar la cuadrilla', 'error'); 
        } finally {
            setGuardando(false);
        }
    };

    const handleEliminar = async (id) => {
        const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar la cuadrilla #${id}?`);
        if (!confirmar) return;
        try { 
            await cuadrillasApi.delete(id); 
            mostrarMsg('Cuadrilla eliminada correctamente', 'success'); 
            cargarDatos(); 
        } catch (error) { 
            mostrarMsg('No se pudo eliminar la cuadrilla', 'error'); 
        }
    };

    // Aplicar filtros (por departamento y por texto)
    let cuadrillasFiltradas = cuadrillas;
    
    if (filtroDepto !== 'todos') {
        cuadrillasFiltradas = cuadrillasFiltradas.filter(c => c.departamentoId === Number(filtroDepto));
    }
    
    if (busqueda) {
        cuadrillasFiltradas = cuadrillasFiltradas.filter(c => 
            c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            (c.departamentoNombre && c.departamentoNombre.toLowerCase().includes(busqueda.toLowerCase()))
        );
    }

    return (
        <div className={styles.container}>
            <Notification {...notificacion} />

            {/* HEADER */}
            <div className={styles.header}>
                <h2 className={styles.headerTitle}>Gestión de Cuadrillas</h2>
                <button onClick={openCreate} className={styles.btnPrimary}>
                    <i className="bi bi-plus-lg"></i> Nueva Cuadrilla
                </button>
            </div>

            {/* TOOLBAR */}
            <div className={styles.toolbar}>
                <i className="bi bi-search" style={{ color: '#94a3b8', fontSize: '1.2rem', marginLeft: '5px' }}></i>
                <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 10px' }}></div>
                
                <div style={{ display: 'flex', gap: '10px', flexGrow: 1, flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        className={styles.input}
                        style={{ flexGrow: 1, minWidth: '200px' }}
                        placeholder="Buscar por nombre o departamento..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                    />
                    <select 
                        className={styles.select} 
                        value={filtroDepto} 
                        onChange={e => setFiltroDepto(e.target.value)}
                        style={{ minWidth: '200px' }}
                    >
                        <option value="todos">Todos los departamentos ({cuadrillas.length})</option>
                        {departamentos.map(d => (
                            <option key={d.id} value={d.id}>
                                {d.nombre} ({cuadrillas.filter(c => c.departamentoId === d.id).length})
                            </option>
                        ))}
                    </select>
                    {busqueda && (
                        <button type="button" onClick={() => setBusqueda('')} className={styles.btnCancel}>
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* TABLA DE RESULTADOS */}
            <div className={styles.tableContainer}>
                {cargando ? (
                    <p style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        <i className="bi bi-hourglass-split"></i> Cargando cuadrillas...
                    </p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cuadrilla</th>
                                <th>Departamento Asignado</th>
                                <th style={{ textAlign: 'center' }}><i className="bi bi-three-dots"></i></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cuadrillasFiltradas.length > 0 ? cuadrillasFiltradas.map(c => (
                                <tr key={c.id} className={styles.tableRow}>
                                    <td>
                                        <span style={{ color: '#64748b', fontWeight: '600' }}>#{c.id}</span>
                                    </td>
                                    <td>
                                        <div className={styles.userCell}>
                                            <div className={styles.avatar} style={{ background: '#14b8a6' }}>
                                                <i className="bi bi-people-fill"></i>
                                            </div>
                                            <div className={styles.userInfo}>
                                                <span className={styles.userName}>{c.nombre}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.contactCell}>
                                            <span className={styles.contactText} style={{ fontWeight: '500', color: '#334155' }}>
                                                <i className="bi bi-building"></i> {c.departamentoNombre || 'Sin asignar'}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button onClick={() => openEdit(c)} className={styles.btnIcon} title="Editar">
                                            <i className="bi bi-pencil-square" style={{ fontSize: '1.1rem', color: '#0ea5e9' }}></i>
                                        </button>
                                        <button onClick={() => handleEliminar(c.id)} className={styles.btnIcon} title="Eliminar">
                                            <i className="bi bi-trash" style={{ fontSize: '1.1rem', color: '#ef4444' }}></i>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                        No se encontraron cuadrillas con estos filtros.
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
                            <h3>{editing ? 'Editar Cuadrilla' : 'Registrar Nueva Cuadrilla'}</h3>
                            <button type="button" onClick={() => setModal(false)} className={styles.btnIcon}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={handleGuardar}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                                    <label>Nombre de la Cuadrilla *</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Ej: Reparación de Fugas"
                                        value={form.nombre}
                                        onChange={e => setForm({ ...form, nombre: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Departamento Asignado *</label>
                                    <select 
                                        className={styles.select}
                                        value={form.departamentoId}
                                        onChange={e => setForm({ ...form, departamentoId: e.target.value })}
                                        required
                                    >
                                        <option value="">Selecciona un departamento...</option>
                                        {departamentos.map(d => (
                                            <option key={d.id} value={d.id}>{d.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setModal(false)} className={styles.btnCancel}>
                                    Cancelar
                                </button>
                                <button type="submit" disabled={guardando} className={styles.btnPrimary}>
                                    {guardando ? 'Procesando...' : (editing ? 'Guardar Cambios' : 'Registrar Cuadrilla')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cuadrillas;