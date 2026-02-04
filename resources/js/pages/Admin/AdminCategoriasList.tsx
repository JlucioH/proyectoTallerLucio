import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { 
    Search, Users, Building2, Phone, Mail, FileText, ChevronRight, ChevronDown
} from 'lucide-react';

interface Categoria {
    idCategoria: number;
    nombreCategoria: string;
    estadoCategoria: boolean;
}

interface Empresa {
    idEmpresa: number;
    nombreEmpresa: string;
    nitEmpresa: string;
    categorias: Categoria[];
}

interface Props {
    empresas: Empresa[];
}

export default function AdminCategoriasList({ empresas }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedEmpresas, setExpandedEmpresas] = useState<number[]>([]);

    const toggleEmpresa = (id: number) => {
        setExpandedEmpresas(prev => 
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        );
    };

    const filteredData = useMemo(() => {
        return empresas.map(empresa => ({
            ...empresa,
            categorias: empresa.categorias.filter(c => 
                c.nombreCategoria.toLowerCase().includes(searchTerm.toLowerCase()) 
            )
        })).filter(empresa => empresa.categorias.length > 0);
    }, [empresas, searchTerm]);

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Admin / Consolidado Categorias', href: '/admin/categorias-consolidado' }]}>
            <Head title="Consolidado de Categorías" />

            <div className="flex flex-1 flex-col gap-4 p-4 py-6 md:p-8 text-slate-900 dark:text-slate-100">
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-6 dark:border-slate-800">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Building2 className="h-6 w-6 text-indigo-600" /> Consolidado Global
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">Vista general de categorías por empresa</p>
                    </div>

                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text" 
                            placeholder="Buscar categoría o empresa..."
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
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">NIT: {empresa.nitEmpresa} • {empresa.categorias.length} Categorías</p>
                                        </div>
                                    </div>
                                </button>

                                {expandedEmpresas.includes(empresa.idEmpresa) && (
                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 border-t dark:border-slate-800">
                                        {empresa.categorias.map(categoria => (
                                            <div key={categoria.idCategoria} className="p-3 rounded-lg border dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-2">
                                                <div className="flex justify-between items-start">
                                                
                                                    <span className={`h-2 w-2 rounded-full ${categoria.estadoCategoria ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                </div>
                                                <h3 className="font-bold text-sm leading-tight line-clamp-1">{categoria.nombreCategoria}</h3>

                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                            <Users className="h-12 w-12 text-slate-300 mb-2" />
                            <p className="text-slate-500 font-medium">No hay datos para mostrar.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppSidebarLayout>
    );
}