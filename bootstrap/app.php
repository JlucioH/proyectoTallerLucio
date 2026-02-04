<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        
        // 1. Configuración de Cookies (Correcto)
        $middleware->encryptCookies(except: [
            'appearance', 
            'sidebar_state'
        ]);

        // 2. Middlewares del grupo Web
        // IMPORTANTE: Aseguramos que HandleInertiaRequests sea el último en ejecutarse
        $middleware->web(append: [
            HandleAppearance::class,
            AddLinkHeadersForPreloadedAssets::class,
            HandleInertiaRequests::class, 
        ]);

        // 3. Alias (Correcto)
        $middleware->alias([
            'is.staff' => \App\Http\Middleware\CheckStaff::class,
            'check.company' => \App\Http\Middleware\EmpresaEsSeleccionada::class,
        ]);

        // 4. Forzar que la sesión se inicie correctamente en peticiones Inertia
        $middleware->statefulApi(); 
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();