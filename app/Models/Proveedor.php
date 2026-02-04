<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Proveedor extends Model
{
    protected $table = 'proveedores';
    protected $primaryKey = 'idProveedor';
    protected $fillable = [
        'nombreProveedor', 
        'nitProveedor', 
        'codigoProveedor', 
        'direccionProveedor', 
        'telefonoProveedor', 
        'celularProveedor', 
        'correoProveedor',
        'estadoProveedor',
        'idEmpresa'
    ];
    protected $casts = [
        'estadoProveedor' => 'boolean',
    ];

    /**
     * Obtener la empresa a la que pertenece el proveedor.
     */
    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'idEmpresa', 'idEmpresa');
    }

    public function compras()
    {
        return $this->hasMany(Compra::class, 'idProveedor', 'idProveedor');
    }
    
}