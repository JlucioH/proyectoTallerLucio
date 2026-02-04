<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Models\PlanSuscripcion;
use App\Models\PlanSuscripcionEmpresa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EmpresaController extends Controller
{
    /**
     * Muestra los datos de la empresa actual, incluyendo su suscripción.
     */
    public function show()
    {
        $idEmpresa = session('active_company_id');

        if (!$idEmpresa) {
            return redirect()->route('company.select')->with('error', 'Sesión de empresa no encontrada.');
        }

        // Cargamos la empresa con su relación de suscripción activa para mostrarla en la vista
        $empresa = Empresa::with(['suscripcionActual.plan'])
            ->where('idEmpresa', $idEmpresa)
            ->firstOrFail();

        return Inertia::render('Empresa/Datos', [
            'empresa' => $empresa
        ]);
    }

    /**
     * Crea una nueva empresa y le asigna el plan seleccionado.
     */
    public function store(Request $request)
    {
        // Validamos datos de empresa y la existencia del plan
        $request->validate([
            'nombreEmpresa' => 'required|string|max:255',
            'idPlanSuscripcion' => 'required|exists:plan_suscripcion,idPlanSuscripcion',
            'direccionEmpresa' => 'nullable|string|max:255',
            'telefonoEmpresa' => 'nullable|string|max:20',
        ]);

        // Usamos una transacción para que si algo falla, no se cree la empresa sin plan
        return DB::transaction(function () use ($request) {
            
            // 1. Crear la empresa
            $empresa = Empresa::create([
                'nombreEmpresa'    => $request->nombreEmpresa,
                'direccionEmpresa' => $request->direccionEmpresa,
                'telefonoEmpresa'  => $request->telefonoEmpresa,
                'estadoEmpresa'    => true,
            ]);

            // 2. Crear la suscripción vinculada al plan elegido (1 año de duración)
            PlanSuscripcionEmpresa::create([
                'idEmpresa' => $empresa->idEmpresa,
                'idPlanSuscripcion' => $request->idPlanSuscripcion,
                'fechaIniPlanSuscripcionEmpresa' => Carbon::now(),
                'fechaFinPlanSuscripcionEmpresa' => Carbon::now()->addYear(),
                'estadoPlanEmpresa' => true,
            ]);

            return redirect()->route('company.select')->with('success', 'Empresa y plan creados correctamente.');
        });
    }

    /**
     * Actualiza los datos existentes de la empresa (Nombre, dirección, logo, mapa).
     */
    public function update(Request $request, $id)
    {
        // 1. Validar permisos (Solo Rol 2)
        if (session('active_role_id') !== 2) {
            return back()->withErrors(['error' => 'No tienes permisos de administrador para esta sede.']);
        }

        // 2. Validar datos incluyendo Logo y Coordenadas
        $request->validate([
            'nombreEmpresa'    => 'required|string|max:255',
            'direccionEmpresa' => 'nullable|string|max:255',
            'telefonoEmpresa'  => 'nullable|string|max:20',
            'logo'             => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'latitud'          => 'nullable|numeric', 
            'longitud'         => 'nullable|numeric', 
        ]);

        $empresa = Empresa::where('idEmpresa', $id)->firstOrFail();
        
        // 3. Preparar datos para actualizar
        $data = [
            'nombreEmpresa'    => $request->nombreEmpresa,
            'direccionEmpresa' => $request->direccionEmpresa,
            'telefonoEmpresa'  => $request->telefonoEmpresa,
            'latitud'          => $request->latitud,
            'longitud'         => $request->longitud,
        ];

        // 4. Lógica de guardado dinámico del Logo
        if ($request->hasFile('logo')) {
            if ($empresa->logoEmpresa) {
                Storage::disk('public')->delete($empresa->logoEmpresa);
            }

            $path = $request->file('logo')->store(
                "empresas/empresa_{$id}/logos", 
                'public'
            );

            $data['logoEmpresa'] = $path;
        }

        $empresa->update($data);

        return back()->with('success', 'Datos de la empresa actualizados correctamente.');
    }
}