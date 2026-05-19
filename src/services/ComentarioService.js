
import api from './api';

const API_BASE_URL = 'http://135.232.229.213:9000/api';

export const getAllComentarios = () => 
  api.get(`${API_BASE_URL}/comentarios`);

export const getComentariosByIncidencia = (incidenciaId) =>
  api.get(`${API_BASE_URL}/comentarios/incidencia/${incidenciaId}`);

export const getComentariosByUsuario = (usuarioId) =>
  api.get(`${API_BASE_URL}/comentarios/usuario/${usuarioId}`);

export const getComentarioById = (id) => 
  api.get(`${API_BASE_URL}/comentarios/${id}`);

export const postComentario = (comentario) => 
  api.post(`${API_BASE_URL}/comentarios`, comentario);

export const deleteComentario = (id) => 
  api.delete(`${API_BASE_URL}/comentarios/${id}`);