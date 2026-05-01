import React from 'react';
import styles from './LoadingScreen.module.css';

import logoAyuntamiento from '../../assets/img/disenoayutnamiento.png'; 
// Importamos tus nuevos iconos
import iconoIzquierda from '../../assets/img/iconoRenaceIzquierda.png';
import iconoArriba from '../../assets/img/iconoRenaceArriba.png';
import iconoDerecha from '../../assets/img/iconoRenaceDerecha.png';
import iconoAbajo from '../../assets/img/iconoRenaceAbajo.png';

const LoadingScreen = () => {
    return (
        <div className={styles.container}>
            {/* Logo principal arriba, respirando suavemente */}
            <img src={logoAyuntamiento} alt="Ayuntamiento" className={styles.logoAnimado} />
            
            {/* Contenedor horizontal para los iconos de carga */}
            <div className={styles.iconContainer}>
                {/* El delay hace que se enciendan uno tras otro (0s, 0.2s, 0.4s, 0.6s) */}
                <img src={iconoIzquierda} alt="carga" className={styles.loadingIcon} style={{ animationDelay: '0s' }} />
                <img src={iconoArriba} alt="carga" className={styles.loadingIcon} style={{ animationDelay: '0.2s' }} />
                <img src={iconoDerecha} alt="carga" className={styles.loadingIcon} style={{ animationDelay: '0.4s' }} />
                <img src={iconoAbajo} alt="carga" className={styles.loadingIcon} style={{ animationDelay: '0.6s' }} />
            </div>
        </div>
    );
};

export default LoadingScreen;