<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        \App\Models\Rol::create(['nombreRol' => 'Super Admin']); 
        

        \App\Models\Rol::create(['nombreRol' => 'Admin Empresa']); 
        

        \App\Models\Rol::create(['nombreRol' => 'Admin Almacen']);
        \App\Models\Rol::create(['nombreRol' => 'Vendedor']);
    }
}
