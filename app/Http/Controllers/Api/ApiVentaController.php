<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CabeceraMovimiento;
use App\Models\DetalleMovimiento;
use App\Models\Venta;
use App\Models\Item;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ApiVentaController extends Controller
{
    public function store(Request $request)
    {
        $idEmpresa = $request->header('idEmpresa');

        $request->validate([
            'idCliente' => 'nullable|integer',
            'nitVenta' => 'required|string',
            'razonSocialVenta' => 'required|string',
            'totalRecibidoVenta' => 'required|numeric',
            'metodoPago' => 'required|string',
            'items' => 'required|array|min:1',
        ]);

        try {
            $ventaFinal = DB::transaction(function () use ($request, $idEmpresa) {
                $totalVenta = 0;
                $detallesParaInsertar = [];

                // 1. Cabecera
                $cabecera = CabeceraMovimiento::create([
                    'fechaCabeceraMovimiento' => now(),
                    'totalCabeceraMovimiento' => 0, 
                    'idTipoMovimiento' => 2, // Venta
                    'id' => Auth::id(),
                    'idEmpresa' => $idEmpresa,
                ]);

                foreach ($request->items as $itemData) {
                    $item = Item::lockForUpdate()->findOrFail($itemData['idItem']);

                    if ($item->cantidadItem < $itemData['cantidad']) {
                        throw new \Exception("Stock insuficiente para: {$item->nombreItem}");
                    }

                    $subtotal = $item->precioVentaItem * $itemData['cantidad'];
                    $totalVenta += $subtotal;

                    $detallesParaInsertar[] = new DetalleMovimiento([
                        'idItem' => $item->idItem,
                        'cantidadDetalleMovimiento' => $itemData['cantidad'],
                        'precioDetalleMovimiento' => $item->precioVentaItem,
                        'costoDetalleMovimiento' => $item->costoItem ?? 0,
                        'precioTotalDetalleMovimiento' => $subtotal,
                        'costoTotalDetalleMovimiento' => ($item->costoItem ?? 0) * $itemData['cantidad'],
                    ]);

                    // 2. Descontar Stock
                    $item->decrement('cantidadItem', $itemData['cantidad']);
                }

                $cabecera->detalles()->saveMany($detallesParaInsertar);
                $cabecera->update(['totalCabeceraMovimiento' => $totalVenta]);

                // 3. Registro en tabla Ventas (Aquí aplicamos tu regla de oro)
                return Venta::create([
                    'idCliente' => $request->idCliente,
                    'idCabeceraMovimiento' => $cabecera->idCabeceraMovimiento,
                    'totalRecibidoVenta' => $request->totalRecibidoVenta,
                    'totalCambioVenta' => $request->totalRecibidoVenta - $totalVenta,
                    'metodoPago' => $request->metodoPago,
                    'nitVenta' => $request->nitVenta, // Datos específicos de la venta
                    'razonSocialVenta' => $request->razonSocialVenta, // Datos específicos de la venta
                ]);
            });

            return response()->json(['message' => 'Venta exitosa', 'idVenta' => $ventaFinal->idVenta], 201);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }
    public function getVentasApi(Request $request)
    {
        // Obtenemos el ID de la empresa desde el header que ya configuramos en Flutter
        $idEmpresa = $request->header('idEmpresa');
        $idUs = Auth::id();
        $ventas = CabeceraMovimiento::where('idEmpresa', $idEmpresa)
            ->where('id', $idUs)
            ->where('idTipoMovimiento', 2)
            ->with([
                'venta', // Trae nitVenta y razonSocialVenta
                'usuario:id,name',
                'detalles.item'
            ])
            ->orderBy('fechaCabeceraMovimiento', 'desc')
            ->take(10) // Solo las últimas 10 para el dashboard
            ->get();

        return response()->json($ventas);
    }
}