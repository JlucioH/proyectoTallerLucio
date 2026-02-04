<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('categorias', function (Blueprint $table) {
            $table->id('idCategoria');
            $table->string('nombreCategoria');
            $table->boolean('estadoCategoria')->default(true); // Para inhabilitar
            $table->unsignedBigInteger('idEmpresa');
            $table->timestamps();

            $table->foreign('idEmpresa')->references('idEmpresa')->on('empresas')->onDelete('cascade');
        });
    }

    public function down() {
        Schema::dropIfExists('categorias');
    }
};