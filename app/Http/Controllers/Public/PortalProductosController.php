<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\Categoria;
use Inertia\Inertia;
use Illuminate\Http\Request;

class PortalProductosController extends Controller
{
    /**
     * Muestra todos los productos del portal.
     */
    public function index()
    {
        // 1. Obtener categorías únicas por nombre para el Sidebar
        $categorias = Categoria::where('estadoCategoria', true)
            ->select('nombreCategoria')
            ->distinct()
            ->orderBy('nombreCategoria', 'asc')
            ->get();

        // 2. Obtener todos los productos activos
        $items = Item::with(['imagenes', 'empresa', 'categoria'])
            ->where('estadoItem', true)
            ->latest()
            ->get();

        return Inertia::render('Public/PortalProductos', [
            'categorias' => $categorias,
            'items' => $items,
            'categoriaActual' => null // Indica que estamos viendo "Todos"
        ]);
    }

    /**
     * Muestra los productos filtrados por el nombre de la categoría (unificada).
     */
    public function porCategoria($nombre)
    {
        // 1. Mantener las categorías en el Sidebar
        $categorias = Categoria::where('estadoCategoria', true)
            ->select('nombreCategoria')
            ->distinct()
            ->orderBy('nombreCategoria', 'asc')
            ->get();

        // 2. Filtrar items que pertenezcan a categorías con ese nombre
        // Buscamos en la relación 'categoria' el campo 'nombreCategoria'
        $items = Item::whereHas('categoria', function($q) use ($nombre) {
                $q->where('nombreCategoria', $nombre);
            })
            ->with(['imagenes', 'empresa', 'categoria'])
            ->where('estadoItem', true)
            ->latest()
            ->get();

        return Inertia::render('Public/PortalProductos', [
            'categorias' => $categorias,
            'items' => $items,
            'categoriaActual' => $nombre // Enviamos el nombre para resaltar el botón en el frontend
        ]);
    }
}