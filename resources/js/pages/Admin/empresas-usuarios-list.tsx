import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react'; // busquedaEmpresa
import { ChevronRight, ChevronDown, Building, Mail, BadgeCheck, Users, Search, XCircle } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    nombre_rol_asignado?: string; 
}

interface Empresa {
    idEmpresa: number;
    nombreEmpresa: string;
    usuarios: User[];
}

export default function EmpresasUsuariosList({ empresas }: { empresas: Empresa[] }) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState(''); // estado para el buscador busquedaEmpresa

    // busquedaEmpresa filtrado 
    const filteredEmpresas = useMemo(() => {
        return empresas.filter((empresa) =>
            empresa.nombreEmpresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
            // busquedaEmpresa por el nombre de los usuarios dentro de la empresa
            empresa.usuarios?.some(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [empresas, searchTerm]);

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Empresa / Usuario', href: '/admin/empresas-usuarios' }]}>
            <Head title="Gestión de Empresas" />
            
            <div className="flex flex-1 flex-col gap-4 p-4 py-6 md:p-8">
                {/* Encabezado de la página */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Users className="h-6 w-6 text-primary" />
                            Directorio de Empresas y Usuarios
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Visualización total de empresas y personal asignado.
                        </p>
                    </div>

                    {/* BUSCADOR */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar empresa o usuario..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <XCircle className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 mt-2">
                    {filteredEmpresas.length > 0 ? (
                        filteredEmpresas.map((empresa) => (
                            <div 
                                key={empresa.idEmpresa} 
                                className={`overflow-hidden rounded-xl border transition-all duration-200 ${
                                    expandedId === empresa.idEmpresa ? 'ring-1 ring-primary shadow-md' : 'bg-card shadow-sm hover:border-primary/50'
                                }`}
                            >
                                {/* Botón / Fila de Empresa */}
                                <button
                                    onClick={() => setExpandedId(expandedId === empresa.idEmpresa ? null : empresa.idEmpresa)}
                                    className="flex w-full items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Building className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-foreground leading-tight">
                                                {empresa.nombreEmpresa}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {empresa.usuarios?.length || 0} usuarios registrados
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                                            {expandedId === empresa.idEmpresa ? 'Ocultar detalles' : 'Ver usuarios'}
                                        </span>
                                        {expandedId === empresa.idEmpresa ? (
                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </div>
                                </button>

                                {/* Sección Desplegable (Usuarios) */}
                                {expandedId === empresa.idEmpresa && (
                                    <div className="border-t bg-muted/20 p-0 sm:p-4">
                                        <div className="overflow-x-auto rounded-lg border bg-background shadow-inner">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted/50 border-b text-xs uppercase font-semibold text-muted-foreground">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left">Nombre del Usuario</th>
                                                        <th className="px-6 py-3 text-left">Correo Electrónico</th>
                                                        <th className="px-6 py-3 text-left">Rol en Empresa</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {empresa.usuarios && empresa.usuarios.length > 0 ? (
                                                        empresa.usuarios.map((user) => (
                                                            <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                                                <td className="px-6 py-4 font-medium text-foreground">
                                                                    {user.name}
                                                                </td>
                                                                <td className="px-6 py-4 text-muted-foreground">
                                                                    <div className="flex items-center gap-2">
                                                                        <Mail className="h-3.5 w-3.5" />
                                                                        {user.email}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">
                                                                        <BadgeCheck className="h-3.5 w-3.5" />
                                                                        <span className="text-xs font-bold uppercase tracking-wider">
                                                                            {user.nombre_rol_asignado || 'Sin Rol'}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={3} className="px-6 py-10 text-center text-muted-foreground italic">
                                                                No hay usuarios vinculados.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-xl border-2 border-dashed">
                            <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                            <p className="text-muted-foreground font-medium">
                                {searchTerm ? `No hay resultados para "${searchTerm}"` : "No se encontraron empresas en el sistema."}
                            </p>
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm('')}
                                    className="mt-2 text-sm text-primary hover:underline"
                                >
                                    Limpiar búsqueda
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppSidebarLayout>
    );
}