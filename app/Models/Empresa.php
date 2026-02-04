<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Empresa extends Model
{
    use HasFactory;

    protected $table = 'empresas';
    protected $primaryKey = 'idEmpresa';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'nombreEmpresa',
        'direccionEmpresa',
        'telefonoEmpresa',
        'logoEmpresa',
        'latitud', 
        'longitud',
        'estadoEmpresa'
    ];

    /**
     * RELACIÓN AÑADIDA: Una empresa tiene muchos clientes.
     * Esto permite usar ->with(['clientes']) en el controlador.
     */
    public function clientes(): HasMany
    {
        return $this->hasMany(Cliente::class, 'idEmpresa', 'idEmpresa');
    }
    public function categorias(): HasMany
    {
        return $this->hasMany(Categoria::class, 'idEmpresa', 'idEmpresa');
    }
    public function items(): HasMany
    {
        return $this->hasMany(Item::class, 'idEmpresa', 'idEmpresa');
    }


    public function usuarios()
    {
        return $this->belongsToMany(User::class, 'usuarioEmpresa', 'idEmpresa', 'id')
                    ->withPivot('idRol', 'idUsuarioEmpresa')
                    ->withTimestamps();
    }

    // Una empresa puede tener muchas invitaciones
    public function invitaciones()
    {
        return $this->hasMany(InvitacionEmpresa::class, 'idEmpresa', 'idEmpresa');
    }

    public function suscripcionActual()
    {
        // Obtiene la suscripción activa más reciente
        return $this->hasOne(PlanSuscripcionEmpresa::class, 'idEmpresa', 'idEmpresa')
                    ->where('estadoPlanEmpresa', true)
                    ->latest();
    }
}