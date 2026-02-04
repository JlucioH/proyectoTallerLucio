<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EmpresaEsSeleccionada
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle($request, Closure $next)
    {
        $user = $request->user();
        
        // 1. Verificamos si es Staff. El Staff NO necesita seleccionar empresa obligatoriamente.
        $esStaff = \App\Models\AdminSistema::where('id', $user->id)->exists();

        if ($esStaff) {
            return $next($request);
        }

        // 2. Si es un usuario de empresa (Rol 2, 3, 4) y no ha seleccionado empresa:
        if (!session()->has('active_company_id')) {
            return redirect()->route('company.select');
        }

        return $next($request);
    }

    public function setCompany(Request $request)
{
    $request->validate(['idEmpresa' => 'required']);

    $user = \Illuminate\Support\Facades\Auth::user();

    $relacion = \App\Models\UsuarioEmpresa::where('id', $user->id)
        ->where('idEmpresa', $request->idEmpresa)
        ->with(['empresa', 'rol'])
        ->first();

    if ($relacion) {
        // Usamos put() para asegurar que Laravel 12 registre el cambio
        $request->session()->put('active_company_id', $relacion->idEmpresa);
        $request->session()->put('active_company_name', $relacion->empresa->nombreEmpresa);
        $request->session()->put('active_role_name', $relacion->rol->nombreRol);
        $request->session()->put('active_role_id', (int)$relacion->idRol); // Forzamos a entero
        
        // Esto es lo que le faltaba para que el Sidebar lo vea de inmediato
        $request->session()->save(); 
        
        return redirect()->route('dashboard');
    }

    return back()->with('error', 'Acceso denegado.');
}
}
