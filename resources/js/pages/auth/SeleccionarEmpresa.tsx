import { Head, router } from '@inertiajs/react';
import { Building2, ArrowRight, ShieldCheck, Warehouse, ShoppingCart } from 'lucide-react';

interface EmpresaConRol {
    idEmpresa: number;
    nombreEmpresa: string;
    rol: string; 
}

export default function SeleccionarEmpresa({ empresas }: { empresas: EmpresaConRol[] }) {
    
    const seleccionar = (idEmpresa: number) => {
        // Usamos la configuración más simple posible para evitar errores de compilación
        router.post('/select-company', { idEmpresa: idEmpresa });
    };

    const getIconoRol = (rol: string) => {
        switch (rol) {
            case 'Admin Empresa': return <ShieldCheck className="h-5 w-5 text-blue-500" />;
            case 'Admin Almacén': return <Warehouse className="h-5 w-5 text-orange-500" />;
            case 'Vendedor': return <ShoppingCart className="h-5 w-5 text-green-500" />;
            default: return <Building2 className="h-5 w-5 text-slate-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-center py-12 px-6 lg:px-8">
            <Head title="Seleccionar Empresa" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
                <div className="inline-flex items-center justify-center p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4">
                    <Building2 className="h-10 w-10 text-blue-600" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight">
                    Acceso a Empresas
                </h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400 text-lg">
                    Elige la organización con la que vas a trabajar hoy
                </p>
            </div>

            <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="grid gap-4">
                    {empresas && empresas.length > 0 ? (
                        empresas.map((item) => (
                            <button
                                key={item.idEmpresa}
                                onClick={() => seleccionar(item.idEmpresa)}
                                className="relative flex items-center p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-blue-500 transition-all group text-left w-full"
                            >
                                <div className="h-14 w-14 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors mr-5">
                                    <Building2 className="h-7 w-7" />
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                                        {item.nombreEmpresa}
                                    </h3>
                                    
                                    <div className="flex items-center gap-2 mt-1">
                                        {getIconoRol(item.rol)}
                                        <span className="text-sm font-medium text-slate-500">
                                            Rol: <span className="text-slate-900 dark:text-slate-200">{item.rol}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="ml-4 flex items-center text-slate-400 group-hover:text-blue-600 transition-all transform group-hover:translate-x-1">
                                    <ArrowRight className="h-6 w-6" />
                                </div>
                            </button>
                        ))
                    ) : (
                        <p className="text-center text-slate-500">No hay empresas disponibles.</p>
                    )}
                </div>
            </div>
        </div>
    );
}