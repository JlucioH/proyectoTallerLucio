import { FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';


interface Props {
    token: string;
    emailInvitacion: string;
    nombreEmpresa: string;
    usuarioYaExiste: boolean; // Recibimos la nueva variable
}

export default function RegisterInvitado({ token, emailInvitacion, nombreEmpresa, usuarioYaExiste }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        token: token,
        name: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // @ts-ignore
        //post(route('invitacion.register'));
        post('/registro-invitado/finalizar');
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
            <Head title="Invitación de Empresa" />

            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-center dark:text-white mb-4">
                    {usuarioYaExiste ? '¡Bienvenido de nuevo!' : `Únete a ${nombreEmpresa}`}
                </h2>

                <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
                    {usuarioYaExiste 
                        ? `Tu cuenta (${emailInvitacion}) ya está registrada. Haz clic abajo para vincularte a ${nombreEmpresa}.`
                        : `Estás creando una cuenta vinculada a ${nombreEmpresa}.`}
                </p>
                
                <form onSubmit={submit} className="space-y-4">
                    {!usuarioYaExiste && (
                        <>
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300">Nombre Usuario</label>
                                <input
                                    className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300">Nueva Contraseña</label>
                                <input
                                    type="password"
                                    className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    required
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300">Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <button 
                        className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 font-bold"
                        disabled={processing}
                    >
                        {processing ? 'Procesando...' : usuarioYaExiste ? 'Aceptar y Entrar' : 'Registrarse y Unirse'}
                    </button>
                </form>
            </div>
        </div>
    );
}