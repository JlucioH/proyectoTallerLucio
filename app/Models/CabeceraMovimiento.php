<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CabeceraMovimiento extends Model
{
    protected $table = 'cabeceraMovimiento';
    protected $primaryKey = 'idCabeceraMovimiento';

    protected $fillable = [
        'fechaCabeceraMovimiento',
        'totalCabeceraMovimiento',
        'idTipoMovimiento',
        'id', // ID del usuario (estándar de Laravel)
        'idEmpresa'
    ];

    // Relación con el Tipo (Compra, Venta...)
    public function tipo(): BelongsTo
    {
        return $this->belongsTo(TipoMovimiento::class, 'idTipoMovimiento', 'idTipoMovimiento');
    }

    // Relación con el Usuario que creó el movimiento
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id', 'id');
    }

    // Relación con la Empresa
    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'idEmpresa', 'idEmpresa');
    }

    // Relación con los productos específicos (el detalle)
    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleMovimiento::class, 'idCabeceraMovimiento', 'idCabeceraMovimiento');
    }

    // Si es una venta, permite acceder a la tabla ventas directamente
    public function venta(): HasOne
    {
        return $this->hasOne(Venta::class, 'idCabeceraMovimiento', 'idCabeceraMovimiento');
    }

    public function compra() {
    // Relación hacia la tabla de compras (donde está el idProveedor)
    return $this->hasOne(Compra::class, 'idCabeceraMovimiento', 'idCabeceraMovimiento');
}
}