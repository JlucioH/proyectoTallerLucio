import React, { useState } from 'react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head } from '@inertiajs/react';
import { 
    Users, ChevronDown, Search, FileText, 
    Calendar, TrendingUp, TrendingDown, Minus, 
    TruckIcon
} from 'lucide-react';

export default function HistorialSuministros({ proveedores }: { proveedores: any[] }) {
    const [filtro, setFiltro] = useState('');

    const proveedoresFiltrados = proveedores.filter(p => 
        p.nombre.toLowerCase().includes(filtro.toLowerCase()) || 
        (p.codigo && p.codigo.toLowerCase().includes(filtro.toLowerCase()))
    );

    // Función para calcular si el precio subió o bajó respecto a la compra anterior del MISMO item
    const obtenerTendencia = (items: any[], currentItem: any, index: number) => {
        // Buscamos la siguiente compra (más antigua) del mismo ID de item
        const compraAnterior = items.slice(index + 1).find(it => it.idItem === currentItem.idItem);
        console.log(items)
        if (!compraAnterior) return <Minus className="w-3 h-3 text-zinc-300" />;
        
        if (currentItem.costo_unitario > compraAnterior.costo_unitario) {
            return (
                <span title="Subió de precio">
                    <TrendingUp className="w-3 h-3 text-red-500" />
                </span>
            );
        } else if (currentItem.costo_unitario < compraAnterior.costo_unitario) {
            return (
                <span title="Bajó de precio">
                    <TrendingDown className="w-3 h-3 text-emerald-500" />
                </span>
            );
        }
        return <Minus className="w-3 h-3 text-zinc-300" />;
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Suministros por Proveedor', href: '/compras/historial-suministros' }]}>
            <Head title="Análisis de Suministros" />

            <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tight ">
                            Historial Suministros
                        </h1>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Control de costos y tendencias</p>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <input 
                            type="text"
                            placeholder="Buscar proveedor..."
                            className="w-full md:w-80 pl-10 pr-4 py-2.5 bg-background border rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                    </div>
                </div>

                {/* Lista */}
                <div className="grid gap-4">
                    {proveedoresFiltrados.map((prov) => (
                        <details key={prov.idProveedor} className="group bg-card border rounded-[2rem] bg-white dark:bg-zinc-900 overflow-hidden shadow-sm open:ring-1 open:ring-emerald-500/20 transition-all">
                            <summary className="flex items-center justify-between p-6 cursor-pointer list-none hover:bg-muted/10">
                                <div className="flex items-center gap-5">
                                    <div className="p-4 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-600/20">
                                        <TruckIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-foreground uppercase tracking-tight">{prov.nombre}</h3>
                                        <div className="flex gap-3 text-[10px] font-black text-muted-foreground mt-1">
                                            <span className="bg-muted px-2 py-0.5 rounded">NIT: {prov.nit || 'S/N'}</span>
                                            <span className="text-emerald-600 uppercase">Última: {prov.ultima_fecha ? new Date(prov.ultima_fecha).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="hidden sm:text-right sm:block">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase">Inversión Total</p>
                                        <p className="text-xl font-black text-emerald-600">
                                            {new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(prov.precio_total_invertido)}
                                        </p>
                                        <p className="text-xl font-black text-amber-600">
                                            {new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(prov.monto_total_invertido)}
                                        </p>
                                    </div>
                                    <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform duration-300" />
                                </div>
                            </summary>

                            <div className="p-8 pt-0 border-t bg-muted/10 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm">
                                <div className="mt-6 overflow-x-auto border rounded-2xl ">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b dark:border-slate-800 font-bold">
                                            <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b bg-muted/30">
                                                <th className="p-4 text-left">Fecha</th>
                                                <th className="p-4 text-left">Ítem / Código</th>
                                                <th className="p-4 text-center">Factura</th>
                                                <th className="p-4 text-right">Cant.</th>
                                                <th className="p-4 text-right">Costo Unit.</th>
                                                
                                                <th className="p-4 text-right">Costo Tot.</th>
                                                <th className="p-4 text-center">Trend</th>
                                                <th className="p-4 text-right">Precio Unit.</th>
                                                <th className="p-4 text-right">Precio Tot.</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {prov.items.map((it: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                                    <td className="p-4 text-xs font-bold text-muted-foreground">
                                                        {new Date(it.fecha).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="font-black text-foreground uppercase tracking-tight leading-none">{it.nombre_item}</p>
                                                        <p className="text-[9px] text-muted-foreground font-bold mt-1">#{it.codigo_item}</p>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {it.factura ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded text-[9px] font-black border border-emerald-500/20">
                                                                <FileText className="w-3 h-3" /> {it.factura}
                                                            </span>
                                                        ) : <span className="text-zinc-300 text-[10px]">--</span>}
                                                    </td>
                                                    <td className="p-4 text-right font-black">x{it.cantidad}</td>
                                                    <td className="p-4 text-right font-bold text-amber-600">{it.costo_unitario}</td>
                                                    
                                                    <td className="p-4 text-right font-black text-amber-600">{it.subtotal}</td>
                                                    <td className="p-4">
                                                        <div className="flex justify-center">
                                                            {obtenerTendencia(prov.items, it, idx)}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right font-black text-emerald-600">{it.precio_unitario}</td>
                                                    <td className="p-4 text-right font-black text-emerald-600">{it.precio_subtotal}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </AppSidebarLayout>
    );
}