import { FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';

interface Props {
    token: string;
    emailInvitacion: string;
    nombreEmpresa: string;
    nombreRol: string; 
    usuarioYaExiste: boolean;
}

export default function RegisterInvitadoEmpresa({ 
    token, 
    emailInvitacion, 
    nombreEmpresa, 
    nombreRol,
    usuarioYaExiste 
}: Props) {
    
    // Inicializamos useForm con los campos necesarios
    const { data, setData, post, processing, errors } = useForm({
        token: token,
        name: '',
        password: '',
        password_confirmation: '',
        // Pasamos usuarioYaExiste para que el controlador sepa qué validar
        usuarioYaExiste: usuarioYaExiste, 
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        // Enviamos la petición al endpoint definido en web.php
        post('/invitacion/empresa/confirmar', {
            onFinish: () => {
                // Limpiamos contraseñas si hay un error de validación
                if (!usuarioYaExiste) {
                    setData('password', '');
                    setData('password_confirmation', '');
                }
            },
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
            <Head title={`Invitación a ${nombreEmpresa}`} />

            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-center dark:text-white mb-2">
                    {usuarioYaExiste ? '¡Hola de nuevo!' : 'Invitación de Empresa'}
                </h2>
                
                {/* Banner informativo de la invitación */}
                <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                    <p className="text-sm text-center text-indigo-900 dark:text-indigo-300">
                        Has sido invitado a unirte a <strong>{nombreEmpresa}</strong> con el rol de <strong>{nombreRol}</strong>.
                    </p>
                </div>

                <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
                    {usuarioYaExiste 
                        ? `Tu cuenta (${emailInvitacion}) ya está en el sistema. Haz clic abajo para aceptar la vinculación.`
                        : `Crea tu cuenta para empezar a colaborar con ${nombreEmpresa}.`}
                </p>
                
                <form onSubmit={submit} className="space-y-4">
                    {/* Solo mostramos los campos de registro si el usuario NO existe */}
                    {!usuarioYaExiste && (
                        <>
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300">Nombre Usuario</label>
                                <input
                                    className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    required
                                    placeholder="Tu nombre usuario"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300">Establecer Contraseña</label>
                                <input
                                    type="password"
                                    className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    required
                                    placeholder="Mínimo 8 caracteres"
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300">Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    required
                                    placeholder="Repite tu contraseña"
                                />
                            </div>
                        </>
                    )}

                    {/* Botón de acción dinámico */}
                    <button 
                        type="submit"
                        className="w-full bg-indigo-600 text-white p-2.5 rounded-md hover:bg-indigo-700 transition-colors font-bold shadow-sm disabled:opacity-50"
                        disabled={processing}
                    >
                        {processing 
                            ? 'Procesando...' 
                            : usuarioYaExiste ? 'Aceptar Invitación y Entrar' : 'Registrarse y Unirme'}
                    </button>
                    
                    {/* Visualización de error genérico del servidor con casting de TS */}
                    {(errors as any).error && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded">
                            <p className="text-red-500 text-center text-sm">{(errors as any).error}</p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}