import api, { setToken } from './api';

export const loginUsuario = async (credenciales) => {
    try {
        const response = await api.post('auth/login', credenciales);
        if (response.data.accessToken) {
            setToken(response.data.accessToken);
        }
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const registrarCiudadano = async (datosRegistro) => {
    try {
        const response = await api.post('auth/registrar', datosRegistro);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const logoutUsuario = async () => {
    try {
        await api.post('auth/logout');  
        setToken(null); 
    } catch (error) {
        throw error;
    }
};

export const actualizarDatosPerfil = async (id, datos) => {
    try {
        const response = await api.put(`auth/actualizar/${id}`, datos);
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const actualizarPasswordPerfil = async (id, datosPassword) => {
    try {
        const response = await api.patch(`auth/actualizar/${id}/password`, datosPassword);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const obtenerTodosLosUsuarios = async () => {
    const response = await api.get('auth/usuarios');
    return response.data;
};

export const obtenerCiudadanos = async () => {
    const response = await api.get('auth/usuarios/ciudadanos');
    return response.data;
};

export const obtenerEmpleados = async () => {
    const response = await api.get('auth/usuarios/empleados');
    return response.data;
};

export const buscarUsuarioPorEmailCoincidencia = async (email) => {
    const response = await api.get(`auth/usuarios/buscar/correo?email=${email}`);
    return response.data; // Tu backend ya devuelve una Lista
};

export const buscarUsuarioPorId = async (id) => {
    const response = await api.get(`auth/usuarios/${id}`);
    return [response.data];
};

// --- ACCIONES DE ADMIN ---
export const eliminarUsuarioAdmin = async (id) => {
    const response = await api.delete(`auth/${id}`);
    return response.data;
};

export const actualizarUsuarioAdmin = async (id, datos) => {
    const response = await api.put(`auth/actualizar/${id}`, datos);
    return response.data;
};

export const actualizarRolUsuario = async (id, rolData) => {
    const response = await api.patch(`auth/actualizar/${id}/rol`, rolData);
    return response.data;
};

export const obtenerUsuariosActivos = async () => {
    const response = await api.get('auth/usuarios/activos');
    return response.data;
};

export const obtenerUsuariosInactivos = async () => {
    const response = await api.get('auth/usuarios/inactivos');
    return response.data;
};

// --- BLOQUEO Y REACTIVACIÓN ---
export const bloquearUsuario = async (id) => {
    const response = await api.patch(`auth/bloqueo/${id}`);
    return response.data;
};

export const reactivarUsuario = async (id) => {
    const response = await api.patch(`auth/reactivar/${id}`);
    return response.data;
};

export const crearUsuarioAdmin = async (datosRegistro) => {
    const response = await api.post('auth/registrar/empleado', datosRegistro);
    return response.data;
};

export const resetearPasswordAdmin = async (id, datosPassword) => {
    try {
        const response = await api.patch(`auth/admin/usuarios/${id}/reset-password`, datosPassword);
        return response.data;
    } catch (error) {
        throw error;
    }
};
