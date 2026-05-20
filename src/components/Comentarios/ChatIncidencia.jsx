import React, { useEffect, useState, useRef } from "react";
import { getComentariosByIncidencia, postComentario } from "../../services/ComentarioService";
import { buscarUsuarioPorId } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import ComentarioBubble from "./ComentarioBubble";
import ComentarioInput from "./ComentarioInput";
import styles from './Chat.module.css'; 

const ChatIncidencia = ({ incidencia, onClose }) => {
  const { usuario, rol } = useAuth(); 
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chatRef = useRef(null);

  const getNombreUsuario = (usuarioData) => {
    if (!usuarioData) return null;
    const nombre = usuarioData.nombre || usuarioData.firstName || usuarioData.name;
    const apellidos = usuarioData.apellidos || usuarioData.apellidoPaterno || usuarioData.apellidoMaterno || usuarioData.lastName || usuarioData.surname;
    const nombreCompleto = [nombre, apellidos].filter(Boolean).join(' ').trim();
    return nombreCompleto || usuarioData.nombreCompleto || usuarioData.fullName || usuarioData.username || usuarioData.email || null;
  };

  const asignarNombresDeUsuarios = async (comentariosData) => {
    const idsUnicos = [...new Set(comentariosData
      .map((c) => c.usuarioId || c.usuario?.id)
      .filter((id) => id))];

    const nombresPorId = {};
    await Promise.all(idsUnicos.map(async (id) => {
      try {
        const usuarioResponse = await buscarUsuarioPorId(id);
        const usuarioData = Array.isArray(usuarioResponse) ? usuarioResponse[0] : usuarioResponse;
        if (usuarioData) {
          nombresPorId[id] = getNombreUsuario(usuarioData) || `Usuario ${id}`;
        }
      } catch (error) {
        nombresPorId[id] = `Usuario ${id}`;
      }
    }));

    return comentariosData.map((comentario) => {
      const comentarioUsuarioId = comentario.usuarioId || comentario.usuario?.id;
      const nombreUsuarioComentario = getNombreUsuario(comentario.usuario) || comentario.usuarioNombre || comentario.nombre || comentario.email;

      return {
        ...comentario,
        usuarioNombre: nombreUsuarioComentario
          || (comentarioUsuarioId === usuario?.id ? getNombreUsuario(usuario) || "Tú" : nombresPorId[comentarioUsuarioId])
          || (comentarioUsuarioId === usuario?.id ? "Tú" : `Usuario ${comentarioUsuarioId}`),
      };
    });
  };

  const cargarComentarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getComentariosByIncidencia(incidencia.id);
      const data = res.data || [];
      const comentariosConNombres = await asignarNombresDeUsuarios(data);
      setComentarios(comentariosConNombres.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)));
    } catch (err) {
      console.error("Error al cargar comentarios:", err);
      setError("Error al cargar los comentarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarComentarios();
  }, [incidencia.id]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [comentarios]);

  const handleEnviar = async (textoComentario) => {
    try {
      const esCiudadano = rol === "CIUDADANO" || rol === "ROLE_CIUDADANO";
      const usuarioDestinoId = esCiudadano
        ? incidencia.personalId
        : incidencia.usuarioId;

      const nuevoComentario = {
        incidenciaId: incidencia.id,
        usuarioId: usuario.id,
        usuarioDestinoId,
        mensaje: textoComentario,
      };

      // Debug extra solicitado
      console.log("DESTINO:", nuevoComentario.usuarioDestinoId);
      console.log("personalId:", incidencia.personalId);
      console.log("usuarioId dueño:", incidencia.usuarioId);

      const res = await postComentario(nuevoComentario);
      const creado = res?.data || res;

      if (creado && creado.id) {
        setComentarios((prev) => [...prev, creado]);
      } else {
        await cargarComentarios();
      }
    } catch (err) {
      console.error("Error al enviar comentario:", err);
      await cargarComentarios();
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h5 className={styles.cardTitle}>{incidencia.titulo}</h5>
          <span className={incidencia.estado === "ABIERTA" ? styles.badge : styles.badgeClosed}>
            {incidencia.estado}
          </span>
        </div>
        <button className={styles.btnCancel} onClick={onClose}>Cerrar</button>
      </div>

      <div className={styles.cardBody} ref={chatRef}>
        {error && <div className="alert alert-danger py-2" style={{borderRadius: '8px'}}>{error}</div>}
        
        {loading ? (
          <div style={{textAlign: 'center', color: '#64748b', marginTop: '2rem'}}>Cargando...</div>
        ) : comentarios.length === 0 ? (
          <div style={{textAlign: 'center', color: '#64748b', marginTop: '2rem'}}>No hay comentarios</div>
        ) : (
          comentarios.map((c) => (
            <ComentarioBubble key={c.id} comentario={c} esPropio={c.usuarioId === usuario.id} />
          ))
        )}
      </div>

      {incidencia.estado !== "CERRADA" && (
        <div className={styles.cardFooter}>
          <ComentarioInput onEnviar={handleEnviar} />
        </div>
      )}
    </div>
  );
};

export default ChatIncidencia;