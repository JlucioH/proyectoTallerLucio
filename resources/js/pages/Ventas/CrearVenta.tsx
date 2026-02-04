import { Toaster, toast } from 'sonner';
import 'sonner/dist/styles.css';
import React, { useState, useRef, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { 
    Search, User, CreditCard, Plus, Trash2, ShoppingCart, FileText,
    Package, X, Loader2, Banknote, QrCode, Smartphone, ArrowRight,
    Hash, Receipt, Calculator, Tag, ChevronUp, Printer, Users, UserCircle
} from 'lucide-react';
import empresa from '@/routes/empresa';

// === CONFIGURACIÓN DE LA EMPRESA PARA EL TICKET ===
interface Empresa {
    nombreEmpresa: string;
    direccionEmpresa: string;
    telefonoEmpresa: string;
};

interface Cliente {
    idCliente: number;
    nitFacturaCliente?: string;
    razonSocialCliente: string;
    razonSocialFacturaCliente?: string;
    codigoCliente?: string;
}

interface Item {
    idItem: number;
    codigoItem: string;
    nombreItem: string;
    precioVentaItem: number;
    cantidadItem: number;
    rutaImagen?: string | null; 
    imagenItem?: string | null;
}

interface DetalleVenta extends Item {
    cantidadSeleccionada: number;
    subtotal: number;
}

export default function CrearVenta({ auth, empresa, items, clientes = [] }: { auth: any, empresa:Empresa, items: Item[], clientes: Cliente[] }) {
    // Estados de UI
    const [showModalProductos, setShowModalProductos] = useState(false);
    const [showModalClientes, setShowModalClientes] = useState(false);
    const [showCheckoutMobile, setShowCheckoutMobile] = useState(false);
    
    // Filtros
    const [filtroItem, setFiltroItem] = useState('');
    const [filtroCliente, setFiltroCliente] = useState('');
    
    // Lógica de Venta
    const [detalle, setDetalle] = useState<DetalleVenta[]>([]);
    const [itemSeleccionado, setItemSeleccionado] = useState<Item | null>(null);
    const [cantidadInput, setCantidadInput] = useState<string>('');
    const [pagoCon, setPagoCon] = useState<number | string>('');
    
    const inputCantidadRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, reset } = useForm({
        idCliente: null as number | null,
        razonSocialCliente: '',
        nitFacturaCliente: '',
        totalCambioVenta: 0,
        totalRecibidoVenta: 0,
        razonSocialFacturaCliente: '',
        metodoPago: 'Efectivo',
        items: [] as any[],
    });

    //ESTADOS PARA MODAL AÑADIR CLIENTE
    const [showModalNuevoClie, setShowModalNuevoClie] = useState(false);
    const [nuevoClie, setNuevoClie] = useState({codigoCliente:'',  razonSocialCliente: '',razonSocialFacturaCliente: '', nitFacturaCliente: '', direccionCliente: '', correoCliente: '', telefonoCliente: '', celularCliente: '' });
    const [enviandoClie, setEnviandoClie] = useState(false);
    
    // Función para guardar el Cliente 
    const guardarNuevoCliente = () => {
        if (!nuevoClie.razonSocialCliente) return toast.error("El nombre es obligatorio");
           
        setEnviandoClie(true);
            // Usamos el router de Inertia que ya incluye el Token CSRF automáticamente
        router.post('/clientes/guardar-rapido-cliente', {
            codigoCliente: nuevoClie.codigoCliente,
            razonSocialCliente: nuevoClie.razonSocialCliente,
            razonSocialFacturaCliente: nuevoClie.razonSocialFacturaCliente,
            nitFacturaCliente: nuevoClie.nitFacturaCliente,
            direccionCliente: nuevoClie.direccionCliente,
            correoCliente: nuevoClie.correoCliente,
            telefonoCliente: nuevoClie.telefonoCliente,
            celularCliente: nuevoClie.celularCliente,
        }, {
            onSuccess: (page) => {
                toast.success("Cliente registrado y seleccionado");
                setShowModalNuevoClie(false);
                setNuevoClie({ codigoCliente:'', razonSocialCliente: '', razonSocialFacturaCliente: '', nitFacturaCliente: '', direccionCliente: '', correoCliente: '', telefonoCliente:'' , celularCliente:'' });
                     // IMPORTANTE: Como el controlador hace un "return back()", 
                // los props de la página se actualizan. 
                // Buscamos el último proveedor creado para seleccionarlo:
                const lista = page.props.clientes as any[];
                if (lista && lista.length > 0) {
                    const ultimo = lista[lista.length - 1];
                    setData(d => ({ 
                        ...d, 
                        idCliente: ultimo.idCliente, 
                        codigoCliente: ultimo.codigoCliente ?? "", 
                        razonSocialCliente: ultimo.razonSocialCliente,
                        razonSocialFacturaCliente: ultimo.razonSocialFacturaCliente ?? "",
                        nitFacturaCliente: ultimo.nitFacturaCliente ?? "",
                        direccionCliente: ultimo.direccionCliente ?? "",
                        correoCliente: ultimo.correoCliente ?? "",
                        telefonoCliente: ultimo.telefonoCliente ?? "",
                        celularCliente: ultimo.celularCliente ?? "",
                    }));
                }
            },
            onError: () => toast.error("Error al validar datos"),
            onFinish: () => setEnviandoClie(false),
        });
    };

    // --- FUNCIÓN DE IMPRESIÓN ---

    

    const imprimirTicket = (nuevoIdVenta: any) => {
        const ventanImpresion = window.open('', '_blank', 'width=300,height=600');
        if (!ventanImpresion) return;

        const fechaActual =  new Date().toLocaleString('es-BO', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true
                        });
                        
        
        const filasTicket = detalle.map(d => `
            <tr style="font-size: 9px;">
                <td class="col-desc" style="vertical-align: top;">${d.nombreItem}</td>
                <td class="col-cant" style="vertical-align: top;">${d.cantidadSeleccionada}</td>
                <td class="col-pu"   style="vertical-align: top;">${Number(d.precioVentaItem).toFixed(2)}</td>
                <td class="col-sub"  style="vertical-align: top;">${Number(d.subtotal).toFixed(2)}</td>
            </tr>
        `).join('');

        ventanImpresion.document.write(`
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; width: 80mm; font-size: 9px; margin: 0; padding: 5px; color: #000; }
                        .text-center { text-align: center; }
                        .text-right { text-align: right; }
                        .divider { border-bottom: 1px solid #000; margin: 1px 0; width: 100%;}
                        .bold { font-weight: bold; }
                        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                        .col-desc { 
                            width: auto; /* Toma el espacio restante */
                            word-wrap: break-word; 
                            white-space: normal; 
                            padding-right: 5px;
                            text-align: left;
                        }
                        .col-cant { width: 40px; text-align: center; }
                        .col-pu   { width: 40px; text-align: right; }
                        .col-sub  { width: 40px; text-align: right; }
                        th { border-bottom: 1px solid #000; }
                    </style>
                </head>
                <body>
                    <div class="text-center">
                        <div class="bold" style="font-size: 13px;">${empresa.nombreEmpresa}</div>
                        <div>Telefono: ${empresa.telefonoEmpresa}</div>
                        <div>${empresa.direccionEmpresa}</div>
                    </div>
                    <div class="divider"></div>
                    <div class="bold text-center">COMPROBANTE DE VENTA #${String(nuevoIdVenta)}</div>
                    <div class="divider"></div>
                    <div>FECHA: ${fechaActual}</div>
                    <div>CLIENTE: ${data.razonSocialFacturaCliente || 'S/N'}</div>
                    <div>NIT/CI: ${data.nitFacturaCliente || '0'}</div>
                    <div class="divider"></div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 9px; font-family: Arial, sans-serif;">
                        <thead>
                            <tr style="border-bottom: 1px solid #000;">
                                <th class="col-desc">Descripción</th>
                                <th class="col-cant">Cant.</th>
                                <th class="col-pu">P.U.</th>
                                <th class="col-sub">Sub. T</th>
                            </tr>
                        </thead>
                        <tbody>${filasTicket}</tbody>
                    </table>
                    <div class="divider"></div>
                    <div class="text-right bold" style="font-size: 9px;">
                        TOTAL: ${totalGeneral.toFixed(2)} BS
                    </div>
                    <div class="text-right">
                        RECIBIDO: ${Number(pagoCon || 0).toFixed(2)} BS
                    </div>
                    <div class="text-right">
                        CAMBIO: ${cambio.toFixed(2)} BS
                    </div>
                    <div class="divider"></div>
                    <div class="text-center">¡GRACIAS POR SU COMPRA!</div>
                </body>
            </html>
        `);

        ventanImpresion.document.close();
        ventanImpresion.focus();
        setTimeout(() => {
            ventanImpresion.print();
            ventanImpresion.close();
        }, 250);
    };
    // Filtrado para modales ITEM
    const itemsFiltrados = items.filter(i => 
        i.nombreItem.toLowerCase().includes(filtroItem.toLowerCase()) || 
        i.codigoItem.toLowerCase().includes(filtroItem.toLowerCase())
    );
    // --- ATAJOS DE TECLADO ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F1') { e.preventDefault(); setShowModalProductos(true); }
            if (e.key === 'F9' && detalle.length > 0 && !processing) {
                e.preventDefault();
                handleSubmit();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [detalle, processing, data]); // Añadido data a dependencias

    // --- LÓGICA DE CLIENTES ---
    const clientesFiltrados = clientes.filter(c => {
        // Convertimos todo a minúsculas una sola vez para mejorar rendimiento
        const busqueda = filtroCliente.toLowerCase();
        
        // Usamos cortocircuito (|| '') para evitar que null rompa el código
        const nombreCliente = (c.razonSocialCliente || '').toLowerCase();
        const nombreFactura = (c.razonSocialFacturaCliente || '').toLowerCase();
        const nit = (c.nitFacturaCliente || '').toLowerCase();
        const codigo = (c.codigoCliente || '').toLowerCase();

        return nombreCliente.includes(busqueda) || 
            nit.includes(busqueda) || 
            codigo.includes(busqueda);
    });

    const seleccionarCliente = (cliente: Cliente) => {
        setData(d => ({
            ...d,
            idCliente: cliente.idCliente,
            nitFacturaCliente: cliente.nitFacturaCliente || '0', // Si es null, pone 0
            razonSocialFacturaCliente: cliente.razonSocialFacturaCliente || 'S/N' // Si es null, pone S/N
        }));
        setShowModalClientes(false);
    };

    // --- LÓGICA DE PRODUCTOS ---
    const agregarAlDetalle = () => {
        const cant = parseInt(cantidadInput);
        if (!itemSeleccionado || isNaN(cant) || cant <= 0) return;
        const precio = Number(itemSeleccionado.precioVentaItem);
        
        const existeIndex = detalle.findIndex(d => d.idItem === itemSeleccionado.idItem);
        if (existeIndex !== -1) {
            const nuevoDetalle = [...detalle];
            nuevoDetalle[existeIndex].cantidadSeleccionada += cant;
            nuevoDetalle[existeIndex].subtotal = nuevoDetalle[existeIndex].cantidadSeleccionada * precio;
            setDetalle(nuevoDetalle);
        } else {
            setDetalle([...detalle, { 
                ...itemSeleccionado, 
                cantidadSeleccionada: cant, 
                subtotal: cant * precio 
            }]);
        }
        setItemSeleccionado(null);
        setCantidadInput('');
    };

    const totalGeneral = detalle.reduce((acc, fila) => acc + Number(fila.subtotal), 0);
    const cambio = pagoCon ? (Number(pagoCon) - totalGeneral) : 0;
    //GUARDAR VENTAS LUCIO
    const handleSubmit = () => {
        post('/ventas/guardar', {
            onBefore: () => { 
                data.items = detalle.map(d => ({ 
                    idItem: d.idItem, 
                    cantidad: d.cantidadSeleccionada,
                    precio: d.precioVentaItem 
                })) 
            },
            onSuccess: (page: any) => {
                // Capturamos el idVenta de la tabla ventas
                const idGenerado = page.props.flash?.success?.idVenta;
                
                console.log("ID recuperado para el ticket:", idGenerado);

                // 1. Imprimir Ticket
                imprimirTicket(idGenerado);

                // 2. Notificación de éxito (Usando el mensaje que viene de Laravel)
                toast.success('Venta completada', {
                    description: `Se generó el comprobante #${idGenerado}`,
                });

                // 3. Limpieza de interfaz
                setDetalle([]);
                reset();
                setPagoCon('');
                setShowCheckoutMobile(false);
            },
            onError: (errors: any) => {
                if (errors.error) {
                    toast.error('Sin Stock Disponible', {
                        description: errors.error, // Aquí aparecerá "Stock insuficiente para:..."
                        duration: 5000,
                        style: {
                            padding: '16px',
                        },
                    });
                } else {
                    toast.error('Error en el formulario', {
                        description: 'Verifica los datos del cliente o los productos.'
                    });
                }
            }
        });
    };

    return (
        <AppSidebarLayout>
            <Toaster 
                position="bottom-center" 
                richColors 
                theme="system" // detecta automáticamente el modo del navegador
                closeButton 
                toastOptions={{
                    // el z-index sea siempre alto NOTIFICACION
                    style: { zIndex: 10000 }, 
                }}
            />
            <Head title="Nueva Venta" />
            
            <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-[#F4F7FA] dark:bg-zinc-950">
                
                {/* ÁREA IZQUIERDA: CLIENTE Y PRODUCTOS */}
                <div className="flex-1 flex flex-col p-4 lg:p-6 space-y-4 overflow-y-auto">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <ShoppingCart className="h-6 w-6 text-indigo-600" /> Nueva Venta
                    </h1>
                    {/* BUSCADOR DE CLIENTE (Inputs editables) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-5 flex gap-3">
                            <div className="flex-1 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <label className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase mb-1">
                                    <Hash className="w-3 h-3" /> NIT / CI
                                </label>
                                <input 
                                    type="text" className="w-full border-none p-0 bg-transparent text-zinc-800 dark:text-zinc-100 font-bold focus:ring-0"
                                    value={data.nitFacturaCliente} onChange={e => setData('nitFacturaCliente', e.target.value)} 
                                />
                            </div>

                            {/*BOTON AÑADIR CLIENTE*/}

                            <button 
                                type="button"
                                onClick={() => setShowModalNuevoClie(true)} // Ahora abre el modal
                                className=" bg-indigo-600 text-white px-4 rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/10 group"
                            >
                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                <UserCircle className="w-5 h-5" />
                            </button>


                            <button 
                                onClick={() => setShowModalClientes(true)}
                                className="bg-indigo-600 dark:bg-indigo-600 text-white px-4 rounded-2xl hover:bg-indigo-600 transition-colors shadow-sm"
                            >
                                <UserCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="md:col-span-4">
                            <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <label className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase mb-1">
                                    <User className="w-3 h-3" /> Razón Social
                                </label>
                                <input 
                                    type="text" className="w-full border-none p-0 bg-transparent text-zinc-800 dark:text-zinc-100 font-bold focus:ring-0"
                                    value={data.razonSocialFacturaCliente} onChange={e => setData('razonSocialFacturaCliente', e.target.value)} 
                                />
                            </div>
                        </div>

                        <button 
                            onClick={() => setShowModalProductos(true)}
                            className="md:col-span-3 bg-indigo-600 text-white rounded-2xl p-4 flex items-center justify-between hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all"
                        >
                            <div className="text-left overflow-hidden">
                                <p className="text-[10px] font-bold text-indigo-200 uppercase">F1 Buscar Producto</p>
                                <p className="font-bold truncate">{itemSeleccionado ? itemSeleccionado.nombreItem : 'Seleccionar Item'}</p>
                            </div>
                            <Search className="w-5 h-5" />
                        </button>
                    </div>

                    {/* CARGA DE CANTIDAD */}
                    {itemSeleccionado && (
                        <div className="bg-emerald-500/10 border-2 border-emerald-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 animate-in slide-in-from-top-2">
                            <div className="flex-1 flex items-center gap-3">
                                <Package className="text-emerald-500 w-8 h-8" />
                                <div>
                                    <h4 className="font-black text-zinc-800 dark:text-zinc-100 uppercase leading-none mb-1">{itemSeleccionado.nombreItem}</h4>
                                    <p className="text-xs font-bold text-zinc-500">Precio: {itemSeleccionado.precioVentaItem} BS | Stock: {itemSeleccionado.cantidadItem}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <input 
                                    ref={inputCantidadRef} autoFocus type="number" 
                                    className="flex-1 md:w-28 bg-white dark:bg-zinc-800 border-none rounded-xl text-center font-black text-xl py-3 focus:ring-2 focus:ring-emerald-500 shadow-sm"
                                    value={cantidadInput} onChange={e => setCantidadInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && agregarAlDetalle()}
                                />
                                <button onClick={agregarAlDetalle} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black hover:bg-emerald-700 transition-colors">AÑADIR</button>
                            </div>
                        </div>
                    )}

                    {/* LISTADO DE CARRITO */}
                    <div className="flex-1 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
                        <div className="overflow-x-auto overflow-y-auto">
                            <table className="w-full">
                                <thead className="bg-zinc-50 dark:bg-slate-800/50 sticky top-0 border-b dark:border-zinc-800">
                                    <tr className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-left">
                                        <th className="px-6 py-4">Descripción</th>
                                        <th className="px-6 py-4 text-center">Cant.</th>
                                        <th className="px-6 py-4 text-right">Precio U.</th>
                                        <th className="px-6 py-4 text-right">Subtotal</th>
                                        <th className="px-6 py-4 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                    {detalle.length === 0 ? (
                                        <tr><td colSpan={5} className="py-24 text-center opacity-20 font-black uppercase text-sm">Esperando productos...</td></tr>
                                    ) : (
                                        detalle.map((fila, index) => (
                                            <tr key={index} className="group">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-zinc-700 dark:text-zinc-100 text-sm leading-tight">{fila.nombreItem}</p>
                                                    <p className="text-[10px] text-zinc-400 font-mono">{fila.codigoItem}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg font-black text-xs">{fila.cantidadSeleccionada}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-zinc-500 tabular-nums">{Number(fila.precioVentaItem).toFixed(2)}</td>
                                                <td className="px-6 py-4 text-right font-black text-zinc-900 dark:text-white tabular-nums">{Number(fila.subtotal).toFixed(2)}</td>
                                                <td className="px-6 py-4">
                                                    <button onClick={() => setDetalle(detalle.filter((_, i) => i !== index))} className="text-red-500">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* BOTÓN FLOTANTE MÓVIL */}
                <div className="lg:hidden fixed bottom-6 right-6 z-40">
                    <button onClick={() => setShowCheckoutMobile(true)} className="bg-indigo-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center animate-bounce">
                        <Receipt className="w-6 h-6" />
                    </button>
                </div>

                {/* PANEL DERECHO DE PAGO */}


                <div className={`
                    fixed lg:static inset-x-0 bottom-0 z-50 lg:z-0
                    w-full lg:w-[420px] bg-white dark:bg-zinc-900 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 
                    p-6 lg:p-8 flex flex-col shadow-2xl lg:shadow-none transition-transform duration-500
                    ${showCheckoutMobile ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
                    rounded-t-[2.5rem] lg:rounded-none
                `}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-zinc-900 dark:bg-indigo-600 p-2.5 rounded-xl text-white">
                                <Receipt className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-black text-zinc-800 dark:text-white uppercase tracking-tighter">Cobro</h2>
                        </div>
                        <button onClick={() => setShowCheckoutMobile(false)} className="lg:hidden p-2 text-zinc-400"><X /></button>
                    </div>
                    
                    <div className="space-y-6 flex-1 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-2">
                            {['Efectivo', 'QR', 'Transferencia', 'Tarjeta'].map(m => (
                                <button 
                                    key={m} 
                                    onClick={() => {
                                        setData('metodoPago', m);
                                        // Si cambia a otro método que no sea efectivo, reseteamos el pagoCon
                                        if (m !== 'Efectivo') {
                                            setPagoCon('');
                                            setData(d => ({ ...d, totalRecibidoVenta: totalGeneral, totalCambioVenta: 0 }));
                                        }
                                    }}
                                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${
                                        data.metodoPago === m 
                                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' 
                                        : 'border-zinc-50 dark:border-zinc-800 text-zinc-400'
                                    }`}
                                >
                                    <span className="text-[10px] font-black uppercase">{m}</span>
                                </button>
                            ))}
                        </div>

                        {data.metodoPago === 'Efectivo' && (
                            <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white text-center shadow-2xl shadow-indigo-500/30">
                                <label className="text-[10px] font-black uppercase opacity-60 block mb-1">Efectivo Recibido</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-transparent border-none text-center text-5xl font-black focus:ring-0 p-0 placeholder:text-indigo-400"
                                    placeholder="0.00" 
                                    value={pagoCon} 
                                    onChange={e => {
                                        const valor = e.target.value;
                                        setPagoCon(valor);
                                        
                                        // Sincronizamos con el objeto data de Inertia
                                        const recibido = Number(valor) || 0;
                                        const cambioCalculado = recibido - totalGeneral;
                                        
                                        setData(d => ({
                                            ...d,
                                            totalRecibidoVenta: recibido,
                                            totalCambioVenta: cambioCalculado > 0 ? cambioCalculado : 0
                                        }));
                                    }}
                                />
                            </div>
                        )}

                        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-[2.5rem] space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase text-zinc-400">Cambio</span>
                                <span className={`text-xl font-black tabular-nums ${cambio < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {cambio.toFixed(2)} BS
                                </span>
                            </div>
                            <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
                            <div className="text-center">
                                <span className="text-[10px] font-black text-indigo-500 uppercase block mb-1">Total Final</span>
                                <span className="text-6xl font-black text-zinc-900 dark:text-white tracking-tighter tabular-nums">
                                    {totalGeneral.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button 
                            onClick={handleSubmit} 
                            // BOTÓN DESHABILITADO SI:
                            // 1. Está procesando
                            // 2. No hay items
                            // 3. Es efectivo y el cambio es negativo (falta dinero)
                            disabled={
                                processing || 
                                detalle.length === 0 || 
                                (data.metodoPago === 'Efectivo' && cambio < 0) || 
                                (data.metodoPago === 'Efectivo' && Number(pagoCon) < totalGeneral )
                            }
                            className="w-full bg-zinc-900 dark:bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-xl hover:scale-[1.02] transition-all shadow-xl disabled:opacity-20 disabled:hover:scale-100 flex items-center justify-center gap-4"
                        >
                            {processing ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>REGISTRAR <ArrowRight className="w-6 h-6" /></>
                            )}
                        </button>
                        <p className="text-center text-[10px] font-bold text-zinc-400 uppercase mt-4 tracking-widest">
                            Atajo: F9 para completar
                        </p>
                    </div>
                </div>
                
            </div>

            {/* MODAL BUSCAR CLIENTE */}
            {showModalClientes && (
                <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl max-h-[80vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
                        <div className="p-6 border-b dark:border-zinc-800 flex items-center gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-400" />
                                <input 
                                    autoFocus type="text" placeholder="Buscar por Nombre, NIT o Código..." 
                                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl pl-14 pr-6 py-5 text-lg font-medium focus:ring-2 focus:ring-indigo-500"
                                    onChange={e => setFiltroCliente(e.target.value)}
                                />
                            </div>
                            <button onClick={() => setShowModalClientes(false)} className="p-5 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-zinc-500 hover:bg-red-500 hover:text-white transition-colors"><X /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-2">
                            {clientesFiltrados.map(cliente => (
                                <button 
                                    key={cliente.idCliente} onClick={() => seleccionarCliente(cliente)}
                                    className="w-full text-left p-4 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-2xl border border-transparent hover:border-indigo-200 transition-all flex justify-between items-center group"
                                >
                                    <div>
                                        <p className="font-black text-zinc-800 dark:text-zinc-200 uppercase">{cliente.razonSocialCliente}</p>
                                        <p className="text-xs font-bold text-zinc-400">RAZÓN SOCIAL: {cliente.razonSocialFacturaCliente} | NIT: {cliente.nitFacturaCliente} | CÓD: {cliente.codigoCliente || 'S/C'}</p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL PRODUCTOS */}
            {showModalProductos && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800">
                        <div className="p-6 border-b dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/20">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-600 p-2 rounded-lg">
                                    <Package className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-black uppercase text-zinc-800 dark:text-zinc-100">Catálogo de Items</h3>
                            </div>
 
                            <button 
                                onClick={() => {
                                    setShowModalProductos(false); // cierra el modal
                                    setFiltroItem("");             // limpia el texto de busqueda
                                }}
                                className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>


                        </div>
                        
                        <div className="p-6">
                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                                <input 
                                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all rounded-2xl p-4 pl-12 outline-none font-bold text-lg" 
                                    placeholder="¿Qué producto buscas?" 
                                    autoFocus
                                    onChange={e => setFiltroItem(e.target.value)} 
                                />
                            </div>

                            {/* Diseño de Galería: 1 col móvil, 2 col tablet, 3 col desktop */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
                                {itemsFiltrados.map(i => (
                                    <div 
                                        key={i.idItem} 
                                        onClick={() => { setItemSeleccionado(i); setShowModalProductos(false); }}
                                        className="group flex flex-col bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer transition-all duration-300"
                                    >
                                        {/* IMAGEN GRANDE (Aspect Ratio 4:3) */}
                                        <div className="aspect-video w-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden relative border-b border-zinc-200 dark:border-zinc-800">
                                            {i.rutaImagen ? (
                                                <img 
                                                    src={`/storage/${i.rutaImagen}`} 
                                                    alt={i.nombreItem} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-2">
                                                    <Package className="w-12 h-12 opacity-20" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Sin Imagen</span>
                                                </div>
                                            )}
                                            {/* Badge de Stock flotante sobre la imagen */}
                                            <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black shadow-sm ${i.cantidadItem > 0 ? 'bg-indigo-500 text-white' : 'bg-red-500 text-white'}`}>
                                                STOCK: {i.cantidadItem}
                                            </div>
                                        </div>

                                        {/* CONTENIDO DEBAJO DE IMAGEN */}
                                        <div className="p-4 flex flex-col flex-1">
                                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-1 uppercase tracking-tighter">
                                                Cód: {i.codigoItem}
                                            </span>
                                            <h4 className="font-black text-sm text-zinc-800 dark:text-zinc-100 uppercase leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                                                {i.nombreItem}
                                            </h4>
                                            
                                            <div className="mt-auto pt-3 flex items-center justify-between border-t border-zinc-200/50 dark:border-zinc-700/50">
                                                <span className="text-xs font-bold text-zinc-500 uppercase">Seleccionar</span>
                                                <div className="bg-white dark:bg-zinc-700 p-1.5 rounded-full shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    <Plus className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {itemsFiltrados.length === 0 && (
                                    <div className="col-span-full py-20 text-center">
                                        <Package className="w-16 h-16 mx-auto text-zinc-300 mb-4 opacity-20" />
                                        <p className="text-zinc-500 font-black uppercase text-xs tracking-widest">No hay resultados para tu búsqueda</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* MODAL NUEVO Cliente RAPIDO */}
            {showModalNuevoClie && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border border-indigo-500/20">
                        <div className="p-6 border-b dark:border-zinc-800 flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-800/10">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-600 p-2 rounded-lg">
                                    <UserCircle className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-black text-zinc-800 dark:text-zinc-100">Nuevo Cliente</h3>
                            </div>
                            <button onClick={() => setShowModalNuevoClie(false)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-4">
                            <div className="col-span-2 space-y-1">
                                <label className="text-[10px] font-black text-zinc-400 uppercase ml-2 mb-1 block">Razón Social / Nombre </label>
                                <input 
                                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-2.5 font-bold outline-none transition-all"
                                    placeholder="Ej. Juan Pérez"
                                    value={nuevoClie.razonSocialCliente}
                                    onChange={e => setNuevoClie({...nuevoClie, razonSocialCliente: e.target.value.toUpperCase()})}
                                />
                            </div>

                            <div className="col-span-2 space-y-1">
                                <label className="text-[10px] font-black text-zinc-400 uppercase ml-2 mb-1 block">Código Cliente</label>
                                <input 
                                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-emerindigoald-500 rounded-2xl p-2.5 font-bold outline-none transition-all"
                                    placeholder=""
                                    value={nuevoClie.codigoCliente}
                                    onChange={e => setNuevoClie({...nuevoClie, codigoCliente: e.target.value})}
                                />
                            </div> 

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-zinc-400 uppercase ml-2 mb-1 block">Correo</label>
                                <input type="email"
                                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-2.5 font-bold outline-none transition-all"
                                    placeholder=""
                                    value={nuevoClie.correoCliente}
                                    onChange={e => setNuevoClie({...nuevoClie, correoCliente: e.target.value})}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-zinc-400 uppercase ml-2 mb-1 block">Celular</label>
                                <input 
                                    type="text" 
                                                step="1" 
                                                min="0"
                                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-2.5 font-bold outline-none transition-all"
                                    value={nuevoClie.celularCliente}

                                    onChange={e => {
                                        // Reemplaza cualquier cosa que NO sea un número (0-9) por nada
                                        const val = e.target.value.replace(/\D/g, ''); 
                                        setNuevoClie({...nuevoClie, celularCliente: val});
                                    }}
                                />
                            </div>
                            
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-zinc-400 uppercase ml-2 mb-1 block">Teléfono</label>
                                <input 
                                    type="text" 
                                                step="1" 
                                                min="0"
                                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-2.5 font-bold outline-none transition-all"
                                    placeholder=""
                                    value={nuevoClie.telefonoCliente}
                                    onChange={e => {
                                        // Reemplaza cualquier cosa que NO sea un número (0-9) por nada
                                        const val = e.target.value.replace(/\D/g, ''); 
                                        setNuevoClie({...nuevoClie, telefonoCliente: val});
                                    }}

                                />
                            </div>

                            <h3 className="text-[11px] font-black uppercase text-indigo-600 mb-3 flex items-center gap-2">
                                <FileText className="h-3 w-3" /> Datos de Facturación
                            </h3>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-zinc-400 uppercase ml-2 mb-1 block">Razón Social</label>
                                <input 
                                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-2.5 font-bold outline-none transition-all"
                                    placeholder=""
                                    value={nuevoClie.razonSocialFacturaCliente}
                                    onChange={e => setNuevoClie({...nuevoClie, razonSocialFacturaCliente: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-zinc-400 uppercase ml-2 mb-1 block">NIT / CI Factura</label>
                                <input 
                                    type="text" 
                                                step="1" 
                                                min="0"
                                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-2.5 font-bold outline-none transition-all"
                                    placeholder=""
                                    value={nuevoClie.nitFacturaCliente}
                                    onChange={e => {
                                        // Reemplaza cualquier cosa que NO sea un número (0-9) por nada
                                        const val = e.target.value.replace(/\D/g, ''); 
                                        setNuevoClie({...nuevoClie, nitFacturaCliente: val});
                                    }}

                                />
                            </div>
                            <div className="mt-8 flex gap-3 justify-end">

                                <button type="button" onClick={() => setShowModalNuevoClie(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancelar</button>
                                <button 
                                    onClick={guardarNuevoCliente}
                                    disabled={enviandoClie}
                                    className="bg-indigo-600 text-white px-6 py-2 text-sm rounded-lg font-black tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/20"
                                >
                                    {enviandoClie ? 'Guardando...' : 'Registrar y Seleccionar'}
                                </button>
                            </div>
                            
                        </div>
                    </div>
                </div>
            )}
        </AppSidebarLayout>
    );
}