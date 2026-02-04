<?php

// database/migrations/xxxx_xx_xx_create_items_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('items', function (Blueprint $table) {
            $table->id('idItem');
            $table->string('codigoItem')->unique();
            $table->string('nombreItem');
            $table->string('descripcionItem')->nullable();
            $table->integer('cantidadItem')->default(0);
            $table->decimal('costoItem', 12, 2)->default(0);
            $table->decimal('importeItem', 12, 2)->default(0);
            $table->decimal('precioVentaItem', 12, 2)->default(0);
            $table->integer('cantidadMinItem')->default(0);
            $table->integer('cantidadMaxItem')->default(0);
            $table->boolean('estadoItem')->default(true); // Para inhabilitar
            
            $table->unsignedBigInteger('idCategoria');
            $table->unsignedBigInteger('idEmpresa');
            $table->timestamps();

            $table->foreign('idCategoria')->references('idCategoria')->on('categorias')->onDelete('cascade');
            $table->foreign('idEmpresa')->references('idEmpresa')->on('empresas')->onDelete('cascade');
        });
    }

    public function down() {
        Schema::dropIfExists('items');
    }
};