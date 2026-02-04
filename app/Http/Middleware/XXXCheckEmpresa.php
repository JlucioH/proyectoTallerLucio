<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class XXXCheckEmpresa
{
    /**
     * Verifica que el usuario tenga una empresa activa en la sesión.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Si el usuario NO tiene una empresa seleccionada en la sesión
        if (!$request->session()->has('active_company_id')) {
            
            // Y si no está ya en la página de selección (para evitar bucles infinitos)
            if (!$request->is('select-company*')) {
                return redirect()->route('company.select')
                    ->with('error', 'Por favor, selecciona una empresa para continuar.');
            }
        }

        return $next($request);
    }
}