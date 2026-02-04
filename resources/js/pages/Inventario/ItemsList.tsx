import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState, useMemo, useRef } from 'react';
import { 
    Plus, Search, Edit2, Power, PowerOff, 
    Package, X, Tag, Image as ImageIcon,
    AlertTriangle, BarChart3, DollarSign, ClipboardList
} from 'lucide-react';

interface Categoria {
    idCategoria: number;
    nombreCategoria: string;
}

interface ItemImagen {
    idImagenItem: number;
    rutaImagenItem: string;
    ordenImagenItem: number;
}

interface Item {
    idItem: number;
    codigoItem: string;
    nombreItem: string;
    descripcionItem?: string;
    estadoItem: boolean;
    cantidadItem: number;
    cantidadMinItem: number;
    precioVentaItem: number; // AÑADIDO
    idCategoria: number;
    idEmpresa: number;
    categoria?: Categoria;
    imagenes?: ItemImagen[];
}

interface Props {
    items: Item[];
    categorias: Categoria[];
    auth: { user: { idEmpresa: number } };
}

export default function ItemsList({ items, categorias, auth }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        codigoItem: '',
        nombreItem: '',
        descripcionItem: '',
        idCategoria: '',
        cantidadItem: 0,
        cantidadMinItem: 0,
        precioVentaItem: 0, // AÑADIDO
        imagen: null as File | null,
    });

    const filteredItems = useMemo(() => {
        return (items || []).filter((item) =>
            item.nombreItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.codigoItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.categoria?.nombreCategoria.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [items, searchTerm]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('imagen', file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const openCreateModal = () => {
        setEditingItem(null);
        setImagePreview(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (item: Item) => {
        setEditingItem(item);
        setData({
            codigoItem: item.codigoItem,
            nombreItem: item.nombreItem,
            descripcionItem: item.descripcionItem || '',
            idCategoria: item.idCategoria.toString(),
            cantidadItem: item.cantidadItem,
            cantidadMinItem: item.cantidadMinItem,
            precioVentaItem: item.precioVentaItem, // AÑADIDO
            imagen: null,
        });
        setImagePreview(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setImagePreview(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            post(`/inventario/items/${editingItem.idItem}`, {
                forceFormData: true,
                onBefore: () => {
                    // @ts-ignore
                    data._method = 'PUT';
                },
                onSuccess: () => closeModal(),
            });
        } else {
            post('/inventario/items', {
                forceFormData: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    const toggleEstado = (id: number) => {
        if (confirm('¿Deseas cambiar el estado?')) router.patch(`/inventario/items/${id}/estado`);
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Inventario / Productos', href: '/inventario/items' }]}>
            <Head title="Gestión de Productos" />

            <div className="flex flex-1 flex-col gap-4 p-4 py-6 md:p-8 text-slate-900 dark:text-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 dark:border-slate-800">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Package className="h-6 w-6 text-indigo-600" /> Gestión de Productos
                    </h1>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text" placeholder="Buscar..." value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <button onClick={openCreateModal} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm">
                            <Plus className="h-4 w-4" /> Nuevo Producto
                        </button>
                    </div>
                </div>

                <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-b dark:border-slate-800">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Imagen</th>
                                <th className="px-4 py-3 font-semibold">Código e Item</th>
                                <th className="px-4 py-3 font-semibold">Categoría</th>
                                <th className="px-4 py-3 font-semibold text-center">Precio</th>
                                <th className="px-4 py-3 font-semibold text-center">Stock</th>
                                <th className="px-4 py-3 font-semibold">Estado</th>
                                <th className="px-4 py-3 text-right font-semibold">Ver Kardex</th>
                                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-slate-800">
                            {filteredItems.map((item) => {
                                const esStockBajo = item.cantidadItem <= item.cantidadMinItem;
                                return (
                                    <tr key={item.idItem} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${!item.estadoItem ? 'opacity-60 grayscale' : ''}`}>
                                        <td className="px-4 py-4">
                                            <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden border dark:border-slate-700">
                                                {item.imagenes && item.imagenes.length > 0 ? (
                                                    <img src={`/storage/${item.imagenes[0].rutaImagenItem}`} className="h-full w-full object-cover" alt={item.nombreItem} />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-slate-400"><ImageIcon className="h-6 w-6" /></div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase text-emerald-500">#{item.codigoItem}</span>
                                                <span className="font-bold">{item.nombreItem}</span>
                                                {item.descripcionItem && <span className="text-xs text-slate-500 line-clamp-1">{item.descripcionItem}</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-100 dark:border-indigo-800">
                                                <Tag className="h-3 w-3" /> {item.categoria?.nombreCategoria}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="font-bold text-slate-700 dark:text-slate-200">
                                                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(item.precioVentaItem)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className={`inline-flex flex-col items-center justify-center min-w-[60px] p-1 rounded-lg border ${
                                                esStockBajo 
                                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' 
                                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                            }`}>
                                                <span className="text-lg font-bold leading-none">{item.cantidadItem}</span>
                                                {esStockBajo && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        <span className="text-[10px] font-bold tracking-tighter uppercase">Bajo</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${item.estadoItem ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
                                                {item.estadoItem ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                {/* BOTON KARDEX */}
                                                <Link 
                                                    href={`/reporte/reportekardexitem/${item.idItem}`}
                                                    className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                                    title="Ver Kardex Valorizado"
                                                >
                                                    <ClipboardList className="h-4 w-4" />
                                                </Link>
                                                
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                {/* BOTON EDITAR */}
                                                <button onClick={() => openEditModal(item)} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 className="h-4 w-4" /></button>
                                                {/* BOTON APAGAR */}
                                                <button onClick={() => toggleEstado(item.idItem)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100">{item.estadoItem ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl my-auto border dark:border-slate-800 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                            <h2 className="text-lg font-bold">{editingItem ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><X className="h-5 w-5" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Columna Imagen */}
                                <div className="flex flex-col items-center gap-4">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest self-start">Imagen Principal</label>
                                    <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 overflow-hidden relative group">
                                        {imagePreview ? (
                                            <img src={imagePreview} className="h-full w-full object-cover" alt="Preview" />
                                        ) : editingItem && editingItem.imagenes && editingItem.imagenes.length > 0 ? (
                                            <img src={`/storage/${editingItem.imagenes[0].rutaImagenItem}`} className="h-full w-full object-cover" alt="Actual" />
                                        ) : (
                                            <div className="text-center p-4">
                                                <ImageIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Subir Foto</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">Cambiar</div>
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                                    {errors.imagen && <p className="text-red-500 text-[10px] font-bold">{errors.imagen}</p>}
                                </div>

                                {/* Columna Datos */}
                                <div className="md:col-span-2 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-1">
                                            <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Código</label>
                                            <input type="text" value={data.codigoItem} onChange={(e) => setData('codigoItem', e.target.value)} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                                            {errors.codigoItem && <p className="text-red-500 text-xs mt-1">{errors.codigoItem}</p>}
                                        </div>
                                        <div className="col-span-1">
                                            <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Categoría</label>
                                            <select 
                                                value={data.idCategoria} 
                                                onChange={(e) => setData('idCategoria', e.target.value)} 
                                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="">Seleccionar...</option>
                                                {categorias.map(cat => (
                                                    <option key={cat.idCategoria} value={cat.idCategoria}>{cat.nombreCategoria}</option>
                                                ))}
                                            </select>
                                            {errors.idCategoria && <p className="text-red-500 text-xs mt-1">{errors.idCategoria}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Nombre del Producto</label>
                                        <input type="text" value={data.nombreItem} onChange={(e) => setData('nombreItem', e.target.value)} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                                        {errors.nombreItem && <p className="text-red-500 text-xs mt-1">{errors.nombreItem}</p>}
                                    </div>

                                    {/* SECCIÓN DE PRECIO Y STOCK */}
                                    <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-700">
                                        <div className="col-span-1">
                                            <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block flex items-center gap-1">
                                                <DollarSign className="h-3 w-3 text-emerald-500" /> Precio Venta
                                            </label>
                                            <input 
                                                type="number" 
                                                value={data.precioVentaItem} 
                                                onChange={(e) => setData('precioVentaItem', parseFloat(e.target.value) || 0)} 
                                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                                            />
                                            {errors.precioVentaItem && <p className="text-red-500 text-[10px]">{errors.precioVentaItem}</p>}
                                        </div>
                                        <div className="col-span-1">
                                            <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block flex items-center gap-1">
                                                <BarChart3 className="h-3 w-3 text-indigo-500" /> Stock
                                            </label>
                                            <input 
                                                type="number" 
                                                value={data.cantidadItem} 
                                                onChange={(e) => setData('cantidadItem', parseInt(e.target.value) || 0)} 
                                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block flex items-center gap-1">
                                                <AlertTriangle className="h-3 w-3 text-amber-500" /> Mínimo
                                            </label>
                                            <input 
                                                type="number" 
                                                value={data.cantidadMinItem} 
                                                onChange={(e) => setData('cantidadMinItem', parseInt(e.target.value) || 0)} 
                                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Descripción</label>
                                        <textarea 
                                            value={data.descripcionItem} 
                                            onChange={(e) => setData('descripcionItem', e.target.value)} 
                                            rows={2}
                                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3 justify-end border-t dark:border-slate-800 pt-6">
                                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancelar</button>
                                <button type="submit" disabled={processing} className="bg-indigo-600 text-white px-8 py-2.5 text-sm font-black rounded-xl hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-200 dark:shadow-none transition-all">
                                    {processing ? 'Guardando...' : editingItem ? 'Actualizar Producto' : 'Crear Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppSidebarLayout>
    );
}