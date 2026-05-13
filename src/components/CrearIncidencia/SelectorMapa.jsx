// src/components/SelectorMapa.jsx
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import axios from "axios";
import L from "leaflet";

// Importamos el IncidenciasService
import { IncidenciasService } from "../../services/IncidenciasService";

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

            onSelect({ latitud: lat, longitud: lon, cargando: true, coloniasDisponibles: [] });

            try {
                // 1. Obtener dirección por Nominatim (Llamada externa, usa axios directo)
                const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
                    params: { lat, lon, format: "jsonv2", addressdetails: 1 },
                });

                const addr = response.data.address || {};
                const codigoPostal = addr.postcode || "No disponible";

                const ciudad = addr.city || addr.town || addr.village || addr.municipality || "No disponible";
                const coloniaNominatim = addr.suburb || addr.neighbourhood || addr.quarter || "No disponible";
                const direccion = response.data.display_name || "Sin dirección";

                let coloniasCp = [];

                // 2. Buscar colonias por Código Postal usando IncidenciasService
                if (codigoPostal !== "No disponible") {
                    try {
                        const respuestaColonias = await IncidenciasService.obtenerColoniasPorCodigoPostal(codigoPostal);
                        // Extraemos el array sin importar si viene directo o dentro de .data
                        coloniasCp = Array.isArray(respuestaColonias) ? respuestaColonias : (respuestaColonias.data || []);

                        console.log(`Colonias encontradas para CP ${codigoPostal}:`, coloniasCp);
                    } catch (error) {
                        console.error("Error al obtener colonias por CP:", error);
                    }
                }

                // 3. Mandamos los datos recolectados al componente padre
                onSelect({
                    latitud: lat.toFixed(6),
                    longitud: lon.toFixed(6),
                    direccion: direccion,
                    ciudad: ciudad,
                    codigoPostal: codigoPostal,
                    coloniaOriginal: coloniaNominatim,
                    coloniasDisponibles: coloniasCp,
                    cargando: false,
                });

            } catch (error) {
                onSelect({
                    latitud: lat,
                    longitud: lon,
                    direccion: "Error al obtener dirección",
                    coloniasDisponibles: [],
                    cargando: false
                });
            }
        },
    });
    return null;
}

const SelectorMapa = ({ onUbicacionGuardada }) => {
    const [seleccion, setSeleccion] = useState(null);
    const [coloniaSeleccionada, setColoniaSeleccionada] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [exito, setExito] = useState(false);

    const manejarNuevaSeleccion = (nuevaUbicacion) => {
        setSeleccion(nuevaUbicacion);
        setExito(false);

        if (nuevaUbicacion.coloniasDisponibles && nuevaUbicacion.coloniasDisponibles.length === 1) {
            setColoniaSeleccionada(nuevaUbicacion.coloniasDisponibles[0]);
        } else {
            setColoniaSeleccionada("");
        }
    };

    const confirmarUbicacion = async () => {
        if (!seleccion || seleccion.cargando) return;

        if (seleccion.coloniasDisponibles.length > 0 && !coloniaSeleccionada) {
            alert("Por favor, selecciona una colonia de la lista antes de fijar el pin.");
            return;
        }

        setGuardando(true);
        setExito(false);

        try {
            const payload = {
                latitud: Number(seleccion.latitud),
                longitud: Number(seleccion.longitud),
                direccion: seleccion.direccion,
                ciudad: seleccion.ciudad,
                colonia: coloniaSeleccionada || seleccion.coloniaOriginal,
                codigoPostal: seleccion.codigoPostal,
            };

            // 4. Guardamos usando IncidenciasService
            const nuevaUbicacion = await IncidenciasService.crearUbicacion(payload);

            // Le avisamos al Formulario padre el ID que nos devolvió la base de datos
            onUbicacionGuardada(nuevaUbicacion.id);
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
                    <p style={{ margin: 0, color: "#1a73e8" }}>Buscando dirección y colonias...</p>
                ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                        <div style={{ flex: 1, paddingRight: "10px" }}>
                            
                            {seleccion.coloniasDisponibles && seleccion.coloniasDisponibles.length > 0 ? (
                                <select 
                                    value={coloniaSeleccionada}
                                    onChange={(e) => setColoniaSeleccionada(e.target.value)}
                                    style={{ 
                                        display: "block", 
                                        width: "100%", 
                                        marginBottom: "4px", 
                                        padding: "4px", 
                                        borderRadius: "4px", 
                                        border: "1px solid #ccc",
                                        fontWeight: "bold",
                                        color: "#333"
                                    }}
                                >
                                    <option value="">Selecciona una colonia (CP: {seleccion.codigoPostal})</option>
                                    {seleccion.coloniasDisponibles.map(col => (
                                        <option key={col} value={col}>{col}</option>
                                    ))}
                                </select>
                            ) : (
                                <input 
                                    type="text"
                                    value={coloniaSeleccionada || seleccion.coloniaOriginal}
                                    onChange={(e) => setColoniaSeleccionada(e.target.value)}
                                    placeholder="Escribe tu colonia"
                                    style={{
                                        display: "block", 
                                        width: "100%", 
                                        marginBottom: "4px", 
                                        padding: "4px", 
                                        borderRadius: "4px", 
                                        border: "1px solid #ccc",
                                        fontWeight: "bold",
                                        color: "#333"
                                    }}
                                />
                            )}

                            <span style={{ fontSize: "0.8rem", color: "#666", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                {seleccion.direccion}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={confirmarUbicacion}
                            disabled={guardando || exito}
                            style={{
                                background: guardando ? "#ccc" : exito ? "#2e7d32" : "#3b3b8c",
                                color: "white", 
                                border: "none", 
                                padding: "8px 12px",
                                borderRadius: "6px", 
                                cursor: (guardando || exito) ? "not-allowed" : "pointer",
                                transition: "background 0.3s ease",
                                whiteSpace: "nowrap"
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