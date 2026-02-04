import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { AlertTriangle, TrendingUp, Wallet, ShoppingBag, Star, BarChart3, PieChart as PieIcon, PackageSearch } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: dashboard().url }];

// Colores vibrantes para el gráfico de dona
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
    const { alertasStock = [], empresaStats } = usePage().props as any;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-y-auto">

                {/* --- 1. SECCIÓN DE ALERTAS CRÍTICAS (SIEMPRE ARRIBA) --- */}
                {alertasStock.length > 0 && (
                    <div className="rounded-xl border border-red-200 bg-red-50/50 shadow-sm dark:border-red-900/30 dark:bg-red-900/10">
                        <div className="flex items-center justify-between border-b border-red-200 px-4 py-3 dark:border-red-900/30">
                            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                                <AlertTriangle className="h-5 w-5 animate-pulse" />
                                <h3 className="text-sm font-bold uppercase tracking-wider">Stock Crítico detectado ({alertasStock.length})</h3>
                            </div>
                            <Link href="/inventario/items" className="text-xs font-bold text-red-700 hover:underline dark:text-red-400">Gestionar Inventario</Link>
                        </div>
                        <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {alertasStock.slice(0, 4).map((item: any) => (
                                <div key={item.idItem} className="flex items-center justify-between rounded-lg border bg-white p-3 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                                    <span className="text-xs font-medium truncate w-32 dark:text-slate-300">{item.nombreItem}</span>
                                    <span className="rounded-full bg-red-100 px-2 py-1 text-[10px] font-black text-red-700 dark:bg-red-900/40 dark:text-red-400">
                                        {item.cantidadItem} unid.
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- 2. KPIs PRINCIPALES --- */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-muted-foreground">Ventas del Mes</span>
                            <div className="rounded-full bg-indigo-100 p-2 dark:bg-indigo-900/30">
                                <ShoppingBag className="h-4 w-4 text-indigo-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold">{formatCurrency(empresaStats?.ventasMes || 0)}</h3>
                    </div>

                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-muted-foreground">Utilidad Neta</span>
                            <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/30">
                                <TrendingUp className="h-4 w-4 text-emerald-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-emerald-600">{formatCurrency(empresaStats?.utilidadMes || 0)}</h3>
                    </div>

                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-muted-foreground">Valor Almacén</span>
                            <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/30">
                                <Wallet className="h-4 w-4 text-amber-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold">{formatCurrency(empresaStats?.valorInventario || 0)}</h3>
                    </div>
                </div>

                {/* --- 3. GRÁFICOS --- */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Ventas vs Compras */}
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b pb-4">
                            <BarChart3 className="h-5 w-5 text-indigo-500" />
                            <h3 className="font-semibold">Flujo Mensual: Ventas vs Compras</h3>
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={empresaStats?.comparativoMensual}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                    <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} />
                                    <YAxis hide />
                                    <Tooltip cursor={{fill: 'transparent'}} />
                                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                                    <Bar name="Ventas" dataKey="ventas" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                                    <Bar name="Compras" dataKey="compras" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Ventas por Categoría (Gráfico de Dona) */}
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b pb-4">
                            <PieIcon className="h-5 w-5 text-emerald-500" />
                            <h3 className="font-semibold">Ventas por Categoría (Mes Actual)</h3>
                        </div>
                        <div className="h-72 flex items-center justify-center">
                            {empresaStats?.ventasPorCategoria?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={empresaStats.ventasPorCategoria}
                                            innerRadius={70}
                                            outerRadius={95}
                                            paddingAngle={8}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {empresaStats.ventasPorCategoria.map((_entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        />
                                        <Legend 
                                            verticalAlign="bottom" 
                                            iconType="circle"
                                            formatter={(value) => <span className="text-xs font-medium dark:text-gray-300">{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-muted-foreground opacity-40">
                                    <PackageSearch className="h-12 w-12 mb-2" />
                                    <p className="text-sm italic">Sin ventas por categoría este mes</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- 4. TOP PRODUCTOS --- */}
                <div className="rounded-xl border bg-card shadow-sm mb-6">
                    <div className="border-b p-4 flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <h3 className="font-semibold">Top 5 Productos con mayor Utilidad</h3>
                    </div>
                    <div className="p-4">
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {empresaStats?.productosRentables?.length > 0 ? (
                                empresaStats.productosRentables.map((prod: any, idx: number) => (
                                    <div key={idx} className="min-w-[220px] rounded-xl border bg-muted/30 p-4 transition-hover hover:border-indigo-300 dark:hover:border-indigo-800">
                                        <div className="aspect-square rounded-lg bg-white border mb-3 flex items-center justify-center overflow-hidden dark:bg-slate-800 dark:border-slate-700">
                                            {prod.rutaImagenItem ? (
                                                <img src={`/storage/${prod.rutaImagenItem}`} className="object-cover h-full w-full" alt={prod.nombreItem} />
                                            ) : (
                                                <PackageSearch className="text-slate-300 h-12 w-12" />
                                            )}
                                        </div>
                                        <h4 className="text-sm font-bold truncate dark:text-slate-200">{prod.nombreItem}</h4>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold">{prod.unidades_vendidas} Vendidos</span>
                                            <p className="text-xs text-emerald-600 font-black">+{formatCurrency(prod.utilidad_item)}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="w-full py-10 text-center text-muted-foreground italic text-sm">
                                    No hay datos de rentabilidad acumulados.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}