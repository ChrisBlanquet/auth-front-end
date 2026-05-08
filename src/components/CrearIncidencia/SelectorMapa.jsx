// src/components/SelectorMapa.jsx
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import axios from "axios";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

function EventosMapa({ onSelect }) {
    useMapEvents({
        async click(e) {
            const lat = e.latlng.lat;
            const lon = e.latlng.lng;

            onSelect({ latitud: lat, longitud: lon, cargando: true });

            try {
                const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
                    params: { lat, lon, format: "jsonv2", addressdetails: 1 },
                });

                const addr = response.data.address || {};
                onSelect({
                    latitud: lat.toFixed(6),
                    longitud: lon.toFixed(6),
                    direccion: response.data.display_name || "Sin dirección",
                    colonia: addr.suburb || addr.neighbourhood || addr.quarter || "No disponible",
                    ciudad: addr.city || addr.town || addr.village || "No disponible",
                    cargando: false,
                });
            } catch (error) {
                onSelect({ latitud: lat, longitud: lon, direccion: "Error al obtener", cargando: false });
            }
        },
    });
    return null;
}

const SelectorMapa = ({ onUbicacionGuardada }) => {
    const [seleccion, setSeleccion] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [exito, setExito] = useState(false);

    const manejarNuevaSeleccion = (nuevaUbicacion) => {
        setSeleccion(nuevaUbicacion);
        setExito(false); // Regresa el botón a la normalidad
    };

    const confirmarUbicacion = async () => {
        if (!seleccion || seleccion.cargando) return;
        setGuardando(true);
        setExito(false);

        try {
            const payload = {
                latitud: Number(seleccion.latitud),
                longitud: Number(seleccion.longitud),
                direccion: seleccion.direccion,
                colonia: seleccion.colonia,
                ciudad: seleccion.ciudad,
            };

            const response = await axios.post("http://135.232.229.213:9000/api/ubicaciones", payload);

            // Le avisamos al Formulario padre el ID que nos devolvió la base de datos
            onUbicacionGuardada(response.data.id);
            setExito(true);

        } catch (error) {
            console.error("Error:", error);
            alert("No se pudo guardar la ubicación en la base de datos.");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div style={{ width: "100%", border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>

            <MapContainer center={[17.5515, -99.5058]} zoom={14} style={{ height: "250px", width: "100%", zIndex: 0 }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <EventosMapa onSelect={manejarNuevaSeleccion} />
                {seleccion && !seleccion.cargando && (
                    <Marker position={[seleccion.latitud, seleccion.longitud]} />
                )}
            </MapContainer>

            <div style={{ padding: "10px", background: "#f8f9fa", fontSize: "0.9rem" }}>
                {!seleccion ? (
                    <p style={{ margin: 0, color: "#666" }}>Da clic en el mapa para ubicar el problema.</p>
                ) : seleccion.cargando ? (
                    <p style={{ margin: 0, color: "#1a73e8" }}>Buscando dirección...</p>
                ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ flex: 1, paddingRight: "10px" }}>
                            <strong style={{ display: "block", color: "#333" }}>{seleccion.colonia}</strong>
                            <span style={{ fontSize: "0.8rem", color: "#666" }}>{seleccion.direccion}</span>
                        </div>

                        <button
                            type="button"
                            onClick={confirmarUbicacion}
                            disabled={guardando || exito} // Deshabilitamos si ya está guardado para no duplicar en BD
                            style={{
                                // Magia de colores: Gris si carga, Verde si ya se guardó, Azul institucional si está normal
                                background: guardando ? "#ccc" : exito ? "#2e7d32" : "#3b3b8c",
                                color: "white", border: "none", padding: "8px 12px",
                                borderRadius: "6px", cursor: (guardando || exito) ? "not-allowed" : "pointer",
                                transition: "background 0.3s ease"
                            }}
                        >
                            {guardando ? "Fijando..." : exito ? "¡Fijado!" : "Fijar Pin"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SelectorMapa;