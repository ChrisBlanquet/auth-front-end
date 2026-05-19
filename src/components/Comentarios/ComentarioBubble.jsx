import React from "react";
import { useAuth } from "../../context/AuthContext";
import styles from './Chat.module.css';

/**
 * Formatea una fecha recibida del backend (ISO string)
 * convertida a la zona horaria local del navegador.
 */
export const formatFechaLocal = (fechaISO) => {
    if (!fechaISO) return '';

    try {
        const fecha = new Date(fechaISO);

        // DEBUG: log raw data
        console.log("DEBUG formatFechaLocal - entrada:", fechaISO, "- fecha JS:", fecha.toISOString());

        // Usa getFullYear, getMonth, getDate (zona local del navegador)
        const ano = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        const hora = String(fecha.getHours()).padStart(2, '0');
        const minuto = String(fecha.getMinutes()).padStart(2, '0');
        const segundo = String(fecha.getSeconds()).padStart(2, '0');

        return `${dia}/${mes}/${ano} ${hora}:${minuto}:${segundo}`;
    } catch (error) {
        console.error('Error al formatear fecha:', error);
        return '';
    }
};

/**
 * Formatea solo la hora (HH:mm:ss AM/PM) desde una fecha ISO
 * en la zona horaria local del navegador
 */
export const formatHoraLocal = (fechaISO) => {
    if (!fechaISO) return '';

    try {
        const fecha = new Date(fechaISO);
        const horas = fecha.getHours();
        const minutos = String(fecha.getMinutes()).padStart(2, '0');
        const segundos = String(fecha.getSeconds()).padStart(2, '0');

        // Convertir a formato 12h con AM/PM
        const horas12 = horas % 12 || 12;
        const ampm = horas >= 12 ? 'PM' : 'AM';

        return `${String(horas12).padStart(2, '0')}:${minutos}:${segundos} ${ampm}`;
    } catch (error) {
        console.error('Error al formatear hora:', error);
        return '';
    }
};

/**
 * Formatea solo la fecha (DD/MM/YYYY) en zona local
 */
export const formatFechaCorta = (fechaISO) => {
    if (!fechaISO) return '';

    try {
        const fecha = new Date(fechaISO);
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const ano = fecha.getFullYear();

        return `${dia}/${mes}/${ano}`;
    } catch (error) {
        console.error('Error al formatear fecha corta:', error);
        return '';
    }
};

const ComentarioBubble = ({ comentario, esPropio }) => {
    const { usuario } = useAuth();

    const getNombreUsuario = (usuarioData) => {
        if (!usuarioData) return null;
        const nombre = usuarioData.nombre || usuarioData.firstName || usuarioData.name;
        const apellidos = usuarioData.apellidos || usuarioData.apellidoPaterno || usuarioData.apellidoMaterno || usuarioData.lastName || usuarioData.surname;
        const nombreCompleto = [nombre, apellidos].filter(Boolean).join(' ').trim();
        return nombreCompleto || usuarioData.nombreCompleto || usuarioData.fullName || usuarioData.username || usuarioData.email || null;
    };

    const comentarioUsuarioId = comentario.usuarioId || comentario.usuario?.id;
    const nombreAutor = comentario.usuarioNombre
        || getNombreUsuario(comentario.usuario)
        || comentario.nombre
        || comentario.email
        || (comentarioUsuarioId === usuario?.id ? getNombreUsuario(usuario) || "Tú" : `Usuario ${comentarioUsuarioId}`);

    return (
        <div className={esPropio ? styles.bubbleWrapperOwn : styles.bubbleWrapperOther}>
            <div className={esPropio ? styles.bubbleOwn : styles.bubbleOther}>

                <div className={styles.bubbleText}>
                    {comentario.mensaje}
                </div>

                <div className={esPropio ? styles.bubbleMetaOwn : styles.bubbleMetaOther}>
                    {nombreAutor}
                    <br />
                    <span>{formatHoraLocal(comentario.fecha)}</span>
                </div>

            </div>
        </div>
    );
};

export default ComentarioBubble;