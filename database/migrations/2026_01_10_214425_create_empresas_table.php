<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('empresas', function (Blueprint $table) {
            $table->id('idEmpresa'); 
            $table->string('nombreEmpresa');
            $table->string('direccionEmpresa')->nullable();
            $table->string('telefonoEmpresa')->nullable();
            $table->string('logoEmpresa')->nullable();
            $table->decimal('ivaEmpresa', 5, 2)->default(13.00);
            // NUEVOS CAMPOS PARA GEOLOCALIZACIÓN
            // decimal(total_digitos, decimales)
            // Latitud: de -90 a 90 (10,8 es ideal)
            // Longitud: de -180 a 180 (11,8 es ideal)
            $table->decimal('latitud', 10, 8)->nullable();
            $table->decimal('longitud', 11, 8)->nullable();
            
            $table->boolean('estadoEmpresa')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('empresas');
    }
};