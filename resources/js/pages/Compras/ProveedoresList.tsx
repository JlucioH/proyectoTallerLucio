import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { 
    Plus, Search, Edit2, Power, PowerOff, 
    Truck, AlertCircle, X, Phone, Mail, FileText, Copy
} from 'lucide-react';

interface Proveedor {
    idProveedor: number;
    codigoProveedor: string | null;
    nombreProveedor: string;
    direccionProveedor?: string;
    telefonoProveedor?: string;
    celularProveedor?: string;
    correoProveedor?: string;
    nitProveedor?: string;
    estadoProveedor: boolean;
    idEmpresa: number;
}

interface Props {
    proveedores: Proveedor[];
}

export default function ProveedoresList({ proveedores }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState<'todos' | 'activos' | 'inactivos'>('todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);

    const { data, setData, post, put, patch, processing, reset, errors, clearErrors } = useForm({
        codigoProveedor: '',
        nombreProveedor: '',
        direccionProveedor: '',
        telefonoProveedor: '',
        celularProveedor: '',
        correoProveedor: '',
        nitProveedor: '',
    });

    // CUADRO BUSQUEDA 
    const filteredProveedores = useMemo(() => {
        return (proveedores || []).filter((p) => {
            const searchRes = searchTerm.toLowerCase();
            
            const matchesSearch = 
                p.nombreProveedor.toLowerCase().includes(searchRes) || 
                (p.codigoProveedor?.toLowerCase() || '').includes(searchRes) || 
                (p.nitProveedor?.toLowerCase() || '').includes(searchRes); 
            
            const matchesFilter = 
                filterEstado === 'todos' ? true :
                filterEstado === 'activos' ? p.estadoProveedor === true :
                p.estadoProveedor === false;

            return matchesSearch && matchesFilter;
        });
    }, [proveedores, searchTerm, filterEstado]);

    const openCreateModal = () => {
        setEditingProveedor(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (proveedor: Proveedor) => {
        setEditingProveedor(proveedor);
        clearErrors();
        setData({
            codigoProveedor: proveedor.codigoProveedor || '',
            nombreProveedor: proveedor.nombreProveedor,
            direccionProveedor: proveedor.direccionProveedor || '',
            telefonoProveedor: proveedor.telefonoProveedor || '',
            celularProveedor: proveedor.celularProveedor || '',
            correoProveedor: proveedor.correoProveedor || '',
            nitProveedor: proveedor.nitProveedor || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProveedor) {
            put(`/compras/proveedores/${editingProveedor.idProveedor}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/compras/proveedores', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const toggleEstado = (id: number) => {
        if (confirm('¿Desea cambiar el estado de este proveedor?')) {
            patch(`/compras/proveedores/${id}/estado`);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProveedor(null);
        reset();
        clearErrors();
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Compras / Proveedores', href: '/compras/proveedores' }]}>
            <Head title="Proveedores" />

            <div className="flex flex-1 flex-col gap-4 p-4 py-6 md:p-8 text-slate-900 dark:text-slate-100">
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-6 dark:border-slate-800">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Truck className="h-6 w-6 text-emerald-600" /> Proveedores
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">Administra los proveedores de suministros</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text" placeholder="Buscar proveedor..."
                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border dark:border-slate-700">
                            {(['todos', 'activos', 'inactivos'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilterEstado(f)}
                                    className={`px-3 py-1 text-[11px] font-black uppercase rounded-md transition-all ${
                                        filterEstado === f 
                                        ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600' 
                                        : 'text-slate-500'
                                    }`}
                                >
                                    {f === 'todos' ? 'Ver Todo' : f === 'activos' ? 'Activos' : 'Inactivos'}
                                </button>
                            ))}
                        </div>

                        <button onClick={openCreateModal} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm transition-all">
                            <Plus className="h-4 w-4" /> Nuevo Proveedor
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                    {filteredProveedores.length > 0 ? (
                        filteredProveedores.map((p) => (
                            <div key={p.idProveedor} className={`p-5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 transition-all ${!p.estadoProveedor && 'opacity-60 grayscale'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold border border-emerald-100 dark:border-emerald-800">
                                            {p.nombreProveedor.charAt(0)}
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                                {p.codigoProveedor ? `#${p.codigoProveedor}` : 'S/C'}
                                            </span>
                                            <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{p.nombreProveedor}</h3>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => openEditModal(p)} className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors">
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => toggleEstado(p.idProveedor)} className={`p-2 rounded-lg transition-colors ${p.estadoProveedor ? 'text-slate-400 hover:text-red-600' : 'text-slate-400 hover:text-emerald-600'}`}>
                                            {p.estadoProveedor ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 border-t pt-3 mt-3">
                                    <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {p.celularProveedor || 'Sin celular'}</div>
                                    <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {p.correoProveedor || 'Sin correo'}</div>
                                    <div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5" /> {p.nitProveedor || 'Sin NIT'}</div>
                                    <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {p.direccionProveedor || 'Sin dirección'}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                            <AlertCircle className="h-12 w-12 text-slate-300 mb-2" />
                            <p className="text-slate-500 font-medium">No se encontraron proveedores.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border dark:border-slate-800">
                        <div className="flex items-center justify-between p-5 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                            <h2 className="text-lg font-bold">{editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 max-h-[85vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Nombre Proveedor</label>
                                    <input type="text" value={data.nombreProveedor} onChange={e => setData('nombreProveedor', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 outline-none focus:ring-2 focus:ring-emerald-500" required />
                                    {errors.nombreProveedor && <p className="text-red-500 text-[10px] font-bold">{errors.nombreProveedor}</p>}
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Dirección Proveedor</label>
                                    <input type="text" value={data.direccionProveedor} onChange={e => setData('direccionProveedor', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"/>
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Correo</label>
                                    <input type="email" value={data.correoProveedor} onChange={e => setData('correoProveedor', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Código (Opcional)</label>
                                    <input type="text" value={data.codigoProveedor} onChange={e => setData('codigoProveedor', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
                                    {errors.codigoProveedor && <p className="text-red-500 text-[10px] font-bold">{errors.codigoProveedor}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500">NIT / CI Proveedor</label>
                                    <input type="text" value={data.nitProveedor} onChange={e => setData('nitProveedor', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Celular</label>
                                    <input type="text" value={data.celularProveedor} onChange={e => setData('celularProveedor', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Teléfono</label>
                                    <input type="text" value={data.telefonoProveedor} onChange={e => setData('telefonoProveedor', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
                                </div>
                                
                            </div>

                            <div className="mt-8 flex gap-3 justify-end">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancelar</button>
                                <button type="submit" disabled={processing} className="bg-emerald-600 text-white px-6 py-2 text-sm font-bold rounded-lg hover:bg-emerald-700 shadow-md transition-all active:scale-95 disabled:opacity-50">
                                    {processing ? 'Guardando...' : editingProveedor ? 'Actualizar' : 'Crear Proveedor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppSidebarLayout>
    );
}