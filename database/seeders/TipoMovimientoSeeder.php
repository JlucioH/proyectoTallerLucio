<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TipoMovimientoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tipos = [
            ['idTipoMovimiento' => 1, 'nombreTipoMovimiento' => 'Compra'],
            ['idTipoMovimiento' => 2, 'nombreTipoMovimiento' => 'Venta'],
            ['idTipoMovimiento' => 3, 'nombreTipoMovimiento' => 'Ajuste de Entrada'],
            ['idTipoMovimiento' => 4, 'nombreTipoMovimiento' => 'Ajuste de Salida'],
            ['idTipoMovimiento' => 5, 'nombreTipoMovimiento' => 'Devolución de Cliente'],
            ['idTipoMovimiento' => 6, 'nombreTipoMovimiento' => 'Devolución a Proveedor'],
        ];

        foreach ($tipos as $tipo) {
            DB::table('tipoMovimiento')->updateOrInsert(
                ['idTipoMovimiento' => $tipo['idTipoMovimiento']],
                ['nombreTipoMovimiento' => $tipo['nombreTipoMovimiento'], 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}