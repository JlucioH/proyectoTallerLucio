<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Categoria;
use App\Models\Empresa;
use App\Models\ImagenItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ItemController extends Controller
{
    /**
     * Valida permisos y retorna el ID de la empresa activa.
     */
    private function getEmpresaId() {
        $activeCompanyId = session('active_company_id');
        if (!$activeCompanyId) abort(403, 'No hay una empresa seleccionada.');

        $vinculo = DB::table('usuarioEmpresa')
            ->where('id', Auth::id())
            ->where('idEmpresa', $activeCompanyId)
            ->first();

        if (!$vinculo || !in_array($vinculo->idRol, [2, 3])) {
            abort(403, 'No tienes permisos.');
        }

        return $activeCompanyId;
    }

    /**
     * Lista los ítems con sus categorías e imágenes ordenadas.
     */
    public function index() {
        $idEmpresa = $this->getEmpresaId();
        $user = Auth::user();

        // --- INICIO LIMPIEZA DE NOTIFICACIONES ---
        if ($user) {
            $user->unreadNotifications()
                ->where('data->idEmpresa', (int)$idEmpresa)
                ->where('type', 'App\Notifications\CantidadMinItemNotification')
                ->get()
                ->markAsRead();
        }
        // --- FIN LIMPIEZA DE NOTIFICACIONES ---
        
        $items = Item::with(['categoria', 'imagenes' => function($q) {
                $q->orderBy('ordenImagenItem', 'asc');
            }])
            ->where('idEmpresa', $idEmpresa)
            ->orderBy('nombreItem', 'asc')
            ->get();

        $categorias = Categoria::where('idEmpresa', $idEmpresa)
            ->where('estadoCategoria', true)
            ->get();

        return Inertia::render('Inventario/ItemsList', [
            'items' => $items,
            'categorias' => $categorias
        ]);
    }

    /**
     * Administradores lista de empresas items
     */
    public function indexAdmin() {
        $empresas = Empresa::with(['items' => function($query) {
            $query->orderBy('nombreItem', 'asc')->with('categoria')->with('imagenes');
        }])
        ->orderBy('nombreEmpresa', 'asc')
        ->get()
        ->map(function($empresa) {
            return [
                'idEmpresa' => $empresa->idEmpresa,
                'nombreEmpresa' => $empresa->nombreEmpresa,
                'nitEmpresa' => $empresa->nitEmpresa,
                'items' => $empresa->items->map(function($item) {
                    $imagenPortada = $item->imagenes->firstWhere('ordenImagenItem', 1);
                    return [
                        'idItem' => $item->idItem,
                        'codigoItem' => $item->codigoItem,
                        'nombreItem' => $item->nombreItem,
                        'cantidadItem' => $item->cantidadItem,
                        'cantidadMinItem' => $item->cantidadMinItem,
                        'precioVentaItem' => $item->precioVentaItem, // AÑADIDO
                        'estadoItem' => $item->estadoItem,
                        'categoria' => [
                            'idCategoria' => $item->categoria?->idCategoria,
                            'nombreCategoria' => $item->categoria?->nombreCategoria ?? 'Sin Categoría',
                        ],
                        'portada' => [
                            'idImagenItem' => $imagenPortada?->idImagenItem,
                            'ruta' => $imagenPortada 
                                ? asset('storage/' . $imagenPortada->rutaImagenItem) 
                                : null,
                        ],
                    ];
                })
            ];
        });

        return Inertia::render('Admin/AdminItemsList', [
            'empresas' => $empresas
        ]);
    }

    /**
     * Crea un nuevo item
     */
    public function store(Request $request) {
        $idEmpresa = $this->getEmpresaId();
        
        $validated = $request->validate([
            'codigoItem'      => 'required|unique:items,codigoItem',
            'nombreItem'      => 'required|string|max:255',
            'descripcionItem' => 'nullable|string|max:255',
            'idCategoria'     => 'required|exists:categorias,idCategoria',
            'cantidadItem'    => 'required|numeric|min:0',
            'cantidadMinItem' => 'required|numeric|min:0',
            'precioVentaItem' => 'required|numeric|min:0', // AÑADIDO
            'imagen'          => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        return DB::transaction(function () use ($validated, $idEmpresa, $request) {
            $item = Item::create([
                'codigoItem'      => $validated['codigoItem'],
                'nombreItem'      => $validated['nombreItem'],
                'descripcionItem' => $request->descripcionItem ?? '', 
                'idCategoria'     => $validated['idCategoria'],
                'idEmpresa'       => $idEmpresa,
                'estadoItem'      => true,
                'cantidadItem'    => $validated['cantidadItem'],
                'cantidadMinItem' => $validated['cantidadMinItem'],
                'precioVentaItem' => $validated['precioVentaItem'], // AÑADIDO
                'costoItem'       => 0,
                'importeItem'     => 0,
            ]);

            if ($request->hasFile('imagen')) {
                $this->saveItemImage($request->file('imagen'), $item, $idEmpresa);
            }

            return redirect()->back()->with('message', 'Ítem creado con éxito.');
        });
    }

    /**
     * Actualiza los datos del ítem, incluyendo stock e imagen principal.
     */
    public function update(Request $request, $id) {
        $idEmpresa = $this->getEmpresaId();
        
        $item = Item::where('idItem', $id)
                    ->where('idEmpresa', $idEmpresa)
                    ->firstOrFail();

        $validated = $request->validate([
            'codigoItem'      => 'required|unique:items,codigoItem,' . $id . ',idItem',
            'nombreItem'      => 'required|string|max:255',
            'descripcionItem' => 'nullable|string|max:255',
            'idCategoria'     => 'required|exists:categorias,idCategoria',
            'cantidadItem'    => 'required|numeric|min:0',
            'cantidadMinItem' => 'required|numeric|min:0',
            'precioVentaItem' => 'required|numeric|min:0', // AÑADIDO
            'imagen'          => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        DB::transaction(function () use ($request, $item, $idEmpresa, $validated) {
            $item->update([
                'codigoItem'      => $validated['codigoItem'],
                'nombreItem'      => $validated['nombreItem'],
                'descripcionItem' => $request->descripcionItem ?? '',
                'idCategoria'     => $validated['idCategoria'],
                'cantidadItem'    => $validated['cantidadItem'],
                'cantidadMinItem' => $validated['cantidadMinItem'],
                'precioVentaItem' => $validated['precioVentaItem'], // AÑADIDO
            ]);

            if ($request->hasFile('imagen')) {
                $this->saveItemImage($request->file('imagen'), $item, $idEmpresa);
            }
        });

        return redirect()->back()->with('message', 'Ítem actualizado correctamente.');
    }

    /**
     * Cambia el estado (Activo/Inactivo) del ítem.
     */
    public function toggleEstado($id) {
        $idEmpresa = $this->getEmpresaId();
        
        $item = Item::where('idItem', $id)
            ->where('idEmpresa', $idEmpresa)
            ->firstOrFail();

        $item->update([
            'estadoItem' => !$item->estadoItem
        ]);

        return redirect()->back()->with('message', 'Estado actualizado.');
    }

    /**
     * Lógica simplificada para guardar/reemplazar imagen principal (Orden 1).
     */
    private function saveItemImage($file, $item, $idEmpresa) {
        // 1. Definir ruta
        $path = "empresas/empresa_{$idEmpresa}/items/item_{$item->idItem}";
        $fileName = time() . '_' . $file->getClientOriginalName();
        $fullPath = $file->storeAs($path, $fileName, 'public');

        // 2. Buscar si ya existe una imagen de "portada" (orden 1)
        $imagenExistente = DB::table('imagenItem')
            ->where('idItem', $item->idItem)
            ->where('ordenImagenItem', 1)
            ->first();

        if ($imagenExistente) {
            // Eliminar archivo físico anterior
            Storage::disk('public')->delete($imagenExistente->rutaImagenItem);
            
            // Actualizar registro
            DB::table('imagenItem')
                ->where('idImagenItem', $imagenExistente->idImagenItem)
                ->update([
                    'rutaImagenItem' => $fullPath,
                    'updated_at'     => now(),
                ]);
        } else {
            // Crear registro nuevo con orden 1
            DB::table('imagenItem')->insert([
                'rutaImagenItem'  => $fullPath,
                'idItem'          => $item->idItem,
                'ordenImagenItem' => 1,
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);
        }
    }

    public function updateImagenOrden(Request $request, $idImagen) {
        $this->getEmpresaId(); 
        $validated = $request->validate(['orden' => 'required|integer|min:1']);
        DB::table('imagenItem')->where('idImagenItem', $idImagen)->update(['ordenImagenItem' => $validated['orden']]);
        return redirect()->back()->with('message', 'Orden actualizado.');
    }

    public function destroyImagen($idImagen) {
        $this->getEmpresaId(); 
        $imagen = DB::table('imagenItem')->where('idImagenItem', $idImagen)->first();
        if ($imagen) {
            Storage::disk('public')->delete($imagen->rutaImagenItem);
            DB::table('imagenItem')->where('idImagenItem', $idImagen)->delete();
        }
        return redirect()->back()->with('message', 'Imagen eliminada.');
    }


    public function guardarRapidoItem(Request $request) 
    {
        
        $request->validate([
            'codigoItem'      => 'required|unique:items,codigoItem',
            'nombreItem'      => 'required|string|max:255',
            'descripcionItem' => 'nullable|string|max:255',
            'idCategoria'     => 'required|exists:categorias,idCategoria',
            'precioVentaItem' => 'required|numeric|min:0', // AÑADIDO
        ]);

        $p = new Item();
        $p->codigoItem = $request->codigoItem;
        $p->nombreItem = $request->nombreItem;
        $p->descripcionItem = $request->descripcionItem;
        $p->idCategoria = $request->idCategoria;
        $p->precioVentaItem = $request->precioVentaItem;
        $p->idEmpresa = session('active_company_id');
        $p->estadoItem = 1;
        $p->save();

        // Esto hace que Inertia recargue los datos de la vista actual
        return back(); 
    }
}