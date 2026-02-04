import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo, Fragment } from 'react';
import { 
    Search, ShoppingBag, Calendar, 
    ChevronDown, ChevronUp, Package, 
    FileText, Plus, User, Truck
} from 'lucide-react';

// Interfaces basadas en tu estructura de Compras
interface Detalle {
    idDetalleMovimiento: number;
    idItem: number;
    cantidadDetalleMovimiento: number;
    costoDetalleMovimiento: number;
    costoTotalDetalleMovimiento: number;
    precioDetalleMovimiento: number;
    precioTotalDetalleMovimiento: number;
    item?: {
        nombreItem: string;
        codigoItem: string;
    };
}

interface CompraModel {
    idCompra: number;
    metodoPago: string;
    numeroFacturaCompra: string | null;
    conFacturaCompra: number;
    proveedor?: {
        nombreProveedor: string;
        nitProveedor: string;
    };
}

interface Cabecera {
    idCabeceraMovimiento: number;
    fechaCabeceraMovimiento: string;
    totalCabeceraMovimiento: string | number; // Cambiado a montoTotal según tu base
    usuario?: { 
        id: number;
        name: string; 
    };
    compra?: CompraModel;
    detalles?: Detalle[];
}

interface Empresa {
    nombreEmpresa: string;
    direccionEmpresa: string;
    telefonoEmpresa: string;
}

interface Props {
    compras: Cabecera[];
    empresa: Empresa;
}

export default function IndexCompras({ compras = [], empresa }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleRow = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const imprimirComprobanteCompra = (c: Cabecera) => {
        const ventanImpresion = window.open('', '_blank', 'width=800,height=600');
        if (!ventanImpresion) return;

        const filasTicket = (c.detalles || []).map(d => `
            <tr style="font-size: 9px;">
                <td class="col-cod" style="vertical-align: top;">${(d.item?.codigoItem || 'Producto')}</td>
                <td class="col-desc" style="vertical-align: top;">${(d.item?.nombreItem || 'Producto')}</td>
                <td class="col-cant" style="vertical-align: top;">${d.cantidadDetalleMovimiento}</td>
                <td class="col-pu"   style="vertical-align: top;">${Number(d.costoDetalleMovimiento).toFixed(2)}</td>
                <td class="col-sub"  style="vertical-align: top;">${Number(d.costoTotalDetalleMovimiento).toFixed(2)}</td>
                <td class="col-pu"   style="vertical-align: top;">${Number(d.precioDetalleMovimiento).toFixed(2)}</td>
                <td class="col-sub"  style="vertical-align: top;">${Number(d.precioTotalDetalleMovimiento).toFixed(2)}</td>
            </tr>
        `).join('');

        ventanImpresion.document.write(`
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; width: 210mm; font-size: 9px; margin: 0; padding: 5px; color: #000; }
                        .text-center { text-align: center; color: #000000; font-weight: 900; font-size: 15px; text-align: center;}
                        .text-right { text-align: right; }
                        .divider { border-bottom: 1px solid #000; margin: 1px 0; width: 100%;}
                        .bold { font-weight: bold; }
                        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                        .col-desc { width: auto; word-wrap: break-word; white-space: normal; padding-right: 5px; text-align: left; }
                        .col-cod { width: 120px; text-align: left; }
                        .col-cant { width: 80px; text-align: center; }
                        .col-pu   { width: 80px; text-align: right; }
                        .col-sub  { width: 80px; text-align: right; }
                        th { border-bottom: 1px solid #000; }
                    </style>
                </head>
                <body>
                    <div class="text-center">
                        <div class="bold">COMPROBANTE DE COMPRA</div>
                        <div class="bold">${empresa?.nombreEmpresa || 'MI EMPRESA'}</div>
                        <div class="bold">(Expresado en Bolivianos)</div>
                    </div>
                    <div class="divider"></div>
                    <div class="bold">ID COMPRA: #${c.compra?.idCompra}</div>
                    <div class="bold">FECHA: ${(() => {
                        const fecha = new Date(c.fechaCabeceraMovimiento);
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
                    <div class="bold">PROVEEDOR: ${c.compra?.proveedor?.nombreProveedor || 'S/P'}</div>
                    <div class="bold">FACTURA: ${c.compra?.numeroFacturaCompra || 'S/F'}</div>
                    <div class="divider"></div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 9px; font-family: Arial, sans-serif;">
                        <thead>
                            <tr>
                                <th class="col-cod">Código</th>
                                <th class="col-desc">Descripción</th>
                                <th class="col-cant">Cantidad</th>
                                <th class="col-pu">Costo Unitario</th>
                                <th class="col-sub">Costo Total</th>
                                <th class="col-pu">Precio Unitario</th>
                                <th class="col-sub">Precio Total</th>
                            </tr>
                        </thead>
                        <tbody>${filasTicket}</tbody>
                    </table>
                    <div class="divider"></div>
                    <div class="text-right bold" style="font-size: 10px;">
                        TOTAL COMPRA: ${Number(c.totalCabeceraMovimiento).toFixed(2)} BS
                    </div>
                    <div class="text-center" style="margin-top: 10px;">REGISTRO DE ALMACÉN</div>
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

    const filteredCompras = useMemo(() => {
        return (compras || []).filter((c) => {
            const proveedorStr = c.compra?.proveedor?.nombreProveedor?.toLowerCase() || '';
            const facturaStr = c.compra?.numeroFacturaCompra?.toString() || '';
            const idStr = c.idCabeceraMovimiento.toString();
            const search = searchTerm.toLowerCase();
            return proveedorStr.includes(search) || idStr.includes(search) || facturaStr.includes(search);
        });
    }, [compras, searchTerm]);

    const formatCurrency = (value: string | number) => {
        return new Intl.NumberFormat('es-BO', { 
            style: 'currency', 
            currency: 'BOB', 
            minimumFractionDigits: 2 
        }).format(Number(value));
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Compras / Historial', href: '/compras/historial' }]}>
            <Head title="Historial de Compras" />

            <div className="flex flex-1 flex-col gap-4 p-4 py-6 md:p-8 text-slate-900 dark:text-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 dark:border-slate-800">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <ShoppingBag className="h-6 w-6 text-emerald-600" /> Historial de Compras
                        </h1>
                        <p className="text-sm text-slate-500">Gestión de entradas de mercancía y facturas de proveedores.</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text" 
                                placeholder="Buscar proveedor, factura o ID..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            />
                        </div>
                        <button 
                            onClick={() => router.get('/compras/nueva')} 
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-all active:scale-95 shadow-md shadow-emerald-200 dark:shadow-none"
                        >
                            <Plus className="h-4 w-4" /> Nueva Compra
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
                                    <th className="px-6 py-4">Proveedor / Comprador</th>
                                    <th className="px-6 py-4 text-center">Factura</th>
                                    <th className="px-6 py-4 text-right">Total</th>
                                    <th className="px-6 py-4 text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-slate-800">
                                {filteredCompras.length > 0 ? (
                                    filteredCompras.map((c) => (
                                        <Fragment key={c.compra?.idCompra}>
                                            <tr 
                                                onClick={() => toggleRow(Number(c.compra?.idCompra))}
                                                className={`group cursor-pointer transition-colors ${expandedId === c.compra?.idCompra ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40'}`}
                                            >
                                                <td className="px-6 py-4 text-center">
                                                    {expandedId === c.compra?.idCompra ? <ChevronUp className="h-4 w-4 text-emerald-600" /> : <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-emerald-400" />}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 dark:text-slate-100">#{c.compra?.idCompra}</span>
                                                        <span className="text-[10px] text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                                                            <Calendar className="h-3 w-3" /> {new Date(c.fechaCabeceraMovimiento).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                            {c.compra?.proveedor?.nombreProveedor || 'Proveedor General'}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                            <User className="h-3 w-3" /> {c.usuario?.name || 'Sistema'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                                        c.compra?.conFacturaCompra 
                                                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10' 
                                                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800'
                                                    }`}>
                                                        {c.compra?.conFacturaCompra ? `N° ${c.compra.numeroFacturaCompra}` : 'Sin Factura'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">
                                                        {formatCurrency(c.totalCabeceraMovimiento)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); imprimirComprobanteCompra(c); }}
                                                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                                        title="Imprimir Comprobante"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>

                                            {expandedId === c.compra?.idCompra && (
                                                <tr className="bg-slate-50/30 dark:bg-slate-800/20">
                                                    <td colSpan={6} className="px-8 py-6">
                                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                                            <div className="lg:col-span-2 space-y-3">
                                                                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 flex items-center gap-2 tracking-widest">
                                                                    <Package className="h-3.5 w-3.5" /> Items Recibidos
                                                                </h4>
                                                                <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-800 divide-y dark:divide-slate-800 overflow-hidden shadow-sm">
                                                                    {c.detalles && c.detalles.length > 0 ? c.detalles.map((det) => (
                                                                        <div key={det.idDetalleMovimiento} className="flex justify-between items-center px-4 py-3 text-sm">
                                                                            <div className="flex flex-col">
                                                                                <span className="font-bold text-slate-700 dark:text-slate-300">{det.item?.nombreItem || 'Item sin nombre'}</span>
                                                                                <span className="text-xs text-slate-500">
                                                                                    {det.cantidadDetalleMovimiento} unidades x {formatCurrency(det.precioDetalleMovimiento)}
                                                                                </span>
                                                                            </div>
                                                                            <span className="font-bold text-slate-900 dark:text-white">
                                                                                {formatCurrency(det.precioTotalDetalleMovimiento)}
                                                                            </span>
                                                                        </div>
                                                                    )) : (
                                                                        <div className="p-4 text-center text-slate-400 italic">No hay detalles de compra</div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4">
                                                                <div className="bg-emerald-600 text-white p-5 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none">
                                                                    <h4 className="text-[10px] font-black uppercase opacity-80 mb-4 tracking-widest">Total Invertido</h4>
                                                                    <div className="flex justify-between items-end">
                                                                        <span className="text-xs opacity-90">Monto Final:</span>
                                                                        <span className="text-2xl font-black">{formatCurrency(c.totalCabeceraMovimiento)}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border dark:border-slate-800 text-xs">
                                                                    <p className="font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 flex items-center gap-2">
                                                                        <Truck className="h-3 w-3" /> Info Proveedor
                                                                    </p>
                                                                    <p className="mb-1"><span className="text-slate-400">Nombre:</span> {c.compra?.proveedor?.nombreProveedor || 'N/A'}</p>
                                                                    <p className="mb-1"><span className="text-slate-400">NIT:</span> {c.compra?.proveedor?.nitProveedor || '0'}</p>
                                                                    <p><span className="text-slate-400">Pago:</span> {c.compra?.metodoPago || 'No especificado'}</p>
                                                                </div>
                                                                <button 
                                                                    onClick={() => imprimirComprobanteCompra(c)}
                                                                    className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm transition-all"
                                                                >
                                                                    <FileText className="h-4 w-4" /> Imprimir Comprobante
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
                                            No se encontraron compras en el historial.
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