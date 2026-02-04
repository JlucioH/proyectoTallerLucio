<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\Item;
use App\Models\Empresa;

class ReporteKardexItemController extends Controller
{
    public function index($idItem= null)
    {
        

        $idEmpresa = session('active_company_id');

        // Si NO hay ID, enviamos a la vista solo la lista para el buscador
        if (is_null($idItem)) {
            $items = DB::table('items')
                ->leftJoin('imagenItem', function($join) {
                    $join->on('items.idItem', '=', 'imagenItem.idItem')
                         ->where('imagenItem.ordenImagenItem', '=', 1);
                })
                ->where('items.idEmpresa', $idEmpresa)
                ->select(
                    'items.idItem', 
                    'items.nombreItem', 
                    'items.codigoItem', 
                    'imagenItem.rutaImagenItem as imagen' // Mapeamos a 'imagen' para el frontend
                )
                ->get();

            return Inertia::render('Reporte/ReporteKardexItem', [
                'item' => null,
                'dataKardex' => [],
                'availableItems' => $items 
            ]);
        }
        // 1. Obtener información básica del ítem
        $item = DB::table('items')
            ->leftJoin('imagenItem', function($join) {
                $join->on('items.idItem', '=', 'imagenItem.idItem')
                    ->where('imagenItem.ordenImagenItem', '=', 1);
            })
            ->where('items.idItem', $idItem)
            ->where('items.idEmpresa', $idEmpresa)
            ->select(
                'items.*', 
                'imagenItem.rutaImagenItem as imagen' // <--- ESTO ES LO QUE FALTA PARA EL REPORTE
            )
            ->first();

        if (!$item) {
            return redirect()->back()->with('error', 'Item no encontrado');
        }

        // 2. Obtener todos los movimientos cronológicamente
        // Unimos detalle con cabecera y verificamos si existe en compras o ventas
        $movimientosRaw = DB::table('detalleMovimiento')
            ->join('cabeceraMovimiento', 'detalleMovimiento.idCabeceraMovimiento', '=', 'cabeceraMovimiento.idCabeceraMovimiento')
            ->leftJoin('compras', 'cabeceraMovimiento.idCabeceraMovimiento', '=', 'compras.idCabeceraMovimiento')
            ->leftJoin('ventas', 'cabeceraMovimiento.idCabeceraMovimiento', '=', 'ventas.idCabeceraMovimiento')
            ->where('detalleMovimiento.idItem', $idItem)
            ->where('cabeceraMovimiento.idEmpresa', $idEmpresa)
            ->select(
                'cabeceraMovimiento.fechaCabeceraMovimiento as fecha',
                'detalleMovimiento.cantidadDetalleMovimiento as cantidad',
                'detalleMovimiento.costoDetalleMovimiento as costo_unitario',
                'detalleMovimiento.costoTotalDetalleMovimiento as costo_total',
                'compras.idCompra',
                'ventas.idVenta',
                'compras.numeroFacturaCompra',
                'ventas.idVenta as nro_venta' // O el campo que uses para identificar la venta
            )
            ->orderBy('cabeceraMovimiento.fechaCabeceraMovimiento', 'asc')
            ->get();

        // 3. Lógica del Kardex (Cálculo de Saldos)
        $kardexCalculado = [];
        $saldoCantidad = 0;
        $saldoImporteTotal = 0;

        foreach ($movimientosRaw as $mov) {
            $esEntrada = !is_null($mov->idCompra);
            
            if ($esEntrada) {
                // REGLA ENTRADA: Sumar cantidad e importe
                $saldoCantidad += $mov->cantidad;
                $saldoImporteTotal += $mov->costo_total;
            } else {
                // REGLA SALIDA: Restar cantidad e importe proporcional al saldo anterior
                // Primero calculamos el costo promedio antes de la salida
                $costoPromedioAntes = ($saldoCantidad > 0) ? ($saldoImporteTotal / $saldoCantidad) : 0;
                
                $saldoCantidad -= $mov->cantidad;
                // El importe de salida se calcula con el costo promedio actual
                $importeSalida = $mov->cantidad * $costoPromedioAntes;
                $saldoImporteTotal -= $importeSalida;
            }

            // Evitar división por cero para el costo de saldo
            $costoSaldoActual = ($saldoCantidad > 0) ? ($saldoImporteTotal / $saldoCantidad) : 0;

            $kardexCalculado[] = [
                'fecha' => $mov->fecha,
                'detalle' => $esEntrada ? 'COMPRA - FACT: ' . ($mov->numeroFacturaCompra ?? 'S/N') : 'VENTA - REF: ' . $mov->nro_venta,
                'entrada' => [
                    'cant' => $esEntrada ? $mov->cantidad : 0,
                    'costo' => $esEntrada ? (float)$mov->costo_unitario : 0,
                    'total' => $esEntrada ? (float)$mov->costo_total : 0,
                ],
                'salida' => [
                    'cant' => !$esEntrada ? $mov->cantidad : 0,
                    'costo' => !$esEntrada ? (float)$costoPromedioAntes : 0, // Las salidas salen al costo promedio
                    'total' => !$esEntrada ? (float)($mov->cantidad * $costoPromedioAntes) : 0,
                ],
                'saldo' => [
                    'cant' => $saldoCantidad,
                    'costo' => (float)$costoSaldoActual,
                    'total' => (float)$saldoImporteTotal,
                ]
            ];
        }

        // 2. Datos de la empresa para configuración (IVA, etc.)
        $empresa = Empresa::where('idEmpresa', $idEmpresa)
            ->first(['idEmpresa', 'nombreEmpresa', 'ivaEmpresa']);

        // Retornamos el array invertido para que en la tabla web salga lo más reciente arriba,
        // pero conservando la lógica cronológica del cálculo.
        return Inertia::render('Reporte/ReporteKardexItem', [
            'item' => $item,
            //'dataKardex' => array_reverse($kardexCalculado)
            'dataKardex' => ($kardexCalculado),
            'empresa'     => $empresa
        ]);
    }
}