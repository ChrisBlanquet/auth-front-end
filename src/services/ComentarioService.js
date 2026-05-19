
import api from './api';


export const getAllComentarios = () => 
  api.get(`/comentarios`);

export const getComentariosByIncidencia = (incidenciaId) =>
  api.get(`/comentarios/incidencia/${incidenciaId}`);

export const getComentariosByUsuario = (usuarioId) =>
  api.get(`/comentarios/usuario/${usuarioId}`);

export const getComentarioById = (id) => 
  api.get(`/comentarios/${id}`);

export const postComentario = (comentario) => 
  api.post(`/comentarios`, comentario);

export const deleteComentario = (id) => 
  api.delete(`/comentarios/${id}`);