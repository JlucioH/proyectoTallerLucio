import { Toaster, toast } from 'sonner';
import 'sonner/dist/styles.css';
import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { 
    Search, Plus, Trash2, ShoppingBag, 
    Package, X, Loader2, Calculator,
    CheckCircle2, Users, DollarSign,
    TruckIcon, Receipt
} from 'lucide-react';

interface Categoria {
    idCategoria: number;
    nombreCategoria: string;
}
interface Proveedor {
    idProveedor: number;
    nombreProveedor: string;
    direccionProveedor?: string;
    corrreoProveedor?: string;
    nitProveedor?: string;
    telefonoProveedor?: string;
}

interface Item {
    idItem: number;
    codigoItem: string;
    nombreItem: string;
    cantidadItem: number;
    // Añadimos estas dos opciones como opcionales para que TypeScript no se queje
    rutaImagen?: string | null; 
    imagenItem?: string | null;
}

interface DetalleCompra {
    idItem: number;
    nombre: string;

    cantidadDetalleMovimiento: number;
    costoDetalleMovimiento: number; // Cambiado para coincidir con el Controller
    costoTotalDetalleMovimiento: number; // Cambiado para coincidir con el Controller
    precioDetalleMovimiento: number; 
    precioTotalDetalleMovimiento: number; 
}

export default function CrearCompra({ categorias = [],proveedores = [], items = [], ivaEmpresa }: {  categorias: Categoria[], proveedores: Proveedor[], items: Item[], ivaEmpresa: number }) {
    // Estados de UI
    const [showModalProductos, setShowModalProductos] = useState(false);
    const [showModalProveedores, setShowModalProveedores] = useState(false);
    const [showCheckoutMobile, setShowCheckoutMobile] = useState(false);

    const [filtroItem, setFiltroItem] = useState('');
    const [filtroProv, setFiltroProv] = useState('');
    
    // Lógica de Compra
    const [detalle, setDetalle] = useState<DetalleCompra[]>([]);
    const [itemSeleccionado, setItemSeleccionado] = useState<Item | null>(null);
    //al momento de seleccionar el item para compra
    const [formItem, setFormItem] = useState({ cantidad: '', precio: '', precioTotal: '' });

    //ESTADOS PARA MODAL AÑADIR PROVEEDOR
    const [showModalNuevoProv, setShowModalNuevoProv] = useState(false);
    const [nuevoProv, setNuevoProv] = useState({ nombreProveedor: '', nitProveedor: '', direccionProveedor: '', correoProveedor: '', telefonoProveedor: '' });
    const [enviandoProv, setEnviandoProv] = useState(false);

    // Función para guardar el proveedor vía AJAX (usando fetch o axios para no recargar la página)
    const guardarNuevoProveedor = () => {
        if (!nuevoProv.nombreProveedor) return toast.error("El nombre es obligatorio");
        
        setEnviandoProv(true);

        // Usamos el router de Inertia que ya incluye el Token CSRF automáticamente
        router.post('/proveedores/guardar-rapido', {
            nombreProveedor: nuevoProv.nombreProveedor,
            nitProveedor: nuevoProv.nitProveedor,
            correoProveedor: nuevoProv.correoProveedor,
            telefonoProveedor: nuevoProv.telefonoProveedor,
            direccionProveedor: nuevoProv.direccionProveedor,
        }, {
            onSuccess: (page) => {
                toast.success("Proveedor registrado y seleccionado");
                setShowModalNuevoProv(false);
                setNuevoProv({ nombreProveedor: '', nitProveedor: '', direccionProveedor: '', correoProveedor: '', telefonoProveedor: '' });

                // IMPORTANTE: Como el controlador hace un "return back()", 
                // los props de la página se actualizan. 
                // Buscamos el último proveedor creado para seleccionarlo:
                const lista = page.props.proveedores as any[];
                if (lista && lista.length > 0) {
                    const ultimo = lista[lista.length - 1];
                    setData(d => ({ 
                        ...d, 
                        idProveedor: ultimo.idProveedor, 
                        nombreProveedor: ultimo.nombreProveedor, 
                        direccionProveedor: ultimo.nombreProveedor, 
                        correoProveedor: ultimo.nombreProveedor,
                        telefonoProveedor: ultimo.telefonoProveedor, 
                    }));
                }
            },
            onError: () => toast.error("Error al validar datos"),
            onFinish: () => setEnviandoProv(false),
        });
    };

    //ESTADOS PARA MODAL AÑADIR ITEM
    const [showModalNuevoIte, setShowModalNuevoIte] = useState(false);
    const [nuevoIte, setNuevoIte] = useState({ codigoItem: '', nombreItem: '', descripcionItem: '', idCategoria: '', precioVentaItem: '' });
    const [enviandoIte, setEnviandoIte] = useState(false);

    //ESTADOS PARA MODAL AÑADIR ITEM FIN

    // Función para guardar el proveedor vía AJAX (usando fetch o axios para no recargar la página)
    const guardarNuevoItem = () => {
        if (!nuevoIte.codigoItem) return toast.error("El código es obligatorio");
        if (!nuevoIte.nombreItem) return toast.error("El nombre es obligatorio");
        if (!nuevoIte.idCategoria) return toast.error("La categoría es obligatoria");
        
        setEnviandoIte(true);

        // Usamos el router de Inertia que ya incluye el Token CSRF automáticamente
        router.post('/items/guardar-rapido-item', {
            codigoItem: nuevoIte.codigoItem,
            nombreItem: nuevoIte.nombreItem,
            descripcionItem: nuevoIte.descripcionItem,
            idCategoria: nuevoIte.idCategoria,
            precioVentaItem: Number(nuevoIte.precioVentaItem),
        }, {
            onSuccess: (page) => {
                toast.success("Ìtem registrado y seleccionado");
                setShowModalNuevoIte(false);
                setNuevoIte({ codigoItem: '', nombreItem: '', descripcionItem: '', idCategoria: '', precioVentaItem: '' });

                // IMPORTANTE: Como el controlador hace un "return back()", 
                // los props de la página se actualizan. 
                // Buscamos el último proveedor creado para seleccionarlo:
                const lista = page.props.proveedores as any[];
                if (lista && lista.length > 0) {
                    const ultimo = lista[lista.length - 1];
                    setData(d => ({ 
                        ...d, 
                        iditem: ultimo.idItem, 
                        codigoItem: ultimo.codigoItem, 
                        nombreItem: ultimo.nombreItem, 
                        descripcionItem: ultimo.descripcionItem,
                        idCategoria: ultimo.idCategoria, 
                        precioVentaItem: ultimo.precioVentaItem, 
                    }));
                }
            },
            onError: () => toast.error("Error al validar datos"),
            onFinish: () => setEnviandoIte(false),
        });
    };


    //ESTADOS PARA MODAL AÑADIR ITEM FIN




    const { data, setData, post, processing, reset, transform } = useForm({
        idProveedor: null as number | null,
        nombreProveedor: '',
        conFactura: false,
        numeroFactura: '',
        metodoPago: 'Efectivo',
        items: [] as any[],
        totalCompra: 0
    });

    // Filtrado para modales
    const itemsFiltrados = items.filter(i => 
        i.nombreItem.toLowerCase().includes(filtroItem.toLowerCase()) || 
        i.codigoItem.toLowerCase().includes(filtroItem.toLowerCase())
    );

    const proveedoresFiltrados = proveedores.filter(p => 
        p.nombreProveedor.toLowerCase().includes(filtroProv.toLowerCase())
    );

    useEffect(() => {
        const nuevoDetalleRecalculado = detalle.map(item => {
            if (data.conFactura)
            {
                item.costoTotalDetalleMovimiento = item.precioTotalDetalleMovimiento-Number(((Number((item.precioTotalDetalleMovimiento).toFixed(2))*ivaEmpresa)/100).toFixed(2));
                item.costoDetalleMovimiento = Number((item.costoTotalDetalleMovimiento / item.cantidadDetalleMovimiento).toFixed(2));
            }else{
                item.costoTotalDetalleMovimiento=item.precioTotalDetalleMovimiento 
                item.costoDetalleMovimiento=item.precioDetalleMovimiento
            }

            return {
                ...item,
            };
        });

        setDetalle(nuevoDetalleRecalculado);
    }, [data.conFactura]); // Se ejecuta cada vez que el usuario marca/desmarca el checkbox

    const agregarAlDetalle = () => {
        
        const cant = parseFloat(formItem.cantidad);

        const precT = parseFloat(formItem.precioTotal);
        const prec = cant > 0 ? parseFloat((precT / cant).toFixed(2)) : 0;

        if (!itemSeleccionado || isNaN(cant) || cant <= 0 || isNaN(prec) || precT <= 0) {
            toast.error("Datos de producto inválidos Cantidad:"+cant+" PrecioUnitario: "+prec+" PrecioTotal: "+precT);
            return;
        }
        
        const existeIndex = detalle.findIndex(d => d.idItem === itemSeleccionado.idItem);
        if (existeIndex !== -1) {
            // constante de item encontrado
            const nuevoDetalle = [...detalle];
            const item = { ...nuevoDetalle[existeIndex] };
            
            // suma de valores acumulados
            item.cantidadDetalleMovimiento += cant;
            item.precioTotalDetalleMovimiento += precT;
            //recalculo de unitario
            item.precioDetalleMovimiento = Number((item.precioTotalDetalleMovimiento / item.cantidadDetalleMovimiento).toFixed(2));

            if (data.conFactura)
            {
                item.costoTotalDetalleMovimiento = item.precioTotalDetalleMovimiento-Number(((Number((item.precioTotalDetalleMovimiento).toFixed(2))*ivaEmpresa)/100).toFixed(2));
                item.costoDetalleMovimiento = Number((item.costoTotalDetalleMovimiento / item.cantidadDetalleMovimiento).toFixed(2));
            }else{
                item.costoTotalDetalleMovimiento=item.precioTotalDetalleMovimiento 
                item.costoDetalleMovimiento=item.precioDetalleMovimiento
            }

            nuevoDetalle[existeIndex] = item;
            setDetalle(nuevoDetalle);
        }else{
            const nuevoDetalle: DetalleCompra = {
            idItem: itemSeleccionado.idItem,
            nombre: itemSeleccionado.nombreItem,
            cantidadDetalleMovimiento: cant,
            costoDetalleMovimiento: precT/cant || 0,
            costoTotalDetalleMovimiento: precT,
            precioDetalleMovimiento: precT/cant || 0,
            precioTotalDetalleMovimiento: precT            

            };

            if (data.conFactura)
            {
                nuevoDetalle.costoTotalDetalleMovimiento = nuevoDetalle.precioTotalDetalleMovimiento-Number(((Number((nuevoDetalle.precioTotalDetalleMovimiento).toFixed(2))*ivaEmpresa)/100).toFixed(2));
                nuevoDetalle.costoDetalleMovimiento = Number((nuevoDetalle.costoTotalDetalleMovimiento / nuevoDetalle.cantidadDetalleMovimiento).toFixed(2));
            }

            //console.log("nuevoDetalle.costoTotalDetalleMovimiento  "+nuevoDetalle.costoTotalDetalleMovimiento+" nuevoDetalle.costoDetalleMovimiento  "+nuevoDetalle.costoDetalleMovimiento)

            setDetalle([...detalle, nuevoDetalle]);

        }
        setItemSeleccionado(null);
        setFormItem({ cantidad: '', precio: '', precioTotal: '' });
    };

    const totalGeneral = detalle.reduce((acc, fila) => acc + fila.precioTotalDetalleMovimiento, 0);
    //COMPRA GUARDAR LUCIO 
    const handleSubmit = () => {
        // 1. Validaciones básicas
        if (!data.idProveedor) return toast.error("Seleccione un proveedor");
        if (detalle.length === 0) return toast.error("Agregue productos a la compra");
        if (data.conFactura && Number(data.numeroFactura)===0) return toast.error("Agregue número de factura");

        // 2. "Transform" prepara el paquete de datos antes de enviarlo
        // Es la forma más limpia en Laravel 12
        transform((oldData) => ({
            ...oldData,
            items: detalle.map(d => ({
                idItem: d.idItem,
                cantidadDetalleMovimientoCompra: d.cantidadDetalleMovimiento,
                costoDetalleMovimientoCompra: d.costoDetalleMovimiento, 
                costoTotalDetalleMovimientoCompra: d.costoTotalDetalleMovimiento, 
                precioDetalleMovimientoCompra: d.precioDetalleMovimiento, 
                precioTotalDetalleMovimientoCompra: d.precioTotalDetalleMovimiento, 
            })),
            totalCompra: totalGeneral,
        }));

        // 3. El post ahora viaja con los datos transformados
        post('/compras/guardar', { // Usamos route() si tienes la ruta nombrada
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Compra registrada', {
                    description: 'El stock ha sido actualizado correctamente.',
                });
                setShowCheckoutMobile(false);
                setDetalle([]);
                reset();
            },
            onError: (errors) => {
                // Mostramos el error específico de validación de Laravel
                const msg = Object.values(errors)[0] as string;
                toast.error('Error al registrar compra', {
                    description: msg || 'Revisa los datos.'
                });
            }
        });
    };

    return (
        <AppSidebarLayout>
            <Toaster position="bottom-center" richColors theme="system" />
            <Head title="Nueva Compra" />
            
            <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-[#F4F7FA] dark:bg-zinc-950">
                
                {/* ÁREA IZQUIERDA */}
                <div className="flex-1 flex flex-col p-4 lg:p-6 space-y-4 overflow-y-auto">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <ShoppingBag className="h-6 w-6 text-emerald-600" /> Nueva Compra
                    </h1>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-4 flex gap-2">
                            <div className="flex-1 bg-white dark:bg-emerald-600 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm cursor-pointer"
                                 onClick={() => setShowModalProveedores(true)}>
                                <label className="flex items-center gap-2 text-[10px] font-black text-black-900 uppercase mb-1">
                                    <TruckIcon className="w-3 h-3" /> Proveedor
                                </label>
                                <div className="font-bold text-zinc-800 dark:text-zinc-100 uppercase">
                                    {data.nombreProveedor || 'Seleccionar Proveedor...'}
                                </div>
                            </div>
                        </div>
                        {/*BOTON AÑADIR PROVEEDOR*/}
                        <div className="md:col-span-1 flex items-center justify-center">
                            <button 
                                type="button"
                                onClick={() => setShowModalNuevoProv(true)} // Ahora abre el modal
                                className="w-full h-full bg-emerald-600 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10 group"
                            >
                                <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                                <TruckIcon className="w-5 h-5" />
                            </button>
                        </div>
                        {/*check de factura*/ }
                        <div className="md:col-span-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                            <div>
                                <label className="text-[10px] font-black text-zinc-400 uppercase block mb-1">Factura</label>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={data.conFactura}
                                        onChange={e => {
                                            const checked = e.target.checked;
                                            setData(d => ({ ...d, conFactura: checked, numeroFactura: checked ? d.numeroFactura : '' }));
                                        }}
                                        className="rounded text-indigo-600 h-5 w-5" />
                                    <span className="font-bold text-xs uppercase">{data.conFactura ? 'Con Factura' : 'Sin Factura'}</span>
                                </div>
                            </div>
                            {data.conFactura && (
                                <input placeholder="N°" className="w-20 bg-zinc-100 dark:bg-zinc-600 border-none rounded-lg p-2 text-center font-bold text-xs"
                                    value={data.numeroFactura} onChange={e => setData('numeroFactura', e.target.value)} />
                            )}
                        </div>
                        {/*fin check de factura*/ }

                        {/*BOTON Buscar ITEM*/}
                        <button onClick={() => setShowModalProductos(true)}
                            className="md:col-span-3 bg-emerald-600 text-white rounded-2xl p-4 flex items-center justify-between hover:bg-emerald-700 transition-all">
                            <span className="font-black text-sm uppercase">Buscar Item</span>
                            <Search className="w-5 h-5" />
                        </button>
                        {/*BOTON AÑADIR ITEM*/}
                        <div className="md:col-span-1 flex items-center justify-center">
                            <button 
                                type="button"
                                onClick={() => setShowModalNuevoIte(true)} // Ahora abre el modal
                                className="w-full h-full bg-emerald-600 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10 group"
                            >
                                <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                                <Package className="w-5 h-5" />
                            </button>
                        </div>
                        
                    </div>

                    {itemSeleccionado && (
                        <div className="bg-indigo-500/10 border-2 border-indigo-500/20 rounded-2xl p-4">
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <div className="flex-1 flex items-center gap-3">
                                    <Package className="text-indigo-500 w-8 h-8" />
                                    <div>
                                        <h4 className="font-black text-zinc-800 dark:text-zinc-100 uppercase leading-none mb-1">{itemSeleccionado.nombreItem}</h4>
                                        <p className="text-xs font-bold text-zinc-500">Stock: {itemSeleccionado.cantidadItem}</p>
                                    </div>
                                </div>
                                



                                <div className="grid grid-cols-3 gap-2">
                                    {/* Cantidad */}
                                    <input 
                                        type="number" 
                                        placeholder="Cantidad" 
                                        className="w-full bg-white dark:bg-zinc-800 border-none rounded-xl text-center font-black p-2" 
                                        value={formItem.cantidad} 
                                        onChange={e => setFormItem({...formItem, cantidad: e.target.value})} 
                                    />

                                    {/* Costo Unitario - NO MODIFICABLE */}
                                    <input 
                                        type="number" 
                                        placeholder="Costo" 
                                        className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-xl text-center font-black p-2 cursor-not-allowed opacity-80" 
                                        // Calculamos el valor en tiempo real
                                        value={
                                            Number(formItem.cantidad) > 0 
                                            ? (parseFloat(formItem.precioTotal) / parseFloat(formItem.cantidad)).toFixed(2) 
                                            : '0.00'
                                        } 
                                        onChange={e => setFormItem({...formItem, precio: e.target.value})} 
                                        readOnly // <--- Esto impide que el usuario escriba
                                    />   

                                    {/* Venta (Precio Total de la compra de ese item) */}
                                    <input 
                                        type="number" 
                                        placeholder="Precio compra" 
                                        className="w-full bg-white dark:bg-zinc-800 border-none rounded-xl text-center font-black p-2 text-emerald-600" 
                                        value={formItem.precioTotal} 
                                        onChange={e => setFormItem({...formItem, precioTotal: e.target.value})} 
                                    />
                                </div>





                                <button onClick={agregarAlDetalle} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black">AÑADIR</button>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
                        <div className="overflow-x-auto overflow-y-auto">
                    
                            <table className="w-full text-left">
                                <thead className="bg-zinc-50 dark:bg-slate-800/50 border-b dark:border-zinc-800">
                                    <tr className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                        <th className="px-6 py-4">Descripción</th>
                                        <th className="px-6 py-4 text-center">Cantidad.</th>
                                        <th className="px-6 py-4 text-right">Costo Compra Unit.</th>
                                        <th className="px-6 py-4 text-right">Costo Compra Tot.</th>
                                        <th className="px-6 py-4 text-right">Precio Compra Unit.</th>
                                        <th className="px-6 py-4 text-right">Precio Compra Total.</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detalle.map((fila, index) => (
                                        <tr key={index} className="border-b border-zinc-50 dark:border-zinc-800/50">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-sm text-zinc-800 dark:text-zinc-100">{fila.nombre}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center font-black text-xs">{fila.cantidadDetalleMovimiento}</td>
                                            <td className="px-6 py-4 text-right text-zinc-500">{fila.costoDetalleMovimiento.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right text-zinc-500">{fila.costoTotalDetalleMovimiento.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right font-black">{fila.precioDetalleMovimiento.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right font-black">{fila.precioTotalDetalleMovimiento.toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => setDetalle(detalle.filter((_, i) => i !== index))} className="text-red-500"><Trash2 className="w-4 h-4"/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>


                {/* BOTÓN FLOTANTE MÓVIL */}
                <div className="lg:hidden fixed bottom-6 right-6 z-40">
                    <button onClick={() => setShowCheckoutMobile(true)} className="bg-emerald-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center animate-bounce">
                        <Receipt className="w-6 h-6" />
                    </button>
                </div>

                {/* PANEL DERECHO */}
                <div className={`
                    fixed lg:static inset-x-0 bottom-0 z-50 lg:z-0
                    w-full lg:w-[420px] bg-white dark:bg-zinc-900 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 
                    p-6 lg:p-8 flex flex-col shadow-2xl lg:shadow-none transition-transform duration-500
                    ${showCheckoutMobile ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
                    rounded-t-[2.5rem] lg:rounded-none
                `}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-zinc-900 dark:bg-emerald-600 p-2.5 rounded-xl text-white">
                                <Receipt className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-black text-zinc-800 dark:text-white uppercase tracking-tighter">Resumen</h2>
                        </div>
                        <button onClick={() => setShowCheckoutMobile(false)} className="lg:hidden p-2 text-zinc-400"><X /></button>
                    </div>
                      
                    <div className="flex-1">
                        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-[2.5rem] text-center border-2 border-dashed border-zinc-200 dark:border-zinc-700 mb-6">
                            <span className="text-[10px] font-black text-zinc-400 uppercase block">Total Compra</span>
                            <span className="text-5xl font-black">{totalGeneral.toFixed(2)} <small className="text-lg">BS</small></span>
                        </div>
                    </div>
                    <button onClick={handleSubmit} disabled={processing || detalle.length === 0}
                        className="w-full bg-emerald-600 text-white py-6 rounded-[2.5rem] font-black text-xl disabled:opacity-50">
                        {processing ? 'PROCESANDO...' : 'FINALIZAR COMPRA'}
                    </button>
                    
                </div>
            </div>

            {/* MODAL PROVEEDORES */}
            {showModalProveedores && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <div className="p-6 border-b dark:border-zinc-800 flex justify-between items-center">
                            <div className="bg-emerald-600 p-2 rounded-lg">
                                <TruckIcon className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-black uppercase">Proveedores</h3>
                            {/*REINICIAR EL FILTRO DE X BUSQUEDA*/ }
                            <button 
                                onClick={() => {
                                    setShowModalProveedores(false); // cierra el modal
                                    setFiltroProv("");             // limpia el texto de busqueda
                                }}
                                className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            <input className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl p-3 mb-4" 
                                placeholder="Buscar proveedor..." onChange={e => setFiltroProv(e.target.value)} />
                            <div className="max-h-60 overflow-y-auto space-y-2">
                                {proveedoresFiltrados.map(p => (
                                    <div key={p.idProveedor} onClick={() => { setData(d => ({...d, idProveedor: p.idProveedor, nombreProveedor: p.nombreProveedor})); setShowModalProveedores(false); }}
                                        className="p-3 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl cursor-pointer font-bold border border-transparent hover:border-indigo-500/20 transition-all">
                                        {p.nombreProveedor}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* MODAL NUEVO PROVEEDOR RAPIDO */}
            {showModalNuevoProv && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border border-emerald-500/20">
                        <div className="p-6 border-b dark:border-zinc-800 flex justify-between items-center bg-emerald-50/50 dark:bg-emerald-800/10">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-600 p-2 rounded-lg">
                                    <TruckIcon className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-black text-zinc-800 dark:text-zinc-100">Nuevo Proveedor</h3>
                            </div>
                            <button onClick={() => setShowModalNuevoProv(false)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-4">
                            <div className="col-span-2 space-y-1">
                                <label className="text-[10px] font-black text-zinc-400 uppercase ml-2 mb-1 block">Nombre Proveedor</label>
                                <input 
                                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl p-2.5 font-bold outline-none transition-all"
                                    placeholder="Ej. Importadora Gomez"
                                    value={nuevoProv.nombreProveedor}
                                    onChange={e => setNuevoProv({...nuevoProv, nombreProveedor: e.target.value.toUpperCase()})}
                                />
                            </div>

                            <div className="col-span-2 space-y-1">
                                <label className="text-[10px] font-black text-zinc-400 uppercase ml-2 mb-1 block">NIT / CI Proveedor</label>
                                <input 
                                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl p-2.5 font-bold outline-none transition-all"
                                    placeholder=""
                                    value={nuevoProv.nitProveedor}
                                    onChange={e => setNuevoProv({...nuevoProv, nitProveedor: e.target.value})}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-zinc-400 uppercase ml-2 mb-1 block">Dirección Proveedor</label>
                                <input 
                                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl p-2.5 font-bold outline-none transition-all"
                                    placeholder=""
                                    value={nuevoProv.direccionProveedor}
                                    onChange={e => setNuevoProv({...nuevoProv, direccionProveedor: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-zinc-400 uppercase ml-2 mb-1 block">Correo</label>
                                <input type="email"
                                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl p-2.5 font-bold outline-none transition-all"
                                    placeholder=""
                                    value={nuevoProv.correoProveedor}
                                    onChange={e => setNuevoProv({...nuevoProv, correoProveedor: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-zinc-400 uppercase ml-2 mb-1 block">Teléfono</label>
                                <input 
                                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl p-2.5 font-bold outline-none transition-all"
                                    placeholder=""
                                    value={nuevoProv.telefonoProveedor}
                                    onChange={e => setNuevoProv({...nuevoProv, telefonoProveedor: e.target.value})}
                                />
                            </div>
                            <div className="mt-8 flex gap-3 justify-end">

                                <button type="button" onClick={() => setShowModalNuevoProv(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancelar</button>
                                <button 
                                    onClick={guardarNuevoProveedor}
                                    disabled={enviandoProv}
                                    className="bg-emerald-600 text-white px-6 py-2 text-sm rounded-lg font-black tracking-widest hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/20"
                                >
                                    {enviandoProv ? 'Guardando...' : 'Registrar y Seleccionar'}
                                </button>
                            </div>
                            
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL NUEVO ITEM RAPIDO */}
            {showModalNuevoIte && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border border-emerald-500/20">
                        <div className="p-6 border-b dark:border-zinc-800 flex justify-between items-center bg-emerald-50/50 dark:bg-emerald-800/10">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-600 p-2 rounded-lg">
                                    <Package className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-black text-zinc-800 dark:text-zinc-100">Nuevo Ítem</h3>
                            </div>
                            <button onClick={() => setShowModalNuevoIte(false)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-4">
                            <div className="col-span-2 space-y-1">
                                <label className="text-[10px] font-black text-zinc-400 uppercase ml-2 mb-1 block">Código Ítem</label>
                                <input 
                                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl p-2.5 font-bold outline-none transition-all"
                                    placeholder="Ej. COD-001"
                                    value={nuevoIte.codigoItem}
                                    onChange={e => setNuevoIte({...nuevoIte, codigoItem: e.target.value.toUpperCase()})}
                                />
                            </div>
                            
                            <div className="col-span-2 space-y-1">
                                <label className="text-[10px] font-black text-zinc-400 uppercase ml-2 mb-1 block">Nombre Ítem</label>
                                <input 
                                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl p-2.5 font-bold outline-none transition-all"
                                    placeholder="Ej. AutoSis"
                                    value={nuevoIte.nombreItem}
                                    onChange={e => setNuevoIte({...nuevoIte, nombreItem: e.target.value.toUpperCase()})}
                                />
                            </div>

                            <div className="col-span-2 space-y-1">
                                <label className="text-[10px] font-black text-zinc-400 uppercase ml-2 mb-1 block">Descripción</label>
                                <input 
                                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl p-2.5 font-bold outline-none transition-all"
                                    placeholder=""
                                    value={nuevoIte.descripcionItem}
                                    onChange={e => setNuevoIte({...nuevoIte, descripcionItem: e.target.value})}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-zinc-400 uppercase ml-2 mb-1 block">Categoría</label>
                                <select 
                                    value={nuevoIte.idCategoria}
                                    onChange={e => setNuevoIte({...nuevoIte, idCategoria: e.target.value})}
                                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl p-2.5 font-bold outline-none transition-all"
                                >
                                    <option value="">Seleccionar...</option>
                                        {categorias.map(cat => (
                                            <option key={cat.idCategoria} value={cat.idCategoria}>{cat.nombreCategoria}</option>
                                        ))}

                                </select>    
                            </div>                          
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block flex items-center gap-1">
                                    <DollarSign className="h-3 w-3 text-emerald-500" /> Precio Venta
                                </label>
                                <input 
                                    type="number" 
                                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl p-2.5 font-bold outline-none transition-all"
                                    placeholder=""

                                    value={ Number(nuevoIte.precioVentaItem)                                       } 

                                    onChange={e => setNuevoIte({...nuevoIte, precioVentaItem: e.target.value})}
                                />
                            </div>
                            <div className="mt-8 flex gap-3 justify-end">

                                <button type="button" onClick={() => setShowModalNuevoIte(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancelar</button>
                                <button 
                                    onClick={guardarNuevoItem}
                                    disabled={enviandoIte}
                                    className="bg-emerald-600 text-white px-6 py-2 text-sm rounded-lg font-black tracking-widest hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/20"
                                >
                                    {enviandoIte ? 'Guardando...' : 'Registrar y Seleccionar'}
                                </button>
                            </div>
                            
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
                                <div className="bg-emerald-600 p-2 rounded-lg">
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
                                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-900 transition-all rounded-2xl p-4 pl-12 outline-none font-bold text-lg" 
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
                                        className="group flex flex-col bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 cursor-pointer transition-all duration-300"
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
                                            <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black shadow-sm ${i.cantidadItem > 0 ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                                STOCK: {i.cantidadItem}
                                            </div>
                                        </div>

                                        {/* CONTENIDO DEBAJO DE IMAGEN */}
                                        <div className="p-4 flex flex-col flex-1">
                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-tighter">
                                                Cód: {i.codigoItem}
                                            </span>
                                            <h4 className="font-black text-sm text-zinc-800 dark:text-zinc-100 uppercase leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2">
                                                {i.nombreItem}
                                            </h4>
                                            
                                            <div className="mt-auto pt-3 flex items-center justify-between border-t border-zinc-200/50 dark:border-zinc-700/50">
                                                <span className="text-xs font-bold text-zinc-500 uppercase">Seleccionar</span>
                                                <div className="bg-white dark:bg-zinc-700 p-1.5 rounded-full shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
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
        </AppSidebarLayout>
    );
}