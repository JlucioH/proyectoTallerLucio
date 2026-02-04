<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // database/migrations/xxxx_xx_xx_create_detalle_movimiento_table.php
    public function up()
    {
        Schema::create('detalleMovimiento', function (Blueprint $table) {
            $table->id('idDetalleMovimiento');
            $table->integer('cantidadDetalleMovimiento');

            // Valores Unitarios
            $table->decimal('precioDetalleMovimiento', 15, 2); // A cuánto se vende
            $table->decimal('costoDetalleMovimiento', 15, 2);  // A cuánto se compró (costo)

            // Valores Totales (Calculados: cantidad * unitario)
            $table->decimal('precioTotalDetalleMovimiento', 15, 2);
            $table->decimal('costoTotalDetalleMovimiento', 15, 2);

            // Relaciones
            $table->foreignId('idItem')->constrained('items', 'idItem');
            $table->foreignId('idCabeceraMovimiento')->constrained('cabeceraMovimiento', 'idCabeceraMovimiento')->onDelete('cascade');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detalleMovimiento');
    }
};
