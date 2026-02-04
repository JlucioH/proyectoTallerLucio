import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { 
    Plus, Search, Edit2, Power, PowerOff, UserCircle,
    Users, AlertCircle, X, Phone, Mail, FileText, Copy
} from 'lucide-react';

interface Cliente {
    idCliente: number;
    codigoCliente: string | null;
    razonSocialCliente: string;
    telefonoCliente?: string;
    celularCliente?: string;
    correoCliente?: string;
    nitFacturaCliente?: string;
    razonSocialFacturaCliente?: string;
    estadoCliente: boolean;
    idEmpresa: number;
}

interface Props {
    clientes: Cliente[];
}

export default function ClientesList({ clientes }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState<'todos' | 'activos' | 'inactivos'>('todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

    const { data, setData, post, put, patch, processing, reset, errors, clearErrors } = useForm({
        codigoCliente: '',
        razonSocialCliente: '',
        telefonoCliente: '',
        celularCliente: '',
        correoCliente: '',
        nitFacturaCliente: '',
        razonSocialFacturaCliente: '',
    });

    // CUADRO BUSQUEDA 
    const filteredClientes = useMemo(() => {
        return (clientes || []).filter((c) => {
            const searchRes = searchTerm.toLowerCase();
            
            const matchesSearch = 
                c.razonSocialCliente.toLowerCase().includes(searchRes) ||  //RAZON SOCIAL
                (c.codigoCliente?.toLowerCase() || '').includes(searchRes) ||  //CODIGO CLIENTE
                (c.nitFacturaCliente?.toLowerCase() || '').includes(searchRes); // NIT
            
            const matchesFilter = 
                filterEstado === 'todos' ? true :
                filterEstado === 'activos' ? c.estadoCliente === true :
                c.estadoCliente === false;

            return matchesSearch && matchesFilter;
        });
    }, [clientes, searchTerm, filterEstado]);

    const openCreateModal = () => {
        setEditingCliente(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (cliente: Cliente) => {
        setEditingCliente(cliente);
        clearErrors();
        setData({
            codigoCliente: cliente.codigoCliente || '',
            razonSocialCliente: cliente.razonSocialCliente,
            telefonoCliente: cliente.telefonoCliente || '',
            celularCliente: cliente.celularCliente || '',
            correoCliente: cliente.correoCliente || '',
            nitFacturaCliente: cliente.nitFacturaCliente || '',
            razonSocialFacturaCliente: cliente.razonSocialFacturaCliente || '',
        });
        setIsModalOpen(true);
    };

    const copiarRazonSocial = () => {
        setData('razonSocialFacturaCliente', data.razonSocialCliente);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCliente) {
            put(`/ventas/clientes/${editingCliente.idCliente}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/ventas/clientes', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const toggleEstado = (id: number) => {
        if (confirm('¿Desea cambiar el estado de este cliente?')) {
            patch(`/ventas/clientes/${id}/estado`);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCliente(null);
        reset();
        clearErrors();
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Ventas / Clientes', href: '/ventas/clientes' }]}>
            <Head title="Clientes" />

            <div className="flex flex-1 flex-col gap-4 p-4 py-6 md:p-8 text-slate-900 dark:text-slate-100">
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-6 dark:border-slate-800">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <UserCircle className="h-6 w-6 text-indigo-600" /> Clientes
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">Administra los clientes de tu empresa</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text" placeholder="Buscar por Nombre, Código o NIT..."
                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border dark:border-slate-700">
                            {(['todos', 'activos', 'inactivos'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilterEstado(f)}
                                    className={`px-3 py-1 text-[11px] font-black uppercase rounded-md transition-all ${
                                        filterEstado === f 
                                        ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' 
                                        : 'text-slate-500'
                                    }`}
                                >
                                    {f === 'todos' ? 'Ver Todo' : f === 'activos' ? 'Activos' : 'Inactivos'}
                                </button>
                            ))}
                        </div>

                        <button onClick={openCreateModal} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition-all">
                            <Plus className="h-4 w-4" /> Nuevo Cliente
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                    {filteredClientes.length > 0 ? (
                        filteredClientes.map((cliente) => (
                            <div key={cliente.idCliente} className={`p-5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 transition-all ${!cliente.estadoCliente && 'opacity-60 grayscale'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 dark:border-indigo-800">
                                            {cliente.razonSocialCliente.charAt(0)}
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                                {cliente.codigoCliente ? `#${cliente.codigoCliente}` : 'S/C'}
                                            </span>
                                            <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{cliente.razonSocialCliente}</h3>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => openEditModal(cliente)} className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => toggleEstado(cliente.idCliente)} className={`p-2 rounded-lg transition-colors ${cliente.estadoCliente ? 'text-slate-400 hover:text-red-600' : 'text-slate-400 hover:text-emerald-600'}`}>
                                            {cliente.estadoCliente ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 border-t pt-3 mt-3">
                                    <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {cliente.celularCliente || 'Sin celular'}</div>
                                    <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {cliente.correoCliente || 'Sin correo'}</div>
                                    {cliente.nitFacturaCliente && (
                                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/30 p-1.5 rounded-md mt-1">
                                            <FileText className="h-3.5 w-3.5" /> NIT: {cliente.nitFacturaCliente}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                            <AlertCircle className="h-12 w-12 text-slate-300 mb-2" />
                            <p className="text-slate-500 font-medium">No se encontraron clientes.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border dark:border-slate-800">
                        <div className="flex items-center justify-between p-5 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                            <h2 className="text-lg font-bold">{editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 max-h-[85vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Razón Social / Nombre</label>
                                    <input type="text" value={data.razonSocialCliente} onChange={e => setData('razonSocialCliente', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" required />
                                    {errors.razonSocialCliente && <p className="text-red-500 text-[10px] font-bold">{errors.razonSocialCliente}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Código (Opcional)</label>
                                    <input type="text" value={data.codigoCliente} onChange={e => setData('codigoCliente', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
                                    {errors.codigoCliente && <p className="text-red-500 text-[10px] font-bold">{errors.codigoCliente}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Correo</label>
                                    <input type="email" value={data.correoCliente} onChange={e => setData('correoCliente', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
                                    {errors.correoCliente && <p className="text-red-500 text-[10px] font-bold">{errors.correoCliente}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Celular</label>
                                    <input type="number" 
                                                step="1" 
                                                min="0" value={data.celularCliente} onChange={e => setData('celularCliente', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Teléfono</label>
                                    <input type="number" 
                                                step="1" 
                                                min="0" value={data.telefonoCliente} onChange={e => setData('telefonoCliente', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>

                                {/* SECCIÓN DE FACTURACIÓN */}
                                <div className="col-span-2 mt-4 pt-4 border-t dark:border-slate-800">
                                    <h3 className="text-[11px] font-black uppercase text-indigo-600 mb-3 flex items-center gap-2">
                                        <FileText className="h-3 w-3" /> Datos de Facturación
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black uppercase text-slate-500">Razón Social</label>
                                                <button 
                                                    type="button" 
                                                    onClick={copiarRazonSocial}
                                                    className="flex items-center gap-1 text-[9px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase"
                                                >
                                                    <Copy className="h-2.5 w-2.5" /> Copiar Principal
                                                </button>
                                            </div>
                                            <input type="text" value={data.razonSocialFacturaCliente} onChange={e => setData('razonSocialFacturaCliente', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-500">NIT / CI Factura</label>
                                            <input  
                                                type="number" 
                                                step="1" 
                                                min="0"
                                                value={data.nitFacturaCliente} onChange={e => setData('nitFacturaCliente', e.target.value)} 
                                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                        
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3 justify-end">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancelar</button>
                                <button type="submit" disabled={processing} className="bg-indigo-600 text-white px-6 py-2 text-sm font-bold rounded-lg hover:bg-indigo-700 shadow-md transition-all active:scale-95 disabled:opacity-50">
                                    {processing ? 'Guardando...' : 'Guardar Cliente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppSidebarLayout>
    );
}