<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cliente extends Model
{
    use HasFactory, Notifiable;

    protected $table = 'clientes';
    protected $primaryKey = 'idCliente';

    protected $fillable = [
        'codigoCliente', 
        'razonSocialCliente', 
        'telefonoCliente', 
        'celularCliente', 
        'correoCliente', 
        'nitFacturaCliente',          // Nuevo campo
        'razonSocialFacturaCliente',   // Nuevo campo
        'estadoCliente', 
        'idEmpresa'
    ];

    protected $casts = [
        'estadoCliente' => 'boolean',
    ];

    /**
     * Obtener la empresa a la que pertenece el cliente.
     */
    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'idEmpresa', 'idEmpresa');
    }

    /**
     * Relación con las ventas realizadas al cliente.
     */
    public function ventas(): HasMany
    {
        return $this->hasMany(Venta::class, 'idCliente', 'idCliente');
    }

    public function routeNotificationForMail($notification)
    {
        return $this->correoCliente;
    }
    

}