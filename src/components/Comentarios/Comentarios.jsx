import React, { useState, useEffect, useMemo } from 'react';
import ChatIncidencia from "./ChatIncidencia";
import { getAllComentarios } from '../../services/ComentarioService';
import { IncidenciasService } from '../../services/IncidenciasService';
import styles from './Comentarios.module.css';
import { useAuth } from '../../context/AuthContext';

const Comentarios = () => {
// 1. Extraemos los datos del usuario actual
    const { usuario, rol } = useAuth();

    const [incidencias, setIncidencias] = useState([]);
    const [incidenciaSeleccionada, setIncidenciaSeleccionada] = useState(null);
    const [cargando, setCargando] = useState(true);

    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('Todas');

    useEffect(() => {
        const cargarListaDeIncidencias = async () => {
            try {
                let res;
                
                // 2. Condicionamos según el rol
                if (rol === 'ROLE_CIUDADANO' || rol === 'CIUDADANO') {
                    // Si es ciudadano, solo trae SUS incidencias
                    res = await IncidenciasService.obtenerMisIncidencias(usuario.id);
                } else {
                    // Si es admin/sistema, trae TODAS
                    res = await IncidenciasService.obtenerTodasLasIncidencias();
                }

                const incidenciasArray = Array.isArray(res) ? res : (res?.data || []);
                setIncidencias(incidenciasArray);
            } catch (error) {
                console.error("Error al cargar la lista de incidencias:", error);
            } finally {
                setCargando(false);
            }
        };

        // 3. Nos aseguramos de que haya un usuario antes de llamar a la API
        if (usuario && usuario.id) {
            cargarListaDeIncidencias();
        }
    }, [usuario, rol]);

    // Lógica para filtrar la lista en tiempo real
    const incidenciasFiltradas = useMemo(() => {
        return incidencias.filter(inc => {
            // 1. Ignorar completamente las CERRADAS o ABIERTAS
            // Si el estado es CERRADO o ABIERTA, lo sacamos de la lista inmediatamente
            if (inc.estado === 'CERRADO' || inc.estado === 'RESUELTO') {
                return false;
            }

            // 2. Filtro de búsqueda por texto
            const texto = busqueda.toLowerCase();
            const coincideTexto =
                (inc.titulo && inc.titulo.toLowerCase().includes(texto)) ||
                (inc.descripcion && inc.descripcion.toLowerCase().includes(texto)) ||
                (inc.id && inc.id.toString().includes(texto));

            // 3. Filtro por el select (Todas, Reportado, En proceso)
            const coincideEstado = filtroEstado === 'Todas' || inc.estado === filtroEstado;

            return coincideTexto && coincideEstado;
        });
    }, [incidencias, busqueda, filtroEstado]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.headerTitle}>Incidencias y Conversaciones</h2>
            </div>

            <div className={styles.contentGrid}>
                {/* --- COLUMNA IZQUIERDA: LISTA DE INCIDENCIAS --- */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h6 className={styles.cardTitle} style={{ marginBottom: '1rem' }}>Lista de incidencias</h6>

                        {/* Controles de Búsqueda y Filtro */}
                        <div className={styles.filtrosContainer}>
                            <input
                                type="text"
                                placeholder="Buscar por título, descripción o folio"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className={styles.searchInput}
                            />
                            <select
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                                className={styles.statusSelect}
                            >
                                <option value="Todas">Todas</option>
                                <option value="REPORTADO">Reportado</option>
                                <option value="EN PROCESO">En proceso</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.listContainer}>
                        {cargando ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Cargando incidencias...</div>
                        ) : incidenciasFiltradas.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No se encontraron incidencias.</div>
                        ) : (
                            incidenciasFiltradas.map((inc) => (
                                <button
                                    key={inc.id}
                                    onClick={() => setIncidenciaSeleccionada(inc)}
                                    className={`${styles.listItem} ${incidenciaSeleccionada?.id === inc.id ? styles.listItemSelected : ''}`}
                                >
                                    <div className={styles.itemContent}>
                                        <div className={styles.itemHeader}>
                                            <h6 className={styles.itemTitle}>{inc.titulo}</h6>
                                            <span className={styles.statusBadgeLista}>{inc.estado}</span>
                                        </div>
                                        <p className={styles.itemSubtitle}><strong>Folio:</strong> {inc.id}</p>
                                        <p className={styles.itemSubtitle}>
                                            <strong>Descripción:</strong> {inc.descripcion ? `${inc.descripcion.substring(0, 45)}...` : 'Sin descripción'}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* --- COLUMNA DERECHA: EL CHAT ACTIVO --- */}
                <div>
                    {incidenciaSeleccionada ? (
                        <ChatIncidencia
                            incidencia={incidenciaSeleccionada}
                            onClose={() => setIncidenciaSeleccionada(null)}
                        />
                    ) : (
                        <div className={styles.emptyState}>
                            <i className="bi bi-chat-left-dots"></i>
                            <h3 className={styles.cardTitle} style={{ marginBottom: '0.5rem' }}>Selecciona una incidencia</h3>
                            <p style={{ margin: 0 }}>Haz clic en un elemento de la lista para ver o enviar comentarios.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Comentarios;