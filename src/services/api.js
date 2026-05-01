import axios from 'axios';

/*
const api = axios.create({
    baseURL: 'http://26.227.33.49:9000/api', 
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});*/
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, 
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});

// Variable en memoria para tu Access Token
let accessToken = null;

// Exportamos esta función para que el Login pueda guardar el token aquí
export const setToken = (token) => {
    accessToken = token;
}

api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de RESPUESTAS
api.interceptors.response.use(
    (response) => {
        return response; // Si el backend responde OK (200)
    },
    async (error) => {
        const originalRequest = error.config;
        // Si el backend dice "Token Expirado (401)" y no hemos reintentado ya
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; 
            try {
                const res = await api.post('auth/refresh');
                setToken(res.data.accessToken);

                // Actualizamos la petición original que había fallado y la disparamos de nuevo
                originalRequest.headers['Authorization'] = `Bearer ${res.data.accessToken}`;
                return api(originalRequest);
                
            } catch (refreshError) {
                // Si el refresh falla (la cookie expiró o la borraron), cerramos sesión
                console.error("Sesión caducada. Redirigiendo al login...");
                setToken(null);
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;