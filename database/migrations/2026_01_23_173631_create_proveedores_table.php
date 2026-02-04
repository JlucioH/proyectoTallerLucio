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
        Schema::create('proveedores', function (Blueprint $table) {
            $table->id('idProveedor');
            $table->string('codigoProveedor')->nullable();
            $table->string('nombreProveedor');
            $table->string('nitProveedor')->nullable(); // Útil para facturas de compra
            $table->string('direccionProveedor')->nullable();
            $table->string('telefonoProveedor')->nullable();
            $table->string('celularProveedor')->nullable();
            $table->string('correoProveedor')->nullable();
            $table->boolean('estadoProveedor')->default(true);
            $table->foreignId('idEmpresa')->constrained('empresas', 'idEmpresa')->onDelete('cascade');
            $table->timestamps();

            // Opcional: Un índice normal (no único) para mejorar la velocidad de búsqueda por código
            $table->index(['idEmpresa', 'codigoProveedor']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proveedores');
    }
};
