import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/app/app-sidebar-layout';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Search, TrendingUp, ArrowLeft, ReceiptText, Calendar, Filter, FileText, Package, ChevronRight } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Props {
    auth: any;
    items: any[];
    itemSeleccionado?: any;
    dataGrafico?: any[];
    empresa?: any;
    filtros?: {
        desde: string;
        hasta: string;
        agrupar: string;
    };
}

export default function ReporteCostoItem({ auth, items, itemSeleccionado, dataGrafico, empresa, filtros }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filtrosLocales, setFiltrosLocales] = useState({
        desde: filtros?.desde || new Date().toISOString().split('T')[0],
        hasta: filtros?.hasta || new Date().toISOString().split('T')[0],
        agrupar: filtros?.agrupar || 'ninguno'
    });

    const seleccionarItem = (id: number) => {
        const url = `/reporte/reportecostoitem/${id}?desde=${filtrosLocales.desde}&hasta=${filtrosLocales.hasta}&agrupar=${filtrosLocales.agrupar}`;
        router.get(url);
    };

    const aplicarFiltros = () => {
        if (itemSeleccionado) {
            // Ruta completa manual para actualizar
            const url = `/reporte/reportecostoitem/${itemSeleccionado.idItem}?desde=${filtrosLocales.desde}&hasta=${filtrosLocales.hasta}&agrupar=${filtrosLocales.agrupar}`;
            router.get(url, {}, {
                preserveState: true,
                replace: true
            });
        }
    };

    const formatearFecha = (fechaStr: string, incluirHora: boolean = false) => {
        if (!fechaStr) return '';
        
        // Si la fecha ya viene agrupada por mes o día (no tiene la "T" o ":" de la hora)
        if (!fechaStr.includes(':') && !fechaStr.includes('T')) {
            // En este caso, la fecha ya fue ajustada por el servidor
            if (filtrosLocales.agrupar === 'mes') {
                const [year, month] = fechaStr.split('-');
                const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                return `${meses[parseInt(month) - 1]} ${year}`;
            }
            // Para agrupación por día, simplemente mostramos la fecha tal cual
            const [year, month, day] = fechaStr.split('-');
            return `${day}/${month}`;
        }

        // SI NO ESTÁ AGRUPADO (Detalle por venta), aplicamos el ajuste manual de -4
        const d = new Date(fechaStr);
        d.setHours(d.getHours() - 4);

        return incluirHora 
            ? d.toLocaleString('es-BO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true })
            : d.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit' });
    };

    const generarPDF = () => {
        const doc = new jsPDF();
        const fechaActual = new Date().toLocaleString();

        // Título y Estética
        doc.setFontSize(18);
        doc.setTextColor(16, 185, 129); // Emerald 600
        doc.text('REPORTE DE RENTABILIDAD', 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Empresa: ${empresa?.nombreEmpresa || 'Mi Empresa'}`, 14, 28);
        doc.text(`Producto: ${itemSeleccionado?.nombreItem}`, 14, 33);
        doc.text(`Filtros: ${filtrosLocales.desde} al ${filtrosLocales.hasta} (Agrupación: ${filtrosLocales.agrupar})`, 14, 38);
        doc.text(`Generado: ${fechaActual}`, 14, 43);

        const tableRows = dataGrafico?.map(row => [
            formatearFecha(row.fecha, true),
            `${row.precioBruto.toFixed(2)}`,
            `${(row.precioBruto * (empresa.ivaEmpresa/100)).toFixed(2)}`,
            `${row.precioNeto.toFixed(2)}`,
            `${row.costo.toFixed(2)}`,
            `${(row.precioNeto - row.costo).toFixed(2)}`
        ]);

        autoTable(doc, {
            startY: 50,
            head: [['Fecha/Periodo', 'P. Bruto', 'IVA', 'P. Neto', 'Costo', 'Utilidad']],
            body: tableRows,
            headStyles: { fillColor: [16, 185, 129], fontStyle: 'bold' }, // Emerald Header
            alternateRowStyles: { fillColor: [240, 253, 244] },
            styles: { fontSize: 8, font: 'helvetica' },
            columnStyles: {
                5: { fontStyle: 'bold' }
            }
        });

        doc.save(`Reporte_Rentabilidad_${itemSeleccionado?.nombreItem}.pdf`);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Análisis de Rentabilidad" />

            <div className="p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    
                    {/* ENCABEZADO */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-emerald-500/10 shadow-sm">
                        <div>
                            <h2 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 uppercase tracking-tight">
                                Análisis de <span className="text-emerald-600">Rentabilidad</span>
                            </h2>
                            <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest mt-1">
                                {itemSeleccionado ? `Producto: ${itemSeleccionado.nombreItem}` : 'Seleccione un producto para analizar'}
                            </p>
                        </div>
                        {itemSeleccionado && (
                            <div className="flex gap-2">
                                <button 
                                    onClick={generarPDF}
                                    className="bg-zinc-800 text-white px-5 py-3 rounded-2xl transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-tighter hover:bg-zinc-700"
                                >
                                    <FileText className="w-4 h-4 text-emerald-400"/> Exportar PDF
                                </button>
                                <button 
                                    onClick={() => router.get('/reporte/reportecostoitem')}
                                    className="bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-600 hover:text-white px-5 py-3 rounded-2xl transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-tighter shadow-sm"
                                >
                                    <ArrowLeft className="w-4 h-4"/> Cambiar producto
                                </button>
                            </div>
                        )}
                    </div>

                    {!itemSeleccionado ? (
                        /* BUSCADOR */
                        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-sm border border-emerald-500/10">
                            <div className="relative mb-8">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                                <input 
                                    type="text"
                                    placeholder="FILTRAR PRODUCTO POR NOMBRE O CÓDIGO..."
                                    className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl transition-all font-bold text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            

                            {/* BUSCADOR DE ITEM - ESTILO GRANDE */}
                            <div className="w-full">
                                {/* Grid optimizado: hasta 4 columnas en pantallas muy grandes */}
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 p-4">
                                    {items
                                        .filter(i => 
                                            // Filtra por nombre
                                            i.nombreItem.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                            // O filtra por código (si existe)
                                            (i.codigoItem && i.codigoItem.toLowerCase().includes(searchQuery.toLowerCase()))
                                        )
                                        //.slice(0, 12)
                                        .map((i) => {
                                            // Obtenemos la ruta de la imagen principal (orden 1)
                                            const rutaImagen = i.imagen_principal 
                                                ? `/storage/${i.imagen_principal.rutaImagenItem}` 
                                                : null;

                                            return (
                                                <div 
                                                    key={i.idItem} 
                                                    onClick={() => seleccionarItem(i.idItem)}
                                                    className="group relative flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[3rem] overflow-hidden hover:border-emerald-500 shadow-sm hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] cursor-pointer transition-all duration-500"
                                                >
                                                    {/* CONTENEDOR DE IMAGEN GIGANTE (Aspect ratio 4:3) */}
                                                    <div className="aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative">
                                                        {rutaImagen ? (
                                                            <img 
                                                                src={rutaImagen} 
                                                                alt={i.nombreItem} 
                                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 gap-4">
                                                                <Package className="w-16 h-16 opacity-20" />
                                                                <span className="text-xs font-black uppercase tracking-[0.3em] opacity-30">Sin Imagen</span>
                                                            </div>
                                                        )}

                                                        {/* Badge de Código Flotante */}
                                                        <div className="absolute top-5 left-5">
                                                            <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm">
                                                                <p className="text-[11px] font-black text-zinc-800 dark:text-zinc-200 uppercase">
                                                                    <span className="text-emerald-500 mr-1">#</span>{i.codigoItem || 'S/C'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* INFORMACIÓN DEL PRODUCTO */}
                                                    <div className="p-8 flex flex-col flex-1">
                                                        <div className="mb-6">
                                                            <h4 className="font-black text-2xl text-zinc-800 dark:text-zinc-50 uppercase leading-[1.1] group-hover:text-emerald-600 transition-colors">
                                                                {i.nombreItem}
                                                            </h4>
                                                        </div>
                                                        
                                                        {/* SECCIÓN INFERIOR */}
                                                        <div className="mt-auto pt-6 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Analizar</span>
                                                                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase">Costos y Utilidad</span>
                                                            </div>
                                                            
                                                            <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 w-14 h-14 rounded-[1.5rem] flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                                                <ChevronRight className="w-7 h-7 transition-transform group-hover:translate-x-1" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Efecto de brillo al pasar el mouse */}
                                                    <div className="absolute inset-0 border-[3px] border-transparent group-hover:border-emerald-500/20 rounded-[3rem] pointer-events-none transition-all"></div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>



                        </div>
                    ) : (
                        /* DASHBOARD */
                        <div className="space-y-6">
                            {/* FILTROS */}
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-emerald-500/10 shadow-sm flex flex-wrap items-end gap-4">
                                <div className="flex-1 min-w-[140px]">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Desde</label>
                                    <input type="date" className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl font-bold text-xs" value={filtrosLocales.desde} onChange={e => setFiltrosLocales({...filtrosLocales, desde: e.target.value})} />
                                </div>
                                <div className="flex-1 min-w-[140px]">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Hasta</label>
                                    <input type="date" className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl font-bold text-xs" value={filtrosLocales.hasta} onChange={e => setFiltrosLocales({...filtrosLocales, hasta: e.target.value})} />
                                </div>
                                <div className="flex-1 min-w-[140px]">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 mb-1 flex items-center gap-1"><Filter className="w-3 h-3" /> Agrupar</label>
                                    <select className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl font-bold text-xs" value={filtrosLocales.agrupar} onChange={e => setFiltrosLocales({...filtrosLocales, agrupar: e.target.value})}>
                                        <option value="ninguno">Detalle por Venta</option>
                                        <option value="dia">Por Día</option>
                                        <option value="mes">Por Mes</option>
                                    </select>
                                </div>
                                <button onClick={aplicarFiltros} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] transition-all shadow-lg shadow-emerald-600/20">Actualizar</button>
                            </div>

                            {/* GRÁFICO */}
                            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-sm border border-emerald-500/10">
                                <div className="h-[450px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={dataGrafico} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" strokeOpacity={0.1} />
                                            <XAxis dataKey="fecha" tickFormatter={(val) => formatearFecha(val)} tick={{ fontSize: 9, fontWeight: 'bold' }} stroke="#71717a" minTickGap={30} />
                                            <YAxis tick={{ fontSize: 10, fontWeight: 'bold' }} stroke="#71717a" />
                                            <Tooltip labelFormatter={(val) => formatearFecha(val, true)} contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '1rem', color: '#fff', fontSize: '12px', fontWeight: 'bold' }} />
                                            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '30px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} />
                                            <Line name="Venta Bruta" type="monotone" dataKey="precioBruto" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981' }} />
                                            <Line name="Venta Neta (-13%)" type="monotone" dataKey="precioNeto" stroke="#f59e0b" strokeWidth={4} dot={{ r: 4, fill: '#f59e0b' }} />
                                            <Line name="Costo Real" type="monotone" dataKey="costo" stroke="#8b5cf6" strokeWidth={3} strokeDasharray="6 6" dot={{ r: 3, fill: '#8b5cf6' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* TABLA */}
                            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-emerald-500/10 shadow-sm">
                                <div className="p-6 bg-emerald-600 text-white flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <ReceiptText className="w-5 h-5" />
                                        <h3 className="font-black uppercase text-sm tracking-widest">Resumen de Utilidades</h3>
                                    </div>
                                    <span className="text-[10px] bg-white/20 px-3 py-1 rounded-full font-bold uppercase">IVA: {empresa?.ivaEmpresa}%</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-tighter border-b dark:border-zinc-800">
                                                <th className="p-5">Periodo / Fecha</th>
                                                <th className="p-5 text-emerald-600">P. Bruto</th>
                                                <th className="p-5 text-amber-600">IVA</th>
                                                <th className="p-5 text-amber-500">P. Neto</th>
                                                <th className="p-5 text-violet-500">Costo Inv.</th>
                                                <th className="p-5 text-zinc-800 dark:text-white">Utilidad Neta</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y dark:divide-zinc-800">
                                            {dataGrafico?.map((row, idx) => {
                                                const utilidad = row.precioNeto - row.costo;
                                                return (
                                                    <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors font-bold group text-[11px]">
                                                        <td className="p-5 text-zinc-500">{formatearFecha(row.fecha, true)}</td>
                                                        <td className="p-5 text-emerald-600">{row.precioBruto.toFixed(2)}</td>
                                                        <td className="p-5 text-amber-600/50">{(row.precioBruto * (empresa.ivaEmpresa/100)).toFixed(2)}</td>
                                                        <td className="p-5 text-amber-500">{row.precioNeto.toFixed(2)}</td>
                                                        <td className="p-5 text-violet-500">{row.costo.toFixed(2)}</td>
                                                        <td className="p-5">
                                                            <span className={`px-3 py-1 rounded-full ${utilidad > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-500'}`}>
                                                                {utilidad.toFixed(2)} Bs.
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}