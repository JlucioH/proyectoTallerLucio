<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Fortify\Features;

// Importación de Controladores
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvitacionController;
use App\Http\Controllers\AdminEmpresaUsuarioController;
use App\Http\Controllers\SeleccionarEmpresaController;
use App\Http\Controllers\InvitacionUsuarioRolEmpresaController;
use App\Http\Controllers\EmpresaController; 
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\VentaController; // Nuevo Controlador
use App\Http\Controllers\CompraController; // Nuevo Controlador
use App\Http\Controllers\ProveedorController; // Nuevo Controlador
use App\Http\Controllers\Public\PortalProductosController;
use App\Http\Controllers\ReporteKardexItemController;
use App\Http\Controllers\ReporteCostoItemController;
/*
|--------------------------------------------------------------------------
| Rutas Públicas
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

/* Portal productos */
Route::get('/catalogo', [PortalProductosController::class, 'index'])->name('public.catalogo');
// ruta para filtrar por categoria (unifica nombre)
Route::get('/catalogo/categoria/{nombre}', [PortalProductosController::class, 'porCategoria'])->name('public.categoria');

/**
 * FLUJO A: Invitaciones de Registro Inicial (Admin de Sistema)
 */
Route::controller(InvitacionController::class)->group(function () {
    Route::get('/registro-invitado/{token}', 'showRegistrationForm')->name('invitacion.aceptar');
    Route::post('/registro-invitado/finalizar', 'register')->name('invitacion.register');
});

/**
 * FLUJO B: Invitación de Personal por parte de una Empresa
 */
Route::controller(InvitacionUsuarioRolEmpresaController::class)->group(function () {
    Route::get('/invitacion/empresa/{token}', 'showRegistrationForm')->name('invitaciones.empresa.aceptar');
    Route::post('/invitacion/empresa/confirmar', 'register')->name('invitaciones.empresa.registrar');
});


/*
|--------------------------------------------------------------------------
| Rutas Protegidas (Requieren Auth)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    
    // 1. Selector de Empresa
    Route::get('/select-company', [SeleccionarEmpresaController::class, 'index'])->name('company.select');
    Route::post('/select-company', [SeleccionarEmpresaController::class, 'setCompany'])->name('company.set');

    // 2. Rutas que requieren Empresa seleccionada (Middleware check.company)
    Route::middleware(['check.company'])->group(function () {
        
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // GESTIÓN DE PERSONAL
        Route::controller(InvitacionUsuarioRolEmpresaController::class)->group(function () {
            Route::get('/empresa/usuarios', 'index')->name('empresa.usuarios');
            Route::post('/empresa/usuarios/invitar', 'enviar')->name('empresa.usuarios.invitar');
        });

        // DATOS DE LA EMPRESA
        Route::controller(EmpresaController::class)->group(function () {
            Route::get('/empresa/datos', 'show')->name('empresa.datos');
            Route::put('/empresa/{id}/update', 'update')->name('empresa.update');
        });

        // GESTIÓN DE CATEGORÍAS
        Route::controller(CategoriaController::class)->group(function () {
            // Nota: Corregido error tipográfico de la base (Cebecera -> Cabecera se maneja en el controlador)
            Route::get('/inventario/categorias', 'index')->name('categorias.index');
            Route::post('/inventario/categorias', 'store')->name('categorias.store');
            Route::put('/inventario/categorias/{id}', 'update')->name('categorias.update');
            Route::patch('/inventario/categorias/{id}/estado', 'toggleEstado')->name('categorias.estado');
        });

        // GESTIÓN DE ÍTEMS Y GALERÍA
        Route::controller(ItemController::class)->group(function () {
            Route::get('/inventario/items', 'index')->name('items.index');
            Route::post('/inventario/items', 'store')->name('items.store');
            Route::post('/inventario/items/{id}', 'update')->name('items.update');
            Route::patch('/inventario/items/{id}/estado', 'toggleEstado')->name('items.estado');
            Route::patch('/inventario/imagenes/{idImagen}/orden', 'updateImagenOrden')->name('imagenes.orden');
            // Nota: Eliminada la redundancia de 'detallle' en la lógica de negocio
            Route::delete('/inventario/imagenes/{idImagen}', 'destroyImagen')->name('imagenes.destroy');
            ////
            Route::post('/items/guardar-rapido-item', 'guardarRapidoItem')->name('items.rapido');
        });

        // GESTIÓN DE CLIENTES (Por Empresa)
        Route::controller(ClienteController::class)->group(function () {
            Route::get('/ventas/clientes', 'index')->name('clientes.index');
            Route::post('/ventas/clientes', 'store')->name('clientes.store');
            Route::put('/ventas/clientes/{id}', 'update')->name('clientes.update');
            Route::patch('/ventas/clientes/{id}/estado', 'toggleEstado')->name('clientes.estado');
            // Ruta auxiliar para el formulario de ventas (busca por NIT)
            Route::get('/ventas/clientes/buscar/{nit}', 'buscarPorNit')->name('clientes.buscar');

            ////
            Route::post('/clientes/guardar-rapido-cliente', 'guardarRapidoCliente')->name('clientes.rapido');
        });

        // GESTIÓN DE PROVEEDORES
        Route::controller(ProveedorController::class)->group(function () {
            Route::get('/compras/proveedores', 'index')->name('proveedores.index');
            Route::post('/compras/proveedores', 'store')->name('proveedores.store');
            Route::put('/compras/proveedores/{id}', 'update')->name('proveedores.update');
            // Cambio de estado (El patch que usas para el switch de activar/desactivar)
            Route::patch('/compras/proveedores/{id}/estado', 'toggleEstado')->name('proveedores.estado');
            Route::post('/proveedores/guardar-rapido', 'guardarRapido')->name('proveedores.rapido');
            Route::get('/compras/historial-suministros', 'historialSuministros')->name('compras.suministros');
        });

        // PROCESO DE COMPRAS (Movimientos de Entrada)
        Route::controller(CompraController::class)->group(function () {
            Route::get('/compras/nueva', 'create')->name('compras.create');
            Route::post('/compras/guardar', 'store')->name('compras.store');
            Route::get('/compras/historial', 'index')->name('compras.index');
        });
        
        // PROCESO DE VENTAS (Movimientos)
        Route::controller(VentaController::class)->group(function () {
            Route::get('/ventas/nueva', 'create')->name('ventas.create');
            Route::post('/ventas/guardar', 'store')->name('ventas.store');
            Route::get('/ventas/historial', 'index')->name('ventas.index');
            // NUEVA RUTA PARA BUSQUEDA AUTOMÁTICA DESDE CREARVENTA.TSX
            Route::get('/ventas/buscar-cliente/{nit}', 'buscarPorNit')->name('ventas.buscarCliente');
        });

        //proceso de reportes(ReporteKardexItemController.php)
        Route::controller(ReporteKardexItemController::class)->group(function () {
            //Route::get('/inventario/kardex-reporte/{idItem}', 'index')->name('reporte.kardex');
            // Esta es la que pusiste en el Sidebar
            //Route::get('/reporte/reportekardexitem', [ReporteKardexItemController::class, 'selector'])->name('kardex.selector');

            // Esta es para el reporte real (con ID)
            //Route::get('/reporte/kardex/{idItem}', [ReporteKardexItemController::class, 'index'])->name('kardex.index');
            //Route::get('/reporte/reportekardexitem/{idItem?}', [ReporteKardexItemController::class, 'index'])->name('kardex.index');
            Route::get('/reporte/reportekardexitem/{idItem?}', 'index')->name('kardex.index');
        });
        Route::controller(ReporteCostoItemController::class)->group(function () {
            Route::get('/reporte/reportecostoitem', [ReporteCostoItemController::class, 'index'])->name('reporte.costo.index');
            Route::get('/reporte/reportecostoitem/{idItem}', [ReporteCostoItemController::class, 'show'])->name('reporte.costo.show');
        });
        
    });

    /*
    |--------------------------------------------------------------------------
    | Rutas de Staff (SuperAdmin) - DENTRO del grupo Auth
    |--------------------------------------------------------------------------
    */
    Route::middleware(['is.staff'])->group(function () {
        Route::get('/system/admin', [DashboardController::class, 'index'])->name('admin.panel');
        Route::post('/system/admin/empresas', [DashboardController::class, 'storeEmpresa'])->name('admin.empresas.store');
        
        Route::get('/admin/empresas-usuarios', [AdminEmpresaUsuarioController::class, 'index'])
            ->name('admin.empresas.usuarios');

        // NUEVO: Consolidado de clientes global para el Administrador de Sistema
        Route::get('/admin/clientes-consolidado', [ClienteController::class, 'indexAdmin'])
            ->name('admin.clientes.index');
        //  Categorias de Empresas
        Route::get('/admin/categorias-consolidado', [CategoriaController::class, 'indexAdmin'])
            ->name('admin.categorias.index');
        //  Items de Empresas
        Route::get('/admin/items-consolidado', [ItemController::class, 'indexAdmin'])
            ->name('admin.items.index');    
    });

    // Envío de invitaciones generales (Flujo A)
    Route::post('/enviar-invitacion', [InvitacionController::class, 'store'])->name('invitacion.enviar');
});

/*
|--------------------------------------------------------------------------
| Debug de Sesión
|--------------------------------------------------------------------------
*/
Route::get('/debug-session', function (Request $request) {
    return [
        'session_id' => $request->session()->getId(),
        'payload' => $request->session()->all(),
        'config_secure' => config('session.secure'),
    ];
})->middleware(['web', 'auth']);

require __DIR__.'/settings.php';