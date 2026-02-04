<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Models\AdminSistema;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminEmpresaUsuarioController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $esStaff = AdminSistema::where('id', $user->id)->first();

        if (!$esStaff) {
            abort(403, 'Aviso: No tienes permisos de Staff.');
        }

        // Cargamos empresas y para los usuarios hacemos un join manual con roles
        // para asegurar que el dato 'nombreRol' llegue en el primer nivel del objeto usuario
        $empresas = Empresa::with(['usuarios' => function($query) {
            // IMPORTANTE: Laravel ya hizo el join con 'usuarioEmpresa' automáticamente
            // Solo necesitamos unir la tabla de 'roles' usando la tabla pivote que ya está cargada
            $query->join('roles', 'usuarioEmpresa.idRol', '=', 'roles.idRol')
                ->select(
                    'users.id', 
                    'users.name', 
                    'users.email', 
                    'roles.nombreRol as nombre_rol_asignado'
                );
        }])
        ->orderBy('nombreEmpresa', 'asc')
        ->get();

        return Inertia::render('Admin/empresas-usuarios-list', [
            'empresas' => $empresas
        ]);
    }
}