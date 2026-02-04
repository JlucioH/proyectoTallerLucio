import React from 'react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head } from '@inertiajs/react';
import { Printer, ArrowLeft, Package, FileText, TrendingUp, Search, ChevronRight } from 'lucide-react';
import { router } from '@inertiajs/react';

interface KardexRow {
    fecha: string;
    detalle: string;
    entrada: { cant: number; costo: number; total: number };
    salida: { cant: number; costo: number; total: number };
    saldo: { cant: number; costo: number; total: number };
}

interface Empresa {
    nombreEmpresa: string;
    direccionEmpresa: string;
    telefonoEmpresa: string;
}

interface Props {
    item: any;
    dataKardex: KardexRow[];
    availableItems?: any[]; // Nueva prop
    empresa: Empresa;
}

export default function ReporteKardexItem({ item, dataKardex, availableItems = [], empresa }: Props) {
    const [searchTerm, setSearchTerm] = React.useState('');
    // Filtrar productos según la búsqueda
    const filteredItems = availableItems.filter(i => 
        i.nombreItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.codigoItem && i.codigoItem.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    const handlePrint = () => {
        imprimirKardex(item, dataKardex);
    };

    const imprimirKardex = (item: any, movimientos: any[]) => {
        const ventana = window.open('', '_blank', 'width=1000,height=800');
        if (!ventana) return;

        const filas = movimientos.map(m => {
            // Lógica manual de -4 horas
            const fechaObj = new Date(m.fecha);
            fechaObj.setHours(fechaObj.getHours() - 4);
            
            const fechaFinal = fechaObj.toLocaleString('es-BO', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            return`
            <tr>
                <td style="font-size: 8px; width: 90px; text-align: center;">${fechaFinal}</td>
                <td class="col-desc">${m.detalle || 'S/D'}</td>
                <td class="text-right">${m.entrada.cant > 0 ? m.entrada.cant : '-'}</td>
                <td class="text-right">${m.entrada.costo > 0 ? m.entrada.costo.toFixed(2) : '-'}</td>
                <td class="text-right">${m.entrada.total > 0 ? m.entrada.total.toFixed(2) : '-'}</td>
                <td class="text-right">${m.salida.cant > 0 ? m.salida.cant : '-'}</td>
                <td class="text-right">${m.salida.costo > 0 ? m.salida.costo.toFixed(2) : '-'}</td>
                <td class="text-right">${m.salida.total > 0 ? m.salida.total.toFixed(2) : '-'}</td>
                <td class="text-right" font-weight: bold;>${m.saldo.cant > 0 ? m.saldo.cant : '-'}</td>
                <td class="text-right" font-weight: bold;>${m.saldo.costo > 0 ? m.saldo.costo.toFixed(2) : '-'}</td>
                <td class="text-right" font-weight: bold;>${m.saldo.total > 0 ? m.saldo.total.toFixed(2) : '-'}</td>
            </tr>
            `;
        }).join('');

        ventana.document.write(`
            <html>
                <head>
                    <title>Kardex - ${item.nombreItem}</title>
                    <style>
                        @page { size: landscape; margin: 10mm; }
                        body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
                        .header-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
                        .item-info { flex: 1; }
                        .item-image { width: 120px; height: 120px; object-fit: cover; border-radius: 10px; border: 1px solid #ddd; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
                        th { background-color: #f4f4f5; color: #000; font-weight: bold; text-transform: uppercase; font-size: 9px; }
                        th, td { border: 1px solid #e4e4e7; padding: 6px; overflow: hidden; }
                        .col-desc { width: 270px; font-size: 12px;}
                        .text-right { text-align: right; font-size: 12px;}
                        .text-center { text-align: center; }
                        .bold { font-weight: bold; }
                        .brand { color: #000000; font-weight: 900; font-size: 15px; text-align: center;}
                    </style>
                </head>
                <body>
                    <div class="header-container">
                        <div class="item-info">
                            <div class="brand">
                                <div font-weight: bold;" ">KARDEX VALORIZADO</div>
                                <div font-weight: bold;" ">${empresa?.nombreEmpresa || 'MI EMPRESA'}</div>
                                <div font-weight: bold;" ">(Expresado en Bolivianos)</div>
                            </div>
                            
                            <p><strong>NOMBRE ÍTEM:</strong> ${item.nombreItem || 'S/C'}</p>
                            <p><strong>CÓDIGO:</strong> ${item.codigoItem || 'S/C'}</p>
                            <p><strong>FECHA DE REPORTE:</strong> ${new Date().toLocaleString('es-BO')}</p>
                        </div>
                        ${item.imagen ? `
                            <img src="/storage/${item.imagen}" class="item-image" />
                        ` : ''}
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th class="col-desc" style="width: 60px;" rowSpan=2>Fecha</th>
                                <th class="col-desc" rowSpan=2>Detalle Movimiento</th>
                                <th colSpan=3>Entradas</th>
                                <th colSpan=3>Salidas</th>
                                <th colSpan=3>Saldos</th>
                            </tr>
                            <tr>
                                <th>Cantidad</th>
                                <th>Costo Unit.</th>
                                <th>Costo Tot.</th>
                                <th>Cantidad</th>
                                <th>Costo Unit.</th>
                                <th>Costo Tot.</th>
                                <th>Cantidad</th>
                                <th>Costo Unit.</th>
                                <th>Costo Tot.</th>
                            </tr>
                        </thead>
                        <tbody>${filas}</tbody>
                    </table>
                    
                    <div style="margin-top: 20px; text-align: center; font-size: 8px; color: #999;">
                        Este documento es un reporte interno de control de inventarios.
                    </div>
                </body>
            </html>
        `);
                        
        ventana.document.close();
        // Esperamos a que la imagen cargue antes de imprimir
        setTimeout(() => {
            ventana.focus();
            ventana.print();
            //ventana.close();
        }, 500);
    };

    const breadcrumbs = [
        { title: 'Reporte', href: '#' },
        { title: 'Kardex Valorizado', href: '#' }
    ];

    // Pantalla de Selección (Buscador)
    if (!item) {
        return (
            <AppSidebarLayout breadcrumbs={[{ title: 'Reporte', href: '#' }, { title: 'Seleccionar Item', href: '#' }]}>
                <div className="flex flex-1 flex-col items-center justify-center p-6 bg-zinc-50/50 dark:bg-zinc-950/50">
                    <div className="w-full max-w-7xl mx-auto space-y-8">
                        <div className="text-center">
                            <div className="bg-emerald-100 dark:bg-emerald-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
                                <Search className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-800 dark:text-zinc-100">Kardex Valorizado</h2>
                            <p className="text-zinc-500 font-medium">Busca un producto para ver su historial de movimientos</p>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                            <input 
                                type="text"
                                placeholder="Escribe el nombre o código del producto..."
                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl focus:border-emerald-500 outline-none transition-all font-bold"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {/*BUSCADOR DE ITEM*/}
                        

                        <div className="w-full">
                            {/* Grid optimizado para pantallas anchas: hasta 4 columnas en monitores grandes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 p-4">
                                {filteredItems.slice(0, 12).map((i) => (
                                    <div 
                                        key={i.idItem} 
                                        onClick={() => router.get(`/reporte/reportekardexitem/${i.idItem}`)}
                                        className="group relative flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[3rem] overflow-hidden hover:border-emerald-500 shadow-sm hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] cursor-pointer transition-all duration-500"
                                    >
                                        {/* CONTENEDOR DE IMAGEN GIGANTE (Aspect ratio 4:3 para ver más detalle) */}
                                        <div className="aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative">
                                            {i.imagen ? (
                                                <img 
                                                    src={`/storage/${i.imagen}`} 
                                                    alt={i.nombreItem} 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 gap-4">
                                                    <Package className="w-16 h-16 opacity-20" />
                                                    <span className="text-xs font-black uppercase tracking-[0.3em] opacity-30">Sin Imagen</span>
                                                </div>
                                            )}

                                            {/* Badge de Código Flotante (Estilo Premium) */}
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
                                            
                                            {/* SECCIÓN INFERIOR: Acción y detalles */}
                                            <div className="mt-auto pt-6 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Visualizar</span>
                                                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase">Kardex Completo</span>
                                                </div>
                                                
                                                <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 w-14 h-14 rounded-[1.5rem] flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                                    <ChevronRight className="w-7 h-7 transition-transform group-hover:translate-x-1" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Efecto de brillo al pasar el mouse */}
                                        <div className="absolute inset-0 border-[3px] border-transparent group-hover:border-emerald-500/20 rounded-[3rem] pointer-events-none transition-all"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        

                    </div>
                </div>
            </AppSidebarLayout>
        );
    }

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={`Kardex - ${item.nombreItem}`} />

            <div className="flex flex-1 flex-col gap-6 p-6 lg:p-10 bg-zinc-50/50 dark:bg-zinc-950/50">
                
                {/* BOTONES DE ACCIÓN (Se ocultan al imprimir) */}
                <div className="flex justify-between items-center print:hidden">
                    <button 
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors font-bold uppercase text-[10px] tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4"/> Volver
                    </button>
                    
                    <button 
                        onClick={handlePrint}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-black uppercase text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                    >
                        <Printer className="w-4 h-4"/> Imprimir Reporte (Horizontal)
                    </button>
                </div>

                {/* CONTENEDOR DEL REPORTE (Lo que sale en la hoja) */}
                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden print:border-none print:shadow-none print:rounded-none">
                    
                    {/* ENCABEZADO DEL DOCUMENTO */}
                    <div className="p-10 border-b dark:border-zinc-800">
                        <div className="flex justify-between items-start mb-10">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3 text-emerald-600 mb-2">
                                    <TrendingUp className="w-8 h-8" />
                                    <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Kardex <br/> Valorizado</h1>
                                </div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Control de Existencias - Costo Promedio</p>
                            </div>
                            <div className="text-right space-y-1">
                                <h2 className="text-xl font-black uppercase text-zinc-800 dark:text-zinc-100">{item.razonSocial ?? 'SISTEMA DE GESTIÓN'}</h2>
                                <p className="text-xs font-bold text-zinc-500 uppercase">Reporte Generado: {new Date().toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-8 bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                            <div className="flex gap-4 items-center">
                                {item.imagen && (
                                    <img 
                                        src={`/storage/${item.imagen}`} 
                                        className="w-14 h-14 rounded-xl object-cover border border-zinc-200 print:w-20 print:h-20" 
                                        alt="Miniatura" 
                                    />
                                )}
                                <div>
                                    <span className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Producto / Item</span>
                                    <span className="text-sm font-black text-zinc-800 dark:text-zinc-100 uppercase">{item.nombreItem}</span>
                                </div>
                            </div>
                            <div>
                                <span className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Código Identificador</span>
                                <span className="text-sm font-black text-zinc-800 dark:text-zinc-100 uppercase">{item.codigoItem || 'S/C'}</span>
                            </div>
                            <div className="text-right">
                                <span className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Unidad de Medida</span>
                                <span className="text-sm font-black text-emerald-600 uppercase">Unidades</span>
                            </div>
                        </div>
                    </div>

                    {/* CUERPO DEL KARDEX */}
                    <div className="p-0 sm:p-4 print:p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-[10px] border-collapse min-w-[1000px]">
                                <thead>
                                    <tr className="bg-zinc-900 text-white uppercase font-black tracking-tighter">
                                        <th className="p-3 border border-zinc-700" rowSpan={2}>Fecha</th>
                                        <th className="p-3 border border-zinc-700" rowSpan={2}>Detalle de Movimiento</th>
                                        <th className="p-3 border border-zinc-700 text-center bg-zinc-800" colSpan={3}>Entradas</th>
                                        <th className="p-3 border border-zinc-700 text-center bg-zinc-800" colSpan={3}>Salidas</th>
                                        <th className="p-3 border border-zinc-700 text-center bg-emerald-700" colSpan={3}>Saldos Acumulados</th>
                                    </tr>
                                    <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase font-black text-[8px]">
                                        {/* Entradas */}
                                        <th className="p-2 border border-zinc-200 dark:border-zinc-700">Cant.</th>
                                        <th className="p-2 border border-zinc-200 dark:border-zinc-700">Costo U.</th>
                                        <th className="p-2 border border-zinc-200 dark:border-zinc-700">Importe</th>
                                        {/* Salidas */}
                                        <th className="p-2 border border-zinc-200 dark:border-zinc-700">Cant.</th>
                                        <th className="p-2 border border-zinc-200 dark:border-zinc-700">Costo U.</th>
                                        <th className="p-2 border border-zinc-200 dark:border-zinc-700">Importe</th>
                                        {/* Saldos */}
                                        <th className="p-2 border border-zinc-200 dark:border-zinc-700 bg-emerald-50 dark:bg-emerald-950/20">Cant.</th>
                                        <th className="p-2 border border-zinc-200 dark:border-zinc-700 bg-emerald-50 dark:bg-emerald-950/20">Costo Prom.</th>
                                        <th className="p-2 border border-zinc-200 dark:border-zinc-700 bg-emerald-50 dark:bg-emerald-950/20 font-black">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-zinc-800">
                                    {dataKardex.map((row, i) => (
                                        <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors font-medium">
                                            <td className="p-2 border border-zinc-100 dark:border-zinc-800 text-center whitespace-nowrap">{new Date(row.fecha).toLocaleDateString()}</td>
                                            <td className="p-2 border border-zinc-100 dark:border-zinc-800 text-[9px] uppercase font-bold text-zinc-500">{row.detalle}</td>
                                            
                                            {/* Entradas */}
                                            <td className="p-2 border border-zinc-100 dark:border-zinc-800 text-right">{row.entrada.cant || '-'}</td>
                                            <td className="p-2 border border-zinc-100 dark:border-zinc-800 text-right">{row.entrada.costo > 0 ? row.entrada.costo.toFixed(2) : '-'}</td>
                                            <td className="p-2 border border-zinc-100 dark:border-zinc-800 text-right font-bold text-emerald-600">{row.entrada.total > 0 ? row.entrada.total.toFixed(2) : '-'}</td>
                                            
                                            {/* Salidas */}
                                            <td className="p-2 border border-zinc-100 dark:border-zinc-800 text-right">{row.salida.cant || '-'}</td>
                                            <td className="p-2 border border-zinc-100 dark:border-zinc-800 text-right">{row.salida.costo > 0 ? row.salida.costo.toFixed(2) : '-'}</td>
                                            <td className="p-2 border border-zinc-100 dark:border-zinc-800 text-right font-bold text-red-500">{row.salida.total > 0 ? row.salida.total.toFixed(2) : '-'}</td>
                                            
                                            {/* Saldos */}
                                            <td className="p-2 border border-zinc-100 dark:border-zinc-800 text-right font-black bg-emerald-50/30 dark:bg-emerald-500/5">{row.saldo.cant}</td>
                                            <td className="p-2 border border-zinc-100 dark:border-zinc-800 text-right italic text-zinc-400">{row.saldo.costo.toFixed(2)}</td>
                                            <td className="p-2 border border-zinc-100 dark:border-zinc-800 text-right font-black bg-zinc-100/50 dark:bg-zinc-800/50">{row.saldo.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </AppSidebarLayout>
    );
}