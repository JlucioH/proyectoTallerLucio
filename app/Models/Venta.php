<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Venta extends Model
{
    protected $table = 'ventas';
    protected $primaryKey = 'idVenta';

    protected $fillable = [
        'idCliente',
        'idCabeceraMovimiento',
        'metodoPago',
        'razonSocialVenta',
        'nitVenta',
        'totalRecibidoVenta',
        'totalCambioVenta'
    ];

    // Relación con la cabecera (fundamental para saber totales y fecha)
    public function cabecera(): BelongsTo
    {
        return $this->belongsTo(CabeceraMovimiento::class, 'idCabeceraMovimiento', 'idCabeceraMovimiento');
    }
    public function cliente(): BelongsTo
    {
        // El segundo parámetro es la llave foránea en 'ventas'
        // El tercer parámetro es la llave primaria en 'clientes'
        return $this->belongsTo(Cliente::class, 'idCliente', 'idCliente');
    }
    // Aquí podrías añadir la relación con un modelo Cliente si lo creas después
}