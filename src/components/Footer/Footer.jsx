import React from 'react';
import styles from './Footer.module.css';

// 👈 Asegúrate de que esta ruta apunte a tu imagen real, igual que en el Header
import logoAyuntamiento from '../../assets/img/disenoayutnamiento.png'; 

const Footer = () => {
    const anioActual = new Date().getFullYear();

    return (
        <footer className={styles.footerContainer}>
            <div className={styles.contentWrapper}>
                
                <div className={styles.grid}>
                    
                    {/* 🏛️ COLUMNA 1: Identidad y Logos */}
                    <div className={styles.column}>
                        <div className={styles.logoContainer}>
                            <img 
                                src={logoAyuntamiento} 
                                alt="Logo H. Ayuntamiento de Chilpancingo" 
                                className={styles.logo}
                            />
                        </div>
                        <h3 className={styles.title}>H. Ayuntamiento de Chilpancingo</h3>
                        <p className={styles.description}>
                            Trabajando por el bienestar, desarrollo y la seguridad de la capital del Estado de Guerrero.
                        </p>
                    </div>

                    {/* 📍 COLUMNA 2: Dirección Oficial */}
                    <div className={styles.column}>
                        <h4 className={styles.subtitle}>Ubicación Oficial</h4>
                        <div className={styles.infoItem}>
                            <span className={styles.icon}>📍</span>
                            <p>
                                Plaza Cívica Primer Congreso de Anáhuac S/N,<br />
                                Col. Centro, C.P. 39000.<br />
                                Chilpancingo de los Bravo, Guerrero.
                            </p>
                        </div>
                    </div>

                    {/* 📞 COLUMNA 3: Contacto y Emergencias */}
                    <div className={styles.column}>
                        <h4 className={styles.subtitle}>Contacto y Atención</h4>
                        
                        <div className={styles.infoItem}>
                            <span className={styles.icon}>📞</span> 
                            <p><strong>Atención Ciudadana:</strong> (747) 472 2742</p>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.icon}>🚨</span> 
                            <p><strong>Protección Civil:</strong> (747) 494 9732</p>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.icon}>🚓</span> 
                            <p><strong>Policía Preventiva:</strong> (747) 472 2062</p>
                        </div>
                        <div className={styles.infoItem} style={{ marginTop: '0.5rem' }}>
                            <span className={styles.icon}>📧</span> 
                            <p>presidencia@chilpancingo.gob.mx</p>
                        </div>
                    </div>

                </div>

                {/* ⚖️ LÍNEA DIVISORIA Y LEGALES */}
                <div className={styles.bottomBar}>
                    <p className={styles.copyright}>
                        &copy; {anioActual} H. Ayuntamiento de Chilpancingo de los Bravo. Todos los derechos reservados.
                    </p>
                    
                    <div className={styles.links}>
                        <a href="/aviso-de-privacidad">Aviso de Privacidad</a>
                        <a href="/transparencia">Transparencia</a>
                        <a href="/directorio">Directorio</a>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;