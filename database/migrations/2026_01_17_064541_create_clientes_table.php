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
        Schema::create('clientes', function (Blueprint $table) {
            $table->id('idCliente');
            
            // codigoCliente ahora es nullable y sin restricción unique de base de datos
            // La validación de unicidad la haremos en el Controlador de Laravel
            $table->string('codigoCliente')->nullable();
            
            $table->string('razonSocialCliente');
            $table->string('telefonoCliente')->nullable();
            $table->string('celularCliente')->nullable();
            $table->string('correoCliente')->nullable();
            
            // Nuevos campos para facturación
            $table->string('razonSocialFacturaCliente')->nullable();
            $table->string('nitFacturaCliente')->nullable();
            
            
            $table->boolean('estadoCliente')->default(true);
            $table->foreignId('idEmpresa')->constrained('empresas', 'idEmpresa')->onDelete('cascade');
            $table->timestamps();

            // Opcional: Un índice normal (no único) para mejorar la velocidad de búsqueda por código
            $table->index(['idEmpresa', 'codigoCliente']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};