<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CabeceraMovimiento;
use App\Models\DetalleMovimiento;
use App\Models\Venta;
use App\Models\Item;
use App\Models\Cliente;
use App\Models\Empresa;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Notifications\VentaRealizadaNotification;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;


class VentaController extends Controller
{
    /**
     * Muestra el formulario para crear una nueva venta
     */
    public function create()
    {
        $idEmpresa = session('active_company_id');

        // Solo enviamos items activos y que pertenezcan a la empresa
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
        // 3. Traemos los datos de la EMPRESA para el ticket
        // Usamos first() para que sea un solo objeto y no una lista
        $empresa = Empresa::where('idEmpresa', $idEmpresa)
            ->first(['nombreEmpresa', 'direccionEmpresa', 'telefonoEmpresa', 'logoEmpresa']);

        // 4. Traemos los CLIENTES para el modal de búsqueda
        $clientes = Cliente::where('idEmpresa', $idEmpresa)
            ->where('estadoCliente', 1) 
            ->get();

        // 5. Enviamos TODO a React
        return Inertia::render('Ventas/CrearVenta', [
            'items'    => $items,
            'empresa'  => $empresa, 
            'clientes' => $clientes,
        ]);
    }

    /**
     * Busca un cliente por NIT dentro de la empresa activa
     * (Este método se llama vía Axios, por eso mantiene el JSON)
     */
    public function buscarPorNit($nit)
    {
        $idEmpresa = session('active_company_id');

        $cliente = Cliente::where('idEmpresa', $idEmpresa)
            ->where('nitFacturaCliente', $nit)
            ->first();

        if ($cliente) {
            return response()->json([
                'encontrado' => true,
                'idCliente' => $cliente->idCliente,
                'razonSocial' => $cliente->razonSocialFacturaCliente
            ]);
        }

        return response()->json(['encontrado' => false]);
    }

    /**
     * Almacena una nueva venta y actualiza stock
     */
    public function store(Request $request)
    {
        // Validar la entrada
        $request->validate([
            'idCliente' => 'nullable|integer',
            'nitFacturaCliente' => 'required|string',
            'razonSocialFacturaCliente' => 'required|string',
            'totalRecibidoVenta' => 'required|numeric|min:0',
            'totalCambioVenta' => 'required|numeric|min:0',
            'metodoPago' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.idItem' => 'required|exists:items,idItem',
            'items.*.cantidad' => 'required|integer|min:1',
        ]);

        try {
            // Variable para capturar la cabecera fuera del closure de la transacción
            $cabeceraGlobal = null;
            $idVentaGenerado = null;
            $ventaGlobal = null; //  capturar la venta

            DB::transaction(function () use ($request, &$cabeceraGlobal, &$idVentaGenerado, &$ventaGlobal) {
                $idEmpresa = session('active_company_id');
                $totalVenta = 0;
                $detallesParaInsertar = [];

                // 1. Crear la Cabecera del Movimiento
                $cabecera = CabeceraMovimiento::create([
                    'fechaCabeceraMovimiento' => now(),
                    'totalCabeceraMovimiento' => 0, 
                    'idTipoMovimiento' => 2, // 2 = Venta
                    'id' => Auth::id(),
                    'idEmpresa' => $idEmpresa,
                ]);

                $cabeceraGlobal = $cabecera; // Asignamos a la variable externa

                foreach ($request->items as $itemData) {
                    $item = Item::lockForUpdate()->findOrFail($itemData['idItem']);

                    // Verificar stock
                    if ($item->cantidadItem < $itemData['cantidad']) {
                        throw new \Exception("Stock insuficiente para: {$item->nombreItem}. Disponible: {$item->cantidadItem}");
                    }



                    $subtotal = $item->precioVentaItem * $itemData['cantidad'];
                    $costoTotal = ($item->costoItem ?? 0) * $itemData['cantidad']; 
                    $totalVenta += $subtotal;

                    // 2. Preparar el Detalle
                    $detallesParaInsertar[] = new DetalleMovimiento([
                        'idItem' => $item->idItem,
                        'cantidadDetalleMovimiento' => $itemData['cantidad'],
                        'precioDetalleMovimiento' => $item->precioVentaItem,
                        'costoDetalleMovimiento' => $item->costoItem ?? 0,
                        'precioTotalDetalleMovimiento' => $subtotal,
                        'costoTotalDetalleMovimiento' => $costoTotal,
                    ]);

                    // 3. Descontar Stock
                    $item->decrement('cantidadItem', $itemData['cantidad']);
                    $item->decrement('importeItem', $costoTotal);
                }

                // Guardar detalles vinculados a la cabecera
                $cabecera->detalles()->saveMany($detallesParaInsertar);

                // Actualizar total cabecera con el cálculo final
                $cabecera->update(['totalCabeceraMovimiento' => $totalVenta]);

                // Crear el registro en la tabla Ventas
                $venta =Venta::create([
                    'idCliente' => $request->idCliente,
                    'idCabeceraMovimiento' => $cabecera->idCabeceraMovimiento,
                    'totalRecibidoVenta' => $request->totalRecibidoVenta,
                    'totalCambioVenta' => $request->totalCambioVenta,
                    'metodoPago' => $request->metodoPago,
                    'nitVenta' => $request->nitFacturaCliente,
                    'razonSocialVenta' => $request->razonSocialFacturaCliente,
                ]);

                $idVentaGenerado = $venta->idVenta;
                $ventaGlobal = $venta; // <--- CAPTURAR la venta aquí
            });

            //correossssssssssss
            // Usamos load('cliente') para asegurarnos de tener los datos del cliente
            $ventaGlobal->load(['cliente', 'cabecera.detalles.item']);
            $cliente = $ventaGlobal->cliente;
            //$cliente = $venta->cliente; 

            if ($cliente && !empty($cliente->correoCliente)) {
                try {
                    // Generar el PDF
                    $pdf = Pdf::loadView('pdf.ticket', [
                        'venta' => $ventaGlobal,
                        'cabecera' => $ventaGlobal->cabecera,
                        'detalles' => $ventaGlobal->cabecera->detalles
                    ])->setPaper([0, 0, 226.77, 600], 'portrait'); 

                    // Enviar la notificación
                    $cliente->notify(new VentaRealizadaNotification($ventaGlobal, $pdf->output()));
                    
                } catch (\Exception $e) {
                    Log::error("Error enviando correo en venta #{$idVentaGenerado}: " . $e->getMessage());
                }
            }

            // Retornamos el éxito incluyendo el ID generado
            return redirect()->back()->with('success', [
                'mensaje' => 'Venta realizada con éxito',
                //'idCabecera' => $cabeceraGlobal->idCabeceraMovimiento  capturar idCabecera
                'idVenta' => $idVentaGenerado
            ]);

        } catch (\Exception $e) {
            // En Inertia, si hay un error, redirigimos hacia atrás con errores de validación
            return redirect()->back()->withErrors([
                'error' => 'Error al procesar la venta: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Historial de ventas de la empresa activa
     */
    public function index()
    {
        $idEmpresa = session('active_company_id');

        $ventas = CabeceraMovimiento::where('idEmpresa', $idEmpresa)
            ->where('idTipoMovimiento', 2)
            ->with([
                'usuario:id,name', 
                'venta.cliente', 
                'detalles.item'
            ])
            ->orderBy('fechaCabeceraMovimiento', 'desc')
            ->get();

        // --- AÑADE SOLO ESTO ---
        $empresa = Empresa::find($idEmpresa); 
        // -----------------------

        return Inertia::render('Ventas/IndexVentas', [
            'ventas' => $ventas,
            'empresa' => $empresa // <--- Y AÑADE ESTO AQUÍ
        ]);
    }
}