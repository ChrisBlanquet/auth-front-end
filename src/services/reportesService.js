import api from './api';

const API_BASE_URL = 'http://135.232.229.213:9000/api';

export const obtenerCatalogosReportes = () => {
    return api.get(`${API_BASE_URL}/incidencias/catalogos-tipos`);
};

export const obtenerPdfReporte = async (filtros, tipo = 'general') => {
    const tipoId = filtros.tipoId;
    const nombre = encodeURIComponent(filtros.nombre || 'General');

    const ruta = tipo === 'detallado'
        ? `${API_BASE_URL}/reportes/pdf/detallado/${tipoId}/${nombre}`
        : `${API_BASE_URL}/reportes/pdf/${tipoId}/${nombre}`;

    // Validar si el estado es TODOS para no mandarlo como filtro estricto
    const estadoReal = filtros.estado === 'TODOS' ? null : filtros.estado;

const response = await api.get(ruta, {
        params: {
            estado: estadoReal, 
            fechaInicio: filtros.fechaInicio || null, // <- Actualizado
            fechaFin: filtros.fechaFin || null,       // <- Actualizado
            t: Date.now(),
        },
        responseType: 'blob',
    });

    return URL.createObjectURL(
        new Blob([response.data], { type: 'application/pdf' })
    );
};

export const obtenerPdfCatalogos = async () => {
    const response = await api.get(`${API_BASE_URL}/reportes/pdf/catalogos`, {
        params: {
            t: Date.now(),
        },
        responseType: 'blob',
    });

    return URL.createObjectURL(
        new Blob([response.data], { type: 'application/pdf' })
    );
};