<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanSuscripcion extends Model
{
    protected $table = 'planSuscripcion';
    protected $primaryKey = 'idPlanSuscripcion';
    protected $fillable = [
        'nombrePlanSuscripcion',
        'tiempoPlanSuscripcion',
        'limiteMensualMontoPlanSuscripcion'
    ];

    public function empresas()
    {
        return $this->hasMany(PlanSuscripcionEmpresa::class, 'idPlanSuscripcion');
    }
}