<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Symfony\Component\HttpFoundation\Response;

class HandleAppearance
{
    public function handle(Request $request, Closure $next): Response
    {
        // Forzamos que la clase dark esté disponible para Inertia
        $appearance = $request->cookie('appearance', 'system');

        return $next($request);
    }
}