<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UsuarioEmpresa;
use App\Models\AdminSistema;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApiSeleccionarEmpresaController extends Controller
{
    /**
     * Lista las empresas vinculadas al usuario autenticado.
     * Se usa para mostrar el listado inicial en Flutter.
     */
    public function obtenerEmpresas()
    {
        $user = Auth::user();
        
        // Verifica si el usuario es administrador del sistema
        $esStaff = AdminSistema::where('id', $user->id)->exists();

        // Obtenemos las relaciones cargando los modelos de empresa y rol
        $empresas = UsuarioEmpresa::where('id', $user->id)
            ->with(['empresa', 'rol'])
            ->get()
            ->map(function ($relacion) {
                return [
                    'idEmpresa'     => $relacion->empresa->idEmpresa,
                    'nombreEmpresa' => $relacion->empresa->nombreEmpresa,
                    // Accedemos al logo a través de la relación 'empresa'
                    'logoEmpresa'   => $relacion->empresa->logoEmpresa, 
                    'rol'           => $relacion->rol->nombreRol,
                ];
            });

        return response()->json([
            'empresas' => $empresas,
            'esStaff'  => $esStaff
        ]);
    }

    /**
     * Valida la selección de una empresa específica.
     */
    public function seleccionarEmpresa(Request $request)
    {
        $request->validate(['idEmpresa' => 'required|integer']);
        $user = Auth::user();
        
        // Buscamos la relación específica cargando también la empresa para obtener el logo
        $relacion = UsuarioEmpresa::where('id', $user->id)
            ->where('idEmpresa', $request->idEmpresa)
            ->with('empresa')
            ->first();

        if ($relacion) {
            return response()->json([
                'success'       => true,
                'mensaje'       => 'Empresa seleccionada correctamente',
                'idEmpresa'     => $relacion->idEmpresa,
                // Corregido: Acceso al logo desde la relación empresa
                'logoEmpresa'   => $relacion->empresa->logoEmpresa, 
                'nombreEmpresa' => $relacion->empresa->nombreEmpresa,
            ]);
        }

        return response()->json(['error' => 'Empresa no válida o no vinculada'], 403);
    }
}