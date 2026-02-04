<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\AdminSistema;
use App\Models\Rol;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class CreateSuperAdmin extends Command
{
    protected $signature = 'make:superadmin';
    protected $description = 'Crea el administrador global del sistema';

    public function handle()
    {
        $email = $this->ask('Introduce tu email');
        $password = $this->secret('Introduce tu contraseña');

        DB::beginTransaction();
        try {
            // Crear el usuario base
            $user = User::create([
                'name' => 'Super Admin P',
                'email' => $email,
                'password' => Hash::make($password),
            ]);

            // Buscar el Rol de Super Admin (el ID 1)
            $rol = Rol::where('nombreRol', 'Super Admin')->first();

            // Vincularlo a la tabla de administración
            AdminSistema::create([
                'id' => $user->id,
                'idRol' => $rol->idRol
            ]);

            DB::commit();
            $this->info('Ya eres Super Admin del sistema.');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Algo salió mal: ' . $e->getMessage());
        }
    }
}