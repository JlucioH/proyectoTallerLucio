<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // database/migrations/xxxx_xx_xx_create_cabecera_movimiento_table.php
    public function up()
    {
        Schema::create('cabeceraMovimiento', function (Blueprint $table) {
            $table->id('idCabeceraMovimiento');
            $table->timestamp('fechaCabeceraMovimiento')->useCurrent();
            $table->decimal('totalCabeceraMovimiento', 15, 2)->default(0); 
            
            // Relaciones
            $table->foreignId('idTipoMovimiento')->constrained('tipoMovimiento', 'idTipoMovimiento');
            $table->foreignId('id')->constrained('users'); // Usuario que registra
            $table->foreignId('idEmpresa')->constrained('empresas', 'idEmpresa');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cabeceraMovimiento');
    }
};
