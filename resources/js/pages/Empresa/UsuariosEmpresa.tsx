import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { UserPlus, Mail, Shield, X, Clock } from 'lucide-react';

export default function UsuariosEmpresa({ usuarios, invitaciones }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { data, setData, post, processing, reset, errors } = useForm({
        email: '',
        idRol: '3', 
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/invitaciones/enviar', {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Usuarios de la Empresa" />

            <div className="flex flex-col gap-8 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Gestión de Personal</h1>
                        <p className="text-muted-foreground">Administra los accesos de tu empresa.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <UserPlus className="h-4 w-4" /> Enviar Invitación
                    </button>
                </div>

                {/* Tabla de Usuarios Activos */}
                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/30">
                        <h2 className="font-semibold text-sm">Usuarios Activos</h2>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-4 py-3 font-medium text-muted-foreground">Nombre</th>
                                <th className="px-4 py-3 font-medium text-muted-foreground">Correo</th>
                                <th className="px-4 py-3 font-medium text-muted-foreground">Rol Asignado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {usuarios.map((u: any) => (
                                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-4 font-medium">{u.name}</td>
                                    <td className="px-4 py-4 text-muted-foreground">{u.email}</td>
                                    <td className="px-4 py-4">
                                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                                            {u.nombreRol}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Sección de Invitaciones Pendientes */}
                {invitaciones.length > 0 && (
                    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden opacity-80 ">
                         <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <h2 className="font-semibold text-sm">Invitaciones Pendientes</h2>
                        </div>
                        <table className="w-full text-sm text-left">
                            <tbody className="divide-y divide-border">
                                {invitaciones.map((inv: any, idx: number) => (
                                    <tr key={idx} className="bg-muted/10">
                                        <td className="px-4 py-3 text-muted-foreground italic">{inv.emailInvitacion}</td>
                                        <td className="px-4 py-3 text-xs uppercase font-bold text-muted-foreground">{inv.nombreRol}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-xs text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded">Esperando registro</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal - Reutilizamos el diseño anterior con tus nuevos atributos */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Nueva Invitación</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Correo del Colaborador</label>
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background p-2 text-sm focus:ring-2 focus:ring-primary"
                                    placeholder="correo@ejemplo.com"
                                />
                                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Asignar Rol</label>
                                <select
                                    value={data.idRol}
                                    onChange={(e) => setData('idRol', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background p-2 text-sm focus:ring-2 focus:ring-primary"
                                >
                                    <option value="3">Admin Almacén</option>
                                    <option value="4">Vendedor</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={processing} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                                    {processing ? 'Enviando...' : 'Enviar Link de Acceso'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}