<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UsuarioEmpresa extends Model
{
    protected $table = 'usuarioEmpresa'; // El nombre exacto de tu migración
    protected $primaryKey = 'idUsuarioEmpresa';

    protected $fillable = ['id', 'idEmpresa', 'idRol'];

    // La relación que te pedía el Dashboard
    public function rol(): BelongsTo
    {
        // 1. Modelo, 2. FK en esta tabla, 3. PK en la tabla roles
        return $this->belongsTo(Rol::class, 'idRol', 'idRol');
    }

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'idEmpresa', 'idEmpresa');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id', 'id');
    }
}