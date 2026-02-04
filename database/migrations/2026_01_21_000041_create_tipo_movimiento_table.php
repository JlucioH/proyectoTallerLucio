<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('tipoMovimiento', function (Blueprint $table) {
            $table->id('idTipoMovimiento');
            $table->string('nombreTipoMovimiento'); // Ejemplo: Venta, Compra, Entrada, Salida
            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tipoMovimiento');
    }
};
