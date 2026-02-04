import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { 
    Plus, 
    Search, 
    Edit2, 
    Power, 
    PowerOff, 
    Folder, 
    AlertCircle,
    X
} from 'lucide-react';

interface Categoria {
    idCategoria: number;
    nombreCategoria: string;
    estadoCategoria: boolean;
    idEmpresa: number;
}

interface Props {
    categorias: Categoria[];
}

export default function CategoriasList({ categorias }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);

    const { data, setData, post, put, patch, processing, reset, errors } = useForm({
        nombreCategoria: '',
    });

    const filteredCategorias = useMemo(() => {
        return (categorias || []).filter((cat) =>
            cat.nombreCategoria.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [categorias, searchTerm]);

    const openCreateModal = () => {
        setEditingCategoria(null);
        setData('nombreCategoria', '');
        setIsModalOpen(true);
    };

    const openEditModal = (categoria: Categoria) => {
        setEditingCategoria(categoria);
        setData('nombreCategoria', categoria.nombreCategoria);
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategoria) {
            put(`/inventario/categorias/${editingCategoria.idCategoria}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/inventario/categorias', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const toggleEstado = (id: number) => {
        if (confirm('¿Estás seguro de cambiar el estado de esta categoría?')) {
            patch(`/inventario/categorias/${id}/estado`);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategoria(null);
        reset();
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Inventario / Categorías', href: '/inventario/categorias' }]}>
            <Head title="Categorías de Inventario" />

            {/* Contenedor Principal con color de texto explícito */}
            <div className="flex flex-1 flex-col gap-4 p-4 py-6 md:p-8 text-slate-900 dark:text-slate-100">
                
                {/* ENCABEZADO */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 dark:border-slate-800">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
                            <Folder className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            Gestión de Categorías
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Organiza tus ítems por categorías para un mejor control.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar categoría..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            <Plus className="h-4 w-4" />
                            Nueva Categoría
                        </button>
                    </div>
                </div>

                {/* LISTADO */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {filteredCategorias.length > 0 ? (
                        filteredCategorias.map((categoria) => (
                            <div 
                                key={categoria.idCategoria}
                                className={`p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between transition-all ${
                                    !categoria.estadoCategoria ? 'opacity-60 grayscale border-slate-200 dark:border-slate-800' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${categoria.estadoCategoria ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                        <Folder className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">{categoria.nombreCategoria}</p>
                                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                                            categoria.estadoCategoria ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                                        }`}>
                                            {categoria.estadoCategoria ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => openEditModal(categoria)}
                                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button 
                                        onClick={() => toggleEstado(categoria.idCategoria)}
                                        className={`p-2 rounded-lg transition-colors ${
                                            categoria.estadoCategoria 
                                            ? 'text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' 
                                            : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                        }`}
                                    >
                                        {categoria.estadoCategoria ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                            <AlertCircle className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                            <p className="text-slate-500 italic text-sm">No se encontraron categorías.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL CORREGIDO */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border dark:border-slate-800">
                        <div className="flex items-center justify-between p-4 border-b dark:border-slate-800">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
                            </h2>
                            <button onClick={closeModal} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold mb-1.5 block text-slate-700 dark:text-slate-300">
                                        Nombre de la Categoría
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nombreCategoria}
                                        onChange={(e) => setData('nombreCategoria', e.target.value)}
                                        className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                                            errors.nombreCategoria ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                                        }`}
                                        placeholder="Ej: Repuestos, Herramientas..."
                                        autoFocus
                                    />
                                    {errors.nombreCategoria && (
                                        <p className="text-red-500 text-xs mt-1 font-medium">{errors.nombreCategoria}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-indigo-600 text-white px-6 py-2 text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md"
                                >
                                    {processing ? 'Guardando...' : editingCategoria ? 'Actualizar' : 'Crear Categoría'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppSidebarLayout>
    );
}