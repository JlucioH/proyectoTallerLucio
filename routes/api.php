<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ApiSeleccionarEmpresaController;
use App\Http\Controllers\Api\LoginMovilController; // Crearemos este ahoraç
use App\Http\Controllers\Api\ApiClienteController;
use App\Http\Controllers\Api\ApiItemController;
use App\Http\Controllers\Api\ApiVentaController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::post('/login-movil', [LoginMovilController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/empresas', [ApiSeleccionarEmpresaController::class, 'obtenerEmpresas']);
    Route::post('/seleccionar-empresa', [ApiSeleccionarEmpresaController::class, 'seleccionarEmpresa']);

    Route::get('/clientes', [ApiClienteController::class, 'index']);
    Route::post('/clientes', [ApiClienteController::class, 'store']);

    Route::get('/items', [ApiItemController::class, 'index']);

    Route::post('/ventas', [ApiVentaController::class, 'store']);

    // Esta es la ruta para el historial del Dashboard
    Route::get('/ventas-historial', [ApiVentaController::class, 'getVentasApi']);
});