<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleMovimiento extends Model
{
    protected $table = 'detalleMovimiento';
    protected $primaryKey = 'idDetalleMovimiento';

    protected $fillable = [
        'cantidadDetalleMovimiento',
        'precioDetalleMovimiento',
        'costoDetalleMovimiento',
        'precioTotalDetalleMovimiento',
        'costoTotalDetalleMovimiento',
        'idItem',
        'idCabeceraMovimiento'
    ];

    // Relación con el Producto/Item
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'idItem', 'idItem');
    }

    // Relación con su cabecera
    public function cabecera(): BelongsTo
    {
        return $this->belongsTo(CabeceraMovimiento::class, 'idCabeceraMovimiento', 'idCabeceraMovimiento');
    }
}