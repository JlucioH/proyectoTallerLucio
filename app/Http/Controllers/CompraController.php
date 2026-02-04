<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CabeceraMovimiento;
use App\Models\DetalleMovimiento;
use App\Models\Compra;
use App\Models\Item;
use App\Models\Empresa;
use App\Models\Proveedor;
use App\Models\Categoria;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CompraController extends Controller
{
    /**
     * Muestra el formulario para crear una nueva compra
     */
    public function create()
    {
        $idEmpresa = session('active_company_id');

        // 1. Solo items que pertenezcan a la empresa activa
        $items = Item::where('idEmpresa', $idEmpresa)
            ->where('estadoItem', 1) 
            ->get(['idItem', 'codigoItem', 'nombreItem', 'precioVentaItem', 'cantidadItem', 'costoItem'])
            ->map(function ($item) {
                // Buscamos la imagen con orden 1 para este ítem
                // He usado el nombre de tabla 'imagen_items' y campo 'idItem', 
                // ajústalos si tu tabla se llama distinto (ej. 'ImagenItem')
                $imagenPrincipal = \DB::table('imagenItem')
                    ->where('idItem', $item->idItem)
                    ->where('ordenImagenItem', 1)
                    ->first(['rutaImagenItem']);

                $item->rutaImagen = $imagenPrincipal ? $imagenPrincipal->rutaImagenItem : null;
                return $item;
            });

        // 2. Datos de la empresa para configuración (IVA, etc.)
        $empresa = Empresa::where('idEmpresa', $idEmpresa)
            ->first(['idEmpresa', 'nombreEmpresa', 'ivaEmpresa']);

        // 3. Proveedores de la empresa para el modal de búsqueda
        $proveedores = Proveedor::where('idEmpresa', $idEmpresa)
            ->where('estadoProveedor', 1) 
            ->get();

        // 4. Categorias de la empresa para el modal de búsqueda
        $categorias = Categoria::where('idEmpresa', $idEmpresa)
            ->where('estadoCategoria', 1) 
            ->get();

        return Inertia::render('Compras/CrearCompra', [
            'items'       => $items,
            'empresa'     => $empresa,
            'proveedores' => $proveedores,
            'categorias'  => $categorias,
            'ivaEmpresa'  => (float)$empresa->ivaEmpresa ?? 13 // Valor por defecto
        ]);
    }

    /**
     * Almacena una nueva compra y actualiza stock/costos
     */
    public function store(Request $request)
    {
        // Validamos la entrada siguiendo tu estructura de Ventas
        $request->validate([
            'idProveedor' => 'required|exists:proveedores,idProveedor',
            'conFactura'  => 'required|boolean',
            'metodoPago'  => 'required|string',
            'items'       => 'required|array|min:1',
            'items.*.idItem' => 'required|exists:items,idItem',
            'items.*.cantidadDetalleMovimientoCompra' => 'required|integer|min:1',
            'items.*.costoDetalleMovimientoCompra' => 'required|numeric|min:0',
            'items.*.costoTotalDetalleMovimientoCompra' => 'required|numeric|min:0',
            'items.*.precioDetalleMovimientoCompra' => 'required|numeric|min:0',
            'items.*.precioTotalDetalleMovimientoCompra' => 'required|numeric|min:0',
        ]);

        try {
            $idCompraGenerada = null;

            DB::transaction(function () use ($request, &$idCompraGenerada) {
                $idEmpresa = session('active_company_id');
                $empresa = Empresa::findOrFail($idEmpresa);
                $ivaDecimal = ($empresa->ivaEmpresa ?? 13.00) / 100;
                
                $totalCompra = 0;
                $detallesParaInsertar = [];

                // 1. Crear la Cabecera del Movimiento (Tipo 1 = Compra/Entrada)
                $cabecera = CabeceraMovimiento::create([
                    'fechaCabeceraMovimiento' => now(),
                    'totalCabeceraMovimiento' => 0, // Se actualiza al final
                    'idTipoMovimiento' => 1, 
                    'id' => Auth::id(),
                    'idEmpresa' => $idEmpresa,
                ]);

                foreach ($request->items as $itemData) {
                    $item = Item::lockForUpdate()->findOrFail($itemData['idItem']);
                    
                    $cantidad = $itemData['cantidadDetalleMovimientoCompra'];
                    $importeTBruto = $itemData['precioTotalDetalleMovimientoCompra'];
                    
                    // Lógica de Impuestos: Si hay factura, el costo real (inventariable) es el 87%
                    $costoTReal = $request->conFactura 
                        ? ($importeTBruto-($importeTBruto * $ivaDecimal)) 
                        : $importeTBruto;

                    $costoReal = $costoTReal / $cantidad; // costoUnitario
                    $totalCompra += $importeTBruto;

                    // 2. Preparar el Detalle
                    $detallesParaInsertar[] = new DetalleMovimiento([
                        'idItem' => $item->idItem,
                        'cantidadDetalleMovimiento' => $cantidad,
                        // En compras, el 'costo' es lo primordial
                        'costoDetalleMovimiento' => round($costoTReal/$cantidad,2),
                        'costoTotalDetalleMovimiento' => round($costoTReal,2),
                        // El precio de venta se registra si se actualizó en el form
                        'precioDetalleMovimiento' => round($importeTBruto/$cantidad,2),
                        'precioTotalDetalleMovimiento' => round($importeTBruto,2),
                    ]);

                    // 3. Incrementar Stock (A diferencia de ventas que es decrement)
                    $item->increment('cantidadItem', $cantidad);
                    $item->increment('importeItem', $costoTReal);

                    $item->refresh();

                    // 4. Actualizar costos y precios en el maestro de Items
                    if ($item->cantidadItem > 0) {
                        $nuevoCostoUnitario = $item->importeItem / $item->cantidadItem;
                        
                        $item->update([
                            'costoItem' => round($nuevoCostoUnitario, 2)
                        ]);
                    }
                }

                // Guardar detalles
                $cabecera->detalles()->saveMany($detallesParaInsertar);

                // Actualizar total de cabecera
                $cabecera->update(['totalCabeceraMovimiento' => $totalCompra]);

                // 5. Crear el registro en la tabla Compras
                $compra = Compra::create([
                    'idProveedor' => $request->idProveedor,
                    'idCabeceraMovimiento' => $cabecera->idCabeceraMovimiento,
                    'conFacturaCompra' => $request->conFactura,
                    'numeroFacturaCompra' => $request->numeroFactura ?? null,
                    'metodoPago' => $request->metodoPago,
                ]);

                $idCompraGenerada = $compra->idCompra;
            });

            return redirect()->back()->with('success', [
                'mensaje' => 'Compra registrada y stock actualizado correctamente',
                'idCompra' => $idCompraGenerada
            ]);

        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Error al procesar la compra: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Historial de compras
     */
    public function index()
    {
        $idEmpresa = session('active_company_id');

        $compras = CabeceraMovimiento::where('idEmpresa', $idEmpresa)
            ->where('idTipoMovimiento', 1) // 1 = Compras
            ->with([
                'usuario:id,name', 
                'compra.proveedor', 
                'detalles.item'
            ])
            ->orderBy('fechaCabeceraMovimiento', 'desc')
            ->get();

        $empresa = Empresa::find($idEmpresa); 

        return Inertia::render('Compras/IndexCompras', [
            'compras' => $compras,
            'empresa' => $empresa // <--- Y AÑADE ESTO AQUÍ
        ]);
    }
}