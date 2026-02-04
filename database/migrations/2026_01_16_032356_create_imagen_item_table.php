<?php

// database/migrations/xxxx_xx_xx_create_imagen_item_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('imagenItem', function (Blueprint $table) {
            $table->id('idImagenItem');
            $table->string('rutaImagenItem');
            $table->integer('ordenImagenItem')->default(1);
            $table->unsignedBigInteger('idItem');
            $table->timestamps();

            $table->foreign('idItem')->references('idItem')->on('items')->onDelete('cascade');
        });
    }

    public function down() {
        Schema::dropIfExists('imagenItem');
    }
};