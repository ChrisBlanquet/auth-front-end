import React from "react";
import { marcarNotificacionLeida } from "../../services/notificacionService";

// --- TUS FUNCIONES DE FECHA SE MANTIENEN IGUAL ---
export const formatFechaLocal = (fechaISO) => {
  if (!fechaISO) return '';
  try {
    const fecha = new Date(fechaISO);
    const ano = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const hora = String(fecha.getHours()).padStart(2, '0');
    const minuto = String(fecha.getMinutes()).padStart(2, '0');
    const segundo = String(fecha.getSeconds()).padStart(2, '0');
    return `${dia}/${mes}/${ano} ${hora}:${minuto}:${segundo}`;
  } catch (error) {
    return '';
  }
};

export const formatHoraLocal = (fechaISO) => { /* ... */ };
export const formatFechaCorta = (fechaISO) => { /* ... */ };

const NotificacionesPanel = ({ notificaciones, onClose, refrescar, onMarcarLeidaLocal, error }) => {
  const getEstadoNotificacion = (notificacion) => {
    if (notificacion.estadoId !== undefined && notificacion.estadoId !== null) {
      const estadoId = Number(notificacion.estadoId);
      if (estadoId === 2) return "LEIDA";
      if (estadoId === 1) return "PENDIENTE";
    }
    const estado = notificacion.estado?.toString().trim().toUpperCase();
    if (!estado) return "PENDIENTE";
    if (estado === "2" || estado === "LEIDA") return "LEIDA";
    if (estado === "1" || estado === "NO LEIDA" || estado === "PENDIENTE") {
      return estado === "1" ? "PENDIENTE" : estado;
    }
    return estado;
  };

  const isNotificacionLeida = (notificacion) => getEstadoNotificacion(notificacion) === "LEIDA";

  const handleMarcarLeida = async (id) => {
    try {
      await marcarNotificacionLeida(id);
      if (onMarcarLeidaLocal) {
        onMarcarLeidaLocal(id);
      }
    } catch (err) {
      console.error("Error al marcar como leída:", err);
    }
  };

  return (
    <div style={{
      width: '320px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.15)', // Sombra igual a tu menú de perfil
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'inherit'
    }}>
      
      {/* HEADER DEL PANEL */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>
          Notificaciones
        </span>
        <button 
          onClick={onClose} 
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            fontSize: '0.85rem',
            padding: '4px 8px',
            borderRadius: '4px'
          }}
        >
          Cerrar
        </button>
      </div>

      {/* CUERPO DEL PANEL */}
      <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '12px', backgroundColor: '#fff' }}>
        {error && (
          <div style={{ color: '#dc3545', backgroundColor: '#f8d7da', padding: '8px', borderRadius: '6px', marginBottom: '10px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}
        
        {notificaciones.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '20px 0', fontSize: '0.9rem' }}>
            No hay notificaciones.
          </div>
        ) : (
          notificaciones.map((n) => (
            <div
              key={n.id}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderLeft: isNotificacionLeida(n) ? "4px solid transparent" : "4px solid #3b3b8c", // Color azul de tu app para las no leídas
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "10px",
                transition: "background 0.2s"
              }}
            >
              <div style={{ fontWeight: 600, color: "#1e293b", fontSize: '0.9rem', marginBottom: '4px' }}>
                {n.mensaje}
              </div>
              
              {n.incidenciaId && (
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '6px' }}>
                  Incidencia: #{n.incidenciaId}
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                  {formatFechaLocal(n.fecha)}
                </small>
                
                {isNotificacionLeida(n) && (
                  <span style={{ backgroundColor: '#e2e8f0', color: '#64748b', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 600 }}>
                    LEÍDA
                  </span>
                )}
              </div>

              {!isNotificacionLeida(n) && (
                <button 
                  onClick={() => handleMarcarLeida(n.id)}
                  style={{
                    width: '100%',
                    marginTop: '10px',
                    padding: '6px',
                    backgroundColor: 'transparent',
                    border: '1px solid #3b3b8c',
                    color: '#3b3b8c',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => { e.target.style.backgroundColor = '#f0f2ff'; }}
                  onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; }}
                >
                  Marcar como leída
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificacionesPanel;