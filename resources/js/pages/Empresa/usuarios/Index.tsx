import { useState } from 'react';
import { useForm, usePage, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout'; 
import { Mail, ShieldCheck, Clock, User, UserPlus, X, PlusCircle, Users, Building2 } from 'lucide-react';

function UsuariosIndex() {
    const { invitaciones, usuarios_activos, roles_disponibles, auth } = usePage().props as any;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        idRol: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/empresa/usuarios/invitar', {
            onSuccess: () => {
                reset();
                setIsModalOpen(false);
            },
        });
    };

    return (
        <>
            <Head title="Gestión de Personal" />
            
            {/* Eliminamos el max-w para que ocupe todo el ancho y se pegue a la izquierda */}
            <div className="flex flex-col gap-8 p-6 w-full">
                
                {/* CABECERA - Texto estático a la izquierda y botón a la derecha */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestión de Personal</h1>
                        <p className="text-muted-foreground text-sm">
                            Empresa: <span className="font-bold text-foreground">
                                {auth.empresa || 'Cargando...'}
                            </span>
                        </p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <PlusCircle className="w-5 h-5" />
                         Enviar Invitación
                    </button>
                </div>

                {/* CONTENEDORES FLEXIBLES - Cambian de tamaño con el navegador */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                    
                    {/* LISTADO DE USUARIOS ACTIVOS */}
                    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col w-full">
                        <div className="p-4 border-b border-border bg-muted/30">
                            <h2 className="font-semibold text-sm">Usuarios Activos</h2>
                        </div>
                        <div className="divide-y divide-border overflow-auto max-h-[600px]">
                            {usuarios_activos.length > 0 ? usuarios_activos.map((ua: any) => (
                                <div key={ua.idUsuarioEmpresa} className="p-4 flex justify-between items-center hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{ua.usuario?.name || 'Invitado'}</p>
                                            <p className="text-xs text-muted-foreground">{ua.usuario?.email}</p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                                        {ua.rol?.nombreRol}
                                    </span>
                                </div>
                            )) : <p className="p-10 text-center text-muted-foreground italic text-sm">Sin personal activo.</p>}
                        </div>
                    </div>

                    {/* LISTADO DE INVITACIONES PENDIENTES */}
                    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col h-fit w-full">
                        <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <h2 className="font-semibold text-sm">Invitaciones Pendientes</h2>
                        </div>
                        <div className="divide-y divide-border">
                            {invitaciones.length > 0 ? invitaciones.map((inv: any) => (
                                <div key={inv.idInvitacionUsuarioRolEmpresa} className="p-4 flex justify-between items-center bg-muted/10">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-orange-400" />
                                        <div className="text-sm">
                                            <p className="font-medium text-foreground">{inv.emailInvitacionUsuarioRolEmpresa}</p>
                                            <p className="text-xs text-muted-foreground uppercase">{inv.rol?.nombreRol}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded font-medium">
                                        Esperando registro
                                    </span>
                                </div>
                            )) : <p className="p-10 text-center text-muted-foreground italic text-sm">No hay invitaciones enviadas.</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL - ESTILO LIMPIO */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Nueva Invitación</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium mb-1.5">Correo del Colaborador</label>
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="correo@ejemplo.com"
                                />
                                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Asignar Rol</label>
                                <select
                                    required
                                    value={data.idRol}
                                    onChange={(e) => setData('idRol', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background p-2 text-sm focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                                >
                                    <option value="" disabled>Seleccione un Rol</option>
                                    {roles_disponibles.map((r: any) => (
                                        <option key={r.id} value={r.id.toString()}>{r.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                                El sistema enviará automáticamente un enlace de registro al correo proporcionado.
                            </p>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={processing} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                                    {processing ? 'Enviando...' : 'Enviar Link de Acceso'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}


//para el boton sobrio
//className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
UsuariosIndex.layout = (page: React.ReactNode) => <AppLayout children={page} />;

export default UsuariosIndex;