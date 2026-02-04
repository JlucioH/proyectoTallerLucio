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
        Schema::create('invitacionUsuarioRolEmpresa', function (Blueprint $table) {
            $table->id('idInvitacionUsuarioRolEmpresa');
            
            // Empresa que emite la invitación (La empresa seleccionada del Admin)
            $table->foreignId('idEmpresa')->constrained('empresas', 'idEmpresa')->onDelete('cascade');
            
            // Rol que se le asignará (idRol 3 o 4 según lo que elijas al enviar)
            $table->foreignId('idRol')->constrained('roles', 'idRol')->onDelete('cascade');

            $table->string('emailInvitacionUsuarioRolEmpresa');
            $table->string('tokenInvitacionUsuarioRolEmpresa')->unique();
            $table->timestamp('fechaExpiracionUsuarioRolEmpresa');
            $table->boolean('aceptada')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invitacion_usuario_rol_empresa');
    }
};
