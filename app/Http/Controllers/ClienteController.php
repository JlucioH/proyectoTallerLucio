<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\Empresa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ClienteController extends Controller
{
    /**
     * active_company_id sera id empresa activa
     */
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

        // roles 2 y 4
        if (!$vinculo || !in_array($vinculo->idRol, [2, 4])) {
            abort(403, 'No tienes permisos en esta empresa.');
        }

        return $activeCompanyId;
    }

    /**
     * Vista para Roles 2 y 4 (Gestión por empresa activa)
     */
    public function index() {
        $idEmpresa = $this->getEmpresaId();
        
        $clientes = Cliente::where('idEmpresa', $idEmpresa)
            ->orderBy('razonSocialCliente', 'asc')
            ->get();

        return Inertia::render('Venta/ClientesList', [
            'clientes' => $clientes
        ]);
    }

    /**
     * Vista para Staff (Administrador de Sistema)
     * Como esta ruta ya pasa por el middleware 'is.staff', no volvemos a validar aquí.
     */
    public function indexAdmin() {
        // Obtenemos todas las empresas con sus respectivos clientes
        $empresas = Empresa::with(['clientes' => function($query) {
            $query->orderBy('razonSocialCliente', 'asc');
        }])
        ->orderBy('nombreEmpresa', 'asc')
        ->get()
        ->map(function($empresa) {
            return [
                'idEmpresa' => $empresa->idEmpresa,
                'nombreEmpresa' => $empresa->nombreEmpresa,
                'nitEmpresa' => $empresa->nitEmpresa,
                'clientes' => $empresa->clientes
            ];
        });

        // Apuntamos al componente exacto que mencionaste: Pages/Admin/AdminList.tsx
        return Inertia::render('Admin/AdminList', [
            'empresas' => $empresas
        ]);
    }

    public function store(Request $request) {
        $idEmpresa = $this->getEmpresaId();
        
        $request->validate([
            'codigoCliente' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('clientes')->where(function ($query) use ($idEmpresa) {
                    return $query->where('idEmpresa', $idEmpresa);
                }),
            ],
            'razonSocialCliente' => 'required|string|max:255',
            'correoCliente' => 'nullable|email',
            'celularCliente' => 'nullable|string',
            'nitFacturaCliente' => 'nullable|string|max:20',
            'razonSocialFacturaCliente' => 'nullable|string|max:255',
        ]);

        Cliente::create([
            'codigoCliente' => $request->codigoCliente,
            'razonSocialCliente' => $request->razonSocialCliente,
            'correoCliente' => $request->correoCliente,
            'celularCliente' => $request->celularCliente,
            'telefonoCliente' => $request->telefonoCliente,
            'nitFacturaCliente' => $request->nitFacturaCliente,
            'razonSocialFacturaCliente' => $request->razonSocialFacturaCliente,
            'idEmpresa' => $idEmpresa,
            'estadoCliente' => true
        ]);

        return redirect()->back()->with('message', 'Cliente creado con éxito.');
    }

    public function update(Request $request, $id) {
        $idEmpresa = $this->getEmpresaId();
        
        $cliente = Cliente::where('idCliente', $id)
            ->where('idEmpresa', $idEmpresa)
            ->firstOrFail();

        $request->validate([
            'codigoCliente' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('clientes', 'codigoCliente')
                    ->ignore($cliente->idCliente, 'idCliente')
                    ->where(function ($query) use ($idEmpresa) {
                        return $query->where('idEmpresa', $idEmpresa);
                    }),
            ],
            'razonSocialCliente' => 'required|string|max:255',
            'correoCliente' => 'nullable|email',
            'nitFacturaCliente' => 'nullable|string|max:20',
            'razonSocialFacturaCliente' => 'nullable|string|max:255',
        ]);

        $cliente->update($request->all());

        return redirect()->back()->with('message', 'Cliente actualizado.');
    }

    public function toggleEstado($id) {
        $idEmpresa = $this->getEmpresaId();
        
        $cliente = Cliente::where('idCliente', $id)
            ->where('idEmpresa', $idEmpresa)
            ->firstOrFail();
        
        $cliente->update([
            'estadoCliente' => !$cliente->estadoCliente
        ]);

        return redirect()->back()->with('message', 'Estado actualizado.');
    }

    public function guardarRapidoCliente(Request $request) 
    {
        $idEmpresa = $this->getEmpresaId();
        $request->validate([
            'codigoCliente' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('clientes')->where(function ($query) use ($idEmpresa) {
                    return $query->where('idEmpresa', $idEmpresa);
                }),
            ],
            'razonSocialCliente' => 'required|string|max:255',
            'correoCliente' => 'nullable|email',
            'celularCliente' => 'nullable|string',
            'telefonoCliente' => 'nullable|string',
            'nitFacturaCliente' => 'nullable|string|max:20',
            'razonSocialFacturaCliente' => 'nullable|string|max:255',
        ]);

        $p = new Cliente();
        $p->codigoCliente = $request->codigoCliente;
        $p->razonSocialCliente = $request->razonSocialCliente;
        $p->correoCliente = $request->correoCliente;
        $p->celularCliente = $request->celularCliente;
        $p->telefonoCliente = $request->telefonoCliente;
        $p->nitFacturaCliente = $request->nitFacturaCliente;
        $p->razonSocialFacturaCliente = $request->razonSocialFacturaCliente;
        $p->idEmpresa = session('active_company_id');
        $p->estadoCliente = 1;
        $p->save();

        // Esto hace que Inertia recargue los datos de la vista actual
        return back(); 
    }
}