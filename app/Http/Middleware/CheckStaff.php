<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AdminSistema; // Tu tabla de administradores

class CheckStaff
{
    /**
     * handle: Es la función que procesa la petición.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. auth()->check(): Verifica si el usuario inició sesión.
        // 2. AdminSistema::where...: Busca si el ID del usuario está en tu tabla VIP.
        if (auth()->check() && AdminSistema::where('id', auth()->id())->exists()) {
            return $next($request); // "Luz verde": Pasa al siguiente paso.
        }

        // "Luz roja": Si no es staff, lo mandamos al dashboard normal.
        return redirect('/dashboard')->with('error', 'No tienes permisos de Staff.');
    }
}