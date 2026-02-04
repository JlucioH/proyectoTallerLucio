<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\AdminSistema; 
use App\Models\UsuarioEmpresa;
use App\Models\User; 
use App\Models\Empresa; 
use App\Models\Item; 
use App\Models\InvitacionEmpresa;
use App\Models\PlanSuscripcion; 
use App\Models\PlanSuscripcionEmpresa; 
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Notification;
use App\Notifications\InvitacionEmpresaNotification;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon; 

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Estadísticas generales para Staff
        $stats = [
            'totalUsers' => User::count(),
            'totalAdmins' => AdminSistema::count(),
            'newUsersToday' => User::whereDate('created_at', today())->count(),
        ];

        $esStaff = AdminSistema::where('id', $user->id)->first();

        if ($esStaff) {
            return Inertia::render('Admin/ControlPanel', [
                'stats' => $stats,
                'empresas' => Empresa::latest()->get(),
                'planes' => PlanSuscripcion::all(),
            ]);
        }

        $idEmpresaActiva = session('active_company_id');

        $relacion = UsuarioEmpresa::where('id', $user->id)
            ->where('idEmpresa', $idEmpresaActiva)
            ->with(['rol', 'empresa'])
            ->first();

        // --- INICIO LÓGICA DE ALERTAS Y MÉTRICAS DE EMPRESA ---
        $alertasStock = [];
        $empresaStats = [
            'ventasMes' => 0,
            'utilidadMes' => 0,
            'valorInventario' => 0,
            'productosRentables' => [],
            'comparativoMensual' => [],
            'ventasPorCategoria' => [] 
        ];

        // Solo cargar métricas si el usuario tiene rol de Admin o Gestor (IDs 2 o 3)
        if ($relacion && in_array($relacion->idRol, [2, 3])) {
            
            // 1. Alertas de Stock (Productos por debajo del mínimo)
            $alertasStock = Item::where('idEmpresa', $idEmpresaActiva)
                ->where('estadoItem', true)
                ->whereColumn('cantidadItem', '<=', 'cantidadMinItem')
                ->with('categoria')
                ->get();

            // 2. Ventas y Utilidad del mes actual
            $metricasVentas = DB::table('detalleMovimiento')
                ->join('cabeceraMovimiento', 'detalleMovimiento.idCabeceraMovimiento', '=', 'cabeceraMovimiento.idCabeceraMovimiento')
                ->where('cabeceraMovimiento.idEmpresa', $idEmpresaActiva)
                ->where('cabeceraMovimiento.idTipoMovimiento', 2) // 2 = Venta
                ->whereMonth('cabeceraMovimiento.fechaCabeceraMovimiento', Carbon::now()->month)
                ->select(
                    DB::raw('SUM("precioTotalDetalleMovimiento") as total_ventas'),
                    DB::raw('SUM("precioTotalDetalleMovimiento" - "costoTotalDetalleMovimiento") as total_utilidad')
                )
                ->first();

            $empresaStats['ventasMes'] = (float)($metricasVentas->total_ventas ?? 0);
            $empresaStats['utilidadMes'] = (float)($metricasVentas->total_utilidad ?? 0);

            // 3. Valor total del inventario (Costo de adquisición x Stock actual)
            $empresaStats['valorInventario'] = (float)Item::where('idEmpresa', $idEmpresaActiva)
                ->where('estadoItem', true)
                ->select(DB::raw('SUM("cantidadItem" * "costoItem") as total'))
                ->value('total') ?? 0;

            // 4. Top 5 Productos más rentables
            $empresaStats['productosRentables'] = DB::table('detalleMovimiento')
                ->join('cabeceraMovimiento', 'detalleMovimiento.idCabeceraMovimiento', '=', 'cabeceraMovimiento.idCabeceraMovimiento')
                ->join('items', 'detalleMovimiento.idItem', '=', 'items.idItem')
                ->leftJoin('imagenItem', function($join) {
                    $join->on('items.idItem', '=', 'imagenItem.idItem')
                         ->where('imagenItem.ordenImagenItem', '=', 1);
                })
                ->where('cabeceraMovimiento.idEmpresa', $idEmpresaActiva)
                ->where('cabeceraMovimiento.idTipoMovimiento', 2)
                ->select(
                    'items.nombreItem',
                    'imagenItem.rutaImagenItem',
                    DB::raw('SUM("precioTotalDetalleMovimiento" - "costoTotalDetalleMovimiento") as utilidad_item'),
                    DB::raw('SUM("cantidadDetalleMovimiento") as unidades_vendidas')
                )
                ->groupBy('items.idItem', 'items.nombreItem', 'imagenItem.rutaImagenItem')
                ->orderByDesc('utilidad_item')
                ->take(5)
                ->get();

            // 5. Gráfico de Barras: Comparativo Ventas vs Compras (Últimos 6 meses)
            $empresaStats['comparativoMensual'] = DB::table('cabeceraMovimiento')
                ->join('detalleMovimiento', 'cabeceraMovimiento.idCabeceraMovimiento', '=', 'detalleMovimiento.idCabeceraMovimiento')
                ->where('cabeceraMovimiento.idEmpresa', $idEmpresaActiva)
                ->whereIn('cabeceraMovimiento.idTipoMovimiento', [1, 2]) // 1=Compra, 2=Venta
                ->where('cabeceraMovimiento.fechaCabeceraMovimiento', '>=', now()->subMonths(6))
                ->select(
                    DB::raw("to_char(date_trunc('month', \"fechaCabeceraMovimiento\"), 'Mon') as mes"),
                    DB::raw("CAST(SUM(CASE WHEN \"idTipoMovimiento\" = 2 THEN \"precioTotalDetalleMovimiento\" ELSE 0 END) AS FLOAT) as ventas"),
                    DB::raw("CAST(SUM(CASE WHEN \"idTipoMovimiento\" = 1 THEN \"precioTotalDetalleMovimiento\" ELSE 0 END) AS FLOAT) as compras")
                )
                ->groupBy(DB::raw("date_trunc('month', \"fechaCabeceraMovimiento\"), mes"))
                ->orderBy(DB::raw("date_trunc('month', \"fechaCabeceraMovimiento\")"), 'asc')
                ->get();

            // 6. Gráfico de Dona: Ventas por Categoría (Mes actual)
            $empresaStats['ventasPorCategoria'] = DB::table('detalleMovimiento')
                ->join('cabeceraMovimiento', 'detalleMovimiento.idCabeceraMovimiento', '=', 'cabeceraMovimiento.idCabeceraMovimiento')
                ->join('items', 'detalleMovimiento.idItem', '=', 'items.idItem')
                ->join('categorias', 'items.idCategoria', '=', 'categorias.idCategoria')
                ->where('cabeceraMovimiento.idEmpresa', $idEmpresaActiva)
                ->where('cabeceraMovimiento.idTipoMovimiento', 2)
                ->whereMonth('cabeceraMovimiento.fechaCabeceraMovimiento', Carbon::now()->month)
                ->select(
                    'categorias.nombreCategoria as name',
                    DB::raw('CAST(SUM("precioTotalDetalleMovimiento") AS FLOAT) as value')
                )
                ->groupBy('categorias.nombreCategoria')
                ->having(DB::raw('SUM("precioTotalDetalleMovimiento")'), '>', 0)
                ->get();
        }

        // Respuesta para usuarios con empresa asignada
        if ($relacion) {
            return Inertia::render('dashboard', [
                'stats' => $stats, 
                'alertasStock' => $alertasStock,
                'empresaStats' => $empresaStats, 
            ]);
        }

        // Manejo de redirección si tiene empresas pero ninguna seleccionada
        $tieneEmpresas = UsuarioEmpresa::where('id', $user->id)->exists();
        if ($tieneEmpresas && !$idEmpresaActiva) {
            return redirect()->route('company.select');
        }

        // Estado por defecto (Usuario nuevo sin empresa)
        return Inertia::render('dashboard', [
            'stats' => $stats, 
            'alertasStock' => [], 
            'empresaStats' => $empresaStats,
            'mensaje_estado' => 'Esperando ser asignado a una empresa...'
        ]);
    }

    public function storeEmpresa(Request $request)
    {
        $request->validate([
            'nombreEmpresa' => 'required|string|max:255',
            'emailInvitacionEmpresa' => 'required|email|max:255',
            'idPlanSuscripcion' => 'required|exists:planSuscripcion,idPlanSuscripcion', 
        ]);

        try {
            $token = Str::random(40);
            DB::beginTransaction();

            $empresa = Empresa::create([
                'nombreEmpresa' => $request->nombreEmpresa,
                'estadoEmpresa' => true,
            ]);

            PlanSuscripcionEmpresa::create([
                'idEmpresa' => $empresa->idEmpresa,
                'idPlanSuscripcion' => $request->idPlanSuscripcion,
                'fechaIniPlanSuscripcionEmpresa' => Carbon::now(),
                'fechaFinPlanSuscripcionEmpresa' => Carbon::now()->addYear(), 
                'estadoPlanEmpresa' => true,
            ]);

            $basePath = "empresas/empresa_{$empresa->idEmpresa}";
            Storage::disk('public')->makeDirectory($basePath . '/logos');
            Storage::disk('public')->makeDirectory($basePath . '/items');
            Storage::disk('public')->makeDirectory($basePath . '/usuarios');

            InvitacionEmpresa::create([
                'idEmpresa' => $empresa->idEmpresa,
                'emailInvitacionEmpresa' => $request->emailInvitacionEmpresa,
                'tokenInvitacionEmpresa' => $token,
                'fechaExpiracionEmpresa' => now()->addDays(2),
                'aceptada' => false,
            ]);

            Notification::route('mail', $request->emailInvitacionEmpresa)
                ->notify(new InvitacionEmpresaNotification($empresa, $token));

            DB::commit();

            return redirect()->back()->with('success', 'Empresa, plan de 1 año e invitación creados correctamente.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors([
                'nombreEmpresa' => 'Error técnico: ' . $e->getMessage()
            ]);
        }
    }
}