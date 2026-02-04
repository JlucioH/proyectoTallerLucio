import { useState, useEffect } from 'react';
import { useForm, usePage, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout'; 
import { Building2, MapPin, Phone, Edit3, X, Save, Upload, ImageIcon, Map as MapIcon } from 'lucide-react';

// el mapa
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// iconos de Leaflet react
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function DatosEmpresa() {
    const { empresa, auth } = usePage().props as any;
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const puedeEditar = auth.user?.rol_id === 2 || auth.rol_id === 2;

    // coordenadas por defecto
    const defaultCenter: [number, number] = [
        empresa?.latitud ? parseFloat(empresa.latitud) : -16.5000, 
        empresa?.longitud ? parseFloat(empresa.longitud) : -68.1500
    ];

    const { data, setData, post, processing, errors } = useForm({
        nombreEmpresa: empresa?.nombreEmpresa || '',
        direccionEmpresa: empresa?.direccionEmpresa || '',
        telefonoEmpresa: empresa?.telefonoEmpresa || '',
        latitud: empresa?.latitud || null,
        longitud: empresa?.longitud || null,
        logo: null as File | null,
        _method: 'PUT',
    });

    // capturar clics en el mapa del modal
    function LocationMarker() {
        useMapEvents({
            click(e) {
                setData((prev: any) => ({
                    ...prev,
                    latitud: e.latlng.lat,
                    longitud: e.latlng.lng
                }));
            },
        });

        return data.latitud && data.longitud ? (
            <Marker position={[data.latitud, data.longitud]} />
        ) : null;
    }

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/empresa/${empresa.idEmpresa}/update`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setData('logo', null);
            },
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title="Datos de la Empresa" />

            <div className="flex flex-col gap-8 p-6 w-full">
                
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Datos de la Empresa</h1>
                        <p className="text-muted-foreground text-sm">Información general de la empresa.</p>
                    </div>

                    {puedeEditar && (
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            <Edit3 className="h-4 w-4" /> Editar Datos
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 w-full gap-6">
                    {/* COLUMNA IZQUIERDA: INFORMACIÓN */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col w-full">
                            <div className="p-4 border-b border-border bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-primary" />
                                <h2 className="font-semibold text-sm">Información de Registro</h2>
                            </div>
                            
                            <div className="p-6 flex flex-col md:flex-row items-center md:items-start gap-8">
                                <div className="relative group">
                                    <div className="h-32 w-32 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center overflow-hidden bg-muted/50">
                                        {empresa?.logoEmpresa ? (
                                            <img 
                                                src={`/storage/${empresa.logoEmpresa}`} 
                                                alt="Logo Empresa" 
                                                className="h-full w-full object-contain p-2"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + empresa.nombreEmpresa;
                                                }}
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                                <Building2 className="h-10 w-10 opacity-20" />
                                                <span className="text-[10px] font-medium uppercase italic">Sin Logo</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Nombre Comercial</p>
                                        <p className="text-lg font-medium text-foreground">{empresa?.nombreEmpresa || 'No definido'}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Teléfono de Contacto</p>
                                        <div className="flex items-center gap-2 text-foreground">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium">{empresa?.telefonoEmpresa || 'No registrado'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1 md:col-span-2">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Dirección Física</p>
                                        <div className="flex items-center gap-2 text-foreground">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium">{empresa?.direccionEmpresa || 'No registrada'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: MAPA DE VISUALIZACIÓN */}
                    <div className="lg:col-span-1">
                        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden h-full flex flex-col">
                            <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
                                <MapIcon className="h-4 w-4 text-primary" />
                                <h2 className="font-semibold text-sm">Ubicación Geográfica</h2>
                            </div>
                            <div className="flex-1 min-h-[250px] relative z-0">
                                {empresa?.latitud && empresa?.longitud ? (
                                    <MapContainer center={[empresa.latitud, empresa.longitud]} zoom={15} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <Marker position={[empresa.latitud, empresa.longitud]} />
                                    </MapContainer>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full bg-muted/20 text-muted-foreground p-4 text-center">
                                        <MapPin className="h-8 w-8 mb-2 opacity-20" />
                                        <p className="text-xs italic">Ubicación no establecida en el mapa</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* modal edicion */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200 my-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-foreground">Actualizar Información</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Campos de texto y logo */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" /> Logo de la Empresa
                                    </label>
                                    <input
                                        type="file"
                                        id="logo-upload"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => setData('logo', e.target.files ? e.target.files[0] : null)}
                                    />
                                    <label htmlFor="logo-upload" className="flex items-center justify-center gap-2 w-full cursor-pointer rounded-md border border-dashed border-input bg-muted/50 px-3 py-3 text-xs font-medium hover:bg-muted transition-all">
                                        <Upload className="w-4 h-4" />
                                        {data.logo ? data.logo.name : 'Subir logo'}
                                    </label>
                                    {errors.logo && <p className="text-xs text-destructive">{errors.logo}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Nombre Comercial</label>
                                    <input
                                        type="text"
                                        required
                                        value={data.nombreEmpresa}
                                        onChange={(e) => setData('nombreEmpresa', e.target.value)}
                                        className="w-full rounded-md border border-input bg-background p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Dirección Escrita</label>
                                    <input
                                        type="text"
                                        value={data.direccionEmpresa}
                                        onChange={(e) => setData('direccionEmpresa', e.target.value)}
                                        className="w-full rounded-md border border-input bg-background p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Teléfono</label>
                                    <input
                                        type="text"
                                        value={data.telefonoEmpresa}
                                        onChange={(e) => setData('telefonoEmpresa', e.target.value)}
                                        className="w-full rounded-md border border-input bg-background p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>

                            {/* Selector de Mapa */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> Ubicación en Mapa (Haz clic)
                                </label>
                                <div className="h-[240px] rounded-lg border border-border overflow-hidden relative z-0">
                                    <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <LocationMarker />
                                    </MapContainer>
                                </div>
                                <p className="text-[10px] text-muted-foreground italic text-center">
                                    {data.latitud ? `Coordenadas capturadas: ${Number(data.latitud).toFixed(4)}, ${Number(data.longitud).toFixed(4)}` : 'Haz clic en el mapa para marcar la ubicación'}
                                </p>
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-border">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={processing} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50">
                                    <Save className="h-4 w-4" />
                                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

DatosEmpresa.layout = (page: React.ReactNode) => <AppLayout children={page} />;

export default DatosEmpresa;