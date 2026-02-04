<?php

namespace App\Http\Controllers;

use App\Models\UsuarioEmpresa;
use App\Models\AdminSistema;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class SeleccionarEmpresaController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // Verificamos si es Staff
        $esStaff = AdminSistema::where('id', $user->id)->exists();

        $empresas = UsuarioEmpresa::where('id', $user->id)
            ->with(['empresa', 'rol'])
            ->get()
            ->map(function ($relacion) {
                return [
                    'idEmpresa' => $relacion->empresa->idEmpresa,
                    'nombreEmpresa' => $relacion->empresa->nombreEmpresa,
                    'rol' => $relacion->rol->nombreRol,
                ];
            });

        if ($empresas->isEmpty() && !$esStaff) {
            return Inertia::render('dashboard', ['mensaje' => 'No tienes empresas asignadas.']);
        }

        return Inertia::render('auth/SeleccionarEmpresa', [
            'empresas' => $empresas
        ]);
    }

    public function setCompany(Request $request)
    {
        $request->validate(['idEmpresa' => 'required|integer']);

        $user = Auth::user();
        
        $relacion = UsuarioEmpresa::where('id', $user->id)
            ->where('idEmpresa', $request->idEmpresa)
            ->with(['empresa', 'rol'])
            ->first();

        if ($relacion) {
            // limpiamos evitar conflictos de caché
            $request->session()->forget([
                'active_company_id', 
                'active_company_name', 
                'active_role_id', 
                'active_role_name'
            ]);

            // guardamos los nuevos datos 
            $request->session()->put('active_company_id', (int) $relacion->idEmpresa);
            $request->session()->put('active_company_name', $relacion->empresa->nombreEmpresa);
            $request->session()->put('active_role_id', (int) $relacion->idRol);
            $request->session()->put('active_role_name', $relacion->rol->nombreRol);

            //persistencia en la base de datos sesiones
            $request->session()->save(); 

            // redireccion limpia al Dashboard
            // redirect('/') o redirect('/dashboard') para forzar a inertia 
            // a recargar los shared props en el siguiente ciclo.
            return redirect()->route('dashboard');
        }

        return back()->with('error', 'Empresa no válida.');
    }
}