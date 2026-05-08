// src/services/IncidenciasService.js
import api from './api'; 

const API_BASE_URL = 'http://135.232.229.213:9000/api';

export const IncidenciasService = {

  crearIncidencia: async (incidenciaData) => {
    try {
      const response = await api.post(`${API_BASE_URL}/incidencias`, incidenciaData);
      return response.data;
    } catch (error) {
      console.error("Error en IncidenciasService.crearIncidencia:", error);
      throw error; 
    }
  },

  obtenerTiposIncidencia: async () => {
    try {
      const response = await api.get(`${API_BASE_URL}/incidencias/catalogos-tipos`);
      const data = response.data;
      return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
      console.error("Error al obtener tipos:", error);
      return []; 
    }
  },

  asignarResponsable: async (incidenciaId, personalId, usuarioAsignador) => {
    try {
      const response = await api.patch(`${API_BASE_URL}/incidencias/${incidenciaId}/asignar?personalId=${personalId}&usuarioAsignador=${usuarioAsignador}`);
      return response.data;
    } catch (error) {
      console.error("Error en asignarResponsable:", error);
      throw error;
    }
  },

  obtenerTodasLasIncidencias: async () => {
    try {
      const response = await api.get(`${API_BASE_URL}/incidencias`);
      return response.data;
    } catch (error) {
      console.error("Error al cargar:", error);
      return [];
    }
  },

  obtenerPersonal: async () => {
    try {
      const response = await api.get(`${API_BASE_URL}/gestion/personal`);
      const data = response.data;
      return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
      console.error("Error al cargar personal:", error);
      return [];
    }
  },

  obtenerIncidenciasSinAsignar: async () => {
    try {
      const response = await api.get(`${API_BASE_URL}/incidencias/sin-asignar`);
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
      const response = await api.patch(`${API_BASE_URL}/incidencias/${incidenciaId}/estado?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error en cambiarEstado:", error);
      throw error;
    }
  },

  guardarEvidenciaAntes: async (incidenciaId, urlImagen) => {
    const response = await api.post(`${API_BASE_URL}/evidencias/fotos-antes`, { idHistorialEstado: incidenciaId, url: urlImagen });
    return response.data;
  },

  guardarEvidenciaProceso: async (incidenciaId, personalId, urlImagen) => {
    const response = await api.post(`${API_BASE_URL}/evidencias/fotos-proceso`, { idHistorialEstado: incidenciaId, personalId: personalId, url: urlImagen });
    return response.data;
  },

  guardarEvidenciaDespues: async (incidenciaId, personalId, urlImagen) => {
    const response = await api.post(`${API_BASE_URL}/evidencias/fotos-despues`, { idHistorialEstado: incidenciaId, personalId: personalId, url: urlImagen });
    return response.data;
  }
};