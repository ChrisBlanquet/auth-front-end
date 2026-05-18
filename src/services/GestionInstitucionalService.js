import api from './api';

const BASE = 'http://135.232.229.213:9000/api';

export const incidenciasApi = {
    getAll: () => api.get(`${BASE}/incidencias`),
    getById: (id) => api.get(`${BASE}/incidencias/${id}`),
    asignar: (incidenciaId, personalId, usuarioAsignador) =>
        api.patch(`${BASE}/incidencias/${incidenciaId}/asignar?personalId=${personalId}&usuarioAsignador=${usuarioAsignador}`),
};

export const departamentosApi = {
    getAll: () => api.get(`${BASE}/gestion/departamentos`),
    create: (data) => api.post(`${BASE}/gestion/departamentos`, data),
    update: (id, data) => api.put(`${BASE}/gestion/departamentos/${id}`, data),
    delete: (id) => api.delete(`${BASE}/gestion/departamentos/${id}`),
};

export const cuadrillasApi = {
    getAll: () => api.get(`${BASE}/gestion/cuadrillas`),
    create: (data) => api.post(`${BASE}/gestion/cuadrillas`, data),
    update: (id, data) => api.put(`${BASE}/gestion/cuadrillas/${id}`, data),
    delete: (id) => api.delete(`${BASE}/gestion/cuadrillas/${id}`),
};

export const puestosApi = {
    getAll: () => api.get(`${BASE}/gestion/puestos`),
    create: (data) => api.post(`${BASE}/gestion/puestos`, data),
    update: (id, data) => api.put(`${BASE}/gestion/puestos/${id}`, data),
    delete: (id) => api.delete(`${BASE}/gestion/puestos/${id}`),
};

export const personalApi = {
    getAll: () => api.get(`${BASE}/gestion/personal`),
    getEmpleadosMS1: () => api.get(`${BASE}/gestion/personal/empleados-ms1`),
    create: (data) => api.post(`${BASE}/gestion/personal`, data),
    cambiarDisp: (id, disp) => api.patch(`${BASE}/gestion/personal/${id}/disponibilidad?disponible=${disp}`),
    delete: (id) => api.delete(`${BASE}/gestion/personal/${id}`),
};