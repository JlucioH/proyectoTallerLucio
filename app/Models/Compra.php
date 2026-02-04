<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Compra extends Model
{
    protected $table = 'compras';
    protected $primaryKey = 'idCompra';
    protected $fillable = ['idProveedor', 'idCabeceraMovimiento', 'conFacturaCompra', 'numeroFacturaCompra', 'metodoPago'];

    public function proveedor()
    {
        return $this->belongsTo(Proveedor::class, 'idProveedor');
    }

    public function cabecera()
    {
        return $this->belongsTo(CabeceraMovimiento::class, 'idCabeceraMovimiento');
    }
}