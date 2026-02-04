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
        Schema::create('ventas', function (Blueprint $table) {
            $table->id('idVenta');
            
            // Relación con Cliente (opcional para ventas al mostrador)
            $table->unsignedBigInteger('idCliente')->nullable();
            $table->foreign('idCliente')->references('idCliente')->on('clientes')->onDelete('set null');

            // Relación obligatoria con la cabecera del movimiento
            $table->foreignId('idCabeceraMovimiento')
                  ->constrained('cabeceraMovimiento', 'idCabeceraMovimiento')
                  ->onDelete('cascade');

            // Datos de facturación específicos de esta venta
            $table->string('nitVenta')->nullable(); 
            $table->string('razonSocialVenta')->nullable();

            $table->decimal('totalRecibidoVenta', 15, 2)->default(0); 
            $table->decimal('totalCambioVenta', 15, 2)->default(0); 
            
            // Información de pago
            $table->string('metodoPago')->nullable(); // Efectivo, Transferencia, Tarjeta, etc.
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ventas');
    }
};