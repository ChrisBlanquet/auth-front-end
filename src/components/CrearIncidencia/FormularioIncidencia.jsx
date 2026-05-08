// src/components/CrearIncidencia/FormularioIncidencia.jsx
import { useState, useEffect, useRef } from 'react';
import { IncidenciasService } from "../../services/IncidenciasService";
import styles from "./Formulario.module.css";
import SelectorMapa from "./SelectorMapa";
import { subirImagen } from "../../services/imgbb";
import { useAuth } from "../../context/AuthContext";

const FormularioIncidencia = () => {
  // Extraemos el usuario y el rol 
  const { usuario, rol } = useAuth();

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipoIncidenciaId: '',
    ubicacionId: '',
    usuarioId: '' // Lo dejamos vacío de inicio
  });

  // Cuando el contexto cargue al usuario, actualizamos el formulario
  useEffect(() => {
    if (usuario && usuario.id) {
      setFormData(prev => ({ ...prev, usuarioId: usuario.id }));
    }
  }, [usuario]);

  const [tipos, setTipos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [estadoPeticion, setEstadoPeticion] = useState({ tipo: '', mensaje: '' });
  const [cargando, setCargando] = useState(false);
  const [resetMapaKey, setResetMapaKey] = useState(Date.now());

  const [archivo, setArchivo] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const fileRef = useRef(null);

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const tiposData = await IncidenciasService.obtenerTiposIncidencia();
        setTipos(tiposData);
      } catch (error) {
        console.error("Error al cargar catálogos", error);
      }
    };
    cargarCatalogos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setEstadoPeticion({ tipo: 'error', mensaje: 'El archivo seleccionado no es una imagen válida.' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setEstadoPeticion({ tipo: 'error', mensaje: 'La imagen no puede pesar más de 10 MB.' });
      return;
    }

    setArchivo(file);
    setFilePreview(URL.createObjectURL(file));
    setEstadoPeticion({ tipo: '', mensaje: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones de autenticación
    if (!usuario || !formData.usuarioId) {
      setEstadoPeticion({
        tipo: 'error',
        mensaje: 'Tu sesión no es válida. Por favor, vuelve a iniciar sesión.'
      });
      return;
    }

    if (rol !== 'ROLE_CIUDADANO' && rol !== 'CIUDADANO') {
      setEstadoPeticion({
        tipo: 'error',
        mensaje: 'Acceso denegado: Solo los ciudadanos pueden reportar incidencias.'
      });
      return;
    }

    // Validaciones de formulario
    if (!formData.ubicacionId) {
      setEstadoPeticion({
        tipo: 'error',
        mensaje: 'Por favor, selecciona la ubicación en el mapa y presiona "Fijar Pin".'
      });
      return;
    }

    if (!archivo) {
      setEstadoPeticion({
        tipo: 'error',
        mensaje: 'La evidencia fotográfica es obligatoria. Por favor, sube una foto de la incidencia.'
      });
      return;
    }

    setCargando(true);
    setEstadoPeticion({ tipo: '', mensaje: '' });

    try {
      let urlImgBB = null;

      // Subir la imagen a ImgBB
      if (archivo) {
        setSubiendo(true);
        setEstadoPeticion({ tipo: 'info', mensaje: 'Subiendo evidencia fotográfica...' });
        urlImgBB = await subirImagen(archivo, 'fotos-antes', (pct) => setProgreso(pct));
        setSubiendo(false);
      }

      // Enviar a MS2 para crear incidencia
      setEstadoPeticion({ tipo: 'info', mensaje: 'Generando reporte ciudadano...' });
      const nuevaIncidencia = await IncidenciasService.crearIncidencia(formData);

      let advertenciaImagen = "";

      // Enviar a MS5 la URL de ImgBB y el ID de la incidencia
      if (urlImgBB) {
        setEstadoPeticion({ tipo: 'info', mensaje: 'Guardando evidencia...' });
        try {
          await IncidenciasService.guardarEvidenciaAntes(nuevaIncidencia.id, urlImgBB);
        } catch (errorEvidencia) {
          console.error("Error al enlazar la evidencia:", errorEvidencia);
          // Si esto falla, no rompemos el proceso general, solo agregamos una advertencia
          advertenciaImagen = " Sin embargo, el servicio de imágenes está temporalmente inactivo.";
        }
      }

      // Mostramos mensaje de exito (con o sin advertencia de imagen)
      setEstadoPeticion({
        tipo: advertenciaImagen ? 'error' : 'exito', // Puedes crear un tipo 'warning' si tu CSS lo soporta
        mensaje: `¡Reporte enviado! Folio: ${nuevaIncidencia.id}.${advertenciaImagen}`
      });

      // Limpiamos los campos conservando el usuarioId
      setFormData({
        titulo: '',
        descripcion: '',
        tipoIncidenciaId: '',
        ubicacionId: '',
        usuarioId: usuario.id
      });
      setArchivo(null);
      setFilePreview('');
      setProgreso(0);
      setResetMapaKey(Date.now());

    } catch (error) {
      setEstadoPeticion({
        tipo: 'error',
        mensaje: error.response?.data?.message || 'Hubo un problema al enviar el reporte. Intenta de nuevo.'
      });
    } finally {
      setCargando(false);
    }
  };

  const formatearTexto = (texto) => {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>

          <h1 className={styles.title}>Reportar incidencia</h1>
          <p className={styles.subtitle}>Captura los detalles de la incidencia</p>

          {/* Mensaje de alerta */}
          {estadoPeticion.mensaje && (
            <div className={estadoPeticion.tipo === 'exito' ? styles.alertSuccess : styles.alertError}>
              {estadoPeticion.mensaje}
            </div>
          )}

          {/* Modal de exito/error flotante */}
          {(estadoPeticion.tipo === 'exito' || estadoPeticion.tipo === 'error') && (
            <div className={styles.modalOverlay}>
              <div
                className={styles.modalContent}
                style={{ borderTopColor: estadoPeticion.tipo === 'exito' ? '#10b981' : '#ef4444' }}
              >
                {/* Cambia el ícono y el color dependiendo del tipo */}
                <i
                  className={`bi ${estadoPeticion.tipo === 'exito' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} ${styles.modalIcon}`}
                  style={{ color: estadoPeticion.tipo === 'exito' ? '#10b981' : '#ef4444' }}
                ></i>

                <h2 style={{ color: '#0f172a', marginBottom: '10px', fontSize: '1.8rem', fontWeight: '700' }}>
                  {estadoPeticion.tipo === 'exito' ? '¡Reporte Enviado!' : 'Atención'}
                </h2>

                <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '1rem' }}>
                  {estadoPeticion.mensaje}
                </p>

                <button
                  type="button"
                  className={styles.btnPrimary}
                  style={estadoPeticion.tipo === 'error' ? { backgroundColor: '#ef4444', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)' } : {}}
                  onClick={() => setEstadoPeticion({ tipo: '', mensaje: '' })}
                >
                  {estadoPeticion.tipo === 'exito' ? 'Aceptar' : 'Entendido'}
                </button>
              </div>
            </div>
          )}

          {/* Titulo de la incidencia */}
          <div className={styles.inputGroup}>
            <label>
              1. Título del reporte:
            </label>
            <input
              type="text"
              name="titulo"
              placeholder="Bache profundo"
              value={formData.titulo}
              onChange={handleChange}
              required
            />
          </div>

          {/* Comentarios */}
          <div className={styles.inputGroup}>
            <label>
              2. Descripción:
            </label>
            <textarea
              name="descripcion"
              placeholder="Descripción detallada de la situación..."
              value={formData.descripcion}
              onChange={handleChange}
              required
              rows="4"
              disabled={!formData.titulo}
            />
          </div>

          {/* Tipo de incidencia */}
          <div className={styles.inputGroup}>
            <label>
              3. Tipo de incidencia:
            </label>
            <select
              name="tipoIncidenciaId"
              value={formData.tipoIncidenciaId}
              onChange={handleChange}
              required
              disabled={!formData.descripcion}
            >
              <option value="" disabled hidden>Selecciona el tipo de incidencia</option>
              {Array.isArray(tipos) && tipos.map(tipo => (
                <option key={tipo.id} value={tipo.id}>{formatearTexto(tipo.nombre)}</option>
              ))}
            </select>
          </div>

          {/* Ubicación en el mapa */}
          <div className={styles.inputGroup}>
            <label>
              4. Ubicación de la incidencia:
            </label>

            {/* Contenedor relativo para poder encimar la capa de bloqueo */}
            <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              {!formData.tipoIncidenciaId && (
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(3px)', // Desenfoca el mapa levemente
                  zIndex: 1000, // Se pone por encima del mapa
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <div style={{
                    backgroundColor: '#fff',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    color: '#555',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    textAlign: 'center'
                  }}>
                    <i className="bi bi-lock-fill" style={{ marginRight: '8px', color: '#f59e0b' }}></i>
                    Primero elige el tipo de incidencia
                  </div>
                </div>
              )}

              {/* El componente del mapa normal */}
              {/* Si está bloqueado, le bajamos la opacidad para que se vea "apagado" */}
              <div style={{ opacity: !formData.tipoIncidenciaId ? 0.6 : 1, transition: 'opacity 0.3s ease' }}>
                <SelectorMapa
                  key={resetMapaKey}
                  onUbicacionGuardada={(idNuevo) => {
                    setFormData({ ...formData, ubicacionId: idNuevo });
                  }}
                />
              </div>
            </div>

            {formData.ubicacionId && (
              <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#166534', fontSize: '0.85rem', fontWeight: '500' }}>
                <i className="bi bi-check-circle-fill" style={{ marginRight: '5px' }}></i>
                Si te equivocaste, solo mueve el pin y vuelve a fijarlo.
              </div>
            )}
          </div>

          {/*Evidencia fotográfica*/}
          <div className={styles.inputGroup}>
            <label>
              5. Evidencia fotográfica:
            </label>
            <div
              onClick={() => {
                if (!formData.ubicacionId) return;
                if (!subiendo && !cargando) fileRef.current?.click();
              }}
              style={{
                border: `2px dashed ${subiendo ? '#00A99D' : '#cbd5e1'}`,
                borderRadius: 10,
                padding: '24px',
                textAlign: 'center',
                background: subiendo ? 'rgba(0,169,157,0.04)' : '#f8fafc',
                cursor: (!formData.ubicacionId || subiendo || cargando) ? 'not-allowed' : 'pointer',
                transition: 'all .2s ease',
                opacity: !formData.ubicacionId ? 0.5 : 1
              }}
            >
              {subiendo ? (
                <div>
                  <i className="bi bi-cloud-arrow-up" style={{ fontSize: 34, color: '#f59e0b', display: 'block', marginBottom: 10 }}></i>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#d97706', marginBottom: 10 }}>Subiendo imagen...</div>
                  <div style={{ width: '100%', height: 8, background: '#fef3c7', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ width: `${progreso}%`, height: '100%', background: 'linear-gradient(90deg,#fcd34d,#f59e0b)', transition: 'width .3s ease' }} />
                  </div>
                  <div style={{ fontSize: 12, color: '#b45309', marginTop: 8, fontWeight: 600 }}>{progreso}%</div>
                </div>
              ) : filePreview ? (
                <div>
                  <img src={filePreview} alt="Preview" style={{ maxHeight: 150, maxWidth: '100%', borderRadius: 8, objectFit: 'contain', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 12, fontWeight: 500 }}>Haz clic para cambiar la imagen</div>
                </div>
              ) : (
                <div>
                  <i className="bi bi-camera-fill" style={{ fontSize: 34, color: '#94a3b8', display: 'block', marginBottom: 8 }}></i>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                    {!formData.ubicacionId ? 'Primero fija la ubicación en el mapa' : 'Seleccionar imagen'}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>JPG, PNG, WEBP — máximo 10 MB</div>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
            </div>
          </div>

          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={cargando}
            style={{ opacity: cargando ? 0.7 : 1, cursor: cargando ? 'not-allowed' : 'pointer' }}
          >
            {cargando ? 'Procesando envío...' : 'Enviar reporte'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default FormularioIncidencia;