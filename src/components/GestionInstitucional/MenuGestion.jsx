import React from 'react';
import { useNavigate } from 'react-router-dom';
// Asegúrate de importar el CSS de tu Menú original para mantener el diseño idéntico
import styles from '../../pages/Menu/Menu.module.css';

const MenuGestion = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.welcomeCard}>
                <h1 className={styles.title}>Gestión Institucional</h1>
                <p className={styles.subtitle}>
                    Selecciona el módulo que deseas administrar.
                </p>

                <div className={styles.actionGrid}>
                    {/* Tarjeta Departamentos */}
                    <div
                        className={styles.actionCard}
                        onClick={() => navigate('/admin/gestion-institucional/departamentos')}
                    >
                        <i className={`bi bi-building ${styles.cardIcon}`} style={{ color: '#385C88' }}></i>
                        <h3>Departamentos</h3>
                        <p>Dependencias del ayuntamiento</p>
                    </div>

                    {/* Tarjeta Puestos */}
                    <div
                        className={styles.actionCard}
                        onClick={() => navigate('/admin/gestion-institucional/puestos')}
                    >
                        <i className={`bi bi-briefcase ${styles.cardIcon}`} style={{ color: '#EDA506' }}></i>
                        <h3>Puestos</h3>
                        <p>Cargos y permisos de acceso</p>
                    </div>

                    {/* Tarjeta Personal */}
                    <div
                        className={styles.actionCard}
                        onClick={() => navigate('/admin/gestion-institucional/personal')}
                    >
                        <i className={`bi bi-person-badge-fill ${styles.cardIcon}`} style={{ color: '#72B432' }}></i>
                        <h3>Personal</h3>
                        <p>Trabajadores operativos</p>
                    </div>

                    {/* Tarjeta Cuadrillas */}
                    <div
                        className={styles.actionCard}
                        onClick={() => navigate('/admin/gestion-institucional/cuadrillas')}
                    >
                        <i className={`bi bi-people-fill ${styles.cardIcon}`} style={{ color: '#00A99D' }}></i>
                        <h3>Cuadrillas</h3>
                        <p>Equipos de trabajo</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuGestion;