<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabla de Planes
        Schema::create('planSuscripcion', function (Blueprint $table) {
            $table->id('idPlanSuscripcion');
            $table->string('nombrePlanSuscripcion');
            $table->integer('tiempoPlanSuscripcion')->default(12); // Siempre 12 meses por defecto
            $table->decimal('limiteMensualMontoPlanSuscripcion', 12, 2); // Limite de dinero procesable
            $table->timestamps();
        });

        // 2. Tabla Intermedia (Suscripciones Activas de Empresas)
        Schema::create('planSuscripcionEmpresa', function (Blueprint $table) {
            $table->id('idPlanSuscripcionEmpresa');
            $table->date('fechaIniPlanSuscripcionEmpresa');
            $table->date('fechaFinPlanSuscripcionEmpresa');
            $table->boolean('estadoPlanEmpresa')->default(true);
            
            // Relaciones
            $table->unsignedBigInteger('idEmpresa');
            $table->unsignedBigInteger('idPlanSuscripcion');

            $table->foreign('idEmpresa')->references('idEmpresa')->on('empresas')->onDelete('cascade');
            $table->foreign('idPlanSuscripcion')->references('idPlanSuscripcion')->on('planSuscripcion');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('planSuscripcionEmpresa');
        Schema::dropIfExists('planSuscripcion');
    }
};