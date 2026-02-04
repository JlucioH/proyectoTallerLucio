<?php

namespace App\Http\Controllers;

use App\Models\InvitacionUsuarioRolEmpresa;
use App\Models\User;
use App\Models\UsuarioEmpresa;
use App\Models\Empresa;
use App\Notifications\InvitacionUsuarioRolEmpresaNotification; 
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class InvitacionUsuarioRolEmpresaController extends Controller
{
    /**
     * Lista de usuarios y solicitudes pendientes (Vista Admin Empresa)
     */
    public function index()
    {
        $idEmpresa = session('active_company_id');
        if (!$idEmpresa) {
            return redirect()->route('dashboard')->with('error', 'Seleccione una empresa.');
        }

        // Importante: Asegúrate que tus modelos tengan las relaciones 'usuario' y 'rol'
        $usuarios_activos = UsuarioEmpresa::where('idEmpresa', $idEmpresa)
            ->with(['usuario', 'rol'])
            ->get();

        $invitaciones = InvitacionUsuarioRolEmpresa::where('idEmpresa', $idEmpresa)
            ->where('aceptada', false)
            ->where('fechaExpiracionUsuarioRolEmpresa', '>', now())
            ->with('rol')
            ->get();

        return Inertia::render('Empresa/usuarios/Index', [
            'usuarios_activos' => $usuarios_activos,
            'invitaciones' => $invitaciones,
            'roles_disponibles' => [
                ['id' => 2, 'nombre' => 'Admin Empresa'], 
                ['id' => 3, 'nombre' => 'Admin Almacén'], 
                ['id' => 4, 'nombre' => 'Vendedor']
            ],
            'status' => session('message'),
        ]);
    }

    /**
     * El Administrador envía la invitación
     */
    public function enviar(Request $request)
    {
        $request->validate(['email' => 'required|email', 'idRol' => 'required|in:2,3,4']);

        $idEmpresa = session('active_company_id');
        $empresa = Empresa::find($idEmpresa);

        if (!$empresa) return back()->withErrors(['email' => 'Empresa no encontrada en sesión.']);

        try {
            DB::beginTransaction();
            $token = Str::random(40);
            $invitacion = InvitacionUsuarioRolEmpresa::create([
                'idEmpresa' => $idEmpresa,
                'idRol' => $request->idRol,
                'emailInvitacionUsuarioRolEmpresa' => $request->email,
                'tokenInvitacionUsuarioRolEmpresa' => $token,
                'fechaExpiracionUsuarioRolEmpresa' => now()->addDays(7),
                'aceptada' => false,
            ]);

            Notification::route('mail', $request->email)
                ->notify(new InvitacionUsuarioRolEmpresaNotification($empresa, $token));

            DB::commit();
            return redirect()->back()->with('message', '¡Invitación enviada exitosamente!');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error enviando invitación: " . $e->getMessage());
            return redirect()->back()->withErrors(['email' => 'Error al enviar: ' . $e->getMessage()]);
        }
    }

    /**
     * Muestra el formulario de registro/aceptación al invitado
     */
    public function showRegistrationForm($token)
    {
        $invitacion = InvitacionUsuarioRolEmpresa::where('tokenInvitacionUsuarioRolEmpresa', $token)
            ->where('aceptada', false)
            ->where('fechaExpiracionUsuarioRolEmpresa', '>', now())
            ->with(['empresa', 'rol'])
            ->firstOrFail();

        $usuarioExistente = User::where('email', $invitacion->emailInvitacionUsuarioRolEmpresa)->exists();

        // CAMBIO AQUÍ: 'auth/RegisterInvitadoSede' -> 'auth/RegisterInvitadoEmpresa'
        return Inertia::render('auth/RegisterInvitadoUsuarioRolEmpresa', [
            'token' => $token,
            'emailInvitacion' => $invitacion->emailInvitacionUsuarioRolEmpresa,
            'nombreEmpresa' => $invitacion->empresa->nombreEmpresa ?? 'N/A',
            'nombreRol' => $invitacion->rol->nombreRol ?? 'N/A',
            'usuarioYaExiste' => $usuarioExistente
        ]);
    }

    /**
     * Procesa el registro o la vinculación final del invitado
     */
    public function register(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'name' => 'nullable|required_if:usuarioYaExiste,false|string|max:255',
            'password' => 'nullable|required_if:usuarioYaExiste,false|string|min:8|confirmed',
        ]);

        try {
            DB::beginTransaction();

            $invitacion = InvitacionUsuarioRolEmpresa::where('tokenInvitacionUsuarioRolEmpresa', $request->token)
                ->where('aceptada', false)
                ->firstOrFail();

            $user = User::where('email', $invitacion->emailInvitacionUsuarioRolEmpresa)->first();

            if (!$user) {
                $user = User::create([
                    'name' => $request->name,
                    'email' => $invitacion->emailInvitacionUsuarioRolEmpresa,
                    'password' => Hash::make($request->password),
                ]);
            }

            // IMPORTANTE: Asegúrate de que el modelo UsuarioEmpresa use 'id' para el User ID e 'idEmpresa'
            UsuarioEmpresa::updateOrCreate(
                ['id' => $user->id, 'idEmpresa' => $invitacion->idEmpresa],
                ['idRol' => $invitacion->idRol]
            );

            $invitacion->update(['aceptada' => true]);

            DB::commit();

            Auth::login($user);
            
            return redirect()->route('company.select')
                ->with('message', 'Te has unido con éxito a ' . ($invitacion->empresa->nombreEmpresa ?? 'la empresa'));

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error en registro/vinculación: " . $e->getMessage());
            // CAMBIO AQUÍ: Enviamos el error bajo la clave 'error' para que RegisterInvitadoEmpresa lo detecte
            return redirect()->back()->withErrors(['error' => 'No se pudo procesar la solicitud: ' . $e->getMessage()]);
        }
    }
}