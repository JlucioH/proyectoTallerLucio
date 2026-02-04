<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TipoMovimiento extends Model
{
    protected $table = 'tipoMovimiento';
    protected $primaryKey = 'idTipoMovimiento';
    protected $fillable = ['nombreTipoMovimiento'];

    public function cabeceras(): HasMany
    {
        return $this->hasMany(CabeceraMovimiento::class, 'idTipoMovimiento', 'idTipoMovimiento');
    }
}