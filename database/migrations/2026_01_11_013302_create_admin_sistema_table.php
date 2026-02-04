<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('adminSistema', function (Blueprint $table) {
            $table->id('idAdminSistema');
            // Relación con el usuario
            $table->foreignId('id')->constrained('users')->onDelete('cascade');
            // Relación con el rol (aquí irá el ID del Super Admin)
            $table->foreignId('idRol')->constrained('roles', 'idRol'); 
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('adminSistema');
    }
};