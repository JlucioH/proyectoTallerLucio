<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use Illuminate\Http\Request;

class ApiItemController extends Controller
{
    public function index(Request $request)
    {
        $idEmpresa = $request->header('idEmpresa');
        
        $items = Item::with(['categoria', 'imagenes' => function($q) {
                $q->orderBy('ordenImagenItem', 'asc');
            }])
            ->where('idEmpresa', $idEmpresa)
            ->where('estadoItem', true)
            ->orderBy('nombreItem', 'asc')
            ->get()
            ->map(function($item) {
                // Buscamos la imagen que tiene orden 1 (tu lógica de portada)
                $imagenPortada = $item->imagenes->firstWhere('ordenImagenItem', 1);
                
                return [
                    'idItem' => $item->idItem,
                    'nombreItem' => $item->nombreItem,
                    'codigoItem' => $item->codigoItem,
                    'precioVentaItem' => $item->precioVentaItem,
                    'cantidadItem' => $item->cantidadItem,
                    'categoria' => $item->categoria?->nombreCategoria ?? 'Sin Categoría',
                    // Construimos la URL completa para el Xiaomi
                    'fotoUrl' => $imagenPortada 
                        ? asset('storage/' . $imagenPortada->rutaImagenItem) 
                        : null,
                ];
            });

        return response()->json($items);
    }
}