import api from './api';


export const obtenerCatalogosReportes = () => {
    return api.get(`/incidencias/catalogos-tipos`);
};

export const obtenerPdfReporte = async (filtros, tipo = 'general') => {
    const tipoId = filtros.tipoId;
    const nombre = encodeURIComponent(filtros.nombre || 'General');

    const ruta = tipo === 'detallado'
        ? `/reportes/pdf/detallado/${tipoId}/${nombre}`
        : `/reportes/pdf/${tipoId}/${nombre}`;

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
    const response = await api.get(`/reportes/pdf/catalogos`, {
        params: {
            t: Date.now(),
        },
        responseType: 'blob',
    });

    return URL.createObjectURL(
        new Blob([response.data], { type: 'application/pdf' })
    );
};