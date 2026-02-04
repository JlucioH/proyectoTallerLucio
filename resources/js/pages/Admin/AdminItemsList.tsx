import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { 
    Search, Users, Building2, ChevronRight, ChevronDown, Tag, Image as ImageIcon 
} from 'lucide-react';

interface Categoria {
    idCategoria: number;
    nombreCategoria: string;
}

// Actualizamos la interfaz para recibir la portada desde el controlador
interface Item {
    idItem: number;
    codigoItem: string;
    nombreItem: string;
    cantidadItem?: number;
    categoria: Categoria;
    estadoItem: boolean;
    portada: {
        idImagenItem: number | null;
        ruta: string | null;
    };
}

interface Empresa {
    idEmpresa: number;
    nombreEmpresa: string;
    nitEmpresa: string;
    items: Item[];
}

interface Props {
    empresas: Empresa[];
}

export default function AdminItemsList({ empresas }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedEmpresas, setExpandedEmpresas] = useState<number[]>([]);

    const toggleEmpresa = (id: number) => {
        setExpandedEmpresas(prev => 
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        );
    };

    const filteredData = useMemo(() => {
        const search = searchTerm.toLowerCase();
        return empresas.map(empresa => ({
            ...empresa,
            items: empresa.items.filter(item => 
                item.nombreItem.toLowerCase().includes(search) ||
                (item.codigoItem || '').toLowerCase().includes(search) ||
                empresa.nombreEmpresa.toLowerCase().includes(search)
            )
        })).filter(empresa => empresa.items.length > 0);
    }, [empresas, searchTerm]);

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Admin / Consolidado Ítems', href: '/admin/items-consolidado' }]}>
            <Head title="Consolidado de Items" />

            <div className="flex flex-1 flex-col gap-4 p-4 py-6 md:p-8 text-slate-900 dark:text-slate-100">
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-6 dark:border-slate-800">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Building2 className="h-6 w-6 text-indigo-600" /> Consolidado Global
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">Vista general de ítems por empresa</p>
                    </div>

                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text" 
                            placeholder="Buscar ítem o empresa..."
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div className="space-y-4 mt-4">
                    {filteredData.length > 0 ? (
                        filteredData.map((empresa) => (
                            <div key={empresa.idEmpresa} className="border dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
                                <button 
                                    onClick={() => toggleEmpresa(empresa.idEmpresa)}
                                    className="w-full flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {expandedEmpresas.includes(empresa.idEmpresa) ? <ChevronDown className="h-5 w-5 text-slate-400" /> : <ChevronRight className="h-5 w-5 text-slate-400" />}
                                        <div className="text-left">
                                            <h2 className="font-bold text-slate-900 dark:text-white">{empresa.nombreEmpresa}</h2>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">NIT: {empresa.nitEmpresa} • {empresa.items.length} Ítems</p>
                                        </div>
                                    </div>
                                </button>

                                {expandedEmpresas.includes(empresa.idEmpresa) && (
                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 border-t dark:border-slate-800">
                                        {empresa.items.map(item => (
                                            <div key={item.idItem} className="p-3 rounded-lg border dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-3 items-center">
                                                
                                                {/* MINIATURA DE IMAGEN */}
                                                <div className="h-14 w-14 rounded-md bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden border dark:border-slate-700">
                                                    {item.portada.ruta ? (
                                                        <img 
                                                            src={item.portada.ruta} 
                                                            alt={item.nombreItem} 
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center">
                                                            <ImageIcon className="h-5 w-5 text-slate-400" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* INFORMACIÓN DEL ÍTEM */}
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase truncate">
                                                            #{item.codigoItem || 'S/C'}
                                                        </span>
                                                        <span className={`h-2 w-2 rounded-full flex-shrink-0 ${item.estadoItem ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                    </div>
                                                    <h3 className="font-bold text-sm leading-tight line-clamp-1">{item.nombreItem}</h3>
                                                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                                        <Tag className="h-3 w-3" /> 
                                                        <span className="truncate">{item.categoria?.nombreCategoria || '--'}</span>
                                                    </div>
                                                    {item.cantidadItem !== undefined && (
                                                        <div className="text-[11px] font-bold text-indigo-500">
                                                            Stock: {item.cantidadItem}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                            <Users className="h-12 w-12 text-slate-300 mb-2" />
                            <p className="text-slate-500 font-medium">No se encontraron resultados.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppSidebarLayout>
    );
}