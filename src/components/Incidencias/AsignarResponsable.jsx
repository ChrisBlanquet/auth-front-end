// src/components/AsignarResponsable.jsx
import { useState, useEffect } from 'react';
import { IncidenciasService } from "../../services/IncidenciasService";
import { useAuth } from "../../context/AuthContext";
import styles from '../CrearIncidencia/Formulario.module.css';
import WidgetClima from '../Incidencias/WidgetClima';

const AsignarResponsable = () => {
  const { usuario } = useAuth(); // Obtenemos el usuario autenticado (para sacar su ID)
  
  const [incidencias, setIncidencias] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [estadoPeticion, setEstadoPeticion] = useState({ tipo: '', mensaje: '' });

  // Estado para atrapar lo que el administrador selecciona
  const [seleccion, setSeleccion] = useState({
    incidenciaId: '',
    personalId: ''
  });

  const cargarDatos = async () => {
    try {
      const [dataIncidencias, dataPersonal] = await Promise.all([
        IncidenciasService.obtenerIncidenciasSinAsignar(),
        IncidenciasService.obtenerPersonal()
      ]);

      const personalDisponible = dataPersonal.filter(
        (emp) => emp.disponible === true
      );

      setIncidencias(dataIncidencias);
      setEmpleados(personalDisponible);
    } catch (error) {
      console.error("Error al cargar los datos iniciales");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSeleccion({ ...seleccion, [name]: value });
  };

  const incidenciaSeleccionada = incidencias.find(
    (inc) => inc.id.toString() === seleccion.incidenciaId
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!seleccion.incidenciaId || !seleccion.personalId) {
      setEstadoPeticion({ tipo: 'error', mensaje: 'Debes seleccionar una incidencia y un responsable.' });
      return;
    }

    setCargando(true);
    setEstadoPeticion({ tipo: '', mensaje: '' });

    try {
      // Usamos el ID del usuario autenticado, si no existe usamos 1 como respaldo por seguridad
      const adminId = usuario?.id || 1; 

      await IncidenciasService.asignarResponsable(seleccion.incidenciaId, seleccion.personalId, adminId);

      setEstadoPeticion({
        tipo: 'exito',
        mensaje: `¡Personal asignado correctamente a la incidencia #${seleccion.incidenciaId}!`
      });

      // Limpiamos los selectores
      setSeleccion({ incidenciaId: '', personalId: '' });

    } catch (error) {
      setEstadoPeticion({
        tipo: 'error',
        mensaje: 'No se pudo asignar al responsable. Revisa tu conexión.'
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>

          <h1 className={styles.title}>Asignación de personal</h1>
          <p className={styles.subtitle}>Panel Administrativo para asignar responsable</p>

          {/* Alertas */}
          {estadoPeticion.mensaje && (
            <div className={estadoPeticion.tipo === 'exito' ? styles.alertSuccess : styles.alertError}>
              {estadoPeticion.mensaje}
            </div>
          )}

          {estadoPeticion.tipo === 'exito' && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <i className={`bi bi-check-circle-fill ${styles.modalIcon}`}></i>
                <h2 style={{ color: '#3b3b8c', marginBottom: '10px', fontSize: '1.8rem', fontWeight: '700' }}>
                  ¡Asignación exitosa!
                </h2>
                <p style={{ color: '#555', marginBottom: '30px', fontSize: '1rem' }}>
                  {estadoPeticion.mensaje}
                </p>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={() => {
                    setEstadoPeticion({ tipo: '', mensaje: '' });
                    cargarDatos(); // Refrescamos las listas al dar "Aceptar"
                  }}
                >
                  Aceptar
                </button>
              </div>
            </div>
          )}

          {/* Menú Desplegable 1: Seleccionar Incidencia */}
          <div className={styles.inputGroup}>
            <label style={{ marginBottom: '8px', fontWeight: '600', display: 'block', fontSize: '0.9rem', color: '#555' }}>
              1. Selecciona el reporte ciudadano:
            </label>
            <select
              name="incidenciaId"
              value={seleccion.incidenciaId}
              onChange={handleChange}
              required
            >
              <option value="" disabled hidden>Elige una incidencia pendiente</option>
              {incidencias.length === 0 ? (
                <option disabled>Cargando reportes...</option>
              ) : (
                incidencias.map(inc => (
                  <option key={inc.id} value={inc.id}>
                    Folio #{inc.id} - {inc.titulo}
                  </option>
                ))
              )}
            </select>
          </div>

          {seleccion.incidenciaId && incidenciaSeleccionada?.ubicacionId && (
            <WidgetClima ubicacionId={incidenciaSeleccionada.ubicacionId} />
          )}

          {incidenciaSeleccionada?.alertaClima && (
            <div style={{
              backgroundColor: '#fff1f2',
              color: '#e11d48',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '15px',
              border: '1px solid #fecdd3',
              display: 'flex',
              alignItems: 'center'
            }}>
              <i className="bi bi-cloud-lightning-rain-fill" style={{ fontSize: '1.2rem', marginRight: '10px' }}></i>
              {incidenciaSeleccionada.alertaClima}
            </div>
          )}

          {/* Menú Desplegable 2: Seleccionar Trabajador */}
          <div className={styles.inputGroup}>
            <label style={{ marginBottom: '8px', fontWeight: '600', display: 'block', fontSize: '0.9rem', color: '#555' }}>
              2. Asignar a Empleado/Cuadrilla:
            </label>
            <select
              name="personalId"
              value={seleccion.personalId}
              onChange={handleChange}
              required
              disabled={!seleccion.incidenciaId}
            >
              <option value="" disabled hidden>Elige al responsable</option>
              {empleados.length === 0 ? (
                <option disabled>No hay personal disponible</option>
              ) : (
                empleados.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre} {emp.apellidos || ''}
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={cargando}
            style={{ opacity: cargando ? 0.7 : 1, cursor: cargando ? 'not-allowed' : 'pointer', marginTop: '20px' }}
          >
            {cargando ? 'Asignando...' : 'Confirmar asignación'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AsignarResponsable;