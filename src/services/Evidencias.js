import api from './api';

const BASE = 'http://135.232.229.213:9000/api';

export const fotosAntesApi = {
    getAll:         ()      => api.get(`${BASE}/evidencias/fotos-antes`),
    getByFolio:     (folio) => api.get(`${BASE}/evidencias/fotos-antes/${folio}`),
    getByHistorial: (id)    => api.get(`${BASE}/evidencias/fotos-antes/historial/${id}`),
    create:         (data)  => api.post(`${BASE}/evidencias/fotos-antes`, data),
    delete:         (folio) => api.delete(`${BASE}/evidencias/fotos-antes/${folio}`),
};

export const fotosProcesoApi = {
    getAll:         ()      => api.get(`${BASE}/evidencias/fotos-proceso`),
    getByFolio:     (folio) => api.get(`${BASE}/evidencias/fotos-proceso/${folio}`),
    getByHistorial: (id)    => api.get(`${BASE}/evidencias/fotos-proceso/historial/${id}`),
    create:         (data)  => api.post(`${BASE}/evidencias/fotos-proceso`, data),
    delete:         (folio) => api.delete(`${BASE}/evidencias/fotos-proceso/${folio}`),
};

export const fotosDespuesApi = {
    getAll:         ()      => api.get(`${BASE}/evidencias/fotos-despues`),
    getByFolio:     (folio) => api.get(`${BASE}/evidencias/fotos-despues/${folio}`),
    getByHistorial: (id)    => api.get(`${BASE}/evidencias/fotos-despues/historial/${id}`),
    create:         (data)  => api.post(`${BASE}/evidencias/fotos-despues`, data),
    delete:         (folio) => api.delete(`${BASE}/evidencias/fotos-despues/${folio}`),
};