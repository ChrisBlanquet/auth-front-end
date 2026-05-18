import React, { useState, useEffect } from 'react';
import { personalApi, incidenciasApi, puestosApi, cuadrillasApi } from '../../services/GestionInstitucionalService';
import Notification from '../../components/Notification/Notification';
import styles from '../../pages/Admin/GestionUsuarios.module.css';

// --- Componentes auxiliares visuales ---
const DispBadge = ({ disponible }) => {
    const badgeStyle = disponible 
        ? { background: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(52, 211, 153, 0.5)' }
        : { background: 'rgba(239, 68, 68, 0.1)', color: '#DC2626', border: '1px solid rgba(248, 113, 113, 0.5)' };
    
    return (
        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px', ...badgeStyle }}>
            <div className={`${styles.dot} ${disponible ? styles.dotActive : styles.dotInactive}`} style={{ width: '6px', height: '6px' }}></div>
            {disponible ? 'Disponible' : 'Ocupado'}
        </span>
    );
};

const StatusBadge = ({ status }) => {
    return (
        <span style={{ 
            background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', 
            borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: '700' 
        }}>
            {status}
        </span>
    );
};

// --- Modal de Detalle ---
const VerPersonalModalHTML = ({ p, onClose }) => {
    const [incidenciaAsignada, setIncidenciaAsignada] = useState(null);
    const [loadingInc, setLoadingInc] = useState(false);

    useEffect(() => {
        if (!p) return;
        setIncidenciaAsignada(null);
        setLoadingInc(true);
        incidenciasApi.getAll()
            .then(r => {
                const inc = (r.data || []).find(i => i.personalId === p.id);
                setIncidenciaAsignada(inc || null);
            })
            .catch(() => setIncidenciaAsignada(null))
            .finally(() => setLoadingInc(false));
    }, [p?.id]);

    if (!p) return null;

    const Campo = ({ label, valor, icon }) => (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{
                width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
                background: '#f8fafc', border: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <i className={icon} style={{ color: '#b91c1c', fontSize: '14px' }}></i>
            </div>
            <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
                    {label}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                    {valor || '—'}
                </div>
            </div>
        </div>
    );

    return (
        <div className={styles.modalOverlay} style={{ zIndex: 1010 }}>
            <div className={styles.modalContent} style={{ maxWidth: '460px' }}>
                <div className={styles.modalHeader}>
                    <h3>Información del Personal</h3>
                    <button onClick={onClose} className={styles.btnIcon}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>
                
                <div className={styles.modalBody}>
                    {/* Avatar y nombre */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' }}>
                        <div className={styles.avatar} style={{ width: '52px', height: '52px', borderRadius: '12px', flexShrink: 0, background: '#b91c1c', fontSize: '22px' }}>
                            {(p.nombre || 'U')[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '800', fontSize: '17px', color: '#0f172a', marginBottom: '5px' }}>
                                {p.nombre || `Usuario ${p.usuarioId}`}
                            </div>
                            <DispBadge disponible={p.disponible} />
                        </div>
                    </div>

                    {/* Campos */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Campo label="Correo electrónico" valor={p.email} icon="bi bi-envelope-fill" />
                        <Campo label="Teléfono" valor={p.telefono} icon="bi bi-telephone-fill" />
                        <Campo label="Puesto" valor={p.puestoNombre} icon="bi bi-briefcase-fill" />
                        <Campo label="Cuadrilla" valor={p.cuadrillaNombre} icon="bi bi-people-fill" />
                        <Campo label="Departamento" valor={p.departamentoNombre} icon="bi bi-building-fill" />
                    </div>

                    {/* Incidencia asignada */}
                    <div style={{ marginTop: '16px', background: incidenciaAsignada ? '#f0fdf4' : '#fffbeb', border: `1px solid ${incidenciaAsignada ? '#86efac' : '#fcd34d'}`, borderRadius: '10px', padding: '14px 16px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="bi bi-geo-alt-fill" style={{ color: '#b91c1c', fontSize: '11px' }}></i>
                            Incidencia asignada
                        </div>
                        {loadingInc ? (
                            <div style={{ fontSize: '13px', color: '#64748b' }}><i className="bi bi-hourglass-split"></i> Buscando en MS2…</div>
                        ) : incidenciaAsignada ? (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '6px', padding: '2px 10px', fontSize: '12px', fontWeight: '700' }}>
                                        #{incidenciaAsignada.id}
                                    </span>
                                    <StatusBadge status={incidenciaAsignada.estado} />
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', lineHeight: '1.4' }}>{incidenciaAsignada.titulo}</div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="bi bi-clock" style={{ color: '#b45309', fontSize: '16px' }}></i>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#92400e' }}>Sin incidencia asignada</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Disponible para recibir una asignación</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.modalActions}>
                    <button onClick={onClose} className={styles.btnPrimary}>Cerrar</button>
                </div>
            </div>
        </div>
    );
};

// --- Componente Principal ---
const Personal = () => {
    const [personal, setPersonal] = useState([]);
    const [incidencias, setIncidencias] = useState([]);
    const [usuariosMS1, setUsuariosMS1] = useState([]);
    const [puestos, setPuestos] = useState([]);
    const [cuadrillas, setCuadrillas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: 'info' });

    // Modales y filtros
    const [modalCrear, setModalCrear] = useState(false);
    const [modalAsignar, setModalAsignar] = useState(false);
    const [modalVer, setModalVer] = useState(null);
    const [personalSel, setPersonalSel] = useState(null);
    const [ms1Warn, setMs1Warn] = useState(false);
    
    const [busqueda, setBusqueda] = useState('');
    const [filtro, setFiltro] = useState('todos');

    const [form, setForm] = useState({ usuarioId: '', puestoId: '', cuadrillaId: '' });
    const [asignarForm, setAsignarForm] = useState({ incidenciaId: '', usuarioAsignador: 1 });
    const [guardando, setGuardando] = useState(false);

    const mostrarMsg = (mensaje, tipo) => {
        setNotificacion({ visible: true, mensaje, tipo });
        setTimeout(() => setNotificacion(prev => ({ ...prev, visible: false })), 3000);
    };

    const load = async () => {
        setCargando(true);
        try {
            const res = await personalApi.getAll();
            setPersonal(res.data || []);
        } catch (error) {
            mostrarMsg('No se pudo cargar el personal.', 'error');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { load(); }, []);

    const abrirCrear = async () => {
        setMs1Warn(false);
        setForm({ usuarioId: '', puestoId: '', cuadrillaId: '' });

        try {
            const [pRes, cRes] = await Promise.all([puestosApi.getAll(), cuadrillasApi.getAll()]);
            setPuestos(pRes.data || []);
            setCuadrillas(cRes.data || []);
        } catch {
            mostrarMsg('Error al cargar puestos o cuadrillas.', 'error');
            return;
        }

        try {
            const r = await personalApi.getEmpleadosMS1();
            const registrados = personal.map(p => p.usuarioId);
            const libres = (r.data || []).filter(u => !registrados.includes(u.id));
            setUsuariosMS1(libres);
            if (libres.length === 0) {
                mostrarMsg('Todos los empleados ya están registrados.', 'warning');
                return;
            }
        } catch {
            setUsuariosMS1([]);
            setMs1Warn(true);
        }
        setModalCrear(true);
    };

    const guardarPersonal = async (e) => {
        e.preventDefault();
        const { usuarioId, puestoId, cuadrillaId } = form;
        if (!usuarioId || !puestoId || !cuadrillaId) {
            mostrarMsg('Completa todos los campos', 'error');
            return;
        }
        setGuardando(true);
        try {
            await personalApi.create({ usuarioId: Number(usuarioId), puestoId: Number(puestoId), cuadrillaId: Number(cuadrillaId), disponible: true });
            mostrarMsg('Personal creado correctamente', 'success');
            setModalCrear(false);
            load();
        } catch (e) {
            mostrarMsg(e?.response?.data?.message || 'Error al crear personal', 'error');
        } finally {
            setGuardando(false);
        }
    };

    const abrirAsignar = async (p) => {
        setPersonalSel(p);
        setAsignarForm({ incidenciaId: '', usuarioAsignador: 1 }); // ID Asignador por defecto
        try {
            const r = await incidenciasApi.getAll();
            setIncidencias((r.data || []).filter(i => i.estado === 'REPORTADO' || i.estado === 'EN_PROCESO'));
            setModalAsignar(true);
        } catch {
            setIncidencias([]);
            mostrarMsg('No se pudieron cargar las incidencias', 'error');
        }
    };

    const confirmarAsignar = async (e) => {
        e.preventDefault();
        if (!asignarForm.incidenciaId) { mostrarMsg('Selecciona una incidencia', 'error'); return; }
        setGuardando(true);
        try {
            await incidenciasApi.asignar(asignarForm.incidenciaId, personalSel.id, asignarForm.usuarioAsignador);
            await personalApi.cambiarDisp(personalSel.id, false);
            mostrarMsg(`${personalSel.nombre || 'Personal'} asignado a incidencia #${asignarForm.incidenciaId}`, 'success');
            setModalAsignar(false);
            load();
        } catch (e) {
            mostrarMsg(e?.response?.data?.message || 'Error al asignar', 'error');
        } finally {
            setGuardando(false);
        }
    };

    const toggleDisp = async p => {
        try {
            await personalApi.cambiarDisp(p.id, !p.disponible);
            mostrarMsg('Disponibilidad actualizada', 'success');
            load();
        } catch { mostrarMsg('Error al cambiar disponibilidad', 'error'); }
    };

    const handleEliminar = async (id, nombre) => {
        if (!window.confirm(`¿Estás seguro de eliminar a ${nombre || 'este personal'}?`)) return;
        try { 
            await personalApi.delete(id); 
            mostrarMsg('Personal eliminado', 'success'); 
            load(); 
        } catch { mostrarMsg('No se pudo eliminar el registro', 'error'); }
    };

    // Filtros Locales
    let personalFiltrado = personal;
    if (filtro === 'disponibles') personalFiltrado = personal.filter(p => p.disponible);
    if (filtro === 'ocupados') personalFiltrado = personal.filter(p => !p.disponible);
    
    if (busqueda) {
        personalFiltrado = personalFiltrado.filter(p => 
            (p.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) || 
            (p.puestoNombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
            (p.cuadrillaNombre || '').toLowerCase().includes(busqueda.toLowerCase())
        );
    }

    const usuarioSel = usuariosMS1.find(u => u.id === Number(form.usuarioId));
    const incSel = incidencias.find(i => i.id === Number(asignarForm.incidenciaId));

    return (
        <div className={styles.container}>
            <Notification {...notificacion} />

            {/* HEADER */}
            <div className={styles.header}>
                <h2 className={styles.headerTitle}>Gestión de Personal</h2>
                <button onClick={abrirCrear} className={styles.btnPrimary}>
                    <i className="bi bi-person-plus-fill"></i> Nuevo Personal
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
                        placeholder="Buscar por nombre, puesto o cuadrilla..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                    />
                    <select className={styles.select} value={filtro} onChange={e => setFiltro(e.target.value)} style={{ minWidth: '150px' }}>
                        <option value="todos">Todos ({personal.length})</option>
                        <option value="disponibles">Disponibles ({personal.filter(p => p.disponible).length})</option>
                        <option value="ocupados">Ocupados ({personal.filter(p => !p.disponible).length})</option>
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
                        <i className="bi bi-hourglass-split"></i> Cargando personal...
                    </p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Empleado</th>
                                <th>Puesto</th>
                                <th>Cuadrilla / Depto</th>
                                <th>Estado</th>
                                <th style={{ textAlign: 'center' }}><i className="bi bi-three-dots"></i></th>
                            </tr>
                        </thead>
                        <tbody>
                            {personalFiltrado.length > 0 ? personalFiltrado.map(p => (
                                <tr key={p.id} className={styles.tableRow}>
                                    <td>
                                        <div className={styles.userCell}>
                                            <div className={styles.avatar} style={{ background: '#b91c1c' }}>
                                                {(p.nombre || 'U')[0].toUpperCase()}
                                            </div>
                                            <div className={styles.userInfo}>
                                                <span className={styles.userName}>{p.nombre || `Usuario ${p.usuarioId}`}</span>
                                                <span className={styles.userId}>{p.email || `ID: ${p.usuarioId}`}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={styles.badgeRol} style={{ background: '#e0f2fe', color: '#0369a1' }}>
                                            {p.puestoNombre || 'Sin puesto'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.contactCell}>
                                            <span className={styles.contactText} style={{ fontWeight: '500', color: '#334155' }}>
                                                <i className="bi bi-people"></i> {p.cuadrillaNombre || '—'}
                                            </span>
                                            <span className={styles.contactText} style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                <i className="bi bi-building"></i> {p.departamentoNombre || '—'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <button onClick={() => toggleDisp(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} title="Clic para cambiar disponibilidad">
                                            <DispBadge disponible={p.disponible} />
                                        </button>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button className={styles.btnIcon} title="Ver detalles" onClick={() => setModalVer(p)}>
                                            <i className="bi bi-eye-fill" style={{ fontSize: '1.1rem', color: '#64748b' }}></i>
                                        </button>
                                        {p.disponible && (
                                            <button className={styles.btnIcon} title="Asignar incidencia" onClick={() => abrirAsignar(p)}>
                                                <i className="bi bi-lightning-fill" style={{ fontSize: '1.1rem', color: '#059669' }}></i>
                                            </button>
                                        )}
                                        <button className={styles.btnIcon} title="Eliminar" onClick={() => handleEliminar(p.id, p.nombre)}>
                                            <i className="bi bi-trash" style={{ fontSize: '1.1rem', color: '#ef4444' }}></i>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                        No se encontró personal con estos filtros.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL VER DETALLES */}
            <VerPersonalModalHTML p={modalVer} onClose={() => setModalVer(null)} />

            {/* MODAL CREAR PERSONAL */}
            {modalCrear && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
                        <div className={styles.modalHeader}>
                            <h3>Registrar Personal</h3>
                            <button type="button" onClick={() => setModalCrear(false)} className={styles.btnIcon}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={guardarPersonal}>
                            <div className={styles.modalBody}>
                                {ms1Warn && (
                                    <div style={{ background: '#fffbeb', color: '#92400e', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fcd34d', marginBottom: '15px', fontSize: '0.85rem' }}>
                                        <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: '6px' }}></i> MS1 no disponible. Ingresa el ID manualmente.
                                    </div>
                                )}

                                <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
                                    <label>Empleado *</label>
                                    {ms1Warn ? (
                                        <input type="number" className={styles.input} placeholder="ID del usuario en MS1..." value={form.usuarioId} onChange={e => setForm({ ...form, usuarioId: e.target.value })} required />
                                    ) : (
                                        <select className={styles.select} value={form.usuarioId} onChange={e => setForm({ ...form, usuarioId: e.target.value })} required>
                                            <option value="">Selecciona un empleado...</option>
                                            {usuariosMS1.map(u => <option key={u.id} value={u.id}>{u.nombre} — {u.email}</option>)}
                                        </select>
                                    )}
                                </div>

                                {usuarioSel && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', marginBottom: '1rem' }}>
                                        <div className={styles.avatar} style={{ background: '#b91c1c', width: '36px', height: '36px', borderRadius: '8px' }}>
                                            {usuarioSel.nombre[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>{usuarioSel.nombre}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{usuarioSel.email}</div>
                                        </div>
                                    </div>
                                )}

                                <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
                                    <label>Puesto *</label>
                                    <select className={styles.select} value={form.puestoId} onChange={e => setForm({ ...form, puestoId: e.target.value })} required>
                                        <option value="">Selecciona un puesto...</option>
                                        {puestos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Cuadrilla *</label>
                                    <select className={styles.select} value={form.cuadrillaId} onChange={e => setForm({ ...form, cuadrillaId: e.target.value })} required>
                                        <option value="">Selecciona una cuadrilla...</option>
                                        {cuadrillas.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.departamentoNombre ? `— ${c.departamentoNombre}` : ''}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setModalCrear(false)} className={styles.btnCancel}>Cancelar</button>
                                <button type="submit" disabled={guardando} className={styles.btnPrimary}>
                                    {guardando ? 'Procesando...' : 'Registrar Personal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL ASIGNAR INCIDENCIA */}
            {modalAsignar && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
                        <div className={styles.modalHeader}>
                            <h3>Asignar a Incidencia</h3>
                            <button type="button" onClick={() => setModalAsignar(false)} className={styles.btnIcon}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={confirmarAsignar}>
                            <div className={styles.modalBody}>
                                {personalSel && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
                                        <div className={styles.avatar} style={{ background: '#0f766e', borderRadius: '8px' }}>
                                            {(personalSel.nombre || 'U')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>{personalSel.nombre || `Usuario ${personalSel.usuarioId}`}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{personalSel.puestoNombre} · {personalSel.cuadrillaNombre}</div>
                                        </div>
                                    </div>
                                )}

                                <div className={styles.formGroup} style={{ marginBottom: '15px' }}>
                                    <label>Incidencia a atender *</label>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px', display: 'block' }}>Solo incidencias en REPORTADO o EN_PROCESO</span>
                                    
                                    {incidencias.length === 0 ? (
                                        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: '#92400e' }}>
                                            <i className="bi bi-exclamation-circle-fill" style={{ marginRight: '8px' }}></i> No hay incidencias disponibles.
                                        </div>
                                    ) : (
                                        <select className={styles.select} value={asignarForm.incidenciaId} onChange={e => setAsignarForm({ ...asignarForm, incidenciaId: e.target.value })} required>
                                            <option value="">Selecciona una incidencia...</option>
                                            {incidencias.map(i => <option key={i.id} value={i.id}>#{i.id} — {i.titulo} [{i.estado}]</option>)}
                                        </select>
                                    )}
                                </div>

                                {incSel && (
                                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
                                        <div style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a', marginBottom: '6px' }}>#{incSel.id} — {incSel.titulo}</div>
                                        <StatusBadge status={incSel.estado} />
                                    </div>
                                )}
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setModalAsignar(false)} className={styles.btnCancel}>Cancelar</button>
                                <button type="submit" disabled={guardando || incidencias.length === 0} className={styles.btnPrimary} style={{ background: '#0d9488' }}>
                                    {guardando ? 'Asignando...' : 'Confirmar Asignación'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Personal;