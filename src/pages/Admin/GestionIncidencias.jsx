import React, { useState, useEffect } from 'react';
// Puedes reutilizar el mismo CSS de Gestión de Usuarios o crear uno nuevo
import styles from './GestionUsuarios.module.css';
import { IncidenciasService } from '../../services/IncidenciasService';
import Notification from '../../components/Notification/Notification';

const GestionIncidencias = () => {
    const [incidenciasFull, setIncidenciasFull] = useState([]);
    const [incidenciasMostradas, setIncidenciasMostradas] = useState([]);
    const [tiposIncidencia, setTiposIncidencia] = useState([]);
    const [personal, setPersonal] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: 'info' });

    // Estados de Filtros
    const [filtroEstado, setFiltroEstado] = useState('TODOS');
    const [filtroTipo, setFiltroTipo] = useState('TODOS');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    const mostrarMsg = (mensaje, tipo) => {
        setNotificacion({ visible: true, mensaje, tipo });
        setTimeout(() => setNotificacion(prev => ({ ...prev, visible: false })), 3000);
    };

    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    // Efecto para aplicar filtros localmente cada vez que cambie un estado de filtro
    useEffect(() => {
        aplicarFiltros();
    }, [filtroEstado, filtroTipo, fechaInicio, fechaFin, incidenciasFull]);

    const cargarDatosIniciales = async () => {
        setCargando(true);
        try {
            const [dataIncidencias, dataTipos, dataPersonal] = await Promise.all([
                IncidenciasService.obtenerTodasLasIncidencias(),
                IncidenciasService.obtenerTiposIncidencia(),
                IncidenciasService.obtenerPersonal()
            ]);
            setIncidenciasFull(dataIncidencias);
            setTiposIncidencia(dataTipos);
            setPersonal(dataPersonal);
        } catch (error) {
            mostrarMsg("Error al cargar las incidencias", "error");
        } finally {
            setCargando(false);
        }
    };

    const getNombreTipo = (idBuscado) => {
        if (!idBuscado) return 'N/A';
        const tipoEncontrado = tiposIncidencia.find(tipo => tipo.id === idBuscado);
        return tipoEncontrado ? tipoEncontrado.nombre : 'N/A';
    };

    const getNombrePersonal = (idBuscado) => {
        if (!idBuscado) return 'Sin asignar';
        const empleado = personal.find(p => p.id === idBuscado);
        return empleado ? empleado.nombre : `ID: ${idBuscado}`;
    };

    const aplicarFiltros = () => {
        let filtradas = [...incidenciasFull];

        // Filtro por Estado
        if (filtroEstado !== 'TODOS') {
            filtradas = filtradas.filter(inc => inc.estado === filtroEstado);
        }

        // Filtro por tipo
        if (filtroTipo !== 'TODOS') {
            filtradas = filtradas.filter(inc => {
                const nombreTipo = getNombreTipo(inc.tipoIncidenciaId);
                return nombreTipo === filtroTipo;
            });
        }

        // Filtro por Rango de Fechas
        if (fechaInicio) {
            const fInicio = new Date(fechaInicio);
            filtradas = filtradas.filter(inc => new Date(inc.fechaCreacion || inc.fechaReporte) >= fInicio);
        }
        if (fechaFin) {
            // Se ajusta la fecha fin para incluir todo el día
            const fFin = new Date(fechaFin);
            fFin.setHours(23, 59, 59, 999);
            filtradas = filtradas.filter(inc => new Date(inc.fechaCreacion || inc.fechaReporte) <= fFin);
        }

        setIncidenciasMostradas(filtradas);
    };

    const limpiarFiltros = () => {
        setFiltroEstado('TODOS');
        setFiltroTipo('TODOS');
        setFechaInicio('');
        setFechaFin('');
    };

    const handleEliminar = async (id) => {
        // Pedimos confirmación antes de borrar
        const confirmar = window.confirm('¿Estás seguro de que deseas eliminar la incidencia #' + id + '? Esta acción no se puede deshacer.');

        if (confirmar) {
            try {
                await IncidenciasService.eliminarIncidencia(id);
                mostrarMsg("Incidencia eliminada correctamente", "success");
                // Recargamos los datos para que desaparezca de la tabla
                cargarDatosIniciales();
            } catch (error) {
                mostrarMsg("Error al eliminar la incidencia", "error");
            }
        }
    };

    return (
        <div className={styles.container}>
            <Notification {...notificacion} />

            <div className={styles.header}>
                <h2 className={styles.headerTitle}>Gestión de Incidencias</h2>
            </div>

            {/* --- BARRA DE FILTROS --- */}
            <div className={styles.toolbar} style={{ flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Estado:</label>
                    <select className={styles.select} value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                        <option value="TODOS">Todos</option>
                        <option value="REPORTADO">Reportado</option>
                        <option value="EN_PROCESO">En proceso</option>
                        <option value="RESUELTO">Resuelto</option>
                        <option value="CERRADO">Cerrado</option>
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Tipo:</label>
                    <select className={styles.select} value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                        <option value="TODOS">Todos los tipos</option>
                        {tiposIncidencia.map(tipo => {
                            // Convierte "BACHE" a "Bache" o "FUGA DE AGUA" a "Fuga de agua"
                            const nombreAmigable = tipo.nombre.charAt(0).toUpperCase() + tipo.nombre.slice(1).toLowerCase();
                            return (
                                <option key={tipo.id} value={tipo.nombre}>
                                    {nombreAmigable}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Desde:</label>
                    <input type="date" className={styles.input} value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Hasta:</label>
                    <input type="date" className={styles.input} value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
                </div>

                <button onClick={limpiarFiltros} className={styles.btnCancel} style={{ padding: '0.5rem 1rem' }}>
                    Limpiar
                </button>
            </div>

            {/* --- TABLA DE RESULTADOS --- */}
            <div className={styles.tableContainer}>
                {cargando ? (
                    <p style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}><i className="bi bi-hourglass-split"></i> Cargando incidencias...</p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID / Folio</th>
                                <th>Tipo</th>
                                <th>Descripcion</th>
                                <th>Fecha</th>
                                <th>Ubicación / Colonia</th>
                                <th>Asignacion personal</th>
                                <th>Estado</th>
                                <th style={{ textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {incidenciasMostradas.length > 0 ? incidenciasMostradas.map(inc => {
                                // --- TIPO ---
                                const nombreCrudo = getNombreTipo(inc.tipoIncidenciaId);
                                const nombreAmigable = nombreCrudo !== 'N/A'
                                    ? nombreCrudo.charAt(0).toUpperCase() + nombreCrudo.slice(1).toLowerCase()
                                    : 'N/A';

                                const estadoCrudo = inc.estado ? inc.estado.replace('_', ' ') : 'N/A';
                                // Luego aplicamos la misma regla de mayúscula/minúscula
                                const estadoAmigable = estadoCrudo !== 'N/A'
                                    ? estadoCrudo.charAt(0).toUpperCase() + estadoCrudo.slice(1).toLowerCase()
                                    : 'N/A';

                                return (
                                    <tr key={inc.id} className={styles.tableRow}>
                                        <td><strong>#{inc.id}</strong></td>
                                        <td>{nombreAmigable}</td>
                                        <td style={{ maxWidth: '300px' }}>
                                            {inc.descripcion || 'Sin descripción'}
                                        </td>
                                        <td>{new Date(inc.fechaCreacion || inc.fechaReporte).toLocaleDateString()}</td>
                                        <td>{inc.ubicacion?.colonia || 'Sin especificar'}</td>
                                        <td>
                                            {inc.personalId ? (
                                                <span style={{ color: '#047857', fontWeight: '500' }}>
                                                    <i className="bi bi-person-check-fill" style={{ marginRight: '5px' }}></i>
                                                    {getNombrePersonal(inc.personalId)}
                                                </span>
                                            ) : (
                                                <span style={{ color: '#d97706', fontStyle: 'italic' }}>
                                                    <i className="bi bi-person-dash" style={{ marginRight: '5px' }}></i>
                                                    Sin asignar
                                                </span>
                                            )}
                                        </td>
                                        <td>{estadoAmigable}</td>
                                        <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                                <button
                                                    className={styles.btnIcon}
                                                    title="Eliminar"
                                                    onClick={() => handleEliminar(inc.id)}
                                                    style={{ color: '#ef4444' }}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No se encontraron incidencias con estos filtros.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default GestionIncidencias;