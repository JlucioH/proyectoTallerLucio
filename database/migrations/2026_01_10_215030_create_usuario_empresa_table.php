<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Forzamos el nombre de la tabla con la "E" mayúscula
        Schema::create('usuarioEmpresa', function (Blueprint $table) {
            $table->id('idUsuarioEmpresa'); 
            
            // 1. Relación con Usuarios (Laravel usa 'id' por defecto)
            $table->foreignId('id')->constrained('users')->onDelete('cascade');
            
            // 2. Relación con Empresas usando idEmpresa
            $table->foreignId('idEmpresa')->constrained('empresas', 'idEmpresa')->onDelete('cascade');
            
            // 3. Relación con Roles usando idRol
            $table->foreignId('idRol')->constrained('roles', 'idRol')->onDelete('cascade');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuarioEmpresa');
    }
};