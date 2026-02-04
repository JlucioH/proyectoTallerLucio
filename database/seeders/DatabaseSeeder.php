<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PlanSuscripcionSeeder::class,
        ]);
        $this->call([
            TipoMovimientoSeeder::class,
            
        ]);
        // User::factory(10)->create();
        $this->call([
            RoleSeeder::class,
            // UserSeeder::class, // Si tienes uno para el admin, agrégalo aquí
        ]);
//        $this->call([
//            ClienteDefaultSeeder::class,
//        ]);
        User::factory()->create([
            'name' => 'usuario prueba',
            'email' => 'prueba@ejemplo.com',
        ]);

        
    }
}
