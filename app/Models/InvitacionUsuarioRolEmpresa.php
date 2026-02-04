<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvitacionUsuarioRolEmpresa extends Model
{
    use HasFactory;

    // 1. Especificamos el nombre exacto de la tabla
    protected $table = 'invitacionUsuarioRolEmpresa';

    // 2. Definimos la llave primaria personalizada
    protected $primaryKey = 'idInvitacionUsuarioRolEmpresa';

    // 3. Los campos que se pueden llenar masivamente
    protected $fillable = [
        'idEmpresa',
        'idRol',
        'emailInvitacionUsuarioRolEmpresa',
        'tokenInvitacionUsuarioRolEmpresa',
        'fechaExpiracionUsuarioRolEmpresa',
        'aceptada',
    ];

    // 4. Casteo de tipos para facilitar el manejo en el frontend/backend
    protected $casts = [
        'fechaExpiracionUsuarioRolEmpresa' => 'datetime',
        'aceptada' => 'boolean',
    ];

    // --- RELACIONES ---

    /**
     * Relación con la Empresa que invita
     */
    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'idEmpresa', 'idEmpresa');
    }

    /**
     * Relación con el Rol que tendrá el invitado
     */
    public function rol()
    {
        return $this->belongsTo(Rol::class, 'idRol', 'idRol');
    }
}