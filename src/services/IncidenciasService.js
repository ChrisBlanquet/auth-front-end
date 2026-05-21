// src/services/IncidenciasService.js
import api from './api';

export const IncidenciasService = {

  crearIncidencia: async (incidenciaData) => {
    try {
      const response = await api.post(`/incidencias`, incidenciaData);
      return response.data;
    } catch (error) {
      console.error("Error en IncidenciasService.crearIncidencia:", error);
      throw error;
    }
  },

  obtenerTiposIncidencia: async () => {
    try {
      const response = await api.get(`/incidencias/catalogos-tipos`);
      const data = response.data;
      return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
      console.error("Error al obtener tipos:", error);
      return [];
    }
  },

  obtenerMisIncidencias: async (usuarioId) => {
    try {
      const response = await api.get(`/incidencias/usuario/${usuarioId}`);
      return response.data;
    } catch (error) {
      console.error("Error al cargar mis incidencias:", error);
      return []; // Retornamos un arreglo vacío en caso de error
    }
  },

  asignarResponsable: async (incidenciaId, personalId, usuarioAsignador) => {
    try {
      const response = await api.patch(`/incidencias/${incidenciaId}/asignar?personalId=${personalId}&usuarioAsignador=${usuarioAsignador}`);
      return response.data;
    } catch (error) {
      console.error("Error en asignarResponsable:", error);
      throw error;
    }
  },

  obtenerTodasLasIncidencias: async () => {
    try {
      const response = await api.get(`/incidencias`);
      return response.data;
    } catch (error) {
      console.error("Error al cargar:", error);
      return [];
    }
  },

  obtenerPersonal: async () => {
    try {
      const response = await api.get(`/gestion/personal`);
      const data = response.data;
      return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
      console.error("Error al cargar personal:", error);
      return [];
    }
  },

  obtenerIncidenciasSinAsignar: async () => {
    try {
      const response = await api.get(`/incidencias/sin-asignar`);
      return response.data;
    } catch (error) {
      console.error("Error al cargar:", error);
      return [];
    }
  },

  cambiarEstado: async (incidenciaId, nuevoEstado, comentarios, usuarioModificador) => {
    try {
      const params = new URLSearchParams({
        nuevoEstado: nuevoEstado,
        comentarios: comentarios,
        usuarioModificador: usuarioModificador
      });
      const response = await api.patch(`/incidencias/${incidenciaId}/estado?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error en cambiarEstado:", error);
      throw error;
    }
  },

  guardarEvidenciaAntes: async (incidenciaId, urlImagen) => {
    const response = await api.post(`/evidencias/fotos-antes`, { idHistorialEstado: incidenciaId, url: urlImagen });
    return response.data;
  },

  guardarEvidenciaProceso: async (incidenciaId, personalId, urlImagen) => {
    const response = await api.post(`/evidencias/fotos-proceso`, { idHistorialEstado: incidenciaId, personalId: personalId, url: urlImagen });
    return response.data;
  },

  guardarEvidenciaDespues: async (incidenciaId, personalId, urlImagen) => {
    const response = await api.post(`/evidencias/fotos-despues`, { idHistorialEstado: incidenciaId, personalId: personalId, url: urlImagen });
    return response.data;
  },

  obtenerColoniasPorCodigoPostal: async (codigoPostal) => {
    try {
      const response = await api.get(`/ubicaciones/colonias/codigo-postal/${codigoPostal}`);
      return response.data || [];
    } catch (error) {
      console.error("Error al obtener colonias por CP:", error);
      throw error;
    }
  },

  crearUbicacion: async (ubicacionData) => {
    try {
      const response = await api.post(`/ubicaciones`, ubicacionData);
      return response.data;
    } catch (error) {
      console.error("Error al crear ubicación:", error);
      throw error;
    }
  },
  eliminarIncidencia: async (incidenciaId) => {
    try {
      const response = await api.delete(`/incidencias/${incidenciaId}`);
      return response.data;
    } catch (error) {
      console.error("Error al eliminar incidencia:", error);
      throw error;
    }
  },
  
obtenerClimaUbicacion: async (ubicacionId) => {
    try {
      const response = await api.get(`/incidencias/clima/${ubicacionId}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener el clima:", error);
      return null;
    }
  }
};
