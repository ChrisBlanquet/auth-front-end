import api from './api';

export const getAllNotificaciones = () => 
  api.get('/notificaciones');

export const getNotificacionesByUsuario = (usuarioId) =>
  api.get(`/notificaciones/usuario/${usuarioId}`);

export const getNotificacionById = (id) => 
  api.get(`/notificaciones/${id}`);

export const getNotificacionesByEstado = (estadoId) =>
  api.get(`/notificaciones/estado/${estadoId}`);

export const postNotificacion = (notificacion) => 
  api.post('/notificaciones', notificacion);

export const updateNotificacionEstado = async (id, estado) => {
  const payload = { estadoId: estado };
  const response = await api.put(`/notificaciones/${id}/estado`, payload);
  return response.data;
};

export const deleteNotificacion = (id) => 
  api.delete(`/notificaciones/${id}`);

export const marcarNotificacionLeida = (id) => 
  updateNotificacionEstado(id, 2);

export const getAllUsuarios = () => 
  api.get('/notificaciones/usuarios');