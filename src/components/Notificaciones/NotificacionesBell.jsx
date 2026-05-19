import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getNotificacionesByUsuario } from "../../services/notificacionService";
import NotificacionesPanel from "./NotificacionesPanel";
// Importamos tus estilos del Header para usar el botón original
import styles from "../Header/Header.module.css"; 

const NotificacionesBell = () => {
  const { usuario } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [error, setError] = useState(null);

  const getEstadoNotificacion = (notificacion) => {
    // ... (Mantén tu lógica de estado exactamente igual)
    if (notificacion.estadoId !== undefined && notificacion.estadoId !== null) {
      const estadoId = Number(notificacion.estadoId);
      if (estadoId === 2) return "LEIDA";
      if (estadoId === 1) return "PENDIENTE";
      return String(estadoId);
    }
    if (notificacion.estado) {
      if (typeof notificacion.estado === "object") {
        const estadoObj = notificacion.estado;
        const nombre = estadoObj.nombre || estadoObj.name || estadoObj.estado || estadoObj.tipo;
        const texto = nombre?.toString().trim().toUpperCase();
        if (!texto) return "PENDIENTE";
        if (texto === "2" || texto === "LEIDA") return "LEIDA";
        if (texto === "1" || texto === "NO LEIDA" || texto === "PENDIENTE") return texto === "1" ? "PENDIENTE" : texto;
        return texto;
      }
      const estadoTexto = notificacion.estado.toString().trim().toUpperCase();
      if (!estadoTexto) return "PENDIENTE";
      if (estadoTexto === "2" || estadoTexto === "LEIDA") return "LEIDA";
      if (estadoTexto === "1") return "PENDIENTE";
      return estadoTexto;
    }
    return "PENDIENTE";
  };

  const isNotificacionLeida = (notificacion) => getEstadoNotificacion(notificacion) === "LEIDA";

  const normalizeNotificacion = (notificacion) => ({
    ...notificacion,
    estado: getEstadoNotificacion(notificacion),
  });

  useEffect(() => {
    const cargarNotificaciones = async () => {
      try {
        if (usuario?.id) {
          const res = await getNotificacionesByUsuario(Number(usuario.id));
          setNotificaciones((res.data || []).map(normalizeNotificacion));
          setError(null);
        }
      } catch (err) {
        console.error("Error al cargar notificaciones:", err);
        setError("Error al cargar notificaciones");
      }
    };

    if (usuario?.id) {
      cargarNotificaciones();
      const interval = setInterval(cargarNotificaciones, 30000);
      return () => clearInterval(interval);
    }
  }, [usuario?.id]);

  const pendientes = notificaciones.filter((n) => !isNotificacionLeida(n)).length;

  return (
    // Se añade un contenedor con position: relative puro para anclar el panel
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      
      {/* Usamos exactamente las mismas clases de tu diseño original */}
      <button 
        className={styles.notificationBtn}
        onClick={() => {
            console.log("Clic en campana registrado");
            setShowPanel((v) => !v);
        }}
        title="Notificaciones"
      >
        <i className="bi bi-bell"></i>
        {pendientes > 0 && (
          <span className={styles.badge}>
            {pendientes}
          </span>
        )}
      </button>

      {/* Renderizado del Panel */}
      {showPanel && (
        <div style={{ position: 'absolute', top: '100%', right: '0', zIndex: 9999, marginTop: '10px' }}>
             <NotificacionesPanel
              notificaciones={notificaciones}
              onClose={() => setShowPanel(false)}
              refrescar={async () => {
                try {
                  const res = await getNotificacionesByUsuario(Number(usuario.id));
                  setNotificaciones((res.data || []).map(normalizeNotificacion));
                } catch (err) {
                  console.error("Error al refrescar notificaciones:", err);
                }
              }}
              onMarcarLeidaLocal={(id) => {
                setNotificaciones((prev) =>
                  prev.map((n) =>
                    n.id === id ? { ...n, estado: "LEIDA", estadoId: 2 } : n
                  )
                );
              }}
              error={error}
            />
        </div>
      )}
    </div>
  );
};

export default NotificacionesBell;