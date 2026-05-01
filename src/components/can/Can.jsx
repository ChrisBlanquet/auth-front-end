import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Can = ({ permisosRequeridos, modo = 'any', children }) => {
    const { permisos } = useAuth();

    // Si no hay permisos cargados, no dibujamos nada
    if (!permisos || !permisosRequeridos) return null;

    let tieneAcceso = false;

    if (modo === 'any') {
        // MODO ANY: Te deja pasar si tienes AL MENOS UNO de los permisos
        tieneAcceso = permisosRequeridos.some(permiso => permisos.includes(permiso));
    } else if (modo === 'all') {
        // MODO ALL: Te deja pasar SOLO si tienes TODOS los permisos de la lista
        tieneAcceso = permisosRequeridos.every(permiso => permisos.includes(permiso));
    }

    // Si tiene acceso, dibuja el botón/tarjeta. Si no, dibuja "nada" (null).
    return tieneAcceso ? children : null;
};

export default Can;