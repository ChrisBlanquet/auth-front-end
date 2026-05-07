import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { jwtDecode } from "jwt-decode";
import api, { setToken } from '../services/api'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [permisos, setPermisos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rol, setRol] = useState(null);


    const tokenEnMemoria = useRef(null);
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        const channel = new BroadcastChannel('auth_sync_channel');

        channel.onmessage = (event) => {
            const mensaje = event.data;


            if (mensaje.type === 'ALGUIEN_TIENE_EL_TOKEN' && tokenEnMemoria.current) {
                channel.postMessage({ type: 'AQUI_ESTA_EL_TOKEN', token: tokenEnMemoria.current });
            }

            if (mensaje.type === 'AQUI_ESTA_EL_TOKEN' && !isAuthenticated) {
                console.log("Sesión sincronizada desde otra pestaña.");
                iniciarSesionLocal(mensaje.token);
                setLoading(false);
            }

            if (mensaje.type === 'CERRAR_SESION') {
                cerrarSesionLocal();
            }
        };


        const recuperarSesionDesdeBackend = async () => {
            try {
                const res = await api.post('auth/refresh');
                iniciarSesionLocal(res.data.accessToken);
            } catch (error) {
                console.log("No hay sesión activa en el servidor.");
            } finally {
                setLoading(false);
            }
        };

        // FLUJO DE ARRANQUE AL ABRIR PESTAÑA O DAR F5
        //"¿Alguien más tiene la sesión abierta?"
        channel.postMessage({ type: 'ALGUIEN_TIENE_EL_TOKEN' });


        const timeout = setTimeout(() => {
            if (!tokenEnMemoria.current) {
                recuperarSesionDesdeBackend();
            }
        }, 150);

        return () => {
            channel.close();
            clearTimeout(timeout);
        };
    }, []);

    // --- FUNCIONES INTERNAS ---

const iniciarSesionLocal = async (token) => {
    try {
        tokenEnMemoria.current = token;
        setToken(token);
        
        const decoded = jwtDecode(token);
        setRol(decoded.rol || null);
        setPermisos(decoded.permisos || []);

        //  Extraemos el ID
        const userId = decoded.id;

        // Consultamos al backend los detalles
        if (userId) {
            try {
                const res = await api.get(`/auth/usuarios/${userId}`);
                setUsuario(res.data);
            } catch (err) {
                console.error("Error al obtener datos del usuario", err);
            }
        }

        setIsAuthenticated(true);
    } catch (e) {
        console.error("Error al procesar el token:", e);
    }
};

    const cerrarSesionLocal = () => {
        tokenEnMemoria.current = null;
        setToken(null);
        setPermisos([]);
        setIsAuthenticated(false);
    };

    // --- FUNCIONES PÚBLICAS---

    const loginExitoso = (token) => {
        iniciarSesionLocal(token);
    };

    const logoutExitoso = () => {
        cerrarSesionLocal();
        const channel = new BroadcastChannel('auth_sync_channel');
        channel.postMessage({ type: 'CERRAR_SESION' });
        channel.close();
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, usuario, rol, permisos, loginExitoso, logoutExitoso, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);