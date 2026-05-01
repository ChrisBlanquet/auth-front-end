import React from 'react';
import styles from './Notification.module.css';

const Notification = ({ visible, mensaje, tipo = 'info' }) => {
    // Escogemos el icono dependiendo del tipo
    const getIcono = () => {
        switch (tipo) {
            case 'success': return 'bi-check-circle-fill';
            case 'error': return 'bi-x-circle-fill';
            case 'warning': return 'bi-exclamation-triangle-fill';
            default: return 'bi-info-circle-fill';
        }
    };

    return (
        <div className={`${styles.toastWrapper} ${styles[tipo]} ${visible ? styles.visible : ''}`}>
            <i className={`bi ${getIcono()} ${styles.icon} ${styles[tipo]}`}></i>
            <p className={styles.message}>{mensaje}</p>
        </div>
    );
};

export default Notification;