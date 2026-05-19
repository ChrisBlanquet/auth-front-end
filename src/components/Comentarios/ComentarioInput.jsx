import React, { useState } from "react";
import styles from './Chat.module.css';

const ComentarioInput = ({ onEnviar }) => {
  const [mensaje, setMensaje] = useState("");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (mensaje.trim()) {
      onEnviar(mensaje);
      setMensaje("");
    }
  };
  
  return (
    <form className={styles.inputForm} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        placeholder="Escribe un comentario..."
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
      />
      <button className={styles.btnPrimary} type="submit" title="Enviar">
        <i className="bi bi-send"></i>
      </button>
    </form>
  );
};

export default ComentarioInput;