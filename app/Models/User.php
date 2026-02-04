<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * Atributos asignables masivamente.
     */
    protected $fillable = [
        'name', 
        'email', 
        'password'
    ];

    /**
     * Atributos ocultos para la serialización (seguridad).
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Configuración de conversión de tipos (Casts).
     * El motor de hashing se activa aquí.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed', // <--- ESTO ENCRIPTA TODO AUTOMÁTICAMENTE
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    // --- RELACIONES PERSONALIZADAS ---

    /**
     * Relación con Empresa
     */
    public function empresas()
    {
        return $this->belongsToMany(Empresa::class, 'usuarioEmpresa', 'id', 'idEmpresa')
                    ->withPivot('idRol');
    }

    /**
     * Relación con Rol (Buscando en la tabla pivote)
     */
    public function rol()
    {
        // Obtenemos el idRol de la tabla pivote para este usuario
        $idRol = DB::table('usuarioEmpresa')->where('id', $this->id)->value('idRol');
        return $this->belongsTo(Rol::class, 'idRol', 'idRol')->where('roles.idRol', $idRol);
    }
}