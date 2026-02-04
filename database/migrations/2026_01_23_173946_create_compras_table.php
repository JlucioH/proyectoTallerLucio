<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('compras', function (Blueprint $table) {
            $table->id('idCompra');

            // Relación con Proveedor (puede ser opcional si compras sin registro)
            $table->unsignedBigInteger('idProveedor')->nullable();
            $table->foreign('idProveedor')->references('idProveedor')->on('proveedores')->onDelete('set null');
            $table->boolean('conFacturaCompra')->default(false);

            // Relación obligatoria con la cabecera del movimiento
            $table->foreignId('idCabeceraMovimiento')
                ->constrained('cabeceraMovimiento', 'idCabeceraMovimiento')
                ->onDelete('cascade');

            // Datos adicionales de la compra
            $table->string('numeroFacturaCompra')->nullable(); // El número de factura que te da el proveedor
            $table->string('metodoPago')->nullable(); // Efectivo, Crédito, etc.

            
            
            // Si manejas crédito, podrías añadir estados aquí
            // $table->enum('estadoPago', ['pagado', 'pendiente'])->default('pagado');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compras');
    }
};
