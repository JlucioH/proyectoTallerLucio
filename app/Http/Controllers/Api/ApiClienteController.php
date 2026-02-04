<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApiClienteController extends Controller
{
    // Listar clientes de una empresa específica
    public function index(Request $request)
    {
        $idEmpresa = $request->header('idEmpresa'); // El celular enviará esto en el header
        
        if (!$idEmpresa) {
            return response()->json(['error' => 'No se especificó empresa'], 400);
        }

        $clientes = Cliente::where('idEmpresa', $idEmpresa)
            ->where('estadoCliente', true)
            ->orderBy('razonSocialCliente', 'asc')
            ->get();

        return response()->json($clientes);
    }

    // Guardado rápido desde el móvil
    public function store(Request $request)
    {
        $idEmpresa = $request->header('idEmpresa');

        $request->validate([
            'razonSocialCliente' => 'required|string|max:255',
            'nitFacturaCliente' => 'nullable|string|max:20',
            'correoCliente' => 'nullable|email',
        ]);

        $cliente = Cliente::create([
            'razonSocialCliente' => $request->razonSocialCliente,
            'correoCliente' => $request->correoCliente,
            'nitFacturaCliente' => $request->nitFacturaCliente,
            'razonSocialFacturaCliente' => $request->razonSocialFacturaCliente ?? $request->razonSocialCliente,
            'idEmpresa' => $idEmpresa,
            'estadoCliente' => true
        ]);

        return response()->json([
            'message' => 'Cliente creado',
            'cliente' => $cliente
        ]);
    }
}