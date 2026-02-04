<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Cliente; // Asegúrate de que el nombre del modelo coincida

class ClienteDefaultSeeder extends Seeder
{
    public function run(): void
    {
        Cliente::create([
            'razonSocialCliente' => 'S/N',
            'razonSocialFacturaCliente' => 'S/N',
            'nitFacturaCliente' => '0',
            // Si tienes otros campos obligatorios como idEmpresa, añádelos aquí
        ]);
    }
}