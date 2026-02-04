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
    Schema::create('invitacionEmpresa', function (Blueprint $table) {
        $table->id('idInvitacionEmpresa');
        // Relacionamos con la empresa creada anteriormente
        $table->foreignId('idEmpresa')->constrained('empresas', 'idEmpresa')->onDelete('cascade');
        
        $table->string('emailInvitacionEmpresa');
        $table->string('tokenInvitacionEmpresa')->unique();
        $table->timestamp('fechaExpiracionEmpresa');
        $table->boolean('aceptada')->default(false);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invitacionEmpresa');
    }
};
