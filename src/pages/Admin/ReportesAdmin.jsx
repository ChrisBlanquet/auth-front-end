import React, { useEffect, useState } from 'react';
import styles from './ReportesAdmin.module.css';
import Notification from '../../components/Notification/Notification';
import { obtenerCatalogosReportes, obtenerPdfReporte, obtenerPdfCatalogos } from '../../services/reportesService';

const ReportesAdmin = () => {
    const [catalogos, setCatalogos] = useState([]);
    // 1. Cambiamos años por fechaInicio y fechaFin
    const [filtros, setFiltros] = useState({ tipoId: '', nombre: '', estado: 'TODOS', fechaInicio: '', fechaFin: '' });
    const [pdfUrl, setPdfUrl] = useState('');
    const [mostrarPdf, setMostrarPdf] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: 'info' });

    useEffect(() => {
        cargarCatalogos();
    }, []);

    const mostrarMensaje = (mensaje, tipo = 'info') => {
        setNotificacion({ visible: true, mensaje, tipo });
        setTimeout(() => setNotificacion(prev => ({ ...prev, visible: false })), 3000);
    };

    const cargarCatalogos = async () => {
        setCargando(true);
        try {
            const response = await obtenerCatalogosReportes();
            const catalogosData = response.data || [];
            setCatalogos(catalogosData);

            if (catalogosData.length > 0) {
                setFiltros(prev => ({
                    ...prev,
                    tipoId: catalogosData[0].id || '',
                    nombre: catalogosData[0].nombre || '',
                }));
            }
        } catch (error) {
            mostrarMensaje('No se pudieron cargar los catálogos de reportes.', 'error');
        } finally {
            setCargando(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'tipoId') {
            const tipoSeleccionado = catalogos.find(cat => String(cat.id) === String(value));
            setFiltros(prev => ({
                ...prev,
                tipoId: value,
                nombre: tipoSeleccionado?.nombre || '',
            }));
            return;
        }

        setFiltros(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // 2. Función para limpiar filtros al igual que en Gestión
    const limpiarFiltros = () => {
        setFiltros({
            tipoId: catalogos.length > 0 ? catalogos[0].id : '',
            nombre: catalogos.length > 0 ? catalogos[0].nombre : '',
            estado: 'TODOS',
            fechaInicio: '',
            fechaFin: ''
        });
    };

    const generarPdf = async (tipo = 'general') => {
        if (!filtros.tipoId) {
            mostrarMensaje('Selecciona un tipo de incidencia antes de generar el reporte.', 'warning');
            return;
        }

        setCargando(true);
        try {
            const url = await obtenerPdfReporte(filtros, tipo);
            setPdfUrl(url);
            setMostrarPdf(true);
        } catch (error) {
            mostrarMensaje('No se pudo generar el reporte PDF.', 'error');
        } finally {
            setCargando(false);
        }
    };

    const verCatalogos = async () => {
        setCargando(true);
        try {
            const url = await obtenerPdfCatalogos();
            setPdfUrl(url);
            setMostrarPdf(true);
        } catch (error) {
            mostrarMensaje('No se pudo obtener el PDF de catálogos.', 'error');
        } finally {
            setCargando(false);
        }
    };

    const estadoAmigable = filtros.estado
        ? filtros.estado.replace('_', ' ').charAt(0).toUpperCase() + filtros.estado.replace('_', ' ').slice(1).toLowerCase()
        : 'Todos';

    return (
        <div className={styles.container}>
            <Notification {...notificacion} />

            <div className={styles.header}>
                <div>
                    <h2 className={styles.headerTitle}>Reportes institucionales</h2>
                    <p className={styles.subtitle}>Consulta y genera documentos oficiales desde el panel administrativo.</p>
                </div>
            </div>

            {/* --- BARRA DE FILTROS ACTUALIZADA --- */}
            <div className={styles.toolbar} style={{ flexWrap: 'wrap', gap: '15px' }}>

                {/* Filtro Estado */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Estado:</label>
                    <select className={styles.select} name="estado" value={filtros.estado} onChange={handleChange}>
                        <option value="TODOS">Todos</option>
                        <option value="REPORTADO">Reportado</option>
                        <option value="EN_PROCESO">En proceso</option>
                        <option value="RESUELTO">Resuelto</option>
                        <option value="CERRADO">Cerrado</option>
                    </select>
                </div>

                {/* Filtro Tipo */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Tipo:</label>
                    <select className={styles.select} name="tipoId" value={filtros.tipoId} onChange={handleChange}>
                        {catalogos.map(cat => {
                            const nombreAmigable = cat.nombre.charAt(0).toUpperCase() + cat.nombre.slice(1).toLowerCase();
                            return (
                                <option key={cat.id} value={cat.id}>{nombreAmigable}</option>
                            );
                        })}
                    </select>
                </div>

                {/* Filtro Fecha Desde */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Desde:</label>
                    <input type="date" className={styles.input} name="fechaInicio" value={filtros.fechaInicio} onChange={handleChange} />
                </div>

                {/* Filtro Fecha Hasta */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Hasta:</label>
                    <input type="date" className={styles.input} name="fechaFin" value={filtros.fechaFin} onChange={handleChange} />
                </div>

                {/* Botón Limpiar */}
                <button onClick={limpiarFiltros} className={styles.btnCancel} style={{ padding: '0.5rem 1rem' }}>
                    Limpiar
                </button>
                <button type="button" className={styles.btnCancel} onClick={() => generarPdf('detallado')} disabled={cargando}>
                    Buscar
                </button>
            </div>

            {/* BOTONES DE ACCIÓN PARA PDF */}
            <div className={styles.toolbar} style={{ marginTop: '15px', justifyContent: 'flex-start' }}>
                <div className={styles.buttonRow} style={{ width: '100%' }}>
                    <button type="button" className={styles.btnPrimary} onClick={() => generarPdf('general')} disabled={cargando}>
                        <i className="bi bi-file-earmark-pdf" style={{ marginRight: '5px' }}></i> Ver resumen PDF
                    </button>
                    <button type="button" className={styles.btnSecondary} onClick={verCatalogos} disabled={cargando}>
                        <i className="bi bi-list-ul" style={{ marginRight: '5px' }}></i> Ver catálogos
                    </button>
                </div>
            </div>

            <div className={styles.contentGrid}>
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Filtros</h3>
                    <p className={styles.cardText}>Ajusta los parámetros y genera el reporte oficial directamente desde el panel.</p>
                    <div className={styles.statsRow}>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Catálogos cargados</span>
                            <strong className={styles.statValue}>{catalogos.length}</strong>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Estado actual</span>
                            <strong className={styles.statValue}>{estadoAmigable}</strong>
                        </div>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.pdfHeader}>
                        <h3 className={styles.cardTitle}>Vista previa del PDF</h3>

                        {mostrarPdf && pdfUrl && (
                            <div className={styles.pdfActions}>
                                <button
                                    type="button"
                                    className={styles.pdfActionButton}
                                    onClick={() => {
                                        const link = document.createElement("a");
                                        link.href = pdfUrl;
                                        link.download = "Reporte.pdf";
                                        document.body.appendChild(link);
                                        link.click();
                                        link.remove();
                                    }}
                                >
                                    <i className="bi bi-download"></i> Descargar
                                </button>

                                <button
                                    type="button"
                                    className={styles.pdfActionButton}
                                    onClick={() => {
                                        const printWindow = window.open(pdfUrl, "_blank");
                                        if (printWindow) {
                                            printWindow.onload = () => {
                                                printWindow.focus();
                                                printWindow.print();
                                            };
                                        }
                                    }}
                                >
                                    <i className="bi bi-printer"></i> Imprimir
                                </button>
                            </div>
                        )}
                    </div>

                    {mostrarPdf && pdfUrl ? (
                        <div className={styles.pdfFrameShell}>
                            <iframe
                                title="Vista previa PDF"
                                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                                className={styles.pdfViewer}
                            />
                        </div>
                    ) : (
                        <div className={styles.pdfPlaceholder}>
                            <i className="bi bi-file-earmark-pdf"></i>
                            <p>Selecciona un filtro y genera un PDF para verlo aquí.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportesAdmin;