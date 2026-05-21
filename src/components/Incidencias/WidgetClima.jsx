import { useState, useEffect } from 'react';
import { IncidenciasService } from "../../services/IncidenciasService";

const WidgetClima = ({ ubicacionId }) => {
  const [clima, setClima] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!ubicacionId) return;

    const fetchClima = async () => {
      setCargando(true);
      const data = await IncidenciasService.obtenerClimaUbicacion(ubicacionId);
      setClima(data);
      setCargando(false);
    };

    fetchClima();
  }, [ubicacionId]);

  if (cargando) return <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Cargando clima en la zona...</p>;
  if (!clima || !clima.main) return null; // Si falla, simplemente no lo mostramos

  // OpenWeather tiene una URL oficial para cargar sus iconos
  const iconUrl = `https://openweathermap.org/img/wn/${clima.weather[0].icon}@2x.png`;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '10px 15px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <img src={iconUrl} alt="Icono del clima" style={{ width: '50px', height: '50px', marginRight: '15px' }} />
      <div>
        <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', fontWeight: 'bold' }}>
          {Math.round(clima.main.temp)}°C
        </h4>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', textTransform: 'capitalize' }}>
          {clima.weather[0].description} • Humedad: {clima.main.humidity}%
        </p>
      </div>
    </div>
  );
};

export default WidgetClima;