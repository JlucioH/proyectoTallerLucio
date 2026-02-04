<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginMovilController extends Controller
{
    public function login(Request $request) {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $token = $user->createToken('token-movil')->plainTextToken;

            // Tu lógica de negocio: traer empresas vinculadas al usuario
            $empresas = \App\Models\UsuarioEmpresa::where('id', $user->id)
                ->with(['empresa', 'rol'])
                ->get()
                ->map(function ($relacion) {
                    return [
                        'idEmpresa' => $relacion->empresa->idEmpresa,
                        'nombreEmpresa' => $relacion->empresa->nombreEmpresa,
                        'logoEmpresa' => $relacion->empresa->logoEmpresa,
                        'rol' => $relacion->rol->nombreRol,
                    ];
                });

            return response()->json([
                'token' => $token,
                'empresas' => $empresas
            ]);
        }
    }
}