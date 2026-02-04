import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, useForm } from '@inertiajs/react';
import { Users, ShieldCheck, UserPlus, PlusCircle, X, Building2, CreditCard } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Panel de Administración',
        href: '/system/admin',
    },
];

export default function ControlPanel() {
    // 1. Extraemos 'planes' de las props (asegúrate de enviarlos desde el controlador)
    const { auth, stats, empresas, planes } = usePage().props as any;

    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        nombreEmpresa: '',
        emailInvitacionEmpresa: '',
        idPlanSuscripcion: '', // Nuevo campo para el plan
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/system/admin/empresas', {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Panel" />
            
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Cabecera */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">Panel de Control del Sistema</h1>
                        <p className="text-muted-foreground">
                            Bienvenido, administrador {auth.user.name}.
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Registrar Empresa
                    </button>
                </div>

                {/* Tarjetas de Estadísticas */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border border-sidebar-border bg-card p-6 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-sm font-medium text-muted-foreground">Usuarios Totales</span>
                            <div className="mt-2 text-3xl font-bold">{stats?.totalUsers ?? 0}</div>
                        </div>
                        <Users className="h-8 w-8 text-blue-500 opacity-20" />
                    </div>
                    
                    <div className="rounded-xl border border-sidebar-border bg-card p-6 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-sm font-medium text-muted-foreground">Personal (Staff)</span>
                            <div className="mt-2 text-2xl font-bold">{stats?.totalAdmins ?? 0}</div>
                        </div>
                        <ShieldCheck className="h-8 w-8 text-purple-500 opacity-20" />
                    </div>

                    <div className="rounded-xl border border-sidebar-border bg-card p-6 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-sm font-medium text-muted-foreground">Nuevos Hoy</span>
                            <div className="mt-2 text-2xl font-bold">{stats?.newUsersToday ?? 0}</div>
                        </div>
                        <UserPlus className="h-8 w-8 text-green-500 opacity-20" />
                    </div>
                </div>

                {/* Tabla de Empresas */}
                <div className="rounded-xl border border-sidebar-border bg-card shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-sidebar-border bg-muted/20">
                        <h2 className="font-semibold flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-indigo-500" />
                            Empresas en el Sistema
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-sidebar-border">
                                <tr>
                                    <th className="p-4">Nombre</th>
                                    <th className="p-4">Estado</th>
                                    <th className="p-4">Fecha Registro</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border">
                                {empresas?.length > 0 ? empresas.map((empresa: any) => (
                                    <tr key={empresa.idEmpresa} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4 font-medium">{empresa.nombreEmpresa}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                Activa
                                            </span>
                                        </td>
                                        <td className="p-4 text-muted-foreground">
                                            {new Date(empresa.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="p-8 text-center text-muted-foreground italic">
                                            No hay empresas registradas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL DE REGISTRO ACTUALIZADO */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl bg-card border border-sidebar-border shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
                            <h2 className="text-xl font-bold">Nueva Empresa e Invitación</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Nombre Empresa */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Nombre de la Empresa</label>
                                <input 
                                    type="text"
                                    value={data.nombreEmpresa}
                                    onChange={e => setData('nombreEmpresa', e.target.value)}
                                    className="w-full rounded-lg border border-sidebar-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="Ej. Taller Central S.A."
                                    required
                                />
                                {errors.nombreEmpresa && <p className="text-red-500 text-xs mt-1">{errors.nombreEmpresa}</p>}
                            </div>

                            {/* Email Invitación */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Email del Dueño (Invitación)</label>
                                <input 
                                    type="email"
                                    value={data.emailInvitacionEmpresa}
                                    onChange={e => setData('emailInvitacionEmpresa', e.target.value)}
                                    className="w-full rounded-lg border border-sidebar-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="correo@duenio.com"
                                    required
                                />
                                {errors.emailInvitacionEmpresa && <p className="text-red-500 text-xs mt-1">{errors.emailInvitacionEmpresa}</p>}
                            </div>

                            {/* SELECTOR DE PLANES */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-indigo-500" />
                                    Plan de Suscripción (1 Año)
                                </label>
                                <select 
                                    value={data.idPlanSuscripcion}
                                    onChange={e => setData('idPlanSuscripcion', e.target.value)}
                                    className="w-full rounded-lg border border-sidebar-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                                    required
                                >
                                    <option value="">Seleccione un plan...</option>
                                    {planes?.map((plan: any) => (
                                        <option key={plan.idPlanSuscripcion} value={plan.idPlanSuscripcion}>
                                            {plan.nombrePlanSuscripcion} - Límite mes: Bs. {plan.limiteMensualMontoPlanSuscripcion} 
                                        </option>
                                    ))}
                                </select>
                                {errors.idPlanSuscripcion && <p className="text-red-500 text-xs mt-1">{errors.idPlanSuscripcion}</p>}
                            </div>

                            <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                                Se asignará el plan seleccionado por un periodo de 12 meses a partir de hoy.
                            </p>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-sidebar-border font-medium hover:bg-muted transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    disabled={processing}
                                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                >
                                    {processing ? 'Procesando...' : 'Crear e Invitar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}