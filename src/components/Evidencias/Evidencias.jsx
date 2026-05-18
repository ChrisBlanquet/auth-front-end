import React, { useState, useEffect, useRef } from 'react';
import { subirImagen } from '../../services/imgbb';
import { fotosAntesApi, fotosProcesoApi, fotosDespuesApi } from '../../services/Evidencias'; // Ajusta la ruta a tu archivo de servicios unificado si es necesario
import { incidenciasApi, personalApi } from '../../services/GestionInstitucionalService';
import Notification from '../../components/Notification/Notification';
import styles from '../../pages/Admin/GestionUsuarios.module.css';

// ─── Configuración de tabs ────────────────────────────────────────
const TABS = [
    { key:'incidencias', label:'Incidencias',   icon:'bi-list-ul',          color:'#385C88', bg:'rgba(56,92,136,0.10)',  border:'rgba(56,92,136,0.28)',  badgeBg:'rgba(56,92,136,0.10)',  folioKey:null,          needsPersonal:false, estadoRequerido:null,        info:null },
    { key:'antes',       label:'Fotos Antes',   icon:'bi-camera-fill',       color:'#9a6200', bg:'rgba(237,165,6,0.10)', border:'rgba(237,165,6,0.28)', badgeBg:'rgba(237,165,6,0.13)', folioKey:'folioAntes',   needsPersonal:false, estadoRequerido:'REPORTADO',  info:'Solo incidencias en estado REPORTADO.' },
    { key:'proceso',     label:'Fotos Proceso', icon:'bi-arrow-repeat',      color:'#0d9488', bg:'rgba(13,148,136,0.10)', border:'rgba(13,148,136,0.28)', badgeBg:'rgba(13,148,136,0.13)', folioKey:'folioProceso', needsPersonal:true,  estadoRequerido:'EN_PROCESO', info:'Solo incidencias EN_PROCESO. Solo el personal asignado.' },
    { key:'despues',     label:'Fotos Después', icon:'bi-check-circle-fill', color:'#16a34a', bg:'rgba(22,163,74,0.10)',border:'rgba(22,163,74,0.28)',badgeBg:'rgba(22,163,74,0.13)',folioKey:'folioSolucion',needsPersonal:true,  estadoRequerido:'RESUELTO',   info:'Solo incidencias RESUELTO. Solo el personal asignado.' },
];

// --- Componentes auxiliares visuales ---
const StatusBadge = ({ status }) => (
    <span style={{ 
        background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', 
        borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: '700' 
    }}>
        {status}
    </span>
);

const FolioTag = ({ folio, color, bg, border }) => (
    <span style={{
        fontFamily: 'monospace', fontSize: '13px', fontWeight: '700',
        color: color, background: bg, border: `1px solid ${border}`,
        padding: '3px 10px', borderRadius: '6px'
    }}>
        {folio}
    </span>
);

// ─── Visor de imagen ──────────────────────────────────────────────
const VisorImagen = ({ url, onClose }) => {
    const [imgError, setImgError] = useState(false);
    useEffect(() => { setImgError(false); }, [url]);
    if (!url) return null;

    return (
        <div onClick={onClose} style={{
            position:'fixed', inset:0, zIndex:1100, // Z-index más alto para sobreponerse a modales
            background:'rgba(15, 23, 42, 0.95)',
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center',
            padding:24, animation:'fadeIn .2s ease-out',
        }}>
            <div style={{
                position:'fixed', top:0, left:0, right:0,
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'14px 24px',
                background:'rgba(0,0,0,0.5)', backdropFilter:'blur(8px)',
            }}>
                <span style={{color:'white',fontSize:'14px',fontWeight:'600',display:'flex',alignItems:'center',gap:'8px'}}>
                    <i className="bi bi-camera-fill" style={{color:'#e2e8f0',fontSize:'16px'}} />
                    Vista previa de evidencia
                </span>
                <div style={{display:'flex',gap:'10px'}}>
                    <a href={url} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
                        style={{
                            background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)',
                            borderRadius:'8px', padding:'6px 14px', color:'white', fontSize:'13px', fontWeight:'600',
                            display:'flex', alignItems:'center', gap:'6px', textDecoration:'none', transition:'background .2s'
                        }}>
                        <i className="bi bi-box-arrow-up-right" /> Abrir en pestaña
                    </a>
                    <button onClick={onClose} style={{
                        background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)',
                        borderRadius:'8px', padding:'6px 12px', color:'white', fontSize:'16px', cursor:'pointer',
                        display:'flex', alignItems:'center', transition:'background .2s'
                    }}>
                        <i className="bi bi-x-lg" />
                    </button>
                </div>
            </div>
            
            <div onClick={e=>e.stopPropagation()} style={{marginTop:'60px', maxWidth:'90vw', maxHeight:'80vh'}}>
                {imgError ? (
                    <div style={{
                        background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
                        borderRadius:'16px', padding:'50px 60px', textAlign:'center', color:'rgba(255,255,255,0.7)',
                    }}>
                        <i className="bi bi-image" style={{fontSize:'48px', display:'block', marginBottom:'16px', opacity:0.5}} />
                        <div style={{fontSize:'16px', fontWeight:'600', marginBottom:'8px'}}>No se pudo cargar la imagen</div>
                        <div style={{fontSize:'13px', opacity:0.8, marginBottom:'20px', maxWidth:'300px'}}>
                            La URL no apunta a una imagen accesible desde el navegador.
                        </div>
                        <div style={{
                            background:'rgba(0,0,0,0.4)', borderRadius:'8px', padding:'10px 16px',
                            fontFamily:'monospace', fontSize:'12px', color:'rgba(255,255,255,0.8)', wordBreak:'break-all',
                        }}>{url}</div>
                    </div>
                ) : (
                    <img src={url} alt="Evidencia" onError={()=>setImgError(true)} style={{
                        maxWidth:'88vw', maxHeight:'78vh', borderRadius:'12px',
                        objectFit:'contain', boxShadow:'0 25px 50px -12px rgba(0,0,0,0.5)', display:'block',
                    }} />
                )}
            </div>
            <div style={{position:'fixed', bottom:'20px', color:'rgba(255,255,255,0.5)', fontSize:'13px'}}>
                Haz clic fuera de la imagen para cerrar
            </div>
        </div>
    );
};

// ─── Modal de detalle de una foto ─────────────────────────────────
const DetalleModal = ({ foto, tabInfo, todoPers, onVerImagen, onClose }) => {
    const [incidencia, setIncidencia] = useState(null);
    const [loadingInc, setLoadingInc] = useState(false);

    useEffect(() => {
        if (!foto) return;
        setIncidencia(null);
        setLoadingInc(true);
        incidenciasApi.getById(foto.idHistorialEstado)
            .then(r => setIncidencia(r.data || null))
            .catch(() => setIncidencia(null))
            .finally(() => setLoadingInc(false));
    }, [foto?.idHistorialEstado]);

    if (!foto) return null;

    const folio = foto[tabInfo.folioKey];
    const pers  = tabInfo.needsPersonal && foto.personalId ? todoPers.find(p => p.id === foto.personalId) : null;

    const Campo = ({ label, valor, icon, colorIcon }) => (
        <div style={{ display:'flex', alignItems:'flex-start', gap:'12px', padding:'12px 0', borderBottom:'1px solid #f1f5f9' }}>
            <div style={{
                width:'34px', height:'34px', borderRadius:'8px', flexShrink:0,
                background:'#f8fafc', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center',
            }}>
                <i className={icon} style={{color: colorIcon || '#64748b', fontSize:'14px'}} />
            </div>
            <div>
                <div style={{ fontSize:'11px', fontWeight:'700', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'3px' }}>
                    {label}
                </div>
                <div style={{ fontSize:'14px', fontWeight:'600', color:'#0f172a' }}>
                    {valor || '—'}
                </div>
            </div>
        </div>
    );

    return (
        <div className={styles.modalOverlay} style={{ zIndex: 1050 }}>
            <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
                <div className={styles.modalHeader}>
                    <h3>Detalle de Evidencia</h3>
                    <button onClick={onClose} className={styles.btnIcon}><i className="bi bi-x-lg"></i></button>
                </div>
                
                <div className={styles.modalBody}>
                    {/* Imagen en miniatura */}
                    <div style={{
                        marginBottom:'20px', borderRadius:'12px', overflow:'hidden',
                        border:'1px solid #e2e8f0', background:'#f8fafc', position:'relative',
                    }}>
                        <img
                            src={foto.url} alt="Evidencia"
                            style={{ width:'100%', maxHeight:'220px', objectFit:'cover', display:'block' }}
                            onError={e=>{ e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                        />
                        <div style={{
                            display:'none', alignItems:'center', justifyContent:'center',
                            height:'140px', color:'#94a3b8', flexDirection:'column', gap:'8px',
                        }}>
                            <i className="bi bi-image" style={{fontSize:'32px', opacity:0.5}} />
                            <span style={{fontSize:'13px'}}>No se puede previsualizar</span>
                        </div>
                        <button
                            onClick={() => onVerImagen(foto.url)}
                            style={{
                                position:'absolute', bottom:'10px', right:'10px',
                                background:'rgba(15, 23, 42, 0.8)', backdropFilter:'blur(4px)',
                                border:'none', borderRadius:'8px', padding:'6px 14px',
                                color:'white', fontSize:'13px', fontWeight:'600', cursor:'pointer',
                                display:'flex', alignItems:'center', gap:'6px', transition:'background .2s',
                            }}
                            onMouseEnter={e=>e.currentTarget.style.background='rgba(15, 23, 42, 1)'}
                            onMouseLeave={e=>e.currentTarget.style.background='rgba(15, 23, 42, 0.8)'}
                        >
                            <i className="bi bi-arrows-fullscreen" style={{fontSize:'12px'}} /> Ampliar
                        </button>
                    </div>

                    <div style={{display:'flex', flexDirection:'column'}}>
                        <Campo label="Folio" icon="bi bi-upc-scan"
                            valor={<FolioTag folio={folio} color={tabInfo.color} bg={tabInfo.badgeBg} border={tabInfo.border} />}
                        />
                        <Campo label="Tipo de foto" icon="bi bi-camera-fill" colorIcon={tabInfo.color} valor={tabInfo.label} />
                        
                        <Campo label="Incidencia" icon="bi bi-hash" colorIcon="#482483"
                            valor={
                                loadingInc ? (
                                    <span style={{color:'#64748b', fontSize:'13px'}}>
                                        <i className="bi bi-hourglass-split" style={{marginRight:'5px'}} />Consultando MS2...
                                    </span>
                                ) : incidencia ? (
                                    <div>
                                        <div style={{marginBottom:'6px'}}>#{incidencia.id} — {incidencia.titulo}</div>
                                        <StatusBadge status={incidencia.estado} />
                                    </div>
                                ) : (
                                    <span style={{color:'#ef4444', fontSize:'13px'}}>ID #{foto.idHistorialEstado} — no se pudo obtener</span>
                                )
                            }
                        />

                        {tabInfo.needsPersonal && (
                            <Campo label="Personal asignado" icon="bi bi-person-badge-fill" colorIcon="#0d9488"
                                valor={
                                    pers ? (
                                        <div>
                                            <div style={{fontWeight:'600'}}>{pers.nombre}</div>
                                            <div style={{fontSize:'12px', color:'#64748b', marginTop:'2px'}}>
                                                {pers.puestoNombre} · {pers.cuadrillaNombre}
                                            </div>
                                        </div>
                                    ) : foto.personalId ? (`ID ${foto.personalId} — no encontrado`) : null
                                }
                            />
                        )}

                        <Campo label="Fecha y hora de registro" icon="bi bi-calendar-event-fill" colorIcon="#475569"
                            valor={
                                foto.fecha ? new Date(foto.fecha).toLocaleString('es-MX',{
                                    weekday:'long', day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit',
                                }) : '—'
                            }
                        />
                    </div>
                </div>

                <div className={styles.modalActions}>
                    <button onClick={onClose} className={styles.btnPrimary}>Cerrar</button>
                </div>
            </div>
        </div>
    );
};

// ─── Página principal ─────────────────────────────────────────────
const Evidencias = () => {
    const [tab,           setTab]         = useState('incidencias');
    const [data,          setData]        = useState([]);
    const [incidencias,   setIncidencias] = useState([]);
    const [todoPers,      setTodoPers]    = useState([]);
    const [cargando,      setCargando]    = useState(true);
    const [loadingInc,    setLoadingInc]  = useState(false);
    const [notificacion,  setNotificacion] = useState({ visible: false, mensaje: '', tipo: 'info' });
    
    // Modales y Visores
    const [modal,         setModal]       = useState(false);
    const [visorUrl,      setVisorUrl]    = useState('');
    const [fotoDetalle,   setFotoDetalle] = useState(null); 
    
    // Búsqueda
    const [buscar,        setBuscar]      = useState('');
    const [tipoBuscar,    setTipoBuscar]  = useState('incidencia');
    
    // Subida de imagen
    const [filePreview,   setFilePreview] = useState('');
    const [subiendo,      setSubiendo]    = useState(false);
    const [progreso,      setProgreso]    = useState(0);
    const fileRef = useRef(null);

    const [form, setForm] = useState({
        incidenciaId: '', personalId: '', personalNombre: '', personalAuto: false, url: '',
    });

    const tabInfo   = TABS.find(t => t.key === tab);
    const isFotoTab = tab !== 'incidencias';

    const getApi = (tabKey) => tabKey === 'antes' ? fotosAntesApi : tabKey === 'proceso' ? fotosProcesoApi : fotosDespuesApi;

    const mostrarMsg = (mensaje, tipo) => {
        setNotificacion({ visible: true, mensaje, tipo });
        setTimeout(() => setNotificacion(prev => ({ ...prev, visible: false })), 3000);
    };

    // ─── Cargas ────────────────────────────────────────────────────
    const cargarIncidencias = () => {
        setLoadingInc(true);
        incidenciasApi.getAll()
            .then(r => setIncidencias(r.data || []))
            .catch(() => setIncidencias([]))
            .finally(() => setLoadingInc(false));
    };

    const cargarFotos = (tabKey) => {
        setCargando(true);
        getApi(tabKey).getAll()
            .then(r => setData(r.data || []))
            .catch(() => setData([]))
            .finally(() => setCargando(false));
    };

    const cargarPersonal = () => {
        personalApi.getAll()
            .then(r => setTodoPers(r.data || []))
            .catch(() => setTodoPers([]));
    };

    useEffect(() => {
        setData([]); setBuscar('');
        if (tab === 'incidencias') {
            cargarIncidencias();
        } else {
            cargarFotos(tab);
            if (incidencias.length === 0) cargarIncidencias();
        }
        if (todoPers.length === 0) cargarPersonal();
    }, [tab]);

    const incidenciasFiltradas = tabInfo?.estadoRequerido
        ? incidencias.filter(i => i.estado === tabInfo.estadoRequerido)
        : incidencias;

    // ─── Auto-llenar personal ───────────
    const handleIncidenciaChange = (incidenciaId) => {
        const inc = incidenciasFiltradas.find(i => i.id === Number(incidenciaId));
        if (!inc || !tabInfo.needsPersonal) {
            setForm(f => ({ ...f, incidenciaId, personalId: '', personalNombre: '', personalAuto: false }));
            return;
        }
        if (inc.personalId) {
            const pers = todoPers.find(p => p.id === inc.personalId);
            if (pers) {
                setForm(f => ({
                    ...f, incidenciaId, personalId: String(pers.id),
                    personalNombre: pers.nombre || `ID: ${pers.id}`, personalAuto: true
                }));
                return;
            }
        }
        setForm(f => ({ ...f, incidenciaId, personalId: '', personalNombre: '', personalAuto: false }));
    };

    // ─── Buscar ────────────────────────────────────────────────────
    const hacerBusqueda = async (e) => {
        if(e) e.preventDefault();
        const q = buscar.trim();
        if (!q) { cargarFotos(tab); return; }
        
        setCargando(true); 
        try {
            let r;
            if (tipoBuscar === 'folio') {
                r = await getApi(tab).getByFolio(q);
                setData(r.data ? [r.data] : []);
            } else {
                r = await getApi(tab).getByHistorial(q);
                setData(r.data || []);
            }
            if (!r.data || (Array.isArray(r.data) && r.data.length === 0)) {
                mostrarMsg(`Sin resultados para "${q}"`, 'warning');
            }
        } catch(e) {
            setData([]);
            mostrarMsg(e?.response?.status === 404 ? 'No se encontraron fotos.' : 'Error al buscar.', 'error');
        } finally { 
            setCargando(false); 
        }
    };

    // ─── Subir imagen a ImgBB ──────────────────────────────────────
    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { mostrarMsg('El archivo no es una imagen válida.', 'error'); return; }
        if (file.size > 10*1024*1024) { mostrarMsg('La imagen no puede pesar más de 10 MB.', 'error'); return; }

        const blobUrl = URL.createObjectURL(file);
        setFilePreview(blobUrl);
        
        const carpeta = tab === 'antes' ? 'fotos-antes' : tab === 'proceso' ? 'fotos-proceso' : 'fotos-despues';
        setSubiendo(true); setProgreso(0);
        setForm(f => ({ ...f, url: '' }));

        subirImagen(file, carpeta, (pct) => setProgreso(pct))
            .then(urlImgBB => { setForm(f => ({ ...f, url: urlImgBB })); setSubiendo(false); setProgreso(100); })
            .catch(err => { mostrarMsg(err.message, 'error'); setSubiendo(false); setProgreso(0); setFilePreview(''); });
    };

    const openModal = () => {
        setForm({ incidenciaId: '', personalId: '', personalNombre: '', personalAuto: false, url: '' });
        setFilePreview(''); setSubiendo(false); setProgreso(0);
        if (incidencias.length === 0) cargarIncidencias();
        if (todoPers.length === 0) cargarPersonal();
        setModal(true);
    };

    // ─── Guardar foto ──────────────────────────────────────────────
    const handleGuardar = async (e) => {
        e.preventDefault();
        if (subiendo) { mostrarMsg('Espera a que la imagen termine de subirse.', 'warning'); return; }
        if (!form.incidenciaId) { mostrarMsg('Selecciona una incidencia', 'error'); return; }
        if (!form.url.trim()) { mostrarMsg('Sube una imagen o escribe la URL', 'error'); return; }
        if (tabInfo.needsPersonal && !form.personalId) {
            mostrarMsg('Selecciona el personal asignado', 'error'); return;
        }
        
        const apiActual = getApi(tab);
        const tabActual = tab;
        
        try {
            await apiActual.create({
                idHistorialEstado: Number(form.incidenciaId),
                url: form.url.trim(),
                ...(tabInfo.needsPersonal && { personalId: Number(form.personalId) }),
            });
            setModal(false); setFilePreview(''); setSubiendo(false); setProgreso(0);
            setForm({ incidenciaId: '', personalId: '', personalNombre: '', personalAuto: false, url: '' });
            mostrarMsg('Foto registrada correctamente', 'success');
            cargarFotos(tabActual);
        } catch(e) {
            const respData = e?.response?.data;
            const msg = typeof respData === 'string' ? respData : respData?.message || respData?.error || '';
            if (e?.code === 'ERR_NETWORK' || !e?.response) mostrarMsg('No se pudo conectar con el servidor (MS5).', 'error');
            else if (msg.toLowerCase().includes('reportado')) mostrarMsg('La incidencia ya no está en REPORTADO.', 'error');
            else if (msg.toLowerCase().includes('proceso')) mostrarMsg('La incidencia ya no está en EN_PROCESO.', 'error');
            else if (msg.toLowerCase().includes('resuelto')) mostrarMsg('La incidencia ya no está en RESUELTO.', 'error');
            else if (msg.toLowerCase().includes('personal')) mostrarMsg('El personal no coincide con el asignado.', 'error');
            else mostrarMsg(msg || `Error al registrar la foto.`, 'error');
        }
    };

    const handleEliminar = async (folio, tabKey) => {
        if (!window.confirm(`¿Estás seguro de eliminar el folio ${folio}?`)) return;
        try { 
            await getApi(tabKey).delete(folio); 
            mostrarMsg('Foto eliminada correctamente', 'success'); 
            cargarFotos(tabKey); 
        } catch { mostrarMsg('No se pudo eliminar la foto', 'error'); }
    };

    const personalDisponibles = todoPers.filter(p => p.disponible);

    const aceptaFoto = (estado) => {
        if (estado === 'REPORTADO')  return { label: 'ANTES',   color: '#d97706', bg: '#fef3c7', border: '#fcd34d', icon: 'bi bi-camera-fill' };
        if (estado === 'EN_PROCESO') return { label: 'PROCESO', color: '#0d9488', bg: '#ccfbf1', border: '#5eead4', icon: 'bi bi-arrow-repeat' };
        if (estado === 'RESUELTO')   return { label: 'DESPUÉS', color: '#16a34a', bg: '#dcfce3', border: '#86efac', icon: 'bi bi-check-circle-fill' };
        return { label: 'NINGUNA', color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0', icon: 'bi bi-x-circle' };
    };

    return (
        <div className={styles.container}>
            <VisorImagen url={visorUrl} onClose={() => setVisorUrl('')} />
            <DetalleModal foto={fotoDetalle} tabInfo={tabInfo} todoPers={todoPers} onVerImagen={setVisorUrl} onClose={() => setFotoDetalle(null)} />
            <Notification {...notificacion} />

            {/* HEADER */}
            <div className={styles.header}>
                <div>
                    <h2 className={styles.headerTitle}>Registro de Evidencias</h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px', marginBottom: 0 }}>Registro fotográfico del ciclo de vida de cada incidencia</p>
                </div>
            </div>

            {/* TABS DE NAVEGACIÓN */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {TABS.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 18px', borderRadius: '12px',
                        fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap',
                        background: tab === t.key ? t.badgeBg : '#f8fafc',
                        color: tab === t.key ? t.color : '#64748b',
                        border: tab === t.key ? `1.5px solid ${t.border}` : '1px solid #e2e8f0',
                        transition: 'all 0.2s',
                        boxShadow: tab === t.key ? `0 4px 6px -1px ${t.bg}` : 'none',
                    }}>
                        <i className={t.icon} style={{ fontSize: '1rem' }} />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* INFO BAR */}
            {isFotoTab && (
                <div style={{
                    background: tabInfo.bg, border: `1px solid ${tabInfo.border}`,
                    borderRadius: '12px', padding: '12px 16px', marginBottom: '20px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    fontSize: '0.85rem', color: tabInfo.color, fontWeight: '500'
                }}>
                    <i className="bi bi-info-circle-fill" style={{ fontSize: '1.2rem', flexShrink: 0 }} />
                    {tabInfo.info}
                </div>
            )}

            {/* ── TAB INCIDENCIAS (REFERENCIA) ── */}
            {tab === 'incidencias' && (
                <div className={styles.tableContainer}>
                    {loadingInc ? (
                        <p style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                            <i className="bi bi-hourglass-split"></i> Cargando incidencias de MS2...
                        </p>
                    ) : incidencias.length === 0 ? (
                        <p style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                            No se encontraron incidencias activas en MS2.
                        </p>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Título de Incidencia</th>
                                    <th>Estado</th>
                                    <th>Acepta fotos de...</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incidencias.map((inc) => {
                                    const fi = aceptaFoto(inc.estado);
                                    return (
                                        <tr key={inc.id} className={styles.tableRow}>
                                            <td><strong>#{inc.id}</strong></td>
                                            <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {inc.titulo}
                                            </td>
                                            <td><StatusBadge status={inc.estado} /></td>
                                            <td>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                    background: fi.bg, color: fi.color, border: `1px solid ${fi.border}`,
                                                    borderRadius: '100px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: '700'
                                                }}>
                                                    <i className={fi.icon} />
                                                    {fi.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ── TABS DE FOTOS (ANTES, PROCESO, DESPUES) ── */}
            {isFotoTab && (
                <>
                    {/* TOOLBAR BÚSQUEDA */}
                    <div className={styles.toolbar}>
                        <form onSubmit={hacerBusqueda} style={{ display: 'flex', gap: '10px', flexGrow: 1, flexWrap: 'wrap' }}>
                            <select className={styles.select} value={tipoBuscar} onChange={(e) => setTipoBuscar(e.target.value)} style={{ minWidth: '150px' }}>
                                <option value="incidencia">Por # Incidencia</option>
                                <option value="folio">Por Folio de Foto</option>
                            </select>
                            
                            <div style={{ display: 'flex', flexGrow: 1, position: 'relative' }}>
                                <i className={tipoBuscar === 'folio' ? 'bi bi-upc-scan' : 'bi bi-hash'} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }}></i>
                                <input
                                    className={styles.input}
                                    style={{ flexGrow: 1, paddingLeft: '35px' }}
                                    type="text"
                                    placeholder={tipoBuscar === 'folio' ? 'Ej: ANT-2026-00001' : 'Ej: 1, 4, 8...'}
                                    value={buscar}
                                    onChange={e => setBuscar(e.target.value)}
                                />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className={styles.btnPrimary}>
                                    <i className="bi bi-search"></i> Buscar
                                </button>
                                <button type="button" onClick={() => { setBuscar(''); cargarFotos(tab); }} className={styles.btnCancel}>
                                    Ver todas
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* TABLA DE FOTOS */}
                    <div className={styles.tableContainer}>
                        {cargando ? (
                            <p style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                <i className="bi bi-hourglass-split"></i> Cargando fotos...
                            </p>
                        ) : data.length === 0 ? (
                            <p style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                <i className="bi bi-camera" style={{ fontSize: '2rem', display: 'block', marginBottom: '10px', opacity: 0.5 }}></i>
                                No hay fotos registradas. 
                            </p>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Folio</th>
                                        <th>Incidencia</th>
                                        {tabInfo.needsPersonal && <th>Personal</th>}
                                        <th>Archivo</th>
                                        <th>Fecha</th>
                                        <th style={{ textAlign: 'center' }}><i className="bi bi-three-dots"></i></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((f) => {
                                        const folio = f[tabInfo.folioKey];
                                        const pers  = tabInfo.needsPersonal && f.personalId ? todoPers.find(p => p.id === f.personalId) : null;
                                        
                                        return (
                                            <tr key={folio} className={styles.tableRow}>
                                                <td><FolioTag folio={folio} color={tabInfo.color} bg={tabInfo.badgeBg} border={tabInfo.border} /></td>
                                                <td>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '100px', padding: '3px 10px', fontSize: '0.8rem', fontWeight: '700' }}>
                                                        <i className="bi bi-hash"></i> {f.idHistorialEstado}
                                                    </span>
                                                </td>
                                                
                                                {tabInfo.needsPersonal && (
                                                    <td>
                                                        {f.personalId != null ? (
                                                            <div className={styles.userCell}>
                                                                <div className={styles.avatar} style={{ background: '#0d9488', width: '32px', height: '32px' }}>
                                                                    {pers ? (pers.nombre || '?')[0].toUpperCase() : '?'}
                                                                </div>
                                                                <div className={styles.userInfo}>
                                                                    <span className={styles.userName}>{pers ? (pers.nombre || `ID: ${f.personalId}`) : `ID: ${f.personalId}`}</span>
                                                                    {pers && <span className={styles.userId}>{pers.puestoNombre}</span>}
                                                                </div>
                                                            </div>
                                                        ) : <span style={{ color: '#94a3b8' }}>—</span>}
                                                    </td>
                                                )}

                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <button 
                                                            onClick={() => setVisorUrl(f.url)}
                                                            style={{ 
                                                                background: tabInfo.color, border: 'none', borderRadius: '8px', 
                                                                width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                                cursor: 'pointer', color: 'white', transition: 'opacity .2s' 
                                                            }}
                                                            title="Ver imagen"
                                                            onMouseEnter={e => e.currentTarget.style.opacity = 0.8}
                                                            onMouseLeave={e => e.currentTarget.style.opacity = 1}
                                                        >
                                                            <i className="bi bi-eye-fill"></i>
                                                        </button>
                                                        <span style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {f.url?.split('/').pop() || f.url || '—'}
                                                        </span>
                                                    </div>
                                                </td>
                                                
                                                <td style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                                                    {f.fecha ? new Date(f.fecha).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                                                </td>

                                                <td style={{ textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                        <button onClick={() => setFotoDetalle(f)} className={styles.btnIcon} title="Ver detalle">
                                                            <i className="bi bi-card-list" style={{ color: '#3b82f6' }}></i>
                                                        </button>
                                                        <button onClick={() => handleEliminar(folio, tab)} className={styles.btnIcon} title="Eliminar">
                                                            <i className="bi bi-trash" style={{ color: '#ef4444' }}></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}

            {/* ── Modal subir foto ── */}
            {modal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '550px' }}>
                        <div className={styles.modalHeader}>
                            <h3>Subir {tabInfo.label}</h3>
                            <button type="button" onClick={() => !subiendo && setModal(false)} className={styles.btnIcon}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <form onSubmit={handleGuardar}>
                            <div className={styles.modalBody}>
                                <div style={{ background: tabInfo.bg, border: `1px solid ${tabInfo.border}`, borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', fontSize: '0.85rem', color: tabInfo.color, display: 'flex', gap: '8px' }}>
                                    <i className="bi bi-info-circle-fill" style={{ marginTop: '2px' }} />
                                    {tabInfo.info}
                                </div>

                                <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
                                    <label>Incidencia (Estado: {tabInfo.estadoRequerido}) *</label>
                                    {loadingInc ? (
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}><i className="bi bi-hourglass-split"></i> Cargando incidencias...</div>
                                    ) : incidenciasFiltradas.length === 0 ? (
                                        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', padding: '10px', fontSize: '0.85rem', color: '#92400e' }}>
                                            <i className="bi bi-exclamation-circle-fill"></i> No hay incidencias con estado {tabInfo.estadoRequerido}.
                                        </div>
                                    ) : (
                                        <select className={styles.select} value={form.incidenciaId} onChange={e => handleIncidenciaChange(e.target.value)} required>
                                            <option value="">Selecciona ({incidenciasFiltradas.length} disponibles)...</option>
                                            {incidenciasFiltradas.map(inc => (
                                                <option key={inc.id} value={inc.id}>#{inc.id} — {inc.titulo}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {incSel && (
                                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <i className="bi bi-geo-alt-fill" style={{ color: '#475569', fontSize: '1.2rem' }} />
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>#{incSel.id} — {incSel.titulo}</div>
                                            <div style={{ marginTop: '4px' }}><StatusBadge status={incSel.estado} /></div>
                                        </div>
                                    </div>
                                )}

                                {tabInfo.needsPersonal && (
                                    <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                                        <label>Personal asignado *</label>
                                        {form.personalAuto ? (
                                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div className={styles.userCell}>
                                                    <div className={styles.avatar} style={{ background: '#10b981', width: '32px', height: '32px' }}>
                                                        {form.personalNombre[0]?.toUpperCase() || '?'}
                                                    </div>
                                                    <div className={styles.userInfo}>
                                                        <span className={styles.userName}>{form.personalNombre}</span>
                                                        <span style={{ fontSize: '0.75rem', color: '#059669' }}><i className="bi bi-check-circle-fill"></i> Asignado auto. (ID: {form.personalId})</span>
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => setForm(f => ({ ...f, personalId: '', personalNombre: '', personalAuto: false }))} className={styles.btnCancel} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                                                    Cambiar
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                {personalDisponibles.length === 0 ? (
                                                    <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', padding: '10px', fontSize: '0.85rem', color: '#92400e' }}>
                                                        No hay personal disponible.
                                                    </div>
                                                ) : (
                                                    <select className={styles.select} value={form.personalId} onChange={e => {
                                                        const pers = todoPers.find(p => p.id === Number(e.target.value));
                                                        setForm(f => ({ ...f, personalId: e.target.value, personalNombre: pers ? (pers.nombre || `ID: ${e.target.value}`) : '', personalAuto: false }));
                                                    }} required>
                                                        <option value="">Selecciona el personal...</option>
                                                        {personalDisponibles.map(p => (
                                                            <option key={p.id} value={p.id}>{p.nombre || `ID: ${p.id}`} — {p.puestoNombre}</option>
                                                        ))}
                                                    </select>
                                                )}
                                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>La incidencia no tiene personal asignado en MS2.</p>
                                            </>
                                        )}
                                    </div>
                                )}

                                <div className={styles.formGroup}>
                                    <label>Evidencia (Sube un archivo o pega la URL) *</label>
                                    <div 
                                        onClick={() => !subiendo && fileRef.current?.click()}
                                        style={{
                                            border: `2px dashed ${subiendo ? '#0ea5e9' : '#cbd5e1'}`, borderRadius: '12px', padding: '20px', textAlign: 'center',
                                            background: subiendo ? '#f0f9ff' : '#f8fafc', cursor: subiendo ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s', marginBottom: '10px'
                                        }}
                                    >
                                        {subiendo ? (
                                            <div>
                                                <i className="bi bi-cloud-arrow-up" style={{ fontSize: '2rem', color: '#0ea5e9', display: 'block', marginBottom: '10px' }} />
                                                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0ea5e9', marginBottom: '10px' }}>Subiendo a ImgBB...</div>
                                                <div style={{ width: '100%', height: '8px', background: '#e0f2fe', borderRadius: '100px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${progreso}%`, height: '100%', background: '#0ea5e9', transition: 'width 0.3s' }} />
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: '#0284c7', marginTop: '8px', fontWeight: '600' }}>{progreso}%</div>
                                            </div>
                                        ) : filePreview ? (
                                            <div>
                                                <img src={filePreview} alt="Preview" style={{ maxHeight: '150px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }} />
                                                {form.url && (
                                                    <div style={{ marginTop: '10px', fontSize: '0.85rem', fontWeight: '600', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                                        <i className="bi bi-check-circle-fill" /> Imagen subida correctamente
                                                    </div>
                                                )}
                                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '5px' }}>Haz clic para cambiar la imagen</div>
                                            </div>
                                        ) : (
                                            <div>
                                                <i className="bi bi-cloud-arrow-up" style={{ fontSize: '2rem', color: '#94a3b8', display: 'block', marginBottom: '8px' }} />
                                                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Seleccionar imagen</div>
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>JPG, PNG, WEBP — máximo 10 MB</div>
                                            </div>
                                        )}
                                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
                                    </div>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '10px 0' }}>
                                        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>URL externa</span>
                                        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                                    </div>
                                    <input 
                                        className={styles.input} 
                                        type="text" 
                                        placeholder="https://i.ibb.co/..." 
                                        value={form.url} 
                                        onChange={e => setForm(f => ({ ...f, url: e.target.value }))} 
                                    />
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => !subiendo && setModal(false)} className={styles.btnCancel}>Cancelar</button>
                                <button type="submit" disabled={subiendo} className={styles.btnPrimary} style={{ background: tabInfo.color }}>
                                    <i className={subiendo ? "bi bi-hourglass-split" : "bi bi-cloud-upload"}></i>
                                    {subiendo ? `Subiendo ${progreso}%` : 'Guardar Evidencia'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Evidencias;