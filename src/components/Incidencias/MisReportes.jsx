import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { IncidenciasService } from '../../services/IncidenciasService';
import styles from './MisReportes.module.css';

const MisReportes = () => {
    const { usuario } = useAuth();
    const [misReportes, setMisReportes] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarMisReportes = async () => {
            if (usuario && usuario.id) {
                try {
                    setCargando(true);
                    const data = await IncidenciasService.obtenerMisIncidencias(usuario.id);
                    setMisReportes(data);
                } catch (error) {
                    console.error("Error al obtener los reportes del usuario", error);
                } finally {
                    setCargando(false);
                }
            }
        };

        cargarMisReportes();
    }, [usuario]);

    if (cargando) {
        return <div className={styles.loadingContainer}>Cargando mis reportes...</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Mis incidencias</h1>
            <p className={styles.subtitle}>Historial de incidencias que has reportado</p>

            {misReportes.length === 0 ? (
                <div className={styles.emptyState}>
                    <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#cbd5e1' }}></i>
                    <p>Aún no has creado ningún reporte.</p>
                </div>
            ) : (
                <div className={styles.gridContainer}>
                    {misReportes.map((reporte) => (
                        <div key={reporte.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h3>{reporte.titulo}</h3>
                                <span className={`${styles.badge} ${styles[reporte.estado?.toLowerCase()]}`}>
                                    {reporte.estado}
                                </span>
                            </div>
                            <div className={styles.cardBody}>
                                <p><strong>Folio:</strong> {reporte.id}</p>
                                <p><strong>Descripción:</strong> {reporte.descripcion}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MisReportes;