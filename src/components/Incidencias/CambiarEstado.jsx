// src/components/Incidencias/CambiarEstado.jsx
import { useState, useEffect, useRef } from 'react';
import { IncidenciasService } from '../../services/IncidenciasService';
import { subirImagen } from '../../services/imgbb';
import { useAuth } from '../../context/AuthContext';
import styles from '../CrearIncidencia/Formulario.module.css';

const CambiarEstado = () => {
  const { usuario } = useAuth(); // Para obtener el ID del admin/empleado
  const [incidencias, setIncidencias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [estadoPeticion, setEstadoPeticion] = useState({ tipo: '', mensaje: '' });

  const [formulario, setFormulario] = useState({
    incidenciaId: '',
    nuevoEstado: '',
    comentarios: ''
  });

  // Estados para la imagen
  const [archivo, setArchivo] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const fileRef = useRef(null);

  const cargarDatos = async () => {
    try {
      // Traemos todas las incidencias
      const dataIncidencias = await IncidenciasService.obtenerTodasLasIncidencias();

      const incidenciasEnProceso = dataIncidencias.filter(
        (inc) => inc.personalId !== null && inc.estado !== 'CERRADO'
      );

      setIncidencias(incidenciasEnProceso);
    } catch (error) {
      console.error("Error al cargar las incidencias", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Limpiamos los campos en cascada para evitar bugs
    if (name === 'incidenciaId') {
      setFormulario({ ...formulario, incidenciaId: value, nuevoEstado: '', comentarios: '' });
      setArchivo(null);
      setFilePreview('');
    } else if (name === 'nuevoEstado') {
      setFormulario({ ...formulario, [name]: value });
      // Si cambian a CERRADO, quitamos la foto porque no aplica
      if (value === 'CERRADO') {
        setArchivo(null);
        setFilePreview('');
      }
    } else {
      setFormulario({ ...formulario, [name]: value });
    }
  };

  // Buscamos la incidencia que el usuario acaba de seleccionar para saber su estado actual
  const incidenciaSeleccionada = incidencias.find(
    (inc) => inc.id.toString() === formulario.incidenciaId
  );
  const estadoActual = incidenciaSeleccionada ? incidenciaSeleccionada.estado : null;

  // Manejo de la selección del archivo
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

    if (!formulario.incidenciaId || !formulario.nuevoEstado || !formulario.comentarios) {
      setEstadoPeticion({ tipo: 'error', mensaje: 'Todos los campos son obligatorios.' });
      return;
    }

    if (formulario.nuevoEstado === 'RESUELTO' && !archivo) {
      setEstadoPeticion({
        tipo: 'error',
        mensaje: 'Para marcar una incidencia como RESUELTA es obligatorio subir una evidencia fotográfica.'
      });
      return;
    }

    setCargando(true);
    setEstadoPeticion({ tipo: '', mensaje: '' });

    try {
      let urlImgBB = null;

      // 1. Subir la imagen a ImgBB si el usuario seleccionó una
      if (archivo) {
        setSubiendo(true);
        setEstadoPeticion({ tipo: 'info', mensaje: 'Subiendo evidencia fotográfica...' });
        // Escogemos la carpeta de ImgBB dependiendo del estado
        const carpeta = formulario.nuevoEstado === 'RESUELTO' ? 'fotos-despues' : 'fotos-proceso';
        urlImgBB = await subirImagen(archivo, carpeta, (pct) => setProgreso(pct));
        setSubiendo(false);
      }

      // 2. Actualizar el estado en MS2 (Incidencias)
      setEstadoPeticion({ tipo: 'info', mensaje: 'Actualizando la bitácora...' });
      const modificadorId = usuario?.id || 1; // ID Dinámico

      await IncidenciasService.cambiarEstado(
        formulario.incidenciaId,
        formulario.nuevoEstado,
        formulario.comentarios,
        modificadorId 
      );

      // 3. Guardar la evidencia en MS5 si hay imagen
      if (urlImgBB && incidenciaSeleccionada) {
        setEstadoPeticion({ tipo: 'info', mensaje: 'Enlazando evidencia con el reporte...' });
        const personalId = incidenciaSeleccionada.personalId;

        if (formulario.nuevoEstado === 'EN_PROCESO') {
          await IncidenciasService.guardarEvidenciaProceso(formulario.incidenciaId, personalId, urlImgBB);
        } else if (formulario.nuevoEstado === 'RESUELTO') {
          await IncidenciasService.guardarEvidenciaDespues(formulario.incidenciaId, personalId, urlImgBB);
        }
      }

      setEstadoPeticion({
        tipo: 'exito',
        mensaje: `¡El estado de la incidencia #${formulario.incidenciaId} fue actualizado a ${formulario.nuevoEstado}!`
      });

      // Limpiamos todo
      setFormulario({ incidenciaId: '', nuevoEstado: '', comentarios: '' });
      setArchivo(null);
      setFilePreview('');
      setProgreso(0);

    } catch (error) {
      console.error("Error al actualizar estado:", error);
      setSubiendo(false);
      setEstadoPeticion({
        tipo: 'error',
        mensaje: 'No se pudo actualizar el estado. Revisa tu conexión.'
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>

          <h1 className={styles.title}>Actualizar estado</h1>
          <p className={styles.subtitle}>Bitácora de seguimiento de incidencias</p>

          {/* Alertas de error */}
          {estadoPeticion.tipo === 'error' && (
            <div className={styles.alertError}>
              {estadoPeticion.mensaje}
            </div>
          )}

          {/* Modal de Éxito Flotante*/}
          {estadoPeticion.tipo === 'exito' && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <i className={`bi bi-check-circle-fill ${styles.modalIcon}`}></i>
                <h2 style={{ color: '#3b3b8c', marginBottom: '10px', fontSize: '1.8rem', fontWeight: '700' }}>
                  ¡Actualización exitosa!
                </h2>
                <p style={{ color: '#555', marginBottom: '30px', fontSize: '1rem' }}>
                  {estadoPeticion.mensaje}
                </p>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={() => {
                    setEstadoPeticion({ tipo: '', mensaje: '' });
                    cargarDatos(); // Refrescamos las listas
                  }}
                >
                  Aceptar
                </button>
              </div>
            </div>
          )}

          {/* Seleccionar incidencia */}
          <div className={styles.inputGroup}>
            <label style={{ marginBottom: '8px', fontWeight: '600', display: 'block', fontSize: '0.9rem', color: '#555' }}>
              1. Selecciona el reporte asignado:
            </label>
            <select
              name="incidenciaId"
              value={formulario.incidenciaId}
              onChange={handleChange}
              required
            >
              <option value="" disabled hidden>Elige una incidencia</option>
              {incidencias.length === 0 ? (
                <option disabled>No hay reportes con personal asignado</option>
              ) : (
                incidencias.map(inc => (
                  <option key={inc.id} value={inc.id}>
                    Folio #{inc.id} - {inc.titulo} (Estado: {inc.estado})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Seleccionar nuevo estado */}
          <div className={styles.inputGroup}>
            <label style={{ marginBottom: '8px', fontWeight: '600', display: 'block', fontSize: '0.9rem', color: '#555' }}>
              2. Nuevo estado:
            </label>
            <select
              name="nuevoEstado"
              value={formulario.nuevoEstado}
              onChange={handleChange}
              required
              disabled={!formulario.incidenciaId}
            >
              <option value="" disabled hidden>
                {!formulario.incidenciaId ? "Primero selecciona un reporte" : "Selecciona la fase del trabajo"}
              </option>

              {/* Renderizado condicional basado en el estado actual */}
              {estadoActual === 'REPORTADO' && (
                <option value="EN_PROCESO">En proceso</option>
              )}

              {estadoActual === 'EN_PROCESO' && (
                <option value="RESUELTO">Resuelto</option>
              )}

              {estadoActual === 'RESUELTO' && (
                <option value="CERRADO">Cerrado</option>
              )}
            </select>
          </div>

          {/* Comentarios para la bitácora */}
          <div className={styles.inputGroup}>
            <label style={{ marginBottom: '8px', fontWeight: '600', display: 'block', fontSize: '0.9rem', color: '#555' }}>
              3. Comentarios / Bitácora:
            </label>
            <textarea
              name="comentarios"
              placeholder="Ej. Se tapó el bache usando 5 bultos de asfalto frío..."
              value={formulario.comentarios}
              onChange={handleChange}
              required
              rows="3"
              disabled={!formulario.nuevoEstado}
            />
          </div>

          {/* Evidencia Fotográfica */}
          {formulario.nuevoEstado && formulario.nuevoEstado !== 'CERRADO' && (
            <div className={styles.inputGroup}>
              <label style={{ marginBottom: '8px', fontWeight: '600', display: 'block', fontSize: '0.9rem', color: '#555' }}>
                4. Evidencia fotográfica {formulario.nuevoEstado === 'RESUELTO' ? '(Obligatoria)' : '(Opcional)'}:
              </label>
              <div
                onClick={() => {
                  if (!subiendo && !cargando) fileRef.current?.click();
                }}
                style={{
                  border: `2px dashed ${subiendo ? '#00A99D' : (formulario.nuevoEstado === 'RESUELTO' && !archivo ? '#c62828' : 'rgba(59, 59, 140, 0.25)')}`,
                  borderRadius: 12,
                  padding: '20px',
                  textAlign: 'center',
                  background: subiendo ? 'rgba(0,169,157,0.04)' : 'rgba(59, 59, 140, 0.03)',
                  cursor: (subiendo || cargando) ? 'not-allowed' : 'pointer',
                  transition: 'all .2s'
                }}
              >
                {subiendo ? (
                  <div>
                    <i className="bi bi-cloud-arrow-up" style={{ fontSize: 34, color: '#00A99D', display: 'block', marginBottom: 10 }}></i>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#00A99D', marginBottom: 10 }}>Subiendo imagen...</div>
                    <div style={{ width: '100%', height: 8, background: 'rgba(0,169,157,0.15)', borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{ width: `${progreso}%`, height: '100%', background: 'linear-gradient(90deg,#00A99D,#72B432)', transition: 'width .3s ease' }} />
                    </div>
                    <div style={{ fontSize: 12, color: '#006b66', marginTop: 8, fontWeight: 600 }}>{progreso}%</div>
                  </div>
                ) : filePreview ? (
                  <div>
                    <img src={filePreview} alt="Preview" style={{ maxHeight: 150, maxWidth: '100%', borderRadius: 10, objectFit: 'contain' }} />
                    <div style={{ fontSize: 11, color: '#75787B', marginTop: 8 }}>Haz clic para cambiar la imagen</div>
                  </div>
                ) : (
                  <div>
                    <i className="bi bi-camera-fill" style={{ fontSize: 34, color: 'rgba(59, 59, 140, 0.4)', display: 'block', marginBottom: 8 }}></i>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#3b3b8c' }}>Seleccionar imagen</div>
                    <div style={{ fontSize: 11, color: '#75787B', marginTop: 4 }}>JPG, PNG, WEBP — máximo 10 MB</div>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
              </div>
            </div>
          )}

          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={cargando}
            style={{ opacity: cargando ? 0.7 : 1, cursor: cargando ? 'not-allowed' : 'pointer', marginTop: '20px' }}
          >
            {cargando ? 'Actualizando...' : 'Guardar nuevo estado'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CambiarEstado;