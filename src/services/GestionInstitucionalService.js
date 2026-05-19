import api from './api';


export const incidenciasApi = {
    getAll: () => api.get(`/incidencias`),
    getById: (id) => api.get(`/incidencias/${id}`),
    asignar: (incidenciaId, personalId, usuarioAsignador) =>
        api.patch(`/incidencias/${incidenciaId}/asignar?personalId=${personalId}&usuarioAsignador=${usuarioAsignador}`),
};

export const departamentosApi = {
    getAll: () => api.get(`/gestion/departamentos`),
    create: (data) => api.post(`/gestion/departamentos`, data),
    update: (id, data) => api.put(`/gestion/departamentos/${id}`, data),
    delete: (id) => api.delete(`/gestion/departamentos/${id}`),
};

export const cuadrillasApi = {
    getAll: () => api.get(`/gestion/cuadrillas`),
    create: (data) => api.post(`/gestion/cuadrillas`, data),
    update: (id, data) => api.put(`/gestion/cuadrillas/${id}`, data),
    delete: (id) => api.delete(`/gestion/cuadrillas/${id}`),
};

export const puestosApi = {
    getAll: () => api.get(`/gestion/puestos`),
    create: (data) => api.post(`/gestion/puestos`, data),
    update: (id, data) => api.put(`/gestion/puestos/${id}`, data),
    delete: (id) => api.delete(`/gestion/puestos/${id}`),
};

export const personalApi = {
    getAll: () => api.get(`/gestion/personal`),
    getEmpleadosMS1: () => api.get(`/gestion/personal/empleados-ms1`),
    create: (data) => api.post(`/gestion/personal`, data),
    cambiarDisp: (id, disp) => api.patch(`/gestion/personal/${id}/disponibilidad?disponible=${disp}`),
    delete: (id) => api.delete(`/gestion/personal/${id}`),
};