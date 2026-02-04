<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvitacionEmpresa extends Model
{
    protected $table = 'invitacionEmpresa';
    protected $primaryKey = 'idInvitacionEmpresa';

    protected $fillable = [
        'idEmpresa',
        'emailInvitacionEmpresa',
        'tokenInvitacionEmpresa',
        'fechaExpiracionEmpresa',
        'aceptada'
    ];

    protected $casts = [
        'fechaExpiracionEmpresa' => 'datetime',
        'aceptada' => 'boolean',
    ];

    // Relación inversa: la invitación pertenece a una empresa
    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'idEmpresa', 'idEmpresa');
    }
}