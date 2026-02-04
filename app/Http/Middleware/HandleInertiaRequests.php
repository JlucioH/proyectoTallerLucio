<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\AdminSistema;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        $user = $request->user();
        $idEmpresaActiva = session('active_company_id');
        $idRolActivo = session('active_role_id');

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'rol_id' => session('active_role_id'),
                'rol' => session('active_role_name'),
                'empresa' => session('active_company_name'),
                // NOTIFICACIONES: Buscamos dentro del JSON 'data' el id de la empresa activa
                'notifications' => ($user && $idEmpresaActiva && in_array($idRolActivo, [2, 3]))
                    ? $user->unreadNotifications()
                        ->where('data->idEmpresa', (int)$idEmpresaActiva)
                        ->get()
                    : [],
                // Permiso para ver ventas basado en el rol activo
                'can_manage_sales' => in_array($idRolActivo, [2, 3]),
            ],
            'is_staff' => $user 
                ? \App\Models\AdminSistema::where('id', $user->id)->exists() 
                : false,
            // Mantén aquí tus stats, items y categorias como los tienes actualmente
            'items' => $request->attributes->get('items', []), 
            'categorias' => $request->attributes->get('categorias', []),
            
            // Compartimos la ID de la empresa activa para usarla en los formularios de ventas
            'idEmpresaActiva' => $idEmpresaActiva,
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}