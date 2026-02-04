<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Empresa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ReporteCostoItemController extends Controller
{
    public function index()
    {
        $idEmpresa = session('active_company_id');
        
        return Inertia::render('Reporte/ReporteCostoItem', [
            // Cargamos items con su imagen principal para el buscador inicial
            'items' => Item::where('estadoItem', true)
                ->with('imagenPrincipal')
                ->get(),
            'empresa' => Empresa::find($idEmpresa)
        ]);
    }

    public function show(Request $request, $idItem)
    {
        $idEmpresa = session('active_company_id');
        
        // 1. Datos básicos del Item (con su imagen principal) y la Empresa
        $item = Item::with('imagenPrincipal')->findOrFail($idItem);
        $empresa = Empresa::findOrFail($idEmpresa);
        
        // 2. Parámetros de filtrado
        $fechaInicio = $request->input('desde', now()->startOfMonth()->format('Y-m-d'));
        $fechaFin = $request->input('hasta', now()->format('Y-m-d'));
        $agrupacion = $request->input('agrupar', 'ninguno');

        // 3. Query principal con Join a cabecera
        $query = DB::table('detalleMovimiento as d')
            ->join('cabeceraMovimiento as c', 'd.idCabeceraMovimiento', '=', 'c.idCabeceraMovimiento')
            ->where('d.idItem', $idItem)
            ->where('c.idTipoMovimiento', 2) // Ventas
            ->where('c.idEmpresa', $idEmpresa)
            ->whereBetween('c.fechaCabeceraMovimiento', [$fechaInicio . ' 00:00:00', $fechaFin . ' 23:59:59']);

        // 4. Aplicar agrupaciones respetando la zona horaria de Bolivia (-4) para PostgreSQL
        if ($agrupacion === 'dia') {
            $query->select(
                DB::raw('DATE(c."fechaCabeceraMovimiento" - INTERVAL \'4 hours\') as fecha'),
                DB::raw('SUM(d."precioTotalDetalleMovimiento") as "precioBruto"'),
                DB::raw('SUM(d."costoTotalDetalleMovimiento") as "costoTotal"')
            )->groupBy(DB::raw('DATE(c."fechaCabeceraMovimiento" - INTERVAL \'4 hours\')'));

        } elseif ($agrupacion === 'mes') {
            $query->select(
                DB::raw('TO_CHAR(c."fechaCabeceraMovimiento" - INTERVAL \'4 hours\', \'YYYY-MM\') as fecha'),
                DB::raw('SUM(d."precioTotalDetalleMovimiento") as "precioBruto"'),
                DB::raw('SUM(d."costoTotalDetalleMovimiento") as "costoTotal"')
            )->groupBy(DB::raw('TO_CHAR(c."fechaCabeceraMovimiento" - INTERVAL \'4 hours\', \'YYYY-MM\')'));

        } else {
            // Detalle por venta individual
            $query->select(
                'c.fechaCabeceraMovimiento as fecha',
                'd.precioTotalDetalleMovimiento as precioBruto',
                'd.costoTotalDetalleMovimiento as costoTotal'
            );
        }

        $movimientos = $query->orderBy('fecha', 'asc')->get();

        // 5. Mapeo de datos para el gráfico y cálculo de IVA
        $iva = $empresa->ivaEmpresa / 100;
        $dataGrafico = $movimientos->map(fn($m) => [
            'fecha' => $m->fecha,
            'precioBruto' => (float)$m->precioBruto,
            'precioNeto' => (float)round($m->precioBruto - ($m->precioBruto * $iva), 2),
            'costo' => (float)$m->costoTotal,
        ]);

        return Inertia::render('Reporte/ReporteCostoItem', [
            'itemSeleccionado' => $item,
            'dataGrafico' => $dataGrafico,
            'empresa' => $empresa,
            'filtros' => [
                'desde' => $fechaInicio, 
                'hasta' => $fechaFin, 
                'agrupar' => $agrupacion
            ],
            // Items para el buscador que aparece en la vista
            'items' => Item::where('estadoItem', true)
                ->with('imagenPrincipal')
                ->get()
        ]);
    }
}