<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use App\Models\Empresa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CategoriaController extends Controller
{
    /**
     * Valida el Rol (2 o 3) y asegura que el usuario pertenezca 
     * a la empresa activa en la sesión.
     */
    private function getEmpresaId() {
        $user = Auth::user();
        $activeCompanyId = session('active_company_id');

        if (!$activeCompanyId) {
            abort(403, 'No hay una empresa seleccionada en la sesión.');
        }

        // Buscamos el vínculo específico del usuario con la empresa seleccionada
        $vinculo = DB::table('usuarioEmpresa')
            ->where('id', $user->id)
            ->where('idEmpresa', $activeCompanyId)
            ->first();

        // Validamos que exista el vínculo y que tenga Rol 2 (Admin Empresa) o 3 (Admin Almacén)
        if (!$vinculo || !in_array($vinculo->idRol, [2, 3])) {
            abort(403, 'No tienes permisos para gestionar categorías en esta empresa.');
        }

        return $activeCompanyId;
    }

    public function index() {
        $idEmpresa = $this->getEmpresaId();
        
        $categorias = Categoria::where('idEmpresa', $idEmpresa)
            ->orderBy('nombreCategoria', 'asc')
            ->get();

        return Inertia::render('Inventario/CategoriasList', [
            'categorias' => $categorias
        ]);
    }



    /**
     * Vista para Staff (Administrador de Sistema)
     * Como esta ruta ya pasa por el middleware 'is.staff', no volvemos a validar aquí.
     */
    public function indexAdmin() {
        // Obtenemos todas las empresas con sus respectivos clientes
        $empresas = Empresa::with(['categorias' => function($query) {
            $query->orderBy('nombreCategoria', 'asc');
        }])
        ->orderBy('nombreEmpresa', 'asc')
        ->get()
        ->map(function($empresa) {
            return [
                'idEmpresa' => $empresa->idEmpresa,
                'nombreEmpresa' => $empresa->nombreEmpresa,
                'nitEmpresa' => $empresa->nitEmpresa,
                'categorias' => $empresa->categorias
            ];
        });

        // Apuntamos al componente exacto que mencionaste: Pages/Admin/AdminList.tsx
        return Inertia::render('Admin/AdminCategoriasList', [
            'empresas' => $empresas
        ]);
    }



    public function store(Request $request) {
        $idEmpresa = $this->getEmpresaId();
        
        $request->validate([
            'nombreCategoria' => 'required|string|max:255'
        ]);

        Categoria::create([
            'nombreCategoria' => $request->nombreCategoria,
            'idEmpresa' => $idEmpresa,
            'estadoCategoria' => true // Por defecto activa
        ]);

        return redirect()->back()->with('message', 'Categoría creada con éxito.');
    }

    public function update(Request $request, $id) {
        $idEmpresa = $this->getEmpresaId();
        
        // El where idEmpresa es vital por seguridad para que no editen categorías ajenas
        $categoria = Categoria::where('idCategoria', $id)
            ->where('idEmpresa', $idEmpresa)
            ->firstOrFail();

        $request->validate([
            'nombreCategoria' => 'required|string|max:255'
        ]);

        $categoria->update([
            'nombreCategoria' => $request->nombreCategoria
        ]);

        return redirect()->back()->with('message', 'Categoría actualizada.');
    }

    public function toggleEstado($id) {
        $idEmpresa = $this->getEmpresaId();
        
        $categoria = Categoria::where('idCategoria', $id)
            ->where('idEmpresa', $idEmpresa)
            ->firstOrFail();
        
        $categoria->update([
            'estadoCategoria' => !$categoria->estadoCategoria
        ]);

        return redirect()->back()->with('message', 'Estado de categoría actualizado.');
    }
}