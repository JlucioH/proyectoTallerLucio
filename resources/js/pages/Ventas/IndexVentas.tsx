import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo, Fragment } from 'react';
import { 
    Search, ShoppingCart, Calendar, 
    ChevronDown, ChevronUp, Package, 
    FileText, Plus, User
} from 'lucide-react';

// Interfaces
interface Detalle {
    idDetalleMovimiento: number;
    idItem: number;
    cantidadDetalleMovimiento: number;
    precioDetalleMovimiento: number;
    precioTotalDetalleMovimiento: number;
    item?: {
        nombreItem: string;
    };
}

interface VentaModel {
    idVenta: number;
    metodoPago: string;
    razonSocialVenta: string;
    totalRecibidoVenta?: number;
    totalCambioVenta?: number;
    nitVenta: string;
}

interface Cabecera {
    idCabeceraMovimiento: number;
    fechaCabeceraMovimiento: string;
    totalCabeceraMovimiento: string | number;
    usuario?: { 
        id: number;
        name: string; 
    };
    venta?: VentaModel;
    detalles?: Detalle[];
}

// Añadimos la interfaz de Empresa para los datos del ticket
interface Empresa {
    nombreEmpresa: string;
    direccionEmpresa: string;
    telefonoEmpresa: string;
}

interface Props {
    ventas: Cabecera[];
    empresa: Empresa; // <--- Recibimos la empresa por props
}

export default function IndexVentas({ ventas = [], empresa }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleRow = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // Función de impresión adaptada para el historial
    const imprimirTicketHistorial = (v: Cabecera) => {
        const ventanImpresion = window.open('', '_blank', 'width=300,height=600');
        if (!ventanImpresion) return;

        // Formatear los detalles para el ticket
        const filasTicket = (v.detalles || []).map(d => `
            <tr style="font-size: 9px;">
                <td class="col-desc" style="vertical-align: top;">${(d.item?.nombreItem || 'Producto')}</td>
                <td class="col-cant" style="vertical-align: top;">${d.cantidadDetalleMovimiento}</td>
                <td class="col-pu"   style="vertical-align: top;">${Number(d.precioDetalleMovimiento).toFixed(2)}</td>
                <td class="col-sub"  style="vertical-align: top;">${Number(d.precioTotalDetalleMovimiento).toFixed(2)}</td>
            </tr>
        `).join('');

        ventanImpresion.document.write(`
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; width: 80mm; font-size: 9px; margin: 0; padding: 5px; color: #000; }
                        .text-center { text-align: center; }
                        .text-right { text-align: right; }
                        .divider { border-bottom: 1px solid #000; margin: 1px 0; width: 100%;}
                        .bold { font-weight: bold; }
                        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                        .col-desc { 
                            width: auto; /* Toma el espacio restante */
                            word-wrap: break-word; 
                            white-space: normal; 
                            padding-right: 5px;
                            text-align: left;
                        }
                        .col-cant { width: 40px; text-align: center; }
                        .col-pu   { width: 40px; text-align: right; }
                        .col-sub  { width: 40px; text-align: right; }
                        th { border-bottom: 1px solid #000; }
                    </style>
                </head>
                <body>
                    <div class="text-center">
                        <div class="bold" style="font-size: 13px;">${empresa?.nombreEmpresa || 'MI EMPRESA'}</div>
                        <div>Telefono: ${empresa?.telefonoEmpresa || ''}</div>
                        <div>${empresa?.direccionEmpresa || ''}</div>
                    </div>
                    <div class="divider"></div>
                    <div class="bold text-center">COMPROBANTE DE VENTA #${v.venta?.idVenta}</div>
                    <div class="divider"></div>
                    <div>FECHA: ${(() => {
                        const fecha = new Date(v.fechaCabeceraMovimiento);
                        // Si la base de datos está en UTC (0) y tú en Bolivia (-4), 
                        // forzamos la resta de 4 horas manualmente para que coincida visualmente
                        fecha.setHours(fecha.getHours() - 4);
                        
                        return fecha.toLocaleString('es-BO', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true
                        });
                    })()}</div>
                    <div>CLIENTE: ${v.venta?.razonSocialVenta || 'CONSUMIDOR FINAL'}</div>
                    <div>NIT/CI: ${v.venta?.nitVenta || '0'}</div>
                    <div class="divider"></div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 9px; font-family: Arial, sans-serif;">
                        <thead>
                            <tr style="border-bottom: 1px solid #000;">
                                <th class="col-desc">Descripción</th>
                                <th class="col-cant">Cant.</th>
                                <th class="col-pu">P.U.</th>
                                <th class="col-sub">Sub. T</th>
                            </tr>
                        </thead>
                        <tbody>${filasTicket}</tbody>
                    </table>
                    <div class="divider"></div>
                    <div class="text-right bold" style="font-size: 9px;">
                        TOTAL: ${Number(v.totalCabeceraMovimiento).toFixed(2)} BS
                    </div>
                    <div class="text-right">
                        RECIBIDO: ${Number(v.venta?.totalRecibidoVenta || 0).toFixed(2)} BS
                    </div>
                    <div class="text-right">
                        CAMBIO: ${Number(v.venta?.totalCambioVenta || 0).toFixed(2)} BS
                    </div>
                    <div class="divider"></div>
                    <div class="text-center">RECOPIA DE DOCUMENTO</div>
                    <div class="text-center" style="margin-top: 10px;">¡GRACIAS POR SU PREFERENCIA!</div>
                </body>
            </html>
        `);

        ventanImpresion.document.close();
        ventanImpresion.focus();
        setTimeout(() => {
            ventanImpresion.print();
            //ventanImpresion.close();
        }, 250);
    };

    const filteredVentas = useMemo(() => {
        return (ventas || []).filter((v) => {
            const clienteStr = v.venta?.razonSocialVenta?.toLowerCase() || 'consumidor final';
            const nitStr = v.venta?.nitVenta?.toString() || '';
            const idStr = v.idCabeceraMovimiento.toString();
            const search = searchTerm.toLowerCase();
            return clienteStr.includes(search) || idStr.includes(search) || nitStr.includes(search);
        });
    }, [ventas, searchTerm]);

    const formatCurrency = (value: string | number) => {
        return new Intl.NumberFormat('es-BO', { 
            style: 'currency', 
            currency: 'BOB', 
            minimumFractionDigits: 2 
        }).format(Number(value));
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Ventas / Historial', href: '/ventas/historial' }]}>
            <Head title="Historial de Ventas" />

            <div className="flex flex-1 flex-col gap-4 p-4 py-6 md:p-8 text-slate-900 dark:text-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 dark:border-slate-800">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <ShoppingCart className="h-6 w-6 text-indigo-600" /> Historial de Ventas
                        </h1>
                        <p className="text-sm text-slate-500">Consulta los movimientos de salida por ventas.</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text" 
                                placeholder="Buscar cliente, NIT o ID..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <button 
                            onClick={() => router.get('/ventas/nueva')} 
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-all active:scale-95 shadow-md shadow-indigo-200 dark:shadow-none"
                        >
                            <Plus className="h-4 w-4" /> Nueva Venta
                        </button>
                    </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-b dark:border-slate-800 font-bold">
                                <tr>
                                    <th className="px-6 py-4 w-12 text-center">Det.</th>
                                    <th className="px-6 py-4">ID / Fecha</th>
                                    <th className="px-6 py-4">Cliente / Vendedor</th>
                                    <th className="px-6 py-4">Método Pago</th>
                                    <th className="px-6 py-4 text-right">Total</th>
                                    <th className="px-6 py-4 text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-slate-800">
                                {filteredVentas.length > 0 ? (
                                    filteredVentas.map((v) => (
                                        <Fragment key={v.idCabeceraMovimiento}>
                                            <tr 
                                                onClick={() => toggleRow(v.idCabeceraMovimiento)}
                                                className={`group cursor-pointer transition-colors ${expandedId === v.idCabeceraMovimiento ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40'}`}
                                            >
                                                <td className="px-6 py-4 text-center">
                                                    {expandedId === v.idCabeceraMovimiento ? <ChevronUp className="h-4 w-4 text-indigo-600" /> : <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-indigo-400" />}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 dark:text-slate-100">#{v.venta?.idVenta}</span>
                                                        <span className="text-[10px] text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                                                            <Calendar className="h-3 w-3" /> {new Date(v.fechaCabeceraMovimiento).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                            {v.venta?.razonSocialVenta || 'Consumidor Final'}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                            <User className="h-3 w-3" /> {v.usuario?.name || 'Sistema'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase border dark:border-slate-700">
                                                        {v.venta?.metodoPago || 'Efectivo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-black text-indigo-600 dark:text-indigo-400 text-base">
                                                        {formatCurrency(v.totalCabeceraMovimiento)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button 
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            imprimirTicketHistorial(v); // <--- ACCIÓN DE IMPRIMIR LLAMADA AQUÍ
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                                        title="Imprimir Ticket"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>

                                            {expandedId === v.idCabeceraMovimiento && (
                                                <tr className="bg-slate-50/30 dark:bg-slate-800/20">
                                                    <td colSpan={6} className="px-8 py-6">
                                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                                            <div className="lg:col-span-2 space-y-3">
                                                                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 flex items-center gap-2 tracking-widest">
                                                                    <Package className="h-3.5 w-3.5" /> Detalle de Productos
                                                                </h4>
                                                                <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-800 divide-y dark:divide-slate-800 overflow-hidden shadow-sm">
                                                                    {v.detalles && v.detalles.length > 0 ? v.detalles.map((det) => (
                                                                        <div key={det.idDetalleMovimiento} className="flex justify-between items-center px-4 py-3 text-sm">
                                                                            <div className="flex flex-col">
                                                                                <span className="font-bold text-slate-700 dark:text-slate-300">{det.item?.nombreItem || 'Producto sin nombre'}</span>
                                                                                <span className="text-xs text-slate-500">
                                                                                    {det.cantidadDetalleMovimiento} unidades x {formatCurrency(det.precioDetalleMovimiento)}
                                                                                </span>
                                                                            </div>
                                                                            <span className="font-bold text-slate-900 dark:text-white">
                                                                                {formatCurrency(det.precioTotalDetalleMovimiento)}
                                                                            </span>
                                                                        </div>
                                                                    )) : (
                                                                        <div className="p-4 text-center text-slate-400 italic">No hay detalles disponibles</div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4">
                                                                <div className="bg-indigo-600 text-white p-5 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                                                                    <h4 className="text-[10px] font-black uppercase opacity-80 mb-4 tracking-widest">Resumen de Venta</h4>
                                                                    <div className="flex justify-between items-end">
                                                                        <span className="text-xs opacity-90">Total Pagado:</span>
                                                                        <span className="text-2xl font-black">{formatCurrency(v.totalCabeceraMovimiento)}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border dark:border-slate-800 text-xs">
                                                                    <p className="font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Datos del Documento</p>
                                                                    <p>Cliente: {v.venta?.razonSocialVenta || 'S/N'}</p>
                                                                    <p>NIT: {v.venta?.nitVenta || '0'}</p>
                                                                </div>
                                                                <button 
                                                                    onClick={() => imprimirTicketHistorial(v)}
                                                                    className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm transition-all"
                                                                >
                                                                    <FileText className="h-4 w-4" /> Re-imprimir Ticket
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                                            No se encontraron ventas que coincidan con la búsqueda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
}