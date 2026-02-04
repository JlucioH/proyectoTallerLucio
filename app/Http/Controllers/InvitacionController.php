<?php

namespace App\Http\Controllers;

use App\Models\InvitacionEmpresa;
use App\Mail\InvitacionEmpresaMail; // Mailable
use App\Models\User;
use App\Models\UsuarioEmpresa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail; // Importa el Facade de Mail
use Illuminate\Support\Str;

class InvitacionController extends Controller
{
    public function showRegistrationForm($token)
    {
        // 1. Buscamos la invitación (Tabla: invitacionEmpresa)
        $invitacion = InvitacionEmpresa::where('tokenInvitacionEmpresa', $token)
            ->where('aceptada', false)
            ->where('fechaExpiracionEmpresa', '>', now())
            ->with('empresa') // Relación definida en el Modelo
            ->firstOrFail(); 

        // 2. Buscamos si ya existe un usuario con ese correo (Tabla: users)
        // Cambiamos 'emailInvitacionEmpresa' por 'email' que es el estándar de la tabla users
        $usuarioExistente = User::where('email', $invitacion->emailInvitacionEmpresa)->exists();

        // 3. Enviamos los datos a React
        return Inertia::render('auth/RegisterInvitado', [
            'token' => $token, // Valor de la URL
            'emailInvitacion' => $invitacion->emailInvitacionEmpresa, // De la tabla invitaciones
            'nombreEmpresa' => $invitacion->empresa->nombreEmpresa,    // De la tabla empresas
            'usuarioYaExiste' => $usuarioExistente // Resultado del check anterior
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validamos que el email sea correcto
        $request->validate([
            'email' => 'required|email',
        ]);

        try {
            DB::beginTransaction();

            // 2. Creamos la invitación en la base de datos
            $invitacion = InvitacionEmpresa::create([
                'idEmpresa'              => Auth::user()->idEmpresa, // ID de la empresa del admin logueado
                'emailInvitacionEmpresa' => $request->email,
                'tokenInvitacionEmpresa' => Str::random(40),
                'fechaExpiracionEmpresa' => now()->addDays(7), // Expira en una semana
                'aceptada'               => false,
            ]);

            // 3. ENVIAR EL CORREO (Paso 4)
            // Esto usa el Mailable que configuramos con Markdown
            Mail::to($invitacion->emailInvitacionEmpresa)
                ->send(new InvitacionEmpresaMail($invitacion));

            DB::commit();

            return redirect()->back()->with('message', '¡Invitación enviada con éxito!');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'No se pudo enviar la invitación: ' . $e->getMessage()]);
        }
    }

    public function register(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'name' => 'nullable|string|max:255',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        try {
            DB::beginTransaction();

            $invitacion = InvitacionEmpresa::where('tokenInvitacionEmpresa', $request->token)
                ->where('aceptada', false)
                ->firstOrFail();

            // Buscamos al usuario por el email de la invitación
            $user = User::where('email', $invitacion->emailInvitacionEmpresa)->first();

            // CASO A: Si el usuario NO existe, lo creamos ahora
            if (!$user) {
                $user = User::create([
                    'name' => $request->name,
                    'email' => $invitacion->emailInvitacionEmpresa,
                    'password' => Hash::make($request->password),
                ]);
            }

            // CASO B: En ambos casos (nuevo o existente), lo ligamos a la empresa
            // Usamos updateOrCreate para evitar duplicados en la tabla pívot
            UsuarioEmpresa::updateOrCreate(
                ['id' => $user->id, 'idEmpresa' => $invitacion->idEmpresa],
                ['idRol' => 2] // Rol de Admin de Empresa
            );

            // Marcamos la invitación como usada
            $invitacion->update(['aceptada' => true]);

            DB::commit();

            // Logueamos al usuario y al dashboard
            Auth::login($user);
            return redirect()->route('dashboard');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Error: ' . $e->getMessage()]);
        }
    }
}