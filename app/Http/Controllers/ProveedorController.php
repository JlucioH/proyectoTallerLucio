<?php

namespace App\Http\Controllers;

use App\Models\Proveedor;
use App\Models\Empresa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProveedorController extends Controller
{
    private function getEmpresaId() {
        $user = Auth::user();
        $activeCompanyId = session('active_company_id');

        if (!$activeCompanyId) {
            abort(403, 'No hay una empresa seleccionada.');
        }

        $vinculo = DB::table('usuarioEmpresa')
            ->where('id', $user->id)
            ->where('idEmpresa', $activeCompanyId)
            ->first();

        // roles 2 y 3
        if (!$vinculo || !in_array($vinculo->idRol, [2, 3])) {
            abort(403, 'No tienes permisos en esta empresa.');
        }

        return $activeCompanyId;
    }
    /**
     * Muestra el listado de proveedores.
     */
    public function index()
    {
        $idEmpresa = $this->getEmpresaId();

        $proveedores = Proveedor::where('idEmpresa', $idEmpresa)
            ->orderBy('idProveedor', 'desc')
            ->get();

        return Inertia::render('Compras/ProveedoresList', [
            'proveedores' => $proveedores
        ]);
    }

    /**
     * Almacena un nuevo proveedor.
     */
    public function store(Request $request)
    {
        $idEmpresa = $this->getEmpresaId();


        $request->validate([
            'codigoProveedor' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('proveedores')->where(function ($query) use ($idEmpresa) {
                    return $query->where('idEmpresa', $idEmpresa);
                }),
            ],
            'nombreProveedor' => 'required|string|max:255',
            'direccionProveedor' => 'nullable|string|max:255',
            'telefonoProveedor'    => 'nullable|string|max:20',
            'celularProveedor'     => 'nullable|string|max:20',
            'correoProveedor'      => 'nullable|email|max:100',
            'nitProveedor'  => 'nullable|string|max:20',
        ]);


        Proveedor::create([
            'codigoProveedor' => $request->codigoProveedor,
            'nombreProveedor' => $request->nombreProveedor,
            'direccionProveedor' => $request->direccionProveedor,
            'correoProveedor' => $request->correoProveedor,
            'celularProveedor' => $request->celularProveedor,
            'telefonoProveedor' => $request->telefonoProveedor,
            'nitProveedor' => $request->nitProveedor,
            'idEmpresa' => $idEmpresa,
            'estadoCliente' => true
        ]);

        return redirect()->back()->with('message', 'Proveedor creado correctamente.');
    }

    /**
     * Actualiza un proveedor existente.
     */
    public function update(Request $request, $id)
    {
        $idEmpresa = $this->getEmpresaId();
        $proveedor = Proveedor::where('idProveedor', $id)
            ->where('idEmpresa', $idEmpresa)
            ->firstOrFail();

        $request->validate([
            'codigoProveedor' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('proveedores', 'codigoProveedor')
                    ->ignore($proveedor->idProveedor, 'idProveedor')
                    ->where(function ($query) use ($idEmpresa) {
                        return $query->where('idEmpresa', $idEmpresa);
                    }),
            ],
            'nombreProveedor' => 'required|string|max:255',
            'direccionProveedor' => 'nullable|string|max:255',
            'correoProveedor' => 'nullable|email',
            'nitProveedor' => 'nullable|string|max:20',
            'codigoProveedor'      => 'nullable|string|max:50',
            'telefonoProveedor'    => 'nullable|string|max:20',
            'celularProveedor'     => 'nullable|string|max:20',
        ]);

        $proveedor->update($request->all());

        return redirect()->back()->with('message', 'Proveedor actualizado correctamente.');
    }

    /**
     * Alterna el estado (Activo/Inactivo) del proveedor.
     */
    public function toggleEstado($id)
    {
        $idEmpresa = $this->getEmpresaId();
        $proveedor = Proveedor::where('idProveedor', $id)
            ->where('idEmpresa', $idEmpresa)
            ->firstOrFail();

        $proveedor->update([
            'estadoProveedor' => !$proveedor->estadoProveedor
        ]);

        return redirect()->back()->with('message', 'Estado del proveedor actualizado.');
    }

    public function historialSuministros()
    {
        $idEmpresa = session('active_company_id');

        $proveedores = Proveedor::where('idEmpresa', $idEmpresa)
            ->where('estadoProveedor', 1)
            ->get()
            ->map(function($prov) {
                
                $historial = \DB::table('detalleMovimiento')
                    ->join('cabeceraMovimiento', 'detalleMovimiento.idCabeceraMovimiento', '=', 'cabeceraMovimiento.idCabeceraMovimiento')
                    ->join('compras', 'cabeceraMovimiento.idCabeceraMovimiento', '=', 'compras.idCabeceraMovimiento')
                    ->join('items', 'detalleMovimiento.idItem', '=', 'items.idItem')
                    ->where('compras.idProveedor', $prov->idProveedor)
                    ->select(
                        'cabeceraMovimiento.fechaCabeceraMovimiento as fecha',
                        'items.idItem',
                        'items.nombreItem as nombre_item',
                        'items.codigoItem as codigo_item',
                        'detalleMovimiento.cantidadDetalleMovimiento as cantidad',
                        'detalleMovimiento.costoDetalleMovimiento as costo_unitario',
                        'detalleMovimiento.costoTotalDetalleMovimiento as subtotal',
                        'detalleMovimiento.precioDetalleMovimiento as precio_unitario',
                        'detalleMovimiento.precioTotalDetalleMovimiento as precio_subtotal',
                        'compras.numeroFacturaCompra as factura'
                    )
                    ->orderBy('cabeceraMovimiento.fechaCabeceraMovimiento', 'desc')
                    ->get();

                return [
                    'idProveedor' => $prov->idProveedor,
                    'nombre' => $prov->nombreProveedor,
                    'nit' => $prov->nitProveedor,
                    'codigo' => $prov->codigoProveedor,
                    'total_compras' => $historial->unique('fecha')->count(),
                    'monto_total_invertido' => $historial->sum('subtotal'),
                    'precio_total_invertido' => $historial->sum('precio_subtotal'),
                    'ultima_fecha' => $historial->first()->fecha ?? null,
                    'items' => $historial
                ];
            });

        return Inertia::render('Compras/HistorialSuministro', [
            'proveedores' => $proveedores
        ]);
    }

    //CREAR NUEVO PROVEEDOR OTRA LOGICA ASIN
    public function guardarRapido(Request $request) 
    {
        $request->validate([
            'nombreProveedor' => 'required|string|max:255',
            'correoProveedor' => 'nullable|email',
            'nitProveedor' => 'nullable|string|max:20',
            'direccionProveedor' => 'nullable|string|max:255',
            'telefonoProveedor'    => 'nullable|string|max:20',
        ]);

        $p = new Proveedor();
        $p->nombreProveedor = $request->nombreProveedor;
        $p->nitProveedor = $request->nitProveedor;
        $p->direccionProveedor = $request->direccionProveedor;
        $p->correoProveedor = $request->correoProveedor;
        $p->telefonoProveedor = $request->telefonoProveedor;
        $p->idEmpresa = session('active_company_id');
        $p->estadoProveedor = 1;
        $p->save();

        // Esto hace que Inertia recargue los datos de la vista actual
        return back(); 
    }
}