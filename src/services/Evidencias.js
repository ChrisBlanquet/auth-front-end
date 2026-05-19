import api from './api';


export const fotosAntesApi = {
    getAll:         ()      => api.get(`/evidencias/fotos-antes`),
    getByFolio:     (folio) => api.get(`/evidencias/fotos-antes/${folio}`),
    getByHistorial: (id)    => api.get(`/evidencias/fotos-antes/historial/${id}`),
    create:         (data)  => api.post(`/evidencias/fotos-antes`, data),
    delete:         (folio) => api.delete(`/evidencias/fotos-antes/${folio}`),
};

export const fotosProcesoApi = {
    getAll:         ()      => api.get(`/evidencias/fotos-proceso`),
    getByFolio:     (folio) => api.get(`/evidencias/fotos-proceso/${folio}`),
    getByHistorial: (id)    => api.get(`/evidencias/fotos-proceso/historial/${id}`),
    create:         (data)  => api.post(`/evidencias/fotos-proceso`, data),
    delete:         (folio) => api.delete(`/evidencias/fotos-proceso/${folio}`),
};

export const fotosDespuesApi = {
    getAll:         ()      => api.get(`/evidencias/fotos-despues`),
    getByFolio:     (folio) => api.get(`/evidencias/fotos-despues/${folio}`),
    getByHistorial: (id)    => api.get(`/evidencias/fotos-despues/historial/${id}`),
    create:         (data)  => api.post(`/evidencias/fotos-despues`, data),
    delete:         (folio) => api.delete(`/evidencias/fotos-despues/${folio}`),
};