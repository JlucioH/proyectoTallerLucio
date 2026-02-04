import { Link, Head } from '@inertiajs/react';
import { LayoutGrid, ShoppingCart, Store, Search, X, Info, Package } from 'lucide-react';
import { useState } from 'react';

// --- INTERFACES ---
interface Categoria {
    nombreCategoria: string;
}

interface Item {
    idItem: number;
    codigoItem: string;
    nombreItem: string;
    descripcionItem: string; // Aseguramos que esté aquí
    cantidadItem: number;
    precioVentaItem: number; // AÑADIDO
    categoria?: { nombreCategoria: string };
    empresa?: { nombreEmpresa: string };
    imagenes?: { rutaImagenItem: string }[];
}

interface Props {
    categorias: Categoria[];
    items: Item[];
    categoriaActual?: string | null;
}

export default function PortalProductos({ categorias, items, categoriaActual }: Props) {
    const [busqueda, setBusqueda] = useState('');
    const [itemSeleccionado, setItemSeleccionado] = useState<Item | null>(null);

    const itemsFiltrados = items
        .filter(item => item.cantidadItem > 0)
        .filter(item => 
            item.nombreItem.toLowerCase().includes(busqueda.toLowerCase()) ||
            item.empresa?.nombreEmpresa.toLowerCase().includes(busqueda.toLowerCase()) ||
            item.codigoItem.toLowerCase().includes(busqueda.toLowerCase())
        );

    // Función para formatear precio
    const formatearPrecio = (precio: number) => {
        return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(precio);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
            <Head title="Catálogo de Productos" />
            
            {/* Navbar */}
            <nav className="bg-white dark:bg-slate-900 border-b p-4 sticky top-0 z-50 shadow-sm">
                <div className="w-full px-4 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <Link href="/catalogo" className="text-xl font-black flex items-center gap-2">
                        <LayoutGrid className="text-indigo-600" /> PORTAL
                    </Link>

                    <div className="relative w-full max-w-md group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            type="text"
                            placeholder="Buscar por nombre, código o empresa..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 bg-slate-100 dark:bg-slate-800 border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-sm transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <ShoppingCart className="h-6 w-6" />
                            <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">0</span>
                        </button>
                        <Link href="/login" className="text-sm font-bold text-indigo-600 hover:underline">Acceso</Link>
                    </div>
                </div>
            </nav>

            <div className="w-full flex flex-col md:flex-row gap-8 p-6 md:px-10">
                {/* Sidebar Categorías */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="sticky top-28">
                        <h3 className="font-black text-[10px] uppercase text-slate-400 mb-4 tracking-[0.2em]">Categorías</h3>
                        <nav className="space-y-1">
                            <Link href="/catalogo" className={`block px-4 py-2 rounded-lg text-sm font-bold ${!categoriaActual ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}>Todos</Link>
                            {categorias.map((cat, idx) => (
                                <Link key={idx} href={`/catalogo/categoria/${encodeURIComponent(cat.nombreCategoria)}`} className={`block px-4 py-2 rounded-lg text-sm font-medium ${categoriaActual === cat.nombreCategoria ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}>
                                    {cat.nombreCategoria}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Grid Productos */}
                <main className="flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {itemsFiltrados.map((item) => (
                            <div key={item.idItem} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden group flex flex-col shadow-sm">
                                <div className="aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                                    {item.imagenes?.[0] ? (
                                        <img src={`/storage/${item.imagenes[0].rutaImagenItem}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.nombreItem} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 italic text-xs">Sin imagen</div>
                                    )}
                                    <div className="absolute top-2 left-2 bg-black/70 text-white text-[9px] font-mono px-2 py-1 rounded">#{item.codigoItem}</div>
                                </div>

                                <div className="p-4 flex flex-col flex-1">
                                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-2 h-10 mb-2">{item.nombreItem}</h4>
                                    
                                    <div className="mb-4">
                                        <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                                            {formatearPrecio(item.precioVentaItem)}
                                        </span>
                                    </div>

                                    <div className="mt-auto space-y-2">
                                        <button 
                                            onClick={() => setItemSeleccionado(item)}
                                            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                                        >
                                            <Info className="h-4 w-4" /> Detalle
                                        </button>
                                        <button className="w-full bg-indigo-600 text-white py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 transition-shadow">
                                            <ShoppingCart className="h-4 w-4" /> Al carrito
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>

            {/* MODAL DE DETALLE */}
            {itemSeleccionado && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
                        <button 
                            onClick={() => setItemSeleccionado(null)}
                            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-red-500 text-slate-500 hover:text-white rounded-full transition-all"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {/* Imagen en Modal */}
                        <div className="w-full md:w-1/2 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            {itemSeleccionado.imagenes?.[0] ? (
                                <img src={`/storage/${itemSeleccionado.imagenes[0].rutaImagenItem}`} className="w-full h-full object-contain" alt={itemSeleccionado.nombreItem} />
                            ) : (
                                <Package className="h-20 w-20 text-slate-300" />
                            )}
                        </div>

                        {/* Info en Modal */}
                        <div className="w-full md:w-1/2 p-8 overflow-y-auto">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{itemSeleccionado.categoria?.nombreCategoria}</span>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2 leading-tight">{itemSeleccionado.nombreItem}</h2>
                            <p className="text-xs text-slate-400 mt-1 font-mono uppercase">Código: {itemSeleccionado.codigoItem}</p>
                            
                            <div className="my-6">
                                <span className="text-3xl font-black text-indigo-600">
                                    {formatearPrecio(itemSeleccionado.precioVentaItem)}
                                </span>
                                <p className="text-xs text-green-600 font-bold mt-1">Stock disponible: {itemSeleccionado.cantidadItem} unidades</p>
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                                <h3 className="text-xs font-black uppercase text-slate-500 mb-2">Descripción</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {itemSeleccionado.descripcionItem || 'Este producto no tiene una descripción detallada.'}
                                </p>
                            </div>

                            <div className="mt-8 flex gap-4">
                                <button className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all">
                                    <ShoppingCart className="h-5 w-5" /> AÑADIR AL CARRITO
                                </button>
                            </div>

                            <div className="mt-6 flex items-center gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                <Store className="h-5 w-5 text-indigo-500" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Vendido por</span>
                                    <span className="text-sm font-bold">{itemSeleccionado.empresa?.nombreEmpresa}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}